'use client';

import React from 'react';

type Entry = {
  text: string;
  type: string;
};

type OrganizedViewProps = {
  entries: Entry[];
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

// Define the order of categories
const categoryOrder: Record<string, number> = {
  task: 1,
  event: 2,
  idea: 3,
  feeling: 4,
  note: 5,
};

// Map category types to emojis
const categoryIcons: Record<string, string> = {
  task: '✅',
  event: '🎯', // Using target as per image, could use 📅
  idea: '➕', // Using plus as per image, could use 💡
  feeling: '❤️', // Using heart as per image
  note: '📝',
};

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const OrganizedView: React.FC<OrganizedViewProps> = ({ entries }) => {
  if (!entries || entries.length === 0) {
    return null; // Don't render anything if there are no entries
  }

  const groupedEntries = groupEntriesByType(entries);
  const sortedCategories = Object.keys(groupedEntries).sort(
    (a, b) => (categoryOrder[a] || 99) - (categoryOrder[b] || 99),
  );

  return (
    <div className="space-y-4">
      <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Categorised Thoughts:</h2> {/* Dark mode heading */}
      {sortedCategories.map(category => (
        <div key={category} className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"> {/* Dark mode card */}
          <h3 className="mb-3 flex items-center text-lg font-medium text-gray-900 dark:text-gray-100"> {/* Dark mode title */}
            <span className="mr-2">{categoryIcons[category] || '❓'}</span>
            {capitalizeFirstLetter(category)}s
          </h3>
          <ul className="list-disc space-y-1.5 pl-8">
            {groupedEntries[category]?.map((entry, index) => (
              <li key={`${category}-${index}`} className="text-gray-800 dark:text-gray-300"> {/* Dark mode list item text */}
                {entry.text}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default OrganizedView;
