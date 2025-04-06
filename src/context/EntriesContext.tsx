'use client'; // Context needs to be client-side

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { Entry, CategoriseResponse } from '@/types'; // Import shared types

// Define the shape of the context data
interface EntriesContextType {
  categorizedEntries: Entry[];
  isLoading: boolean; // Add loading state
  errorMessage: string | null; // Add error state
  handleCategorise: (data: CategoriseResponse) => void;
  handleUpdateCategory: (itemId: string, newCategory: string) => void;
  handleUpdateNote: (itemId: string, newNote: string) => void;
  handleUpdateTitle: (itemId: string, newTitle: string) => void;
  handleUpdateStartTime: (itemId: string, newTimestamp: string | null) => void; // Changed handler
  handleUpdateEndTime: (itemId: string, newTimestamp: string | null) => void; // New handler
  handleReorderEntries: (reorderedEntries: Entry[]) => void; // New handler for reordering
  handleAddTaskDirectly: (taskText: string) => void; // New handler for adding tasks from planner
  handleToggleComplete: (itemId: string) => void; // New handler for toggling completion
  setIsLoading: (loading: boolean) => void;
  setErrorMessage: (message: string | null) => void;
}

// Create the context with a default value (can be undefined or null initially)
const EntriesContext = createContext<EntriesContextType | undefined>(undefined);

// Create the Provider component
interface EntriesProviderProps {
  children: ReactNode;
}

export const EntriesProvider: React.FC<EntriesProviderProps> = ({ children }) => {
  const [categorizedEntries, setCategorizedEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handler for processing categorized entries from the API
  const handleCategorise = useCallback((data: CategoriseResponse) => {
    // Note: API already adds id and createdAt now
    setCategorizedEntries(data.entries || []);
    setErrorMessage(null); // Clear error on success
    setIsLoading(false); // Stop loading on success
  }, []);

  // Handler for updating an entry's category
  const handleUpdateCategory = useCallback((itemId: string, newCategory: string) => {
    setCategorizedEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === itemId ? { ...entry, type: newCategory } : entry
      )
    );
  }, []);

  // Handler for updating an entry's note
  const handleUpdateNote = useCallback((itemId: string, newNote: string) => {
    setCategorizedEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === itemId ? { ...entry, note: newNote } : entry
      )
    );
  }, []);

  // Handler for updating an entry's title (text)
  const handleUpdateTitle = useCallback((itemId: string, newTitle: string) => {
    setCategorizedEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === itemId ? { ...entry, text: newTitle } : entry
      )
    );
  }, []);

  // Handler for updating an entry's start time
  const handleUpdateStartTime = useCallback((itemId: string, newTimestamp: string | null) => {
    setCategorizedEntries((prevEntries) =>
      prevEntries.map((entry) => {
        if (entry.id === itemId) {
          const updatedEntry = { ...entry, startTime: newTimestamp ?? undefined };
          // If startTime is cleared, also clear endTime
          if (newTimestamp === null) {
            updatedEntry.endTime = undefined;
            // updatedEntry.reminderSet = false; // Removed reminder logic
          }
          return updatedEntry;
        }
        return entry;
      })
    );
  }, []);

  // Handler for updating an entry's end time
  const handleUpdateEndTime = useCallback((itemId: string, newTimestamp: string | null) => {
    setCategorizedEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === itemId ? { ...entry, endTime: newTimestamp ?? undefined } : entry
      )
    );
  }, []);

  // Handler for reordering entries (e.g., via drag and drop)
  const handleReorderEntries = useCallback((reorderedEntries: Entry[]) => {
    setCategorizedEntries(reorderedEntries);
  }, []);

  // Handler for toggling the completion status of an entry
  const handleToggleComplete = useCallback((itemId: string) => {
    setCategorizedEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === itemId
          ? { ...entry, isCompleted: !entry.isCompleted } // Toggle the status
          : entry
      )
    );
  }, []);

  // Handler for adding a task directly (e.g., from Daily Planner input)
  const handleAddTaskDirectly = useCallback((taskText: string) => {
    const newTask: Entry = {
      id: `direct-${Date.now()}-${Math.random().toString(16).slice(2)}`, // Simple unique ID
      text: taskText,
      type: 'task', // Default type
      priority: 5, // Default priority (e.g., Anytime/Flexible)
      createdAt: new Date().toISOString(),
      // startTime, endTime, note are initially undefined
    };
    setCategorizedEntries((prevEntries) => [...prevEntries, newTask]);
  }, []);


  // Handler for setting error message explicitly
  const handleSetError = useCallback((message: string | null) => {
      setErrorMessage(message);
      if (message) {
          setCategorizedEntries([]); // Clear entries on error if needed
      }
      setIsLoading(false); // Stop loading on error
  }, []);


  // Value provided by the context
  const value = {
    categorizedEntries,
    isLoading,
    errorMessage,
    handleCategorise,
    handleUpdateCategory,
    handleUpdateNote,
    handleUpdateTitle,
    handleUpdateStartTime, // Pass new handler
    handleUpdateEndTime, // Pass new handler
    handleReorderEntries, // Pass new handler
    handleAddTaskDirectly, // Pass new handler
    handleToggleComplete, // Pass new handler
    // handleSetReminderStatus, // Removed reminder handler
    setIsLoading,
    setErrorMessage: handleSetError,
  };

  return (
    <EntriesContext.Provider value={value}>
      {children}
    </EntriesContext.Provider>
  );
};

// Custom hook to use the EntriesContext
export const useEntries = (): EntriesContextType => {
  const context = useContext(EntriesContext);
  if (context === undefined) {
    throw new Error('useEntries must be used within an EntriesProvider');
  }
  return context;
};
