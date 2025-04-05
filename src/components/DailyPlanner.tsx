'use client';

import React, { useEffect, useState, useCallback } from 'react';
import * as chrono from 'chrono-node'; // Import chrono-node
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
// (Component remains the same, no changes needed here for adding tasks)
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
      {...attributes}
      // Updated styling for task items: removed bg, border, shadow; adjusted padding
      className={`flex items-center justify-between rounded-md p-3`}
    >
      {/* Drag Handle */}
      <div {...listeners} className={`mr-3 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
        <DragHandleIcon />
      </div>
      {/* Task Text */}
      <span className="flex-grow pr-4 text-sm text-gray-800">{task.text}</span> {/* Adjusted text size */}
      {/* Controls */}
      <div className="relative flex items-center space-x-2">
        <input
          type="text"
          placeholder="8:00 AM"
          value={task.timeSlot}
          onChange={e => handleTimeSlotChange(index, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          // Adjusted input styling: removed dark styles
          className="w-24 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 placeholder-gray-400"
        />
        {/* Split Button Container */}
        <div className="flex rounded-md shadow-sm" onClick={(e) => e.stopPropagation()}> {/* Added shadow-sm */}
          {/* Main Action Button */}
          <button
            type="button"
            onClick={() => setReminder(index)}
            disabled={task.reminderSet}
            title={task.reminderSet ? 'Reminder set' : 'Set reminder at specified time'}
            // Adjusted button styling: simpler gray, removed dark styles
            className={`rounded-l-md border-r border-gray-400 px-3 py-1 text-sm font-medium ${
              task.reminderSet
                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
            // Adjusted button styling: simpler gray, removed dark styles
            className={`rounded-r-md px-2 py-1 text-sm font-medium ${
              task.reminderSet
                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
            // Adjusted dropdown styling: removed dark styles
            className="absolute right-0 top-full z-10 mt-1 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Label */}
            <span className="block px-4 pt-0 pb-2 text-xs font-medium text-gray-500">
              Remind me...
            </span>
            {/* Option 1 */}
            <button
              type="button"
              onClick={() => setReminder(index, 15)}
              // Adjusted dropdown item styling: removed dark styles
              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              <span>15 mins before</span>
              {/* Placeholder for checkmark - Add logic later if needed */}
              {/* {task.selectedOffset === 15 && <CheckIcon />} */}
            </button>
            {/* Option 2 */}
            <button
              type="button"
              onClick={() => setReminder(index, 30)}
              // Adjusted dropdown item styling: removed dark styles
              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
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
  // State for the new task input
  const [newTaskText, setNewTaskText] = useState('');
  // Counter for unique IDs for manually added tasks
  const [newTaskCounter, setNewTaskCounter] = useState(0);

  // Helper to generate unique IDs - adapted for manual adds
  const generateId = useCallback((text: string, index: number, manualCounter?: number) => {
    // Use counter for manual adds to ensure uniqueness even if text is similar/empty initially
    const suffix = manualCounter !== undefined ? `manual-${manualCounter}` : `api-${index}`;
    return `task-${suffix}-${text.slice(0, 10).replace(/\s+/g, '-')}`;
  }, []); // No dependencies, function is stable

  // Function to map and sort entries from API (Mind Dump)
  // This function now ONLY handles the initial load/overwrite from Mind Dump entries
  const mapAndSortEntriesFromAPI = useCallback((entriesToMap: Entry[]): TaskWithTime[] => {
    const mappedTasks = entriesToMap
      .filter(entry => entry.type === 'task')
      .map((task, index) => {
        const id = generateId(task.text, index); // Generate ID based on API index/text
        return {
          ...task,
          id,
          priority: task.priority ?? 5, // Default priority if missing
          timeSlot: '', // Reset timeSlot on overwrite
          reminderSet: false, // Reset reminderSet on overwrite
          isDropdownOpen: false, // Reset dropdown on overwrite
        };
      });
    // Sort by priority
    return mappedTasks.sort((a, b) => a.priority - b.priority);
  }, [generateId]); // Dependency on generateId

  // Initialize state with sorted tasks from initial entries
  const [tasks, setTasks] = useState<TaskWithTime[]>(() => mapAndSortEntriesFromAPI(entries));

  // Update tasks ONLY when the entries prop changes (Mind Dump submitted)
  // This implements the user's request to OVERWRITE the planner state
  useEffect(() => {
    setTasks(mapAndSortEntriesFromAPI(entries));
  }, [entries, mapAndSortEntriesFromAPI]); // Rerun only when entries change

  // Handler for adding a new task manually
  const handleAddTask = () => {
    if (!newTaskText.trim()) return; // Don't add empty tasks

    const newTaskId = generateId(newTaskText, -1, newTaskCounter); // Use counter for ID
    const newTask: TaskWithTime = {
      id: newTaskId,
      text: newTaskText.trim(),
      type: 'task', // Default type
      priority: 5, // Default priority
      timeSlot: '',
      reminderSet: false,
      isDropdownOpen: false,
    };

    setTasks(currentTasks => [...currentTasks, newTask]); // Append the new task
    setNewTaskText(''); // Clear the input field
    setNewTaskCounter(prev => prev + 1); // Increment counter for next manual add
  };

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

  // Updated setReminder function
  const setReminder = async (index: number, offsetMinutes: number = 0) => {
    const taskId = tasks[index]?.id;
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    if (task.reminderSet) {
      alert('Reminder already set for this task.');
      return;
    }

    if (!task.timeSlot) {
      alert('Please enter a time/date before setting a reminder.');
      return;
    }

    // Parse the date/time string using chrono-node
    const now = new Date();
    // Use chrono.parse to get detailed results and apply options
    const results = chrono.parse(task.timeSlot, new Date(), { forwardDate: true });

    // Check if chrono found a valid date/time
    if (results.length === 0 || !results[0].start) {
      alert(`Could not understand the time: "${task.timeSlot}". Please try a different format (e.g., "10:30am", "2pm today", "14:00").`);
      console.error(`[Clarity] Chrono could not parse: "${task.timeSlot}"`); // Log parsing failure
      alert(`Could not understand the time: "${task.timeSlot}". Please try a different format (e.g., "10:30am", "2pm today", "14:00").`);
      return;
    }

    const parsedDate = results[0].start.date(); // Get the Date object
    console.log('[Clarity] Parsed Date:', parsedDate); // Log parsed date

    // Apply offset if specified
    let targetTime = parsedDate.getTime();
    if (offsetMinutes > 0) {
      targetTime -= offsetMinutes * 60 * 1000; // Subtract offset in milliseconds
    }

    const targetDate = new Date(targetTime);
    console.log('[Clarity] Target Date (after offset):', targetDate); // Log target date

    // Check if the target time is in the past
    if (targetDate.getTime() <= now.getTime()) {
      console.warn('[Clarity] Target time is in the past:', targetDate); // Log past time warning
      alert(`The specified time (${targetDate.toLocaleTimeString()}) is in the past.`);
      return;
    }

    // Check if the target date is today (as per plan)
    const isToday = targetDate.getFullYear() === now.getFullYear() &&
                    targetDate.getMonth() === now.getMonth() &&
                    targetDate.getDate() === now.getDate();

    if (!isToday) {
      alert(`Reminder set for "${task.text}" at ${targetDate.toLocaleString()}. (Note: PoC only triggers notifications for today).`);
      // Still mark reminder as set visually, even if notification won't fire today
      setTasks(currentTasks =>
        currentTasks.map(t =>
          t.id === taskId ? { ...t, reminderSet: true, isDropdownOpen: false } : t
        )
      );
      return; // Don't schedule timeout if not today
    }

    // --- Browser Notification Logic ---
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notification');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('[Clarity] Notification permission:', permission); // Log permission status
      if (permission === 'granted') {
        const delay = targetTime - now.getTime();
        console.log(`[Clarity] Scheduling notification with delay: ${delay}ms`); // Log delay
        const reminderTimeInfo = offsetMinutes > 0
          ? `${offsetMinutes} mins before ${parsedDate.toLocaleTimeString()}`
          : `at ${parsedDate.toLocaleTimeString()}`;

        setTimeout(() => {
          console.log(`[Clarity] Firing notification for: ${task.text}`); // Log inside timeout
          new Notification('Clarity Reminder', {
            body: `${task.text} - ${reminderTimeInfo}`,
            // icon: '/favicons/favicon-32x32.png' // Optional: Add an icon
          });
          // Optionally reset reminderSet state after notification fires
          // setTasks(currentTasks =>
          //   currentTasks.map(t =>
          //     t.id === taskId ? { ...t, reminderSet: false } : t
          //   )
          // );
        }, delay);

        alert(`Reminder scheduled for "${task.text}" ${reminderTimeInfo}.`);
        // Mark reminder as set visually
        setTasks(currentTasks =>
          currentTasks.map(t =>
            t.id === taskId ? { ...t, reminderSet: true, isDropdownOpen: false } : t
          )
        );

      } else if (permission === 'denied') {
        alert('Notification permission denied. Please enable notifications in browser settings.');
      } else {
        alert('Notification permission not granted.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      alert('Could not set reminder due to an error.');
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
  // --- Removed Test Notification Function ---

  // --- Grouping Logic ---
  const priorityMap: Record<number, string> = {
    1: 'Morning',
    2: 'Midday',
    3: 'Afternoon',
    4: 'Evening',
    5: 'Anytime / Flexible',
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    const groupName = priorityMap[task.priority] || 'Anytime / Flexible'; // Default to Anytime
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(task);
    return acc;
  }, {} as Record<string, TaskWithTime[]>);

  // Define the order for the groups
  const groupOrder = ['Morning', 'Midday', 'Afternoon', 'Evening', 'Anytime / Flexible'];

  // Get sorted group names based on the defined order
  const sortedGroupNames = Object.keys(groupedTasks).sort((a, b) => {
    const indexA = groupOrder.indexOf(a);
    const indexB = groupOrder.indexOf(b);
    // Handle cases where a group might not be in groupOrder (shouldn't happen with default)
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
  // --- End Grouping Logic ---

  // Use the state directly - tasks are already sorted by priority initially
  // const tasksToPlan = tasks; // We will use groupedTasks now

  return (
    <div className="space-y-6"> {/* Increased spacing */}
      {/* Adjusted section title styling */}
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Daily Planner</h2>

      {/* Input for adding new tasks - Keep existing style for now */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a new task directly..."
          // Setting input styling based on dev tools: bg-slate-700, border-slate-600
          className="flex-grow rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-400"
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); }} // Allow adding with Enter key
        />
        <button
          type="button"
          onClick={handleAddTask}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-700 dark:hover:bg-green-600"
        >
          Add Task
        </button>
        {/* Removed Test Notification Button */}
      </div>

      {/* Display message if no tasks */}
      {tasks.length === 0 && (
         <p className="pt-2 text-gray-600 dark:text-gray-400">No tasks in the planner. Add some above or via the Mind Dump.</p>
      )}

      {/* Render grouped tasks */}
      {tasks.length > 0 && (
         <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {/* We need SortableContext PER GROUP if we want drag-and-drop within groups */}
          {/* For now, render groups without intra-group sorting for simplicity */}
          {/* To enable sorting within groups, wrap each group's list in SortableContext */}
          <div className="space-y-6">
            {sortedGroupNames.map(groupName => (
              // Apply card styling to group container
              <div key={groupName} className="rounded-lg bg-white p-4 shadow-md">
                {/* Adjusted group title styling */}
                <h3 className="mb-3 text-md font-medium text-gray-800">{groupName}</h3>
                {/* Wrap this div in SortableContext for intra-group sorting */}
                <SortableContext
                   items={groupedTasks[groupName].map(task => task.id)} // IDs for this group
                   strategy={verticalListSortingStrategy}
                 >
                  <div className="space-y-3">
                    {groupedTasks[groupName].map((task) => {
                      // Find the original index in the main 'tasks' array for handlers
                      const originalIndex = tasks.findIndex(t => t.id === task.id);
                      return (
                        <SortableTaskItem
                          key={task.id}
                          task={task}
                          index={originalIndex} // Use original index for handlers
                          handleTimeSlotChange={handleTimeSlotChange}
                          setReminder={setReminder}
                          toggleDropdown={toggleDropdown}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
};

export default DailyPlanner;
