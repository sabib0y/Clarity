import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'; // Add within
import '@testing-library/jest-dom';
import { describe, test, expect, jest, beforeEach } from '@jest/globals'; // Explicitly import Jest globals (removed SpyInstance)
import DailyPlanner from './DailyPlanner'; // Adjust the import path as necessary
import * as chrono from 'chrono-node'; // Import chrono for mocking

// Mock Notification API
const mockNotification = jest.fn();
global.Notification = jest.fn().mockImplementation((title, options) => {
  mockNotification(title, options); // Capture calls
  return {
    // Mock instance properties/methods if needed
  };
}) as any;
global.Notification.requestPermission = jest.fn().mockResolvedValue('granted');

// Define the type for entries, matching the component's expectation
type Entry = {
  text: string;
  type: string;
  priority?: number;
};

describe('DailyPlanner Component', () => {
  const initialEntries: Entry[] = [
    { text: 'API Task 1 (Mid)', type: 'task', priority: 3 },
    { text: 'API Task 2 (High)', type: 'task', priority: 1 },
    { text: 'API Event', type: 'event', priority: 2 }, // Should be filtered out
    { text: 'API Task 3 (Low)', type: 'task', priority: 5 },
  ];

  // Declare spy variable outside beforeEach so it's accessible in tests if needed
  let chronoParseSpy: any; // Use 'any' type as workaround for SpyInstance import issue

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Spy on and mock chrono.parse for each test
    chronoParseSpy = jest.spyOn(chrono, 'parse').mockReturnValue([]); // Default to no parse result

    // Reset notification permission mock
    (global.Notification.requestPermission as jest.Mock).mockResolvedValue('granted');
  });

  // Optional: Restore original implementations after all tests if needed, though clearMocks usually suffices
  // afterAll(() => {
  //   chronoParseSpy.mockRestore();
  // });

  test('renders correctly with initial tasks sorted by priority', () => {
    render(<DailyPlanner entries={initialEntries} />);

    expect(screen.getByRole('heading', { name: /Daily Planner/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Add a new task directly/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Task/i })).toBeInTheDocument();

    // Check that only tasks are rendered and sorted by priority (lower first)
    const tasks = screen.getAllByText(/API Task/);
    expect(tasks).toHaveLength(3);
    expect(tasks[0]).toHaveTextContent('API Task 2 (High)'); // Priority 1
    expect(tasks[1]).toHaveTextContent('API Task 1 (Mid)'); // Priority 3
    expect(tasks[2]).toHaveTextContent('API Task 3 (Low)'); // Priority 5

    expect(screen.queryByText(/API Event/)).not.toBeInTheDocument();
  });

  test('renders message when no tasks are available', () => {
    render(<DailyPlanner entries={[{ text: 'Event only', type: 'event' }]} />);
    expect(screen.getByText(/No tasks in the planner/i)).toBeInTheDocument();
    expect(screen.queryByText(/API Task/)).not.toBeInTheDocument();
  });

  test('allows adding a new task manually', () => {
    render(<DailyPlanner entries={[]} />); // Start with no tasks

    const input = screen.getByPlaceholderText(/Add a new task directly/i);
    const addButton = screen.getByRole('button', { name: /Add Task/i });
    const newTaskText = 'Manually Added Task';

    fireEvent.change(input, { target: { value: newTaskText } });
    fireEvent.click(addButton);

    // Check if the new task appears in the list
    expect(screen.getByText(newTaskText)).toBeInTheDocument();
    // Check if the input is cleared
    expect(input).toHaveValue('');
  });

   test('allows adding a new task manually using Enter key', () => {
    render(<DailyPlanner entries={[]} />); // Start with no tasks

    const input = screen.getByPlaceholderText(/Add a new task directly/i);
    const newTaskText = 'Added with Enter';

    fireEvent.change(input, { target: { value: newTaskText } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(screen.getByText(newTaskText)).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  test('updates time slot for a task', () => {
    render(<DailyPlanner entries={initialEntries} />);

    // Find the input associated with the first task (High priority)
    const timeInputs = screen.getAllByPlaceholderText('8:00 AM');
    // Assuming the first rendered task corresponds to the first time input
    const firstTaskTimeInput = timeInputs[0];

    fireEvent.change(firstTaskTimeInput, { target: { value: '9:30 AM' } });
    expect(firstTaskTimeInput).toHaveValue('9:30 AM');
  });

  test('attempts to set reminder and calls chrono.parse', async () => {
    render(<DailyPlanner entries={initialEntries} />);

    const taskTextElement = await screen.findByText('API Task 2 (High)');
    const taskItemContainer = taskTextElement.closest('div[role="button"]') as HTMLElement;
    if (!taskItemContainer) throw new Error('Task container not found');

    const timeInput = within(taskItemContainer).getByPlaceholderText('8:00 AM');
    const remindButton = within(taskItemContainer).getByRole('button', { name: 'Remind' });

    // Set time for the first task
    fireEvent.change(timeInput, { target: { value: '10am today' } });
    // Click the remind button for the first task
    fireEvent.click(remindButton);

    // Check if chrono.parse was called with the correct time string
    await waitFor(() => {
      expect(chronoParseSpy).toHaveBeenCalledWith('10am today', expect.any(Date), { forwardDate: true });
    });
    // We'll test notification logic separately
  });

  test('shows alert if trying to set reminder without time', async () => { // Make async
    // Mock window.alert
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<DailyPlanner entries={initialEntries} />);

    // Find the specific task item we want to interact with
    const taskTextElement = await screen.findByText('API Task 2 (High)');
    const taskItemContainer = taskTextElement.closest('div[role="button"]') as HTMLElement;

    if (!taskItemContainer) {
      throw new Error('Could not find container for task "API Task 2 (High)"');
    }

    // Find the "Remind" button within this specific task's container
    const remindButton = within(taskItemContainer).getByRole('button', { name: 'Remind' });

    // Click the button
    fireEvent.click(remindButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Please enter a time/date before setting a reminder.');
    });
    expect(chronoParseSpy).not.toHaveBeenCalled();

    alertMock.mockRestore(); // Clean up mock
  });

   test('shows alert if chrono cannot parse time', async () => { // Make async
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<DailyPlanner entries={initialEntries} />);

    const taskTextElement = await screen.findByText('API Task 2 (High)');
    const taskItemContainer = taskTextElement.closest('div[role="button"]') as HTMLElement;
    if (!taskItemContainer) throw new Error('Task container not found');

    const timeInput = within(taskItemContainer).getByPlaceholderText('8:00 AM');
    const remindButton = within(taskItemContainer).getByRole('button', { name: 'Remind' });


    fireEvent.change(timeInput, { target: { value: 'invalid time string' } });
    fireEvent.click(remindButton);

    await waitFor(() => {
      expect(chronoParseSpy).toHaveBeenCalledWith('invalid time string', expect.any(Date), { forwardDate: true });
      expect(alertMock).toHaveBeenCalledWith('Could not understand the time: "invalid time string". Please try a different format (e.g., "10:30am", "2pm today", "14:00").');
    });

    alertMock.mockRestore();
  });

  test('shows alert if parsed time is in the past', async () => { // Make async
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const pastDate = new Date();
    pastDate.setHours(pastDate.getHours() - 1); // 1 hour ago
    // Mock chrono.parse specifically for this test
    chronoParseSpy.mockReturnValue([{ start: { date: () => pastDate } }]);

    render(<DailyPlanner entries={initialEntries} />);

    const taskTextElement = await screen.findByText('API Task 2 (High)');
    const taskItemContainer = taskTextElement.closest('div[role="button"]') as HTMLElement;
    if (!taskItemContainer) throw new Error('Task container not found');

    const timeInput = within(taskItemContainer).getByPlaceholderText('8:00 AM');
    const remindButton = within(taskItemContainer).getByRole('button', { name: 'Remind' });

    fireEvent.change(timeInput, { target: { value: 'yesterday 5pm' } }); // Input text doesn't matter here due to mock
    fireEvent.click(remindButton);

    await waitFor(() => {
      expect(chronoParseSpy).toHaveBeenCalled();
      expect(alertMock).toHaveBeenCalledWith(`The specified time (${pastDate.toLocaleTimeString()}) is in the past.`);
    });

    alertMock.mockRestore();
  });

  test('requests notification permission and schedules notification for today', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const futureDate = new Date();
    futureDate.setSeconds(futureDate.getSeconds() + 30); // 30 seconds in the future
    // Mock chrono.parse specifically for this test
    chronoParseSpy.mockReturnValue([{ start: { date: () => futureDate } }]);

    render(<DailyPlanner entries={initialEntries} />);

    const taskTextElement = await screen.findByText('API Task 2 (High)');
    const taskItemContainer = taskTextElement.closest('div[role="button"]') as HTMLElement;
    if (!taskItemContainer) throw new Error('Task container not found');

    const timeInput = within(taskItemContainer).getByPlaceholderText('8:00 AM');
    const remindButton = within(taskItemContainer).getByRole('button', { name: 'Remind' });

    fireEvent.change(timeInput, { target: { value: 'in 30 seconds' } });
    fireEvent.click(remindButton);

    // Wait for async operations like requestPermission
    await waitFor(() => {
      expect(global.Notification.requestPermission).toHaveBeenCalled();
    });
     // Check alert confirming schedule (might happen before or after permission)
    await waitFor(() => {
       expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('Reminder scheduled for "API Task 2 (High)"'));
    });
    expect(mockNotification).not.toHaveBeenCalled(); // Notification is in setTimeout

    // We can't easily test setTimeout in RTL without advancing timers,
    // but we've confirmed permission request and scheduling alert.

    alertMock.mockRestore();
  });

   test('shows alert and does not schedule notification for future date', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
    futureDate.setHours(10, 0, 0, 0);
    // Mock chrono.parse specifically for this test
    chronoParseSpy.mockReturnValue([{ start: { date: () => futureDate } }]);

    render(<DailyPlanner entries={initialEntries} />);

    const taskTextElement = await screen.findByText('API Task 2 (High)');
    const taskItemContainer = taskTextElement.closest('div[role="button"]') as HTMLElement;
    if (!taskItemContainer) throw new Error('Task container not found');

    const timeInput = within(taskItemContainer).getByPlaceholderText('8:00 AM');
    const remindButton = within(taskItemContainer).getByRole('button', { name: 'Remind' });

    fireEvent.change(timeInput, { target: { value: 'tomorrow 10am' } });
    fireEvent.click(remindButton);

    // Should not request permission or schedule
     await waitFor(() => { // Wait in case alert is slightly delayed
        expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('(Note: PoC only triggers notifications for today)'));
     });
    expect(global.Notification.requestPermission).not.toHaveBeenCalled();
    expect(mockNotification).not.toHaveBeenCalled();


    alertMock.mockRestore();
  });

  // Note: Testing drag and drop with @dnd-kit requires more complex setup
  // (e.g., simulating pointer/keyboard events precisely) and might be deferred.

});
