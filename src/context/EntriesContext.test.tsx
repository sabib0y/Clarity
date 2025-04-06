import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react'; // Added waitFor
import userEvent from '@testing-library/user-event';
import { EntriesProvider, useEntries } from './EntriesContext';
import type { Entry } from '@/types';

// Helper component to consume the context and trigger handlers
const TestConsumerComponent = ({ initialEntries = [] }: { initialEntries?: Entry[] }) => {
  const {
    categorizedEntries,
    handleUpdateStartTime,
    handleUpdateEndTime,
    handleToggleComplete, // Add the new handler
    // handleSetReminderStatus, // Removed
    handleCategorise, // Need this to set initial state easily
  } = useEntries();

  // Set initial state via handleCategorise
  React.useEffect(() => {
    if (initialEntries.length > 0) {
      act(() => {
        handleCategorise({ entries: initialEntries });
      });
    }
  }, [initialEntries, handleCategorise]);


  const testEntry = categorizedEntries.find(e => e.id === 'test-id-1');

  return (
    <div>
      <div data-testid="start-time">{testEntry?.startTime || 'none'}</div>
      <div data-testid="end-time">{testEntry?.endTime || 'none'}</div>
      <div data-testid="is-completed">{testEntry?.isCompleted ? 'true' : 'false'}</div> {/* Added */}
      {/* <div data-testid="reminder-set">{testEntry?.reminderSet ? 'true' : 'false'}</div> Removed */}

      <button onClick={() => handleUpdateStartTime('test-id-1', '2025-04-06T10:00:00.000Z')}>
        Set Start Time
      </button>
      <button onClick={() => handleUpdateStartTime('test-id-1', null)}>
        Clear Start Time
      </button>
      <button onClick={() => handleUpdateEndTime('test-id-1', '2025-04-06T11:00:00.000Z')}>
        Set End Time
      </button>
       <button onClick={() => handleUpdateEndTime('test-id-1', null)}>
        Clear End Time
      </button>
      {/* Reminder buttons removed */}
      <button onClick={() => handleToggleComplete('test-id-1')}> {/* Added */}
        Toggle Complete
      </button>
    </div>
  );
};

// Initial entry for testing updates
const initialTestEntry: Entry = {
  id: 'test-id-1',
  text: 'Test Entry',
  type: 'task',
  priority: 1,
  createdAt: new Date().toISOString(),
  startTime: undefined,
  endTime: undefined,
  isCompleted: false, // Added
  // reminderSet: false, // Removed
};

describe('EntriesContext', () => {
  it('should update startTime correctly', async () => {
    render(
      <EntriesProvider>
        <TestConsumerComponent initialEntries={[initialTestEntry]} />
      </EntriesProvider>
    );

    expect(screen.getByTestId('start-time')).toHaveTextContent('none');
    await act(async () => {
        await userEvent.click(screen.getByText('Set Start Time'));
    });
    expect(screen.getByTestId('start-time')).toHaveTextContent('2025-04-06T10:00:00.000Z');
  });

  it('should update endTime correctly', async () => {
     render(
       <EntriesProvider>
         <TestConsumerComponent initialEntries={[initialTestEntry]} />
       </EntriesProvider>
     );

     expect(screen.getByTestId('end-time')).toHaveTextContent('none');
     await act(async () => {
         await userEvent.click(screen.getByText('Set End Time'));
     });
     expect(screen.getByTestId('end-time')).toHaveTextContent('2025-04-06T11:00:00.000Z');
   });

  // Removed test for reminderSet update

  it('should toggle isCompleted correctly', async () => { // Added test
    render(
      <EntriesProvider>
        <TestConsumerComponent initialEntries={[initialTestEntry]} />
      </EntriesProvider>
    );

    expect(screen.getByTestId('is-completed')).toHaveTextContent('false');
    await act(async () => {
        await userEvent.click(screen.getByText('Toggle Complete'));
    });
    expect(screen.getByTestId('is-completed')).toHaveTextContent('true');
    await act(async () => {
        await userEvent.click(screen.getByText('Toggle Complete'));
    });
    expect(screen.getByTestId('is-completed')).toHaveTextContent('false');
  });


  it('should clear endTime when startTime is cleared', async () => { // Renamed test
     // Set initial times
     // Set initial times
     const entryWithTimes: Entry = {
        ...initialTestEntry,
        startTime: '2025-04-06T09:00:00.000Z',
        endTime: '2025-04-06T09:30:00.000Z',
        isCompleted: false, // Added
        // reminderSet: true, // Removed
     };

    render(
      <EntriesProvider>
        <TestConsumerComponent initialEntries={[entryWithTimes]} />
      </EntriesProvider>
    );

    // Wait for initial state to be set by useEffect
    // Wait for initial state to be set by useEffect
    await waitFor(() => {
      expect(screen.getByTestId('start-time')).toHaveTextContent('2025-04-06T09:00:00.000Z');
      expect(screen.getByTestId('end-time')).toHaveTextContent('2025-04-06T09:30:00.000Z');
      // expect(screen.getByTestId('reminder-set')).toHaveTextContent('true'); // Removed assertion
    });

    // Clear start time
    await act(async () => {
        await userEvent.click(screen.getByText('Clear Start Time'));
    });

    // Verify related fields are cleared
    expect(screen.getByTestId('start-time')).toHaveTextContent('none');
    expect(screen.getByTestId('end-time')).toHaveTextContent('none');
    // expect(screen.getByTestId('reminder-set')).toHaveTextContent('false'); // Removed assertion
  });

   it('should clear endTime correctly', async () => {
     // Set initial times
     // Set initial times
     // Set initial times
     const entryWithTimes: Entry = {
        ...initialTestEntry,
        startTime: '2025-04-06T09:00:00.000Z',
        endTime: '2025-04-06T09:30:00.000Z',
        isCompleted: false, // Added
        // reminderSet: false, // Removed
     };

    render(
      <EntriesProvider>
        <TestConsumerComponent initialEntries={[entryWithTimes]} />
      </EntriesProvider>
    );

     // Wait for initial state to be set by useEffect
     await waitFor(() => {
       expect(screen.getByTestId('end-time')).toHaveTextContent('2025-04-06T09:30:00.000Z');
     });

    // Clear end time
    await act(async () => {
        await userEvent.click(screen.getByText('Clear End Time'));
    });

    // Verify end time is cleared, start time remains
    expect(screen.getByTestId('start-time')).toHaveTextContent('2025-04-06T09:00:00.000Z');
    expect(screen.getByTestId('end-time')).toHaveTextContent('none');
    expect(screen.getByTestId('is-completed')).toHaveTextContent('false'); // Should remain false
    // expect(screen.getByTestId('reminder-set')).toHaveTextContent('false'); // Removed assertion
  });

});
