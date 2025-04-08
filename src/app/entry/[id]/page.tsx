'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEntries } from '@/context/EntriesContext';
import { formatISO, parseISO, isValid } from 'date-fns';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function EntryDetailPage() {
  const params = useParams();
  const {
    categorizedEntries,
    handleUpdateNote,
    handleUpdateTitle,
    handleUpdateCategory,
    handleUpdateStartTime,
    handleUpdateEndTime,
    handleDeleteEntry,
  } = useEntries();
  const router = useRouter();

  const id = typeof params.id === 'string' ? params.id : undefined;

  const entry = categorizedEntries.find((e) => e.id === id);

  const [currentNote, setCurrentNote] = useState(entry?.note || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(entry?.text || '');

  useEffect(() => {
    setCurrentNote(entry?.note || '');
    setCurrentTitle(entry?.text || '');
    setIsEditingTitle(false);
  }, [entry]);

  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(entry?.type || '');
  const [currentStartTime, setCurrentStartTime] = useState<string>('');
  const [currentEndTime, setCurrentEndTime] = useState<string>('');


  useEffect(() => {
    setCurrentCategory(entry?.type || '');
    setIsEditingCategory(false);
    const initialStartTime = entry?.startTime && isValid(parseISO(entry.startTime))
      ? formatISO(parseISO(entry.startTime)).slice(0, 16)
      : '';
    const initialEndTime = entry?.endTime && isValid(parseISO(entry.endTime))
      ? formatISO(parseISO(entry.endTime)).slice(0, 16)
      : '';
    setCurrentStartTime(initialStartTime);
    setCurrentEndTime(initialEndTime);
  }, [entry]);


  const availableCategories = ['task', 'event', 'idea', 'feeling', 'note'];


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

      <div className="mb-1 flex items-center space-x-2">
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
                setCurrentTitle(entry.text);
                setIsEditingTitle(false);
              }}
              className="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold font-heading">{entry.text}</h1>
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

      <div className="mb-4 flex items-center space-x-4 text-sm text-gray-500">
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
                setCurrentCategory(entry.type);
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
         <span>|</span>
         <span>Created: {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
       </div>

       {(entry.type === 'task' || entry.type === 'event') && (
         <div className="my-4 space-y-2">
           <div className="flex items-center space-x-2">
             <label htmlFor="startTime" className="w-20 text-sm font-medium text-gray-700">
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
             {currentStartTime && (
                <button
                  onClick={() => {
                     setCurrentStartTime('');
                     handleUpdateStartTime(entry.id, null);
                  }}
                  className="ml-auto rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                  title="Clear start time and end time"
                >
                  Clear
                </button>
             )}
           </div>
           <div className="flex items-center space-x-2">
              <label htmlFor="endTime" className="w-20 text-sm font-medium text-gray-700">
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
                     if (isoTimestamp && entry.startTime && parseISO(isoTimestamp) <= parseISO(entry.startTime)) {
                        alert("End time must be after start time.");
                        const originalValue = entry?.endTime && isValid(parseISO(entry.endTime)) ? formatISO(parseISO(entry.endTime)).slice(0, 16) : '';
                        setCurrentEndTime(originalValue);
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
                disabled={!entry.startTime}
                title={!entry.startTime ? "Set start time first" : ""}
              />
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
        <h2 className="mb-2 text-lg font-semibold font-heading">Notes</h2>
        <textarea
          placeholder="Add notes here..."
          rows={8}
          className="w-full rounded border border-gray-300 p-2 focus:border-indigo-500 focus:ring-indigo-500"
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          onBlur={() => handleUpdateNote(entry.id, currentNote)}
        />
      </div>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <button
          onClick={async () => {
            if (!entry) return;

            const result = await MySwal.fire({
              title: 'Are you sure?',
              text: `Do you really want to delete "${entry.text}"? This cannot be undone.`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#d33',
              cancelButtonColor: '#3085d6',
              confirmButtonText: 'Yes, delete it!',
              customClass: {
                popup: '!bg-white dark:!bg-gray-800 !rounded-lg',
                title: '!text-gray-900 dark:!text-gray-100',
                htmlContainer: '!text-gray-700 dark:!text-gray-300',
                confirmButton: '!bg-red-600 hover:!bg-red-700 !focus:ring-red-500',
                cancelButton: '!bg-blue-600 hover:!bg-blue-700 !focus:ring-blue-500',
              }
            });

            if (result.isConfirmed) {
              handleDeleteEntry(entry.id);
              router.push('/');
            }
          }}
          className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Delete Entry
        </button>
      </div>

    </div>
  );
}
