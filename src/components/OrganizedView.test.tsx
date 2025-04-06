import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrganizedView from './OrganizedView';
import { useEntries } from '@/context/EntriesContext';
import type { Entry } from '@/types';
import { confirmDelete } from '@/utils/confirmDelete';

jest.mock('next/link', () => {
  // eslint-disable-next-line react/display-name
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock('@/context/EntriesContext', () => ({
  ...jest.requireActual('@/context/EntriesContext'),
  useEntries: jest.fn(),
}));

jest.mock('@/utils/confirmDelete', () => ({
  confirmDelete: jest.fn(),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    component
  );
};


describe('OrganizedView Component', () => {
  let mockHandleDeleteEntry: jest.Mock;

  beforeEach(() => {
    mockHandleDeleteEntry = jest.fn();
    (useEntries as jest.Mock).mockReturnValue({
      handleDeleteEntry: mockHandleDeleteEntry,
    });
    (confirmDelete as jest.Mock).mockResolvedValue(false);
    jest.clearAllMocks();
  });

  const baseEntry: Omit<Entry, 'id' | 'text' | 'type' | 'priority' | 'createdAt'> = {
      note: undefined,
      startTime: undefined,
      endTime: undefined,
  };

  const mockEntries: Entry[] = [
    { ...baseEntry, id: 't1', text: 'Urgent Task 1', type: 'task', priority: 1, createdAt: '2025-04-06T10:00:00Z', startTime: '2025-04-06T14:00:00Z' },
    { ...baseEntry, id: 'e1', text: 'Past Event', type: 'event', priority: 4, createdAt: '2025-04-05T09:00:00Z', startTime: '2025-04-05T15:00:00Z' },
    { ...baseEntry, id: 't2', text: 'Today Task 2', type: 'task', priority: 4, createdAt: '2025-04-06T11:00:00Z', startTime: '2025-04-06T16:00:00Z' },
    { ...baseEntry, id: 't3', text: 'Future Task 3', type: 'task', priority: 5, createdAt: '2025-04-06T12:00:00Z', startTime: '2025-04-07T10:00:00Z' },
    { ...baseEntry, id: 'e2', text: 'Future Event High Prio', type: 'event', priority: 1, createdAt: '2025-04-06T08:00:00Z', startTime: '2025-04-08T11:00:00Z' },
    { ...baseEntry, id: 'i1', text: 'Cool Idea', type: 'idea', priority: 3, createdAt: '2025-04-06T09:00:00Z' },
    { ...baseEntry, id: 'f1', text: 'Feeling Happy', type: 'feeling', priority: 3, createdAt: '2025-04-06T09:30:00Z', note: 'Extra details' },
    { ...baseEntry, id: 't4', text: 'High Prio No Time', type: 'task', priority: 2, createdAt: '2025-04-06T07:00:00Z' },
    { ...baseEntry, id: 't5', text: 'Low Prio No Time', type: 'task', priority: 4, createdAt: '2025-04-06T06:00:00Z' },
  ];

  test('renders the main title', () => {
    renderWithProvider(<OrganizedView entries={mockEntries} />);
    expect(screen.getByRole('heading', { name: /categorised thoughts/i })).toBeInTheDocument();
  });

  test('renders groups with entries and correct icons/titles', () => {
    renderWithProvider(<OrganizedView entries={mockEntries} />);
    expect(screen.getByRole('heading', { name: /🔥 Focus Now/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /⏳ Later/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /📝 Notes/i })).toBeInTheDocument();
  });

  test('does not render groups if they have no entries', () => {
     const onlyNotes: Entry[] = [
        { ...baseEntry, id: 'i1', text: 'Cool Idea', type: 'idea', priority: 3, createdAt: '2025-04-06T09:00:00Z' },
     ];
    renderWithProvider(<OrganizedView entries={onlyNotes} />);
    expect(screen.queryByRole('heading', { name: /🔥 Focus Now/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /⏳ Later/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /📝 Notes/i })).toBeInTheDocument();
  });

   test('renders nothing if no entries result in any groups', () => {
    const { container } = renderWithProvider(<OrganizedView entries={[]} />);
    expect(screen.queryByRole('heading', { name: /categorised thoughts/i })).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });


  test('renders entries within the correct groups', () => {
    renderWithProvider(<OrganizedView entries={mockEntries} />);

    const focusNowGroup = screen.getByRole('heading', { name: /🔥 Focus Now/i }).closest('div');
    expect(focusNowGroup).toHaveTextContent('Urgent Task 1');
    expect(focusNowGroup).toHaveTextContent('Past Event');
    expect(focusNowGroup).toHaveTextContent('Today Task 2');
    expect(focusNowGroup).toHaveTextContent('High Prio No Time');
    expect(focusNowGroup).not.toHaveTextContent('Future Task 3');
    expect(focusNowGroup).not.toHaveTextContent('Cool Idea');

    const laterGroup = screen.getByRole('heading', { name: /⏳ Later/i }).closest('div');
    expect(laterGroup).toHaveTextContent('Future Task 3');
    expect(laterGroup).toHaveTextContent('Future Event High Prio');
    expect(laterGroup).toHaveTextContent('Low Prio No Time');
    expect(laterGroup).not.toHaveTextContent('Urgent Task 1');

    const notesGroup = screen.getByRole('heading', { name: /📝 Notes/i }).closest('div');
    expect(notesGroup).toHaveTextContent('Cool Idea');
    expect(notesGroup).toHaveTextContent('Feeling Happy');
    expect(notesGroup).not.toHaveTextContent('Urgent Task 1');
  });

  test('sorts "Focus Now" entries correctly (time, then priority)', () => {
    renderWithProvider(<OrganizedView entries={mockEntries} />);
    const focusNowItems = screen.getByRole('heading', { name: /🔥 Focus Now/i }).closest('div')?.querySelectorAll('li');
    const texts = Array.from(focusNowItems || []).map(li => li.textContent?.replace(/⏰|🗒️/g, '').trim());

    expect(texts).toEqual([
        'Past Event',
        'Urgent Task 1',
        'Today Task 2',
        'High Prio No Time',
    ]);
  });

   test('sorts "Later" entries correctly (time, then priority)', () => {
    renderWithProvider(<OrganizedView entries={mockEntries} />);
    const laterItems = screen.getByRole('heading', { name: /⏳ Later/i }).closest('div')?.querySelectorAll('li');
    const texts = Array.from(laterItems || []).map(li => li.textContent?.replace(/⏰|🗒️/g, '').trim());

     expect(texts).toEqual([
        'Future Task 3',
        'Future Event High Prio',
        'Low Prio No Time',
    ]);
  });

   test('sorts "Notes" entries correctly (createdAt)', () => {
    renderWithProvider(<OrganizedView entries={mockEntries} />);
    const notesItems = screen.getByRole('heading', { name: /📝 Notes/i }).closest('div')?.querySelectorAll('li');
    const texts = Array.from(notesItems || []).map(li => li.textContent?.replace(/⏰|🗒️/g, '').trim());

     expect(texts).toEqual([
        'Cool Idea',
        'Feeling Happy',
    ]);
  });


  test('renders clock icon for entries with startTime', () => {
    renderWithProvider(<OrganizedView entries={mockEntries} />);
    const urgentTaskItem = screen.getByText('Urgent Task 1').closest('li');
    expect(urgentTaskItem).toHaveTextContent('⏰');

    const ideaItem = screen.getByText('Cool Idea').closest('li');
    expect(ideaItem).not.toHaveTextContent('⏰');
  });

  test('renders note icon for entries with a note', () => {
    renderWithProvider(<OrganizedView entries={mockEntries} />);
    const feelingItem = screen.getByText('Feeling Happy').closest('li');
    expect(feelingItem).toHaveTextContent('🗒️');

    const ideaItem = screen.getByText('Cool Idea').closest('li');
    expect(ideaItem).not.toHaveTextContent('🗒️');
  });


  test('clicking entry text links to the correct detail page', () => {
    renderWithProvider(<OrganizedView entries={mockEntries} />);
    const link = screen.getByText('Urgent Task 1').closest('a');
    expect(link).toHaveAttribute('href', '/entry/t1');

     const link2 = screen.getByText('Cool Idea').closest('a');
    expect(link2).toHaveAttribute('href', '/entry/i1');
  });

  test('clicking delete button calls confirmDelete', async () => {
    renderWithProvider(<OrganizedView entries={mockEntries} />);
    const deleteButton = screen.getByText('Urgent Task 1').closest('li')?.querySelector('button[title="Delete Entry"]');

    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton!);

    await waitFor(() => {
      expect(confirmDelete).toHaveBeenCalledTimes(1);
      expect(confirmDelete).toHaveBeenCalledWith('Are you sure?', 'Do you really want to delete "Urgent Task 1"?');
    });
    expect(mockHandleDeleteEntry).not.toHaveBeenCalled();
  });

  test('calls handleDeleteEntry if confirmDelete returns true', async () => {
    (confirmDelete as jest.Mock).mockResolvedValue(true);
    renderWithProvider(<OrganizedView entries={mockEntries} />);
    const deleteButton = screen.getByText('Urgent Task 1').closest('li')?.querySelector('button[title="Delete Entry"]');

    fireEvent.click(deleteButton!);

    await waitFor(() => {
      expect(confirmDelete).toHaveBeenCalledTimes(1);
    });
    expect(mockHandleDeleteEntry).toHaveBeenCalledTimes(1);
    expect(mockHandleDeleteEntry).toHaveBeenCalledWith('t1');
  });

   test('does not call handleDeleteEntry if confirmDelete returns false', async () => {
    (confirmDelete as jest.Mock).mockResolvedValue(false);
    renderWithProvider(<OrganizedView entries={mockEntries} />);
    const deleteButton = screen.getByText('Urgent Task 1').closest('li')?.querySelector('button[title="Delete Entry"]');

    fireEvent.click(deleteButton!);

     await waitFor(() => {
      expect(confirmDelete).toHaveBeenCalledTimes(1);
    });
    expect(mockHandleDeleteEntry).not.toHaveBeenCalled();
  });

});
