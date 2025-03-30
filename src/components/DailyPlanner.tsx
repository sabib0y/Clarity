'use client';

import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Entry = {
  text: string;
  type: string;
  priority?: number; // Add optional priority from API
};

type DailyPlannerProps = {
  entries: Entry[];
};

// Add a unique ID and priority for dnd-kit and sorting
type TaskWithTime = Entry & {
  id: string; // Unique ID for drag and drop
  timeSlot?: string;
  reminderSet?: boolean;
  isDropdownOpen?: boolean;
  priority: number; // Ensure priority is always present for sorting
};

// --- SortableTaskItem Component ---
type SortableTaskItemProps = {
  task: TaskWithTime;
  index: number; // Keep index for handlers that might still rely on it
  handleTimeSlotChange: (index: number, value: string) => void;
  setReminder: (index: number, offsetMinutes?: number) => void;
  toggleDropdown: (index: number) => void;
};

function SortableTaskItem({
  task,
  index,
  handleTimeSlotChange,
  setReminder,
  toggleDropdown,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // Add isDragging state
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Make item semi-transparent while dragging
    zIndex: isDragging ? 10 : 'auto', // Ensure dragging item is on top
  };

  // Simple Drag Handle Icon
  const DragHandleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400 dark:text-gray-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
    </svg>
  );


  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes} // Apply attributes to the main div
      // Changed dark background for better layering
      className={`flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm dark:border-gray-600 dark:bg-slate-800`}
    >
      {/* Drag Handle */}
      <div {...listeners} className={`mr-3 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}> {/* Apply listeners and cursor style only to the handle */}
        <DragHandleIcon />
      </div>
      {/* Task Text */}
      <span className="flex-grow pr-4 text-gray-800 dark:text-gray-300">{task.text}</span>
      {/* Controls */}
      <div className="relative flex items-center space-x-2">
        <input
          type="text"
          placeholder="8:00 AM"
          value={task.timeSlot}
          onChange={e => handleTimeSlotChange(index, e.target.value)}
          onClick={(e) => e.stopPropagation()} // Prevent drag start on input click
          // Added rounded-md, lightened dark text
          className="w-24 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
        />
        {/* Split Button Container */}
        {/* Ensured container has rounded corners */}
        <div className="flex rounded-md shadow" onClick={(e) => e.stopPropagation()} /* Prevent drag start on button clicks */>
          {/* Main Action Button */}
          <button
            type="button"
            onClick={() => setReminder(index)}
            disabled={task.reminderSet}
            title={task.reminderSet ? 'Reminder set' : 'Set reminder at specified time'}
            // Ensured rounded-l-md
            className={`rounded-l-md border-r border-blue-800 dark:border-gray-700 px-3 py-1 text-sm font-medium text-white ${
              task.reminderSet
                ? 'cursor-not-allowed bg-gray-400 dark:bg-gray-600'
                : 'bg-blue-700 hover:bg-blue-800 dark:bg-gray-600 dark:hover:bg-gray-500'
            }`}
          >
            {task.reminderSet ? 'Set' : 'Remind'}
          </button>
          {/* Dropdown Trigger Button */}
          <button
            type="button"
            onClick={() => toggleDropdown(index)}
            disabled={task.reminderSet}
            title="Reminder options"
            // Ensured rounded-r-md
            className={`rounded-r-md px-2 py-1 text-sm font-medium text-white ${
              task.reminderSet
                ? 'cursor-not-allowed bg-gray-400 dark:bg-gray-600'
                : 'bg-blue-700 hover:bg-blue-800 dark:bg-gray-600 dark:hover:bg-gray-500'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-3 w-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        {/* Dropdown Menu */}
        {task.isDropdownOpen && !task.reminderSet && (
          <div
            // Added rounded-md and shadow-lg (already present but confirmed), adjusted padding
            className="absolute right-0 top-full z-10 mt-1 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 dark:ring-gray-600"
            onClick={(e) => e.stopPropagation()} // Prevent drag start on dropdown click
          >
            {/* Added Label */}
            <span className="block px-4 pt-0 pb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Remind me...
            </span>
            {/* Option 1 */}
            <button
              type="button"
              onClick={() => setReminder(index, 15)}
              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <span>15 mins before</span>
              {/* Placeholder for checkmark - Add logic later if needed */}
              {/* {task.selectedOffset === 15 && <CheckIcon />} */}
            </button>
            {/* Option 2 */}
            <button
              type="button"
              onClick={() => setReminder(index, 30)}
              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <span>30 mins before</span>
              {/* Placeholder for checkmark */}
              {/* {task.selectedOffset === 30 && <CheckIcon />} */}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- DailyPlanner Component ---
const DailyPlanner: React.FC<DailyPlannerProps> = ({ entries }) => {
  // Helper to generate unique IDs - simple approach for now
  const generateId = (text: string, index: number) => `task-${index}-${text.slice(0, 10).replace(/\s+/g, '-')}`;

  // Function to map and sort entries
  const mapAndSortEntriesToTasks = (entriesToMap: Entry[], existingTasks: TaskWithTime[] = []): TaskWithTime[] => {
    const existingTaskMap = new Map(existingTasks.map(t => [t.id, t]));
    const mappedTasks = entriesToMap
      .filter(entry => entry.type === 'task')
      .map((task, index) => {
        const id = generateId(task.text, index); // Generate ID based on initial position/text
        const existingTask = existingTaskMap.get(id);
        return {
          ...task,
          id,
          priority: task.priority ?? 5, // Default priority if missing
          timeSlot: existingTask?.timeSlot || '',
          reminderSet: existingTask?.reminderSet || false,
          isDropdownOpen: existingTask?.isDropdownOpen || false,
        };
      });
    // Sort by priority
    return mappedTasks.sort((a, b) => a.priority - b.priority);
  };

  // Initialize state with sorted tasks
  const [tasks, setTasks] = useState<TaskWithTime[]>(() => mapAndSortEntriesToTasks(entries));

  // Update tasks if the entries prop changes, preserving order and state, then re-sort
  useEffect(() => {
    setTasks(currentTasks => {
      const newTasksFromEntries = mapAndSortEntriesToTasks(entries, currentTasks); // Map and sort new entries
      // Create a map of new tasks for quick lookup
      const newTaskMap = new Map(newTasksFromEntries.map(t => [t.id, t]));
      // Filter current tasks to keep only those still present in new entries, maintaining DND order
      const updatedTasks = currentTasks.filter(t => newTaskMap.has(t.id)); // Changed let to const
      // Add any truly new tasks (that weren't in currentTasks)
      newTasksFromEntries.forEach(newTask => {
        if (!currentTasks.some(t => t.id === newTask.id)) {
          // Find appropriate insertion point based on priority, respecting existing DND order
          let insertIndex = updatedTasks.findIndex(t => t.priority > newTask.priority);
          if (insertIndex === -1) {
             insertIndex = updatedTasks.length; // Insert at the end if no higher priority found
          }
          updatedTasks.splice(insertIndex, 0, newTask);
        }
      });
      // Ensure final list is sorted primarily by priority, but maintain relative DND order within priorities
      // This simple sort might override DND order if priorities change drastically.
      // A more complex merge might be needed for perfect DND preservation across priority changes.
      return updatedTasks.sort((a, b) => a.priority - b.priority);
    });
  }, [entries]); // Rerun only when entries change

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleTimeSlotChange = (index: number, value: string) => {
    // Find the task by index in the current potentially reordered list
    const taskId = tasks[index]?.id;
    if (!taskId) return;

    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, timeSlot: value } : task
      )
    );
  };

  const toggleDropdown = (index: number) => {
    const taskId = tasks[index]?.id;
    if (!taskId) return;

    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, isDropdownOpen: !task.isDropdownOpen } : { ...task, isDropdownOpen: false } // Close others
      )
    );
  };

  const setReminder = (index: number, offsetMinutes: number = 0) => {
    const taskId = tasks[index]?.id;
    const task = tasks.find(t => t.id === taskId); // Find task by ID

    if (task && task.timeSlot && !task.reminderSet) {
      const reminderTimeInfo = offsetMinutes > 0 ? `${offsetMinutes} mins before ${task.timeSlot}` : `at ${task.timeSlot}`;
      alert(`Reminder set for "${task.text}" ${reminderTimeInfo} (simulated).`);
      setTimeout(() => {
        alert(`Reminder: ${task.text} - ${reminderTimeInfo}`);
      }, 5000);

      setTasks(currentTasks =>
        currentTasks.map(t =>
          t.id === taskId ? { ...t, reminderSet: true, isDropdownOpen: false } : t
        )
      );
    } else if (task?.reminderSet) {
      alert('Reminder already set for this task.');
    } else {
      alert('Please enter a time slot before setting a reminder.');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        // Perform the move, DND kit handles visual update
        const movedTasks = arrayMove(items, oldIndex, newIndex);
        // Re-sort by priority after manual drag to maintain grouping (optional, depends on desired UX)
        // return movedTasks.sort((a, b) => a.priority - b.priority);
        return movedTasks; // Keep manual order after drag
      });
    }
  };

  // Use the state directly as it's now managed with sorting/DND
  const tasksToPlan = tasks;

  if (tasksToPlan.length === 0) {
    return (
      <div>
        <h2 className="mb-4 text-xl font-semibold">Daily Planner</h2>
        <p className="text-gray-600 dark:text-gray-400">No tasks found to plan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Daily Planner</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map(task => task.id)} // Pass array of IDs
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {tasksToPlan.map((task, index) => (
              <SortableTaskItem
                key={task.id} // Use unique ID as key
                task={task}
                index={index} // Pass index for handlers
                handleTimeSlotChange={handleTimeSlotChange}
                setReminder={setReminder}
                toggleDropdown={toggleDropdown}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default DailyPlanner;
