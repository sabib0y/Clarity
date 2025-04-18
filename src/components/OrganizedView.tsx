'use client';

import React, { useMemo } from 'react'; // Add useMemo
import Link from 'next/link';
import type { Entry } from '@/types';
import { useEntries } from '@/context/EntriesContext';
import { isToday, isPast, parseISO, isValid, compareAsc } from 'date-fns'; // Import date helpers
import { confirmDelete } from '@/utils/confirmDelete'; // Import the new utility

// Define the new group types
type FocusGroup = 'Focus Now' | 'Later' | 'Notes';

// Remove local Entry type definition if it exists
// type Entry = { ... };

type OrganizedViewProps = {
  entries: Entry[];
  // Removed onUpdateCategory prop
};

// Helper function to group entries by focus/urgency
const groupEntriesByFocus = (entries: Entry[]): Record<FocusGroup, Entry[]> => {
  const groups: Record<FocusGroup, Entry[]> = {
    'Focus Now': [],
    'Later': [],
    'Notes': [],
  };

  // const now = new Date(); // Removed unused variable

  entries.forEach((entry) => {
    if (['idea', 'feeling', 'note'].includes(entry.type)) {
      groups['Notes'].push(entry);
    } else if (entry.type === 'task' || entry.type === 'event') {
      const highPriorityThreshold = 3; // Priority 1, 2, or 3
      let isScheduledForTodayOrPast = false;
      let isFutureScheduled = false;

      // First, check the scheduling
      if (entry.startTime && isValid(parseISO(entry.startTime))) {
        const startTimeDate = parseISO(entry.startTime);
        if (isToday(startTimeDate) || isPast(startTimeDate)) {
          isScheduledForTodayOrPast = true;
        } else {
          // It has a start time, but it's in the future
          isFutureScheduled = true;
        }
      }

      // Determine the group
      if (isScheduledForTodayOrPast) {
        // Anything scheduled for today or past goes to Focus Now
        groups['Focus Now'].push(entry);
      } else if (isFutureScheduled) {
        // Anything scheduled for the future goes to Later
        groups['Later'].push(entry);
      } else {
        // No valid start time, group by priority
        if (entry.priority <= highPriorityThreshold) {
          groups['Focus Now'].push(entry); // High priority unscheduled
        } else {
          groups['Later'].push(entry); // Low priority unscheduled
        }
      }
    }
  });

  // Sort entries within Focus Now and Later groups (by startTime, then priority)
  const sortEntries = (a: Entry, b: Entry): number => {
     const aTime = a.startTime ? parseISO(a.startTime).getTime() : Infinity;
     const bTime = b.startTime ? parseISO(b.startTime).getTime() : Infinity;
     if (aTime !== bTime) return compareAsc(aTime, bTime); // Sort by time first
     return a.priority - b.priority; // Then by priority
  };

  groups['Focus Now'].sort(sortEntries);
  groups['Later'].sort(sortEntries);
  // Optional: Sort Notes (e.g., by createdAt)
  groups['Notes'].sort((a, b) => compareAsc(parseISO(a.createdAt), parseISO(b.createdAt)));


  return groups;
};


// Define icons for the new groups using Font Awesome classes
const focusIcons: Record<FocusGroup, string> = {
  'Focus Now': 'fa-solid fa-fire-flame-simple', // Fire icon
  'Later': 'fa-solid fa-hourglass-half',      // Hourglass icon
  'Notes': 'fa-regular fa-note-sticky',       // Sticky note icon
};

// Define the desired order for the groups
const groupOrder: FocusGroup[] = ['Focus Now', 'Later', 'Notes'];


const OrganizedView: React.FC<OrganizedViewProps> = ({ entries }) => {
  const { handleDeleteEntry } = useEntries();

  const groupedEntries = useMemo(() => groupEntriesByFocus(entries), [entries]);

  // Filter out empty groups before rendering
  const groupsToRender = groupOrder.filter(groupName => groupedEntries[groupName]?.length > 0);


  if (groupsToRender.length === 0) {
    return null; // Don't render anything if all groups are empty
  }


  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-gray-900 font-heading">Categorised Thoughts</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {groupsToRender.map(groupName => (
          <div key={groupName} className="rounded-lg bg-white p-4 shadow-md">
            <h3 className="mb-3 flex items-center text-md font-medium text-gray-800 font-heading">
              <span className={`mr-2 w-4 text-center ${groupName === 'Focus Now' ? 'text-[#183153]' : 'text-gray-500'}`}>
                <i className={focusIcons[groupName]}></i>
              </span>
              {groupName}
            </h3>
            <ul className="space-y-1">
              {groupedEntries[groupName]?.map((entry) => (
                <li key={entry.id} className="text-sm text-gray-700">
                  <div className="flex items-center justify-between rounded p-1 hover:bg-gray-100 group">
                    <Link href={`/entry/${entry.id}`} className="flex items-center flex-grow mr-2 min-w-0">
                      <span className="truncate">{entry.text}</span> {/* Removed group-hover:text-blue-600 */}
                      <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                        {entry.startTime && (
                          <i className="fa-regular fa-clock text-gray-500" title="Has scheduled time"></i>
                        )}
                        {entry.note && (
                          <span className="text-xs" title="Has note">
                            🗒️
                          </span>
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const isConfirmed = await confirmDelete(
                          'Are you sure?',
                          `Do you really want to delete "${entry.text}"?`
                        );
                        if (isConfirmed) {
                          handleDeleteEntry(entry.id);
                        }
                      }}
                      className="ml-2 p-1 rounded text-[#183153] hover:bg-gray-100 flex-shrink-0"
                      title="Delete Entry"
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizedView;
