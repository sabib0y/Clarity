import React from 'react';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals'; // Added afterEach
// Removed unused date-fns imports: isSameDay, isSameWeek, isSameMonth, isSameYear, subDays
// Only import used date-fns helpers
import { addDays, addMonths, addYears } from 'date-fns';
import DailyPlanner from './DailyPlanner';
import { EntriesProvider, useEntries } from '@/context/EntriesContext';
import type { Entry } from '@/types';

// Mock Notification API (Keep this)
const mockNotification = jest.fn();
// Explicitly cast 'granted' to NotificationPermission type
// @ts-expect-error - Workaround for persistent 'never' type error
const mockRequestPermission = jest.fn().mockResolvedValue('granted' as NotificationPermission);

// Assign mock implementation to global.Notification
Object.defineProperty(global, 'Notification', {
  value: jest.fn().mockImplementation((title, options) => {
    mockNotification(title, options);
    return { close: jest.fn() }; // Mock instance methods if needed
  }),
  writable: true, // Allow overwriting
});

// Assign static properties/methods to the mock constructor
Object.defineProperty(global.Notification, 'permission', {
  value: 'granted', // Remove type assertion
  writable: true, // Allow modification if needed, though 'granted' is usually static
});
Object.defineProperty(global.Notification, 'requestPermission', {
  value: mockRequestPermission,
  writable: true,
});

