'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Entry } from '@/types';
import { format, parseISO, isSameDay, compareAsc } from 'date-fns';

interface DailyChronologicalListProps {
  selectedDate: Date | undefined;
  entries: Entry[];
}

const DailyChronologicalList: React.FC<DailyChronologicalListProps> = ({ selectedDate, entries }) => {
  const filteredAndSortedEntries = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return entries
      .filter(entry => entry.startTime && isSameDay(parseISO(entry.startTime), selectedDate))
      .sort((a, b) => {
        // Ensure startTime exists before comparing
        if (!a.startTime || !b.startTime) return 0;
        return compareAsc(parseISO(a.startTime), parseISO(b.startTime));
      });
  }, [selectedDate, entries]);

  if (!selectedDate) {
    return <p className="text-center text-gray-500 dark:text-gray-400">Select a date to see scheduled items.</p>;
  }

  if (filteredAndSortedEntries.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No items scheduled for {format(selectedDate, 'PPP')}.</p>;
  }

  // Simple rendering for now, styling can be enhanced later
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
        {format(selectedDate, 'EEEE, MMMM d')}
      </h2>
      <ul className="space-y-3">
        {filteredAndSortedEntries.map((entry) => (
          <li key={entry.id} className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:shadow-md transition-shadow duration-150">
            <Link href={`/entry/${entry.id}`} className="block group">
              <div className="flex items-start space-x-3">
                 {/* Placeholder for colored dot based on type */}
                 <span className={`mt-1 block h-2.5 w-2.5 rounded-full ${entry.isCompleted ? 'bg-gray-400' : 'bg-blue-500'}`}></span>
                 <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {entry.text}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {entry.startTime ? format(parseISO(entry.startTime), 'HH:mm') : ''}
                            {entry.endTime ? ` - ${format(parseISO(entry.endTime), 'HH:mm')}` : ''}
                        </span>
                    </div>
                    {entry.note && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate">
                            {entry.note}
                        </p>
                    )}
                 </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DailyChronologicalList;
