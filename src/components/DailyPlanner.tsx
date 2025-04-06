'use client';

import React, { useState, useMemo } from 'react';
import { parseISO, isValid, format, isSameDay, isSameWeek, isSameMonth, isSameYear } from 'date-fns';
import { useEntries } from '@/context/EntriesContext';
import type { Entry } from '@/types';
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import AgendaView from './AgendaView';


type SortableTaskItemProps = {
  task: Entry;
};


function SortableTaskItem({ task }: SortableTaskItemProps) {
  const { handleToggleComplete } = useEntries();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

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
      className={`flex items-center rounded-md p-3 space-x-3`}
    >
      <input
        type="checkbox"
        checked={!!task.isCompleted}
        onChange={() => handleToggleComplete(task.id)}
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        onClick={(e) => e.stopPropagation()}
      />
      <div {...listeners} className={`${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
        <DragHandleIcon />
      </div>
      <Link href={`/entry/${task.id}`} className={`flex-grow text-sm text-gray-800 hover:text-indigo-600 ${task.isCompleted ? 'line-through opacity-50' : ''}`}>
        {task.text}
      </Link>
      <div className="relative flex items-center space-x-2 ml-auto">
        <div className="text-xs text-gray-600">
          {task.startTime && isValid(parseISO(task.startTime)) ? (
            <>
              <span>{format(parseISO(task.startTime), 'p')}</span>
              {task.endTime && isValid(parseISO(task.endTime)) && parseISO(task.endTime) > parseISO(task.startTime) ? (
                <span> - {format(parseISO(task.endTime), 'p')}</span>
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
     handleReorderEntries,
     handleAddTaskDirectly,
  } = useEntries();

  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('all');


  const tasks = useMemo(() => {
    const now = new Date();

    const filteredTasks = categorizedEntries.filter(entry => {
      if (entry.type !== 'task') {
        return false;
      }

      if (!entry.startTime || !isValid(parseISO(entry.startTime))) {
        return true;
      }

      const taskDate = parseISO(entry.startTime);

      switch (selectedTimeFilter) {
        case 'day':
          return isSameDay(taskDate, now);
        case 'week':
          return isSameWeek(taskDate, now, { weekStartsOn: 1 });
        case 'month':
          return isSameMonth(taskDate, now);
        case 'year':
          return isSameYear(taskDate, now);
        case 'all':
        default:
          return true;
      }
    });

    return filteredTasks.sort((a, b) => a.priority - b.priority);

  }, [categorizedEntries, selectedTimeFilter]);

  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = () => {
    const trimmedText = newTaskText.trim();
    if (!trimmedText) return;
    handleAddTaskDirectly(trimmedText);
    setNewTaskText('');
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {


      const oldIndex = categorizedEntries.findIndex((entry) => entry.id === active.id);
      const newIndex = categorizedEntries.findIndex((entry) => entry.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedEntries = arrayMove(categorizedEntries, oldIndex, newIndex);
        handleReorderEntries(reorderedEntries);
      } else {
        console.warn('Could not find dragged item or drop target in entries list.');
      }
    }
  };

  const priorityMap: Record<number, string> = {
    1: 'Morning',
    2: 'Midday',
    3: 'Afternoon',
    4: 'Evening',
    5: 'Anytime / Flexible',
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    const groupName = priorityMap[task.priority] || 'Anytime / Flexible';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(task);
    return acc;
  }, {} as Record<string, Entry[]>);

  const groupOrder = ['Morning', 'Midday', 'Afternoon', 'Evening', 'Anytime / Flexible'];

  const sortedGroupNames = Object.keys(groupedTasks).sort((a, b) => {
    const indexA = groupOrder.indexOf(a);
    const indexB = groupOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="space-y-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">Daily Planner</h2>

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


          {tasks.length === 0 && (
             <p className="pt-2 text-gray-600 dark:text-gray-400">No tasks match the current filter.</p>
          )}

          {tasks.length > 0 && (
             <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-6">
            {sortedGroupNames.map(groupName => (
              <div key={groupName} className="rounded-lg bg-white p-4 shadow-md">
                <h3 className="mb-3 text-md font-medium text-gray-800">{groupName}</h3>
                <SortableContext
                   items={groupedTasks[groupName].map(task => task.id)}
                   strategy={verticalListSortingStrategy}
                 >
                  <div className="space-y-3">
                    {groupedTasks[groupName].map((task) => (
                      <SortableTaskItem
                        key={task.id}
                        task={task}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>
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
