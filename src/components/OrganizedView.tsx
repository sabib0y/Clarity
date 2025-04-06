'use client';

import React from 'react'; // Removed useState
import Link from 'next/link'; // Import Link
import type { Entry } from '@/types'; // Import full Entry type

// Remove local Entry type definition if it exists (it might be slightly different)
// type Entry = { ... };

type OrganizedViewProps = {
  entries: Entry[];
  // Removed onUpdateCategory prop
};

// Helper function to group entries by type
const groupEntriesByType = (entries: Entry[]) => {
  return entries.reduce(
    (acc, entry) => {
      const { type } = entry;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(entry);
      return acc;
    },
    {} as Record<string, Entry[]>,
  );
};

const categoryOrder: Record<string, number> = {
  task: 1,
  event: 2,
  idea: 3,
  feeling: 4,
  note: 5,
};

// Removed unused availableCategories constant
// const availableCategories = ['task', 'event', 'idea', 'feeling', 'note'];

const categoryIcons: Record<string, string> = {
  task: '✅',
  event: '🎯',
  idea: '➕',
  feeling: '❤️', 
  note: '📝',
};

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const OrganizedView: React.FC<OrganizedViewProps> = ({ entries }) => {
  // Removed editingItemId state

  if (!entries || entries.length === 0) {
    return null; // Don't render anything if there are no entries
  }

  const groupedEntries = groupEntriesByType(entries);
  const sortedCategories = Object.keys(groupedEntries).sort(
    (a, b) => (categoryOrder[a] || 99) - (categoryOrder[b] || 99),
  );

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Categorised Thoughts</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sortedCategories.map(category => (
          // The key should ideally be on the top-level element returned by map
          <div key={category} className="rounded-lg bg-white p-4 shadow-md">
            <h3 className="mb-3 flex items-center text-md font-medium text-gray-800">
              <span className="mr-2">{categoryIcons[category] || '❓'}</span>
              {capitalizeFirstLetter(category)}s
            </h3>
            <ul className="space-y-1"> {/* Reduced spacing slightly */}
              {groupedEntries[category]?.map((entry) => (
                <li key={entry.id} className="text-sm text-gray-700">
                  {/* Wrap the entry text in a Link */}
                  <Link href={`/entry/${entry.id}`} className="flex items-center justify-between rounded p-1 hover:bg-gray-100">
                    <span>{entry.text}</span>
                    {/* Show note icon if note exists */}
                    {entry.note && (
                      <span className="ml-2 text-xs" title="Has note">🗒️</span>
                    )}
                  </Link>
                  {/* Removed inline editing controls */}
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
