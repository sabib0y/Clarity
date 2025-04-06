import React from 'react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { addDays, addMonths, addYears } from 'date-fns';
import DailyPlanner from './DailyPlanner';
import { EntriesProvider, useEntries } from '@/context/EntriesContext';
import type { Entry } from '@/types';

const mockNotification = jest.fn();
// @ts-expect-error - Workaround for persistent 'never' type error
const mockRequestPermission = jest.fn().mockResolvedValue('granted' as NotificationPermission);

Object.defineProperty(global, 'Notification', {
  value: jest.fn().mockImplementation((title, options) => {
    mockNotification(title, options);
    return { close: jest.fn() };
  }),
  writable: true,
});

Object.defineProperty(global.Notification, 'permission', {
  value: 'granted',
  writable: true,
});
Object.defineProperty(global.Notification, 'requestPermission', {
  value: mockRequestPermission,
  writable: true,
});

const renderWithProvider = (ui: React.ReactElement, initialEntries: Entry[] = []) => {
  let contextValue: ReturnType<typeof useEntries> | null = null;
  const TestComponent = () => {
    contextValue = useEntries();
    React.useEffect(() => {
      if (initialEntries.length > 0 && contextValue?.categorizedEntries.length === 0) {
         act(() => {
           contextValue?.handleCategorise({ entries: initialEntries });
         });
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialEntries]);

    return ui;
  };
  return render(
    <EntriesProvider>
      <TestComponent />
    </EntriesProvider>
  );
};


describe('DailyPlanner Component (Rewritten)', () => {
  const MOCK_NOW = new Date(2024, 3, 15);

  const initialEntries: Entry[] = [
    { id: 'task-today', text: 'Task Today', type: 'task', priority: 1, createdAt: MOCK_NOW.toISOString(), startTime: MOCK_NOW.toISOString(), isCompleted: false },
    { id: 'task-unscheduled', text: 'Unscheduled Task', type: 'task', priority: 5, createdAt: MOCK_NOW.toISOString(), isCompleted: false },
    { id: 'task-this-week', text: 'Task This Week (Not Today)', type: 'task', priority: 2, createdAt: MOCK_NOW.toISOString(), startTime: addDays(MOCK_NOW, 2).toISOString(), isCompleted: false },
    { id: 'task-this-month', text: 'Task This Month (Not This Week)', type: 'task', priority: 3, createdAt: MOCK_NOW.toISOString(), startTime: addDays(MOCK_NOW, 10).toISOString(), isCompleted: false },
    { id: 'task-this-year', text: 'Task This Year (Not This Month)', type: 'task', priority: 4, createdAt: MOCK_NOW.toISOString(), startTime: addMonths(MOCK_NOW, 2).toISOString(), isCompleted: false },
    { id: 'task-next-year', text: 'Task Next Year', type: 'task', priority: 4, createdAt: MOCK_NOW.toISOString(), startTime: addYears(MOCK_NOW, 1).toISOString(), isCompleted: false },
    { id: 'task-completed', text: 'Completed Task Today', type: 'task', priority: 1, createdAt: MOCK_NOW.toISOString(), startTime: MOCK_NOW.toISOString(), isCompleted: true },
    { id: 'event-1', text: 'An Event', type: 'event', priority: 2, createdAt: MOCK_NOW.toISOString() },
    { id: 'event-multi-day', text: 'Multi-Day Conference', type: 'event', priority: 2, createdAt: MOCK_NOW.toISOString(), startTime: addDays(MOCK_NOW, 3).toISOString(), endTime: addDays(MOCK_NOW, 5).toISOString() },
  ];


  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(MOCK_NOW);
    jest.clearAllMocks();
    // @ts-expect-error - Workaround for persistent 'never' type error
    mockRequestPermission.mockResolvedValue('granted' as NotificationPermission);
  });

  afterEach(() => {
    jest.useRealTimers();
  });


  test('renders correctly with initial tasks grouped and sorted (default list view, all filter)', async () => {
    renderWithProvider(<DailyPlanner />, initialEntries);

    await screen.findByText('Task Today');

    expect(screen.getByRole('heading', { name: /Daily Planner/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Add a new task directly/i)).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Morning' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Afternoon' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Anytime / Flexible' })).toBeInTheDocument();

    const morningGroup = await screen.findByRole('heading', { name: 'Morning' });
    expect(within(morningGroup.closest('div')!).getByText('Task Today')).toBeInTheDocument();
    expect(within(morningGroup.closest('div')!).getByText('Completed Task Today')).toBeInTheDocument();

    const afternoonGroup = await screen.findByRole('heading', { name: 'Afternoon' });
    expect(within(afternoonGroup.closest('div')!).getByText('Task This Month (Not This Week)')).toBeInTheDocument();

    const anytimeGroup = await screen.findByRole('heading', { name: 'Anytime / Flexible' });
    expect(within(anytimeGroup.closest('div')!).getByText('Unscheduled Task')).toBeInTheDocument();

    const middayGroup = await screen.findByRole('heading', { name: 'Midday' });
    expect(within(middayGroup.closest('div')!).getByText('Task This Week (Not Today)')).toBeInTheDocument();

    const eveningGroup = await screen.findByRole('heading', { name: 'Evening' });
    expect(within(eveningGroup.closest('div')!).getByText('Task This Year (Not This Month)')).toBeInTheDocument();
    expect(within(eveningGroup.closest('div')!).getByText('Task Next Year')).toBeInTheDocument();



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
    renderWithProvider(<DailyPlanner />, []);
    expect(await screen.findByText(/No tasks match the current filter/i)).toBeInTheDocument();
  });

  test('displays time correctly based on entry data', async () => {
    renderWithProvider(<DailyPlanner />, initialEntries);

    const taskTodayItem = (await screen.findByText('Task Today')).closest('.flex.items-center') as HTMLElement;
    expect(within(taskTodayItem).getByText(/\d{1,2}:\d{2}\s(AM|PM)/)).toBeInTheDocument();

    const unscheduledItem = (await screen.findByText('Unscheduled Task')).closest('.flex.items-center') as HTMLElement;
    expect(within(unscheduledItem).getByText('Not scheduled')).toBeInTheDocument();
  });

  test('renders checkbox, link, and applies conditional styling', async () => {
    renderWithProvider(<DailyPlanner />, initialEntries);

    const taskTodayItem = (await screen.findByText('Task Today')).closest('.flex.items-center') as HTMLElement;
    const taskTodayCheckbox = within(taskTodayItem).getByRole('checkbox');
    const taskTodayLink = within(taskTodayItem).getByRole('link', { name: 'Task Today' });

    expect(taskTodayCheckbox).toBeInTheDocument();
    expect(taskTodayCheckbox).not.toBeChecked();
    expect(taskTodayLink).toBeInTheDocument();
    expect(taskTodayLink).toHaveAttribute('href', '/entry/task-today');
    expect(taskTodayLink).not.toHaveClass('line-through');
    expect(taskTodayLink).not.toHaveClass('opacity-50');

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
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const taskTodayItem = (await screen.findByText('Task Today')).closest('.flex.items-center') as HTMLElement;
    const taskTodayCheckbox = within(taskTodayItem).getByRole('checkbox');
    const taskTodayLink = within(taskTodayItem).getByRole('link', { name: 'Task Today' });

    expect(taskTodayCheckbox).not.toBeChecked();
    expect(taskTodayLink).not.toHaveClass('line-through');

    await act(async () => {
      await user.click(taskTodayCheckbox);
    });

    expect(taskTodayCheckbox).toBeChecked();
    expect(taskTodayLink).toHaveClass('line-through');

     await act(async () => {
       await user.click(taskTodayCheckbox);
     });

     expect(taskTodayCheckbox).not.toBeChecked();
     expect(taskTodayLink).not.toHaveClass('line-through');
  });

  test('switches between List and Calendar views', async () => {
    renderWithProvider(<DailyPlanner />, initialEntries);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await screen.findByText('Task Today');

    expect(screen.getByRole('button', { name: 'List View' })).toHaveClass('border-indigo-500');
    expect(screen.getByRole('button', { name: 'Calendar' })).not.toHaveClass('border-indigo-500');
    expect(screen.getByPlaceholderText(/Add a new task directly/i)).toBeInTheDocument();
    expect(screen.queryByText('Calendar View Placeholder')).not.toBeInTheDocument();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Calendar' }));
    });

    expect(screen.getByRole('button', { name: 'List View' })).not.toHaveClass('border-indigo-500');
    expect(screen.getByRole('button', { name: 'Calendar' })).toHaveClass('border-indigo-500');
    expect(screen.queryByPlaceholderText(/Add a new task directly/i)).not.toBeInTheDocument();
    expect(await screen.findByText(/April 2024/i)).toBeInTheDocument();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'List View' }));
    });

    expect(screen.getByRole('button', { name: 'List View' })).toHaveClass('border-indigo-500');
    expect(screen.getByRole('button', { name: 'Calendar' })).not.toHaveClass('border-indigo-500');
    expect(screen.getByPlaceholderText(/Add a new task directly/i)).toBeInTheDocument();
    expect(screen.queryByText(/April 2024/i)).not.toBeInTheDocument();
  });

  test('filters tasks based on selected time filter', async () => {
    renderWithProvider(<DailyPlanner />, initialEntries);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await screen.findByText('Task Today');

    expect(screen.getByText('Task Today')).toBeInTheDocument();
    expect(screen.getByText('Task This Week (Not Today)')).toBeInTheDocument();
    expect(screen.getByText('Task Next Year')).toBeInTheDocument();
    expect(screen.getByText('Unscheduled Task')).toBeInTheDocument();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Day' }));
    });
    expect(screen.getByText('Task Today')).toBeInTheDocument();
    expect(screen.getByText('Completed Task Today')).toBeInTheDocument();
    expect(screen.getByText('Unscheduled Task')).toBeInTheDocument();
    expect(screen.queryByText('Task This Week (Not Today)')).not.toBeInTheDocument();
    expect(screen.queryByText('Task Next Year')).not.toBeInTheDocument();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Week' }));
    });
    expect(screen.getByText('Task Today')).toBeInTheDocument();
    expect(screen.getByText('Completed Task Today')).toBeInTheDocument();
    expect(screen.getByText('Task This Week (Not Today)')).toBeInTheDocument();
    expect(screen.getByText('Unscheduled Task')).toBeInTheDocument();
    expect(screen.queryByText('Task This Month (Not This Week)')).not.toBeInTheDocument();
    expect(screen.queryByText('Task Next Year')).not.toBeInTheDocument();

     await act(async () => {
       await user.click(screen.getByRole('button', { name: 'Month' }));
     });
     expect(screen.getByText('Task Today')).toBeInTheDocument();
     expect(screen.getByText('Completed Task Today')).toBeInTheDocument();
     expect(screen.getByText('Task This Week (Not Today)')).toBeInTheDocument();
     expect(screen.getByText('Task This Month (Not This Week)')).toBeInTheDocument();
     expect(screen.getByText('Unscheduled Task')).toBeInTheDocument();
     expect(screen.queryByText('Task This Year (Not This Month)')).not.toBeInTheDocument();
     expect(screen.queryByText('Task Next Year')).not.toBeInTheDocument();

     await act(async () => {
       await user.click(screen.getByRole('button', { name: 'Year' }));
     });
     expect(screen.getByText('Task Today')).toBeInTheDocument();
     expect(screen.getByText('Completed Task Today')).toBeInTheDocument();
     expect(screen.getByText('Task This Week (Not Today)')).toBeInTheDocument();
     expect(screen.getByText('Task This Month (Not This Week)')).toBeInTheDocument();
     expect(screen.getByText('Task This Year (Not This Month)')).toBeInTheDocument();
     expect(screen.getByText('Unscheduled Task')).toBeInTheDocument();
     expect(screen.queryByText('Task Next Year')).not.toBeInTheDocument();


     await act(async () => {
       await user.click(screen.getByRole('button', { name: 'All' }));
     });
     expect(screen.getByText('Task Today')).toBeInTheDocument();
     expect(screen.getByText('Task This Week (Not Today)')).toBeInTheDocument();
     expect(screen.getByText('Task Next Year')).toBeInTheDocument();
     expect(screen.getByText('Unscheduled Task')).toBeInTheDocument();

  });



  test.skip('allows reordering tasks via drag and drop', () => {});

  test('Calendar view list shows multi-day events correctly', async () => {
    renderWithProvider(<DailyPlanner />, initialEntries);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await screen.findByText('Task Today');

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Calendar' }));
    });
    await screen.findByText(/April 2024/i);

    const multiDayEventText = 'Multi-Day Conference';

    const startDateButton = await screen.findByLabelText('April 18, 2024');
    await act(async () => {
      await user.click(startDateButton);
    });
    await waitFor(() => {
      expect(screen.getByText(/Thursday, April 18/i)).toBeInTheDocument();
      expect(screen.getByText(multiDayEventText)).toBeInTheDocument();
    });

    const middleDateButton = await screen.findByLabelText('April 19, 2024');
    await act(async () => {
      await user.click(middleDateButton);
    });
    await waitFor(() => {
      expect(screen.getByText(/Friday, April 19/i)).toBeInTheDocument();
      expect(screen.getByText(multiDayEventText)).toBeInTheDocument();
    });

    const endDateButton = await screen.findByLabelText('April 20, 2024');
    await act(async () => {
      await user.click(endDateButton);
    });
    await waitFor(() => {
      expect(screen.getByText(/Saturday, April 20/i)).toBeInTheDocument();
      expect(screen.getByText(multiDayEventText)).toBeInTheDocument();
    });

    const afterDateButton = await screen.findByLabelText('April 21, 2024');
    await act(async () => {
      await user.click(afterDateButton);
    });
    await waitFor(() => {
      expect(screen.queryByText(multiDayEventText)).not.toBeInTheDocument();
      expect(screen.getByText(/No items scheduled for April 21st, 2024/i)).toBeInTheDocument();
    });

  });

});
