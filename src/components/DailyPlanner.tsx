'use client';

import React, { useState, useMemo } from 'react';
import { parseISO, isValid, format, isSameDay, isSameWeek, isSameMonth, isSameYear } from 'date-fns';
import { useEntries } from '@/context/EntriesContext';
import type { Entry } from '@/types';
// Removed Dnd imports
import Link from 'next/link';
import AgendaView from './AgendaView';


// Removed SortableTaskItem component

// Simple Planner Item component (non-sortable) - Renamed
type PlannerItemProps = {
  item: Entry; // Renamed prop
};

function PlannerItem({ item }: PlannerItemProps) { // Renamed component and prop
  const { handleToggleComplete } = useEntries();

  // Only show checkbox for tasks
  const showCheckbox = item.type === 'task';

  return (
    <div className="flex items-center rounded-md p-3 space-x-3">
      {showCheckbox ? (
        <input
          type="checkbox"
          checked={!!item.isCompleted}
          onChange={() => handleToggleComplete(item.id)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          onClick={(e) => e.stopPropagation()} // Prevent link navigation on checkbox click
        />
      ) : (
        // Placeholder or icon for non-task items (e.g., events)
        <div className="h-4 w-4 flex-shrink-0"></div> // Adjust size as needed
      )}
      <Link href={`/entry/${item.id}`} className={`flex-grow text-sm text-gray-800 hover:text-indigo-600 ${item.isCompleted ? 'line-through opacity-50' : ''}`}>
        {item.text}
      </Link>
      <div className="relative flex items-center space-x-2 ml-auto">
        <div className="text-xs text-gray-600">
          {item.startTime && isValid(parseISO(item.startTime)) ? (
            <>
              <span>{format(parseISO(item.startTime), 'p')}</span>
              {item.endTime && isValid(parseISO(item.endTime)) && parseISO(item.endTime) > parseISO(item.startTime) ? (
                <span> - {format(parseISO(item.endTime), 'p')}</span>
              ) : null}
            </>
          ) : (
            <span className="italic text-gray-400">Not scheduled</span>
          )}
        </div>
      </div>
    </div>
  );
}

const DailyPlanner: React.FC = () => {
  const {
     categorizedEntries,
     // handleReorderEntries, // Removed
     handleAddTaskDirectly,
  } = useEntries();

  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('all');


  const plannerItems = useMemo(() => { // Renamed variable
    const now = new Date();

    const filteredItems = categorizedEntries.filter(entry => { // Renamed variable
      // Include both tasks and events
      if (entry.type !== 'task' && entry.type !== 'event') {
        return false;
      }

      if (!entry.startTime || !isValid(parseISO(entry.startTime))) {
        return true;
      }

      const itemDate = parseISO(entry.startTime); // Renamed variable

      switch (selectedTimeFilter) {
        case 'day':
          return isSameDay(itemDate, now);
        case 'week':
          return isSameWeek(itemDate, now, { weekStartsOn: 1 });
        case 'month':
          return isSameMonth(itemDate, now);
        case 'year':
          return isSameYear(itemDate, now);
        case 'all':
        default:
          return true;
      }
    });

    // Sort by priority
    return filteredItems.sort((a, b) => a.priority - b.priority); // Renamed variable

  }, [categorizedEntries, selectedTimeFilter]);

  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = () => {
    const trimmedText = newTaskText.trim();
    if (!trimmedText) return;
    handleAddTaskDirectly(trimmedText);
    setNewTaskText('');
  };

  // Removed sensors and handleDragEnd

  const priorityMap: Record<number, string> = {
    1: 'Morning',
    2: 'Midday',
    3: 'Afternoon',
    4: 'Evening',
    5: 'Anytime / Flexible',
  };

  // Group items by priority group name
  const groupedPlannerItems = plannerItems.reduce((acc, item) => { // Renamed variable
    const groupName = priorityMap[item.priority] || 'Anytime / Flexible'; // Use item
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(item); // Use item
    return acc;
  }, {} as Record<string, Entry[]>);

  const groupOrder = ['Morning', 'Midday', 'Afternoon', 'Evening', 'Anytime / Flexible'];

  // Sort group names based on the defined order
  const sortedGroupNames = Object.keys(groupedPlannerItems).sort((a, b) => { // Use renamed variable
    const indexA = groupOrder.indexOf(a);
    const indexB = groupOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="space-y-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 font-heading">Daily Planner</h2>

      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveView('list')}
            className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium ${
              activeView === 'list'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium ${
              activeView === 'calendar'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Calendar
          </button>
        </nav>
      </div>

      {activeView === 'list' && (
        <>
          <div className="flex space-x-2">
            <input
              type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a new task directly..."
          className="flex-grow rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-400"
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); }}
        />
        <button
          type="button"
          onClick={handleAddTask}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-700 dark:hover:bg-green-600"
        >
              Add Task
            </button>
          </div>

          <div className="my-4 flex justify-center space-x-2 rounded-md bg-gray-100 p-1">
            {(['day', 'week', 'month', 'year', 'all'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedTimeFilter(filter)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  selectedTimeFilter === filter
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>


          {plannerItems.length === 0 && ( // Use renamed variable
             <p className="pt-2 text-gray-600 dark:text-gray-400">No tasks or events match the current filter.</p> // Updated text
          )}

          {plannerItems.length > 0 && ( // Use renamed variable
            // Removed DndContext wrapper
            <div className="space-y-6">
              {sortedGroupNames.map(groupName => (
                <div key={groupName} className="rounded-lg bg-white p-4 shadow-md">
                  <h3 className="mb-3 text-md font-medium text-gray-800 font-heading">{groupName}</h3>
                  {/* Removed SortableContext wrapper */}
                  <div className="space-y-3">
                    {groupedPlannerItems[groupName].map((item) => ( // Use renamed variable and item
                      <PlannerItem // Use the renamed PlannerItem
                        key={item.id} // Use item
                        item={item} // Use item
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeView === 'calendar' && (
        <AgendaView />
      )}
    </div>
  );
};

export default DailyPlanner;
