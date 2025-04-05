'use client';

import React, { useState } from 'react'; // Import useState

type Entry = {
  id: string; 
  text: string;
  type: string;
  priority: number;
};

type OrganizedViewProps = {
  entries: Entry[];
  onUpdateCategory: (itemId: string, newCategory: string) => void;
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

const availableCategories = ['task', 'event', 'idea', 'feeling', 'note'];

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

const OrganizedView: React.FC<OrganizedViewProps> = ({ entries, onUpdateCategory }) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null); // State for editing

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
          <div key={category} className="rounded-lg bg-white p-4 shadow-md">
            <h3 className="mb-3 flex items-center text-md font-medium text-gray-800">
              <span className="mr-2">{categoryIcons[category] || '❓'}</span>
              {capitalizeFirstLetter(category)}s
            </h3>
            <ul className="space-y-2">
              {groupedEntries[category]?.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between text-sm text-gray-700">
                  <span>{entry.text}</span>
                  <div className="ml-2 flex items-center space-x-1">
                    {editingItemId === entry.id ? (
                      <select
                        value={entry.type}
                        onChange={(e) => {
                          onUpdateCategory(entry.id, e.target.value);
                          setEditingItemId(null);
                        }}
                        onBlur={() => setEditingItemId(null)}
                        className="rounded border border-gray-300 bg-white px-1 py-0.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        autoFocus // Focus the select when it appears
                      >
                        {availableCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {capitalizeFirstLetter(cat)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-gray-500">({capitalizeFirstLetter(entry.type)})</span>
                    )}
                    <button
                      onClick={() => setEditingItemId(entry.id)}
                      className="p-0.5 text-gray-400 hover:text-gray-600"
                      title="Edit category"
                      aria-label="Edit category"
                    >
                      ✏️ 
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
