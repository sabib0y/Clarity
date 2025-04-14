'use client';

import React, { useState, useMemo, useEffect } from 'react'; // Added useEffect back
import { parseISO, isValid, format, isSameDay, isSameWeek, isSameMonth, isSameYear } from 'date-fns';
import { useEntries } from '@/context/EntriesContext';
import type { Entry } from '@/types';
// Simple Grip Vertical Icon (example)
const GripVerticalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
  </svg>
);
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'; // Removed DragStartEvent import
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import AgendaView from './AgendaView';


// --- Sortable Planner Item ---
type SortablePlannerItemProps = {
  item: Entry;
  // Removed isAnyItemDragging prop
};

function SortablePlannerItem({ item }: SortablePlannerItemProps) { // Removed prop
  const { handleToggleComplete } = useEntries();
  const {
    attributes, // Keep attributes for accessibility etc.
    listeners, // These will now apply only to the handle
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  // Removed useEffect

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Example: make item semi-transparent while dragging
    // Add touchAction: 'none' if needed for touch devices, though PointerSensor often handles this
  };

  // Only show checkbox for tasks
  const showCheckbox = item.type === 'task';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes} // Apply attributes (like role) to the main div
      // Removed listeners from main div
      className="flex items-center rounded-md p-3 space-x-3 bg-white shadow" // Removed touch-none, handle will have it
    >
      {/* Drag Handle */}
      <span
        {...listeners} // Apply listeners ONLY to the handle
        className="cursor-grab touch-none text-gray-400 hover:text-gray-600 px-1" // Style the handle
        aria-label="Drag to reorder"
      >
        <GripVerticalIcon />
      </span>

      {/* Checkbox */}
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
      <Link
        href={`/entry/${item.id}`}
        className={`flex-grow text-sm text-gray-800 hover:text-indigo-600 ${item.isCompleted ? 'line-through opacity-50' : ''}`}
        // Removed onClick handler - no longer needed
      >
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

// --- Planner Component ---
const DailyPlanner: React.FC = () => {
  const {
    categorizedEntries,
    handleReorderEntries, // Re-added
    handleAddTaskDirectly,
  } = useEntries();

  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('all');
  const [localPlannerItems, setLocalPlannerItems] = useState<Entry[]>([]); // Local state for immediate UI update

  // Sync local state when context entries change
  useEffect(() => {
    setLocalPlannerItems(categorizedEntries);
  }, [categorizedEntries]);


  const plannerItems = useMemo(() => {
    const now = new Date();

    // Filter based on local state now
    const filteredItems = localPlannerItems.filter(entry => {
      // Include both tasks and events
      if (entry.type !== 'task' && entry.type !== 'event') {
        return false;
      }

      // If filtering by time, only include items with a valid start time
      if (selectedTimeFilter !== 'all' && (!entry.startTime || !isValid(parseISO(entry.startTime)))) {
        return false; // Exclude items without start time unless showing 'all'
      }

      // If showing 'all', include items without start time
      if (selectedTimeFilter === 'all' && (!entry.startTime || !isValid(parseISO(entry.startTime)))) {
        return true;
      }


      // Proceed with date filtering if startTime is valid
      const itemDate = parseISO(entry.startTime!); // Safe to use ! due to checks above

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
          return true; // Already handled items with start times
      }
    });

    // Sort by sortOrder (handle potential undefined values)
    return filteredItems.sort((a, b) => {
      const orderA = a.sortOrder ?? Infinity; // Treat undefined as last
      const orderB = b.sortOrder ?? Infinity;
      return orderA - orderB;
    });

  }, [localPlannerItems, selectedTimeFilter]); // Depend on local state

  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = () => {
    const trimmedText = newTaskText.trim();
    if (!trimmedText) return;
    handleAddTaskDirectly(trimmedText);
    setNewTaskText('');
  };

  // --- DND Setup ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Removed handleDragStart

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Use localPlannerItems for index finding and arrayMove
      const oldIndex = localPlannerItems.findIndex((item) => item.id === active.id);
      const newIndex = localPlannerItems.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(localPlannerItems, oldIndex, newIndex);

        // Update local state immediately for instant UI feedback
        setLocalPlannerItems(reordered);

        // Update context/DB in the background
        handleReorderEntries(reordered);
      }
    }
  };
  // --- End DND Setup ---

  // Removed priorityMap, groupedPlannerItems, groupOrder, sortedGroupNames
  /*
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
  */

  return (
    <div className="space-y-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900 font-heading">Planner</h2>

      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveView('list')}
            className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm ${
              activeView === 'list'
                ? 'border-[#141211] text-gray-500 font-bold' // Changed border color
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 font-medium' // Added font-medium for inactive
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm ${
              activeView === 'calendar'
                ? 'border-[#141211] text-gray-500 font-bold' // Changed border color
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 font-medium' // Added font-medium for inactive
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
              className="flex-grow rounded-md border border-stone-900 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-500" // Changed bg, border, text, placeholder
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); }}
            />
            {/* Changed button style to icon button */}
            <button
              type="button"
              onClick={handleAddTask}
              className="flex-shrink-0 rounded-full border border-stone-900 bg-transparent p-2 text-stone-900 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Add Task" // Added aria-label for accessibility
            >
              <i className="fa-solid fa-plus h-5 w-5"></i> {/* Added icon, adjusted size */}
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

          {plannerItems.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              // Removed onDragStart
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localPlannerItems.map(item => item.id)} // Use local state for SortableContext items
                strategy={verticalListSortingStrategy}
              >
                {/* Render a single flat list */}
                <div className="space-y-3 rounded-lg bg-gray-50 p-4 shadow-inner">
                  {/* Map over local state for rendering */}
                  {localPlannerItems.map((item) => (
                    <SortablePlannerItem
                      key={item.id}
                      item={item}
                      // Removed isAnyItemDragging prop
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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
