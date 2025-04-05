import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect } from '@jest/globals'; // Explicitly import Jest globals
import OrganizedView from './OrganizedView'; // Adjust the import path as necessary

// Define the type for entries, matching the component's expectation
type Entry = {
  text: string;
  type: string;
  // Note: OrganizedView doesn't use priority, so it's not needed here
};

describe('OrganizedView Component', () => {
  test('renders nothing when entries array is empty', () => {
    const { container } = render(<OrganizedView entries={[]} />);
    // Expect the container to be empty or not contain the main heading
    expect(screen.queryByRole('heading', { name: /Categorised Thoughts/i })).not.toBeInTheDocument();
    // Or check if the direct container is empty
    expect(container.firstChild).toBeNull(); // The component returns null directly
  });

  test('renders nothing when entries prop is null or undefined', () => {
    const { container: containerNull } = render(<OrganizedView entries={null as any} />);
    expect(containerNull.firstChild).toBeNull();

    const { container: containerUndefined } = render(<OrganizedView entries={undefined as any} />);
    expect(containerUndefined.firstChild).toBeNull();
  });

  test('renders entries grouped by type in the correct order', () => {
    const entries: Entry[] = [
      { text: 'Idea 1', type: 'idea' },
      { text: 'Task 1', type: 'task' },
      { text: 'Feeling 1', type: 'feeling' },
      { text: 'Event 1', type: 'event' },
      { text: 'Task 2', type: 'task' },
      { text: 'Note 1', type: 'note' },
    ];

    render(<OrganizedView entries={entries} />);

    // Check main heading
    expect(screen.getByRole('heading', { name: /Categorised Thoughts/i })).toBeInTheDocument();

    // Check category headings are present
    const taskHeading = screen.getByRole('heading', { name: /✅ Tasks/i });
    const eventHeading = screen.getByRole('heading', { name: /🎯 Events/i });
    const ideaHeading = screen.getByRole('heading', { name: /➕ Ideas/i });
    const feelingHeading = screen.getByRole('heading', { name: /❤️ Feelings/i });
    const noteHeading = screen.getByRole('heading', { name: /📝 Notes/i });

    expect(taskHeading).toBeInTheDocument();
    expect(eventHeading).toBeInTheDocument();
    expect(ideaHeading).toBeInTheDocument();
    expect(feelingHeading).toBeInTheDocument();
    expect(noteHeading).toBeInTheDocument();

    // Check specific items are under the correct heading
    // Note: This relies on the structure (ul within the heading's parent div)
    expect(taskHeading.closest('div')).toHaveTextContent('Task 1');
    expect(taskHeading.closest('div')).toHaveTextContent('Task 2');
    expect(eventHeading.closest('div')).toHaveTextContent('Event 1');
    expect(ideaHeading.closest('div')).toHaveTextContent('Idea 1');
    expect(feelingHeading.closest('div')).toHaveTextContent('Feeling 1');
    expect(noteHeading.closest('div')).toHaveTextContent('Note 1');

    // Check order (more complex, check relative positions if needed, but checking presence is often enough)
    const headings = screen.getAllByRole('heading', { level: 3 }); // Get all category headings
    const headingTexts = headings.map(h => h.textContent);
    expect(headingTexts).toEqual([
      '✅Tasks', // Remove space
      '🎯Events', // Remove space
      '➕Ideas', // Remove space
      '❤️Feelings', // Remove space
      '📝Notes', // Remove space
    ]);
  });

  test('handles entries with unknown types gracefully', () => {
    const entries: Entry[] = [
      { text: 'Task 1', type: 'task' },
      { text: 'Unknown item', type: 'unknown' },
    ];

    render(<OrganizedView entries={entries} />);

    // Task section should render
    expect(screen.getByRole('heading', { name: /✅ Tasks/i })).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();

    // Unknown section should render with a default icon and capitalized name
    const unknownHeading = screen.getByRole('heading', { name: /❓ Unknowns/i });
    expect(unknownHeading).toBeInTheDocument();
    expect(unknownHeading.closest('div')).toHaveTextContent('Unknown item');
  });
});
