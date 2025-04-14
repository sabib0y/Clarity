'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Entry, EntryCategory } from '@/types'; // Added EntryCategory
import { format, parseISO, compareAsc, isValid, startOfDay, isWithinInterval } from 'date-fns';

// Helper function to get color based on category
const getCategoryColor = (category: EntryCategory | undefined): string => {
  switch (category) {
    case 'Task': return 'bg-blue-500'; // Example color - adjust as needed
    case 'Event': return 'bg-purple-500'; // Example color - adjust as needed
    case 'Idea': return 'bg-yellow-500'; // Example color - adjust as needed
    case 'Feeling': return 'bg-pink-500'; // Example color - adjust as needed
    case 'Note': return 'bg-gray-400'; // Example color - adjust as needed
    default: return 'bg-gray-300';
  }
};

interface DailyChronologicalListProps {
  selectedDate: Date | undefined;
  entries: Entry[];
}

const DailyChronologicalList: React.FC<DailyChronologicalListProps> = ({ selectedDate, entries }) => {
  const filteredAndSortedEntries = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const normalizedSelectedDate = startOfDay(selectedDate); // Normalize selected date

    return entries
      .filter(entry => {
        if (!entry.startTime || !isValid(parseISO(entry.startTime))) {
          return false; // Skip entries without a valid start time
        }

        const startDate = startOfDay(parseISO(entry.startTime));
        let endDate = startDate; // Default end date

        if (entry.endTime && isValid(parseISO(entry.endTime))) {
          const parsedEndTime = startOfDay(parseISO(entry.endTime));
          if (parsedEndTime >= startDate) { // Allow same day end date
            endDate = parsedEndTime;
          }
        }

        // Check if the selected date falls within the entry's interval
        return isWithinInterval(normalizedSelectedDate, { start: startDate, end: endDate });
      })
      .sort((a, b) => {
        if (!a.startTime || !b.startTime) return 0;
        return compareAsc(parseISO(a.startTime), parseISO(b.startTime));
      });
  }, [selectedDate, entries]);

  // Group entries by day for the new layout - Moved before early returns
  const groupedEntries = useMemo(() => {
    return filteredAndSortedEntries.reduce((acc, entry) => {
      // Ensure startTime exists before trying to parse and format
      if (entry.startTime) {
        const dayKey = format(parseISO(entry.startTime), 'yyyy-MM-dd'); // Group by start time day
        if (!acc[dayKey]) {
          acc[dayKey] = [];
        }
        acc[dayKey].push(entry);
      }
      return acc;
    }, {} as Record<string, Entry[]>);
  }, [filteredAndSortedEntries]);

  const dayKeys = Object.keys(groupedEntries).sort(); // Ensure days are in order

  // Early returns moved after hook definitions
  if (!selectedDate) {
    // Removed dark mode class
    return <p className="text-center text-gray-500">Select a date to see scheduled items.</p>;
  }

  if (filteredAndSortedEntries.length === 0) {
     // Removed dark mode class
    return <p className="text-center text-gray-500">No items scheduled for {format(selectedDate, 'PPP')}.</p>;
  }

  return (
    <div className="mt-6 w-full max-w-md mx-auto"> {/* Added margin-top and constrained width */}
      {dayKeys.map(dayKey => (
        <div key={dayKey} className="mb-6"> {/* Spacing between days */}
          <h2 className="text-xs font-semibold uppercase text-gray-500 mb-3 tracking-wider">
            {/* Format day heading like "WEDNESDAY 13" */}
            {format(parseISO(dayKey), 'EEEE d')}
          </h2>
          <ul className="space-y-4"> {/* Increased spacing between items */}
            {groupedEntries[dayKey].map((entry) => (
              <li key={entry.id} className="flex items-start space-x-4"> {/* Use flex for layout */}
                {/* Time Column */}
                <div className="w-12 flex-shrink-0 text-right text-xs text-gray-500 pt-0.5">
                  {entry.startTime && isValid(parseISO(entry.startTime)) ? (
                    <>
                      <div>{format(parseISO(entry.startTime), 'HH:mm')}</div>
                      {entry.endTime && isValid(parseISO(entry.endTime)) && (
                        <div className="mt-0.5">{format(parseISO(entry.endTime), 'HH:mm')}</div>
                      )}
                    </>
                  ) : (
                     <div>--:--</div> // Placeholder if no time
                  )}
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0"> {/* Allow content to wrap */}
                  <Link href={`/entry/${entry.id}`} className="group">
                    <div className="flex items-start space-x-2">
                      {/* Colored Dot */}
                      <span className={`mt-1.5 block h-2 w-2 rounded-full flex-shrink-0 ${getCategoryColor(entry.category)}`}></span>
                      {/* Text and Note */}
                      <div>
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 block truncate"> {/* Use block and truncate */}
                          {entry.text}
                        </span>
                        {entry.note && (
                          <p className="text-xs text-gray-500 mt-0.5"> {/* Removed truncate */}
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default DailyChronologicalList;
