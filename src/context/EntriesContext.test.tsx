import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntriesProvider, useEntries } from './EntriesContext';
import type { Entry } from '@/types';

const TestConsumerComponent = ({ initialEntries = [] }: { initialEntries?: Entry[] }) => {
  const {
    categorizedEntries,
    handleUpdateStartTime,
    handleUpdateEndTime,
    handleToggleComplete,
    handleCategorise,
  } = useEntries();

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
      <div data-testid="is-completed">{testEntry?.isCompleted ? 'true' : 'false'}</div>

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
      <button onClick={() => handleToggleComplete('test-id-1')}>
        Toggle Complete
      </button>
    </div>
  );
};

const initialTestEntry: Entry = {
  id: 'test-id-1',
  text: 'Test Entry',
  type: 'task',
  priority: 1,
  createdAt: new Date().toISOString(),
  startTime: undefined,
  endTime: undefined,
  isCompleted: false,
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


  it('should toggle isCompleted correctly', async () => {
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


  it('should clear endTime when startTime is cleared', async () => {
     const entryWithTimes: Entry = {
        ...initialTestEntry,
        startTime: '2025-04-06T09:00:00.000Z',
        endTime: '2025-04-06T09:30:00.000Z',
        isCompleted: false,
     };

    render(
      <EntriesProvider>
        <TestConsumerComponent initialEntries={[entryWithTimes]} />
      </EntriesProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('start-time')).toHaveTextContent('2025-04-06T09:00:00.000Z');
      expect(screen.getByTestId('end-time')).toHaveTextContent('2025-04-06T09:30:00.000Z');
    });

    await act(async () => {
        await userEvent.click(screen.getByText('Clear Start Time'));
    });

    expect(screen.getByTestId('start-time')).toHaveTextContent('none');
    expect(screen.getByTestId('end-time')).toHaveTextContent('none');
  });

   it('should clear endTime correctly', async () => {
     const entryWithTimes: Entry = {
        ...initialTestEntry,
        startTime: '2025-04-06T09:00:00.000Z',
        endTime: '2025-04-06T09:30:00.000Z',
        isCompleted: false,
     };

    render(
      <EntriesProvider>
        <TestConsumerComponent initialEntries={[entryWithTimes]} />
      </EntriesProvider>
    );

     await waitFor(() => {
       expect(screen.getByTestId('end-time')).toHaveTextContent('2025-04-06T09:30:00.000Z');
     });

    await act(async () => {
        await userEvent.click(screen.getByText('Clear End Time'));
    });

    expect(screen.getByTestId('start-time')).toHaveTextContent('2025-04-06T09:00:00.000Z');
    expect(screen.getByTestId('end-time')).toHaveTextContent('none');
    expect(screen.getByTestId('is-completed')).toHaveTextContent('false');
  });

});
