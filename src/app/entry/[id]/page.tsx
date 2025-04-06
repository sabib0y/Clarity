'use client';

import React, { useState, useEffect } from 'react'; // Keep the one with useState, useEffect
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEntries } from '@/context/EntriesContext';
import { formatISO, parseISO, isValid } from 'date-fns'; // Import isValid

export default function EntryDetailPage() {
  const params = useParams();
  const {
    categorizedEntries,
    handleUpdateNote,
    handleUpdateTitle,
    handleUpdateCategory,
    handleUpdateStartTime, // Correct handler
    handleUpdateEndTime, // Correct handler
    // handleSetReminderStatus, // Removed reminder handler
  } = useEntries();

  // Extract the id, ensuring it's a string
  const id = typeof params.id === 'string' ? params.id : undefined;

  // Find the entry based on the id from the route
  const entry = categorizedEntries.find((e) => e.id === id);

  // State for managing the note locally while editing
  const [currentNote, setCurrentNote] = useState(entry?.note || '');
  // State for title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(entry?.text || '');

  // Update local states if the entry from context changes
  useEffect(() => {
    setCurrentNote(entry?.note || '');
    setCurrentTitle(entry?.text || ''); // Update title state too
    setIsEditingTitle(false); // Reset editing state on entry change
  }, [entry]); // Depend on the whole entry object

  // State for category editing
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(entry?.type || '');
  // State for start/end time inputs
  const [currentStartTime, setCurrentStartTime] = useState<string>('');
  const [currentEndTime, setCurrentEndTime] = useState<string>('');


  // Update category and time states if entry changes
  useEffect(() => {
    setCurrentCategory(entry?.type || '');
    setIsEditingCategory(false);
    // Format existing ISO strings for datetime-local input, handle invalid dates
    const initialStartTime = entry?.startTime && isValid(parseISO(entry.startTime))
      ? formatISO(parseISO(entry.startTime)).slice(0, 16)
      : '';
    const initialEndTime = entry?.endTime && isValid(parseISO(entry.endTime))
      ? formatISO(parseISO(entry.endTime)).slice(0, 16)
      : '';
    setCurrentStartTime(initialStartTime);
    setCurrentEndTime(initialEndTime);
  }, [entry]); // Depend on the whole entry object now


  // TODO: Define or import availableCategories
  const availableCategories = ['task', 'event', 'idea', 'feeling', 'note']; // Define locally for now


  // --- Reminder Logic Removed ---


  if (!entry) {
    return (
      <div className="container mx-auto p-4">
        <p>Entry not found.</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Link href="/" className="mb-4 inline-block text-blue-600 hover:underline">
        &larr; Back to Overview
      </Link>

      {/* Title Section with Editing */}
      <div className="mb-1 flex items-center space-x-2"> {/* Reduced bottom margin */}
        {isEditingTitle ? (
          <>
            <input
              type="text"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              className="flex-grow rounded border border-gray-300 px-2 py-1 text-2xl font-bold focus:border-indigo-500 focus:ring-indigo-500"
              autoFocus
            />
            <button
              onClick={() => {
                handleUpdateTitle(entry.id, currentTitle);
                setIsEditingTitle(false);
              }}
              className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => {
                setCurrentTitle(entry.text); // Reset to original
                setIsEditingTitle(false);
              }}
              className="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">{entry.text}</h1>
            <button
              onClick={() => setIsEditingTitle(true)}
              className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
              title="Edit Title"
            >
              Edit
            </button>
          </>
        )}
      </div>

      {/* Metadata Section with Category Editing */}
      <div className="mb-4 flex items-center space-x-4 text-sm text-gray-500"> {/* Use flex for alignment */}
        {isEditingCategory ? (
          <div className="flex items-center space-x-1">
            <span className="mr-1">Category:</span>
            <select
              value={currentCategory}
              onChange={(e) => setCurrentCategory(e.target.value)}
              className="rounded border border-gray-300 bg-white px-1 py-0.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                handleUpdateCategory(entry.id, currentCategory);
                setIsEditingCategory(false);
              }}
              className="rounded bg-green-500 px-2 py-0.5 text-xs text-white hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => {
                setCurrentCategory(entry.type); // Reset
                setIsEditingCategory(false);
              }}
              className="rounded bg-gray-500 px-2 py-0.5 text-xs text-white hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-1">
             <span>Category: {entry.type}</span>
             <button
               onClick={() => setIsEditingCategory(true)}
               className="rounded bg-green-500 px-2 py-0.5 text-xs text-white hover:bg-green-600"
               title="Change Category"
             >
               Change
             </button>
          </div>
        )}
        <span>|</span> {/* Separator */}
         <span>Priority: {entry.priority}</span>
         <span>|</span> {/* Separator */}
         <span>Created: {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> {/* Show time only */}
       </div>

       {/* Start/End Time Inputs and Reminder */}
       {(entry.type === 'task' || entry.type === 'event') && (
         <div className="my-4 space-y-2"> {/* Stack inputs vertically */}
           {/* Start Time */}
           <div className="flex items-center space-x-2">
             <label htmlFor="startTime" className="w-20 text-sm font-medium text-gray-700"> {/* Fixed width label */}
               Start Time:
             </label>
             <input
               type="datetime-local"
               id="startTime"
               value={currentStartTime}
               onChange={(e) => setCurrentStartTime(e.target.value)}
               onBlur={() => {
                 const dateValue = currentStartTime ? new Date(currentStartTime) : null;
                 const isoTimestamp = dateValue && isValid(dateValue) ? formatISO(dateValue) : null;
                 if (currentStartTime === '' || isoTimestamp) {
                   handleUpdateStartTime(entry.id, isoTimestamp);
                 } else {
                   console.warn("Invalid start date entered, not saving.");
                   const originalValue = entry?.startTime && isValid(parseISO(entry.startTime)) ? formatISO(parseISO(entry.startTime)).slice(0, 16) : '';
                   setCurrentStartTime(originalValue);
                 }
               }}
               className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:ring-indigo-500"
             />
             {/* Reminder Button Removed */}
             {/* Clear Start Time Button */}
             {currentStartTime && (
                <button
                  onClick={() => {
                     setCurrentStartTime('');
                     handleUpdateStartTime(entry.id, null); // Also clears end time via handler logic
                  }}
                  className="ml-auto rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600" // Added ml-auto to push right
                  title="Clear start time and end time"
                >
                  Clear
                </button>
             )}
           </div>
           {/* End Time */}
           <div className="flex items-center space-x-2">
              <label htmlFor="endTime" className="w-20 text-sm font-medium text-gray-700"> {/* Fixed width label */}
                End Time:
              </label>
              <input
                type="datetime-local"
                id="endTime"
                value={currentEndTime}
                onChange={(e) => setCurrentEndTime(e.target.value)}
                onBlur={() => {
                  const dateValue = currentEndTime ? new Date(currentEndTime) : null;
                  const isoTimestamp = dateValue && isValid(dateValue) ? formatISO(dateValue) : null;
                  if (currentEndTime === '' || isoTimestamp) {
                     // Basic validation: Ensure end time is after start time if both exist
                     if (isoTimestamp && entry.startTime && parseISO(isoTimestamp) <= parseISO(entry.startTime)) {
                        alert("End time must be after start time.");
                        const originalValue = entry?.endTime && isValid(parseISO(entry.endTime)) ? formatISO(parseISO(entry.endTime)).slice(0, 16) : '';
                        setCurrentEndTime(originalValue); // Revert
                     } else {
                        handleUpdateEndTime(entry.id, isoTimestamp);
                     }
                  } else {
                    console.warn("Invalid end date entered, not saving.");
                    const originalValue = entry?.endTime && isValid(parseISO(entry.endTime)) ? formatISO(parseISO(entry.endTime)).slice(0, 16) : '';
                    setCurrentEndTime(originalValue);
                  }
                }}
                className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={!entry.startTime} // Disable end time if start time isn't set
                title={!entry.startTime ? "Set start time first" : ""}
              />
              {/* Clear End Time Button */}
              {currentEndTime && (
                 <button
                   onClick={() => {
                      setCurrentEndTime('');
                      handleUpdateEndTime(entry.id, null);
                   }}
                   className="ml-auto rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                   title="Clear end time"
                 >
                   Clear
                 </button>
              )}
           </div>
         </div>
       )}


       <div className="mt-6">
        <h2 className="mb-2 text-lg font-semibold">Notes</h2>
        {/* TODO: Add textarea for notes, bind to handleUpdateNote */}
        <textarea
          placeholder="Add notes here..."
          rows={8}
          className="w-full rounded border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
          value={currentNote} // Use controlled component
          onChange={(e) => setCurrentNote(e.target.value)} // Update local state on change
          onBlur={() => handleUpdateNote(entry.id, currentNote)} // Update global state on blur
        />
      </div>

      {/* Removed placeholder buttons */}

    </div>
  );
}