// Helper to render with provider and set initial state (Reverted to useEffect approach)
const renderWithProvider = (ui: React.ReactElement, initialEntries: Entry[] = []) => {
  let contextValue: ReturnType<typeof useEntries> | null = null;
  const TestComponent = () => {
    contextValue = useEntries();
    React.useEffect(() => {
      // Use act to wrap the initial state setting from context
      // Check if context needs initialization
      if (initialEntries.length > 0 && contextValue?.categorizedEntries.length === 0) {
         act(() => {
           contextValue?.handleCategorise({ entries: initialEntries });
         });
      }
    // Only run once on mount or if initialEntries change identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialEntries]); // Removed contextValue from deps

    return ui;
  };
  return render(
    <EntriesProvider>
      <TestComponent />
    </EntriesProvider>
  );
};


describe('DailyPlanner Component (Rewritten)', () => {
  // Use a fixed date for predictable testing across different run times
  const MOCK_NOW = new Date(2024, 3, 15); // April 15th, 2024 (Month is 0-indexed)

  // Mock data with diverse start times relative to MOCK_NOW
  const initialEntries: Entry[] = [
    { id: 'task-today', text: 'Task Today', type: 'task', priority: 1, createdAt: MOCK_NOW.toISOString(), startTime: MOCK_NOW.toISOString(), isCompleted: false },
    { id: 'task-unscheduled', text: 'Unscheduled Task', type: 'task', priority: 5, createdAt: MOCK_NOW.toISOString(), isCompleted: false },
    { id: 'task-this-week', text: 'Task This Week (Not Today)', type: 'task', priority: 2, createdAt: MOCK_NOW.toISOString(), startTime: addDays(MOCK_NOW, 2).toISOString(), isCompleted: false }, // Wednesday
    { id: 'task-this-month', text: 'Task This Month (Not This Week)', type: 'task', priority: 3, createdAt: MOCK_NOW.toISOString(), startTime: addDays(MOCK_NOW, 10).toISOString(), isCompleted: false }, // Next week
    { id: 'task-this-year', text: 'Task This Year (Not This Month)', type: 'task', priority: 4, createdAt: MOCK_NOW.toISOString(), startTime: addMonths(MOCK_NOW, 2).toISOString(), isCompleted: false }, // June
    { id: 'task-next-year', text: 'Task Next Year', type: 'task', priority: 4, createdAt: MOCK_NOW.toISOString(), startTime: addYears(MOCK_NOW, 1).toISOString(), isCompleted: false },
    { id: 'task-completed', text: 'Completed Task Today', type: 'task', priority: 1, createdAt: MOCK_NOW.toISOString(), startTime: MOCK_NOW.toISOString(), isCompleted: true },
    { id: 'event-1', text: 'An Event', type: 'event', priority: 2, createdAt: MOCK_NOW.toISOString() }, // Should be filtered out
  ];


  beforeEach(() => {
    // Mock Date.now() to return our fixed date
    jest.useFakeTimers().setSystemTime(MOCK_NOW);
    jest.clearAllMocks();
    // Reset the mock implementation if needed, or just the calls
    // @ts-expect-error - Workaround for persistent 'never' type error
    mockRequestPermission.mockResolvedValue('granted' as NotificationPermission); // Cast here too
  });

  afterEach(() => {
    // Restore real timers
    jest.useRealTimers();
  });


  test('renders correctly with initial tasks grouped and sorted (default list view, all filter)', async () => {
    renderWithProvider(<DailyPlanner />, initialEntries);

    // Wait for tasks to render. FindBy queries include waitFor.
    await screen.findByText('Task Today'); // Use text from updated mock data

    expect(screen.getByRole('heading', { name: /Daily Planner/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Add a new task directly/i)).toBeInTheDocument();

    // Check groups (priority 1 = Morning, 3 = Afternoon, 5 = Anytime)
    expect(screen.getByRole('heading', { name: 'Morning' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Afternoon' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Anytime / Flexible' })).toBeInTheDocument();

    // Check tasks within groups - use text from new mock data
    // Ensure elements exist before querying within them
    const morningGroup = await screen.findByRole('heading', { name: 'Morning' });
    expect(within(morningGroup.closest('div')!).getByText('Task Today')).toBeInTheDocument();
    expect(within(morningGroup.closest('div')!).getByText('Completed Task Today')).toBeInTheDocument();

    const afternoonGroup = await screen.findByRole('heading', { name: 'Afternoon' });
    expect(within(afternoonGroup.closest('div')!).getByText('Task This Month (Not This Week)')).toBeInTheDocument();

    const anytimeGroup = await screen.findByRole('heading', { name: 'Anytime / Flexible' });
    expect(within(anytimeGroup.closest('div')!).getByText('Unscheduled Task')).toBeInTheDocument();

    // Check other groups/tasks based on new mock data
    const middayGroup = await screen.findByRole('heading', { name: 'Midday' }); // Prio 2
    expect(within(middayGroup.closest('div')!).getByText('Task This Week (Not Today)')).toBeInTheDocument();

    const eveningGroup = await screen.findByRole('heading', { name: 'Evening' }); // Prio 4
    expect(within(eveningGroup.closest('div')!).getByText('Task This Year (Not This Month)')).toBeInTheDocument();
    expect(within(eveningGroup.closest('div')!).getByText('Task Next Year')).toBeInTheDocument();



    // Ensure event is not rendered and all tasks are initially visible (filter = 'all')
    expect(screen.queryByText('An Event')).not.toBeInTheDocument();
    expect(screen.getByText('Task Today')).toBeInTheDocument();
    expect(screen.getByText('Unscheduled Task')).toBeInTheDocument();
    expect(screen.getByText('Task This Week (Not Today)')).toBeInTheDocument();
    expect(screen.getByText('Task This Month (Not This Week)')).toBeInTheDocument();
    expect(screen.getByText('Task This Year (Not This Month)')).toBeInTheDocument();
    expect(screen.getByText('Task Next Year')).toBeInTheDocument();
    expect(screen.getByText('Completed Task Today')).toBeInTheDocument();
  });

  test('renders message when no tasks match filter', async () => {
    renderWithProvider(<DailyPlanner />, []); // No initial entries
    // Use findByText to wait for potential async updates
    expect(await screen.findByText(/No tasks match the current filter/i)).toBeInTheDocument();
  });

  test('displays time correctly based on entry data', async () => {
    renderWithProvider(<DailyPlanner />, initialEntries);

    // Task Today
    const taskTodayItem = (await screen.findByText('Task Today')).closest('.flex.items-center') as HTMLElement;
    expect(within(taskTodayItem).getByText(/\d{1,2}:\d{2}\s(AM|PM)/)).toBeInTheDocument();

    // Unscheduled Task
    const unscheduledItem = (await screen.findByText('Unscheduled Task')).closest('.flex.items-center') as HTMLElement;
    expect(within(unscheduledItem).getByText('Not scheduled')).toBeInTheDocument();
  });

  test('renders checkbox, link, and applies conditional styling', async () => {
    renderWithProvider(<DailyPlanner />, initialEntries);

    // Task Today (Not Completed)
    const taskTodayItem = (await screen.findByText('Task Today')).closest('.flex.items-center') as HTMLElement;
    const taskTodayCheckbox = within(taskTodayItem).getByRole('checkbox');
    const taskTodayLink = within(taskTodayItem).getByRole('link', { name: 'Task Today' });

    expect(taskTodayCheckbox).toBeInTheDocument();
    expect(taskTodayCheckbox).not.toBeChecked();
    expect(taskTodayLink).toBeInTheDocument();
    expect(taskTodayLink).toHaveAttribute('href', '/entry/task-today');
    expect(taskTodayLink).not.toHaveClass('line-through');
    expect(taskTodayLink).not.toHaveClass('opacity-50');

    // Completed Task Today
    const completedTaskItem = (await screen.findByText('Completed Task Today')).closest('.flex.items-center') as HTMLElement;
    const completedTaskCheckbox = within(completedTaskItem).getByRole('checkbox');
    const completedTaskLink = within(completedTaskItem).getByRole('link', { name: 'Completed Task Today' });

    expect(completedTaskCheckbox).toBeInTheDocument();
    expect(completedTaskCheckbox).toBeChecked();
    expect(completedTaskLink).toBeInTheDocument();
    expect(completedTaskLink).toHaveAttribute('href', '/entry/task-completed');
    expect(completedTaskLink).toHaveClass('line-through');
    expect(completedTaskLink).toHaveClass('opacity-50');
  });

  test('clicking checkbox toggles completion state (visual check)', async () => {
    renderWithProvider(<DailyPlanner />, initialEntries);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime }); // Ensure timers are advanced

    // Find Task Today (initially not completed)
    const taskTodayItem = (await screen.findByText('Task Today')).closest('.flex.items-center') as HTMLElement;
    const taskTodayCheckbox = within(taskTodayItem).getByRole('checkbox');
    const taskTodayLink = within(taskTodayItem).getByRole('link', { name: 'Task Today' });

    // Verify initial state
    expect(taskTodayCheckbox).not.toBeChecked();
    expect(taskTodayLink).not.toHaveClass('line-through');

    // Click checkbox
    await act(async () => {
      await user.click(taskTodayCheckbox);
    });

    // Verify state toggled (visually) - requires context handler to work
    expect(taskTodayCheckbox).toBeChecked();
    expect(taskTodayLink).toHaveClass('line-through'); // Check styling change

     // Click again to toggle back
     await act(async () => {
       await user.click(taskTodayCheckbox);
     });

     expect(taskTodayCheckbox).not.toBeChecked();
     // Removed duplicate assertion
     expect(taskTodayLink).not.toHaveClass('line-through');
  });

  test('switches between List and Calendar views', async () => {
    renderWithProvider(<DailyPlanner />, initialEntries);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // Wait for initial render
    await screen.findByText('Task Today');

    // Initially, List View is active
    expect(screen.getByRole('button', { name: 'List View' })).toHaveClass('border-indigo-500');
    expect(screen.getByRole('button', { name: 'Calendar' })).not.toHaveClass('border-indigo-500');
    expect(screen.getByPlaceholderText(/Add a new task directly/i)).toBeInTheDocument(); // List content visible
    expect(screen.queryByText('Calendar View Placeholder')).not.toBeInTheDocument();

    // Click Calendar tab
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Calendar' }));
    });

    // Calendar View is active
    expect(screen.getByRole('button', { name: 'List View' })).not.toHaveClass('border-indigo-500');
    expect(screen.getByRole('button', { name: 'Calendar' })).toHaveClass('border-indigo-500');
    expect(screen.queryByPlaceholderText(/Add a new task directly/i)).not.toBeInTheDocument(); // List content hidden
    // Look for content rendered by react-calendar instead of the placeholder
    // Using findByText to wait for potential async rendering of the calendar
    expect(await screen.findByText(/April 2024/i)).toBeInTheDocument(); // Check for month/year label

    // Click List View tab again
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'List View' }));
    });

    // List View is active again
    expect(screen.getByRole('button', { name: 'List View' })).toHaveClass('border-indigo-500');
    expect(screen.getByRole('button', { name: 'Calendar' })).not.toHaveClass('border-indigo-500');
    expect(screen.getByPlaceholderText(/Add a new task directly/i)).toBeInTheDocument();
    expect(screen.queryByText(/April 2024/i)).not.toBeInTheDocument(); // Calendar content hidden
  });

  test('filters tasks based on selected time filter', async () => {
    renderWithProvider(<DailyPlanner />, initialEntries);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // Wait for initial render
    await screen.findByText('Task Today');

    // Default ('all') - Check a few representative tasks + unscheduled
    expect(screen.getByText('Task Today')).toBeInTheDocument();
    expect(screen.getByText('Task This Week (Not Today)')).toBeInTheDocument();
    expect(screen.getByText('Task Next Year')).toBeInTheDocument();
    expect(screen.getByText('Unscheduled Task')).toBeInTheDocument(); // Always visible

    // Click 'Day' filter
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Day' }));
    });
    expect(screen.getByText('Task Today')).toBeInTheDocument();
    expect(screen.getByText('Completed Task Today')).toBeInTheDocument();
    expect(screen.getByText('Unscheduled Task')).toBeInTheDocument(); // Always visible
    expect(screen.queryByText('Task This Week (Not Today)')).not.toBeInTheDocument();
    expect(screen.queryByText('Task Next Year')).not.toBeInTheDocument();

    // Click 'Week' filter
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Week' }));
    });
    expect(screen.getByText('Task Today')).toBeInTheDocument();
    expect(screen.getByText('Completed Task Today')).toBeInTheDocument();
    expect(screen.getByText('Task This Week (Not Today)')).toBeInTheDocument();
    expect(screen.getByText('Unscheduled Task')).toBeInTheDocument(); // Always visible
    expect(screen.queryByText('Task This Month (Not This Week)')).not.toBeInTheDocument();
    expect(screen.queryByText('Task Next Year')).not.toBeInTheDocument();

     // Click 'Month' filter
     await act(async () => {
       await user.click(screen.getByRole('button', { name: 'Month' }));
     });
     expect(screen.getByText('Task Today')).toBeInTheDocument();
     expect(screen.getByText('Completed Task Today')).toBeInTheDocument();
     expect(screen.getByText('Task This Week (Not Today)')).toBeInTheDocument();
     expect(screen.getByText('Task This Month (Not This Week)')).toBeInTheDocument();
     expect(screen.getByText('Unscheduled Task')).toBeInTheDocument(); // Always visible
     expect(screen.queryByText('Task This Year (Not This Month)')).not.toBeInTheDocument();
     expect(screen.queryByText('Task Next Year')).not.toBeInTheDocument();

     // Click 'Year' filter
     await act(async () => {
       await user.click(screen.getByRole('button', { name: 'Year' }));
     });
     expect(screen.getByText('Task Today')).toBeInTheDocument();
     expect(screen.getByText('Completed Task Today')).toBeInTheDocument();
     expect(screen.getByText('Task This Week (Not Today)')).toBeInTheDocument();
     expect(screen.getByText('Task This Month (Not This Week)')).toBeInTheDocument();
     expect(screen.getByText('Task This Year (Not This Month)')).toBeInTheDocument();
     expect(screen.getByText('Unscheduled Task')).toBeInTheDocument(); // Always visible
     expect(screen.queryByText('Task Next Year')).not.toBeInTheDocument();


     // Click 'All' filter
     await act(async () => {
       await user.click(screen.getByRole('button', { name: 'All' }));
     });
     expect(screen.getByText('Task Today')).toBeInTheDocument();
     expect(screen.getByText('Task This Week (Not Today)')).toBeInTheDocument();
     expect(screen.getByText('Task Next Year')).toBeInTheDocument();
     expect(screen.getByText('Unscheduled Task')).toBeInTheDocument(); // Always visible

  });


  // Removed tests related to reminder buttons and functionality

  // Add tests for drag-and-drop later if needed (requires context update)
  test.skip('allows reordering tasks via drag and drop', () => {});

}); // This should be the final closing brace/parenthesis
