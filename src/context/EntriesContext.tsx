'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { Entry, CategoriseResponse } from '@/types';

export interface EntriesContextType {
  categorizedEntries: Entry[];
  isLoading: boolean;
  errorMessage: string | null;
  handleCategorise: (data: CategoriseResponse) => void;
  handleUpdateCategory: (itemId: string, newCategory: string) => void;
  handleUpdateNote: (itemId: string, newNote: string) => void;
  handleUpdateTitle: (itemId: string, newTitle: string) => void;
  handleUpdateStartTime: (itemId: string, newTimestamp: string | null) => void;
  handleUpdateEndTime: (itemId: string, newTimestamp: string | null) => void;
  handleReorderEntries: (reorderedEntries: Entry[]) => void;
  handleAddTaskDirectly: (taskText: string) => void;
  handleToggleComplete: (itemId: string) => void;
  handleDeleteEntry: (itemId: string) => void;
  setIsLoading: (loading: boolean) => void;
  setErrorMessage: (message: string | null) => void;
}

const EntriesContext = createContext<EntriesContextType | undefined>(undefined);

interface EntriesProviderProps {
  children: ReactNode;
}

export const EntriesProvider: React.FC<EntriesProviderProps> = ({ children }) => {
  const [categorizedEntries, setCategorizedEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCategorise = useCallback((data: CategoriseResponse) => {
    setCategorizedEntries(data.entries || []);
    setErrorMessage(null);
    setIsLoading(false);
  }, []);

  const handleUpdateCategory = useCallback((itemId: string, newCategory: string) => {
    setCategorizedEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === itemId ? { ...entry, type: newCategory } : entry
      )
    );
  }, []);

  const handleUpdateNote = useCallback((itemId: string, newNote: string) => {
    setCategorizedEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === itemId ? { ...entry, note: newNote } : entry
      )
    );
  }, []);

  const handleUpdateTitle = useCallback((itemId: string, newTitle: string) => {
    setCategorizedEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === itemId ? { ...entry, text: newTitle } : entry
      )
    );
  }, []);

  const handleUpdateStartTime = useCallback((itemId: string, newTimestamp: string | null) => {
    setCategorizedEntries((prevEntries) =>
      prevEntries.map((entry) => {
        if (entry.id === itemId) {
          const updatedEntry = { ...entry, startTime: newTimestamp ?? undefined };
          if (newTimestamp === null) {
            updatedEntry.endTime = undefined;
          }
          return updatedEntry;
        }
        return entry;
      })
    );
  }, []);

  const handleUpdateEndTime = useCallback((itemId: string, newTimestamp: string | null) => {
    setCategorizedEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === itemId ? { ...entry, endTime: newTimestamp ?? undefined } : entry
      )
    );
  }, []);

  const handleReorderEntries = useCallback((reorderedEntries: Entry[]) => {
    setCategorizedEntries(reorderedEntries);
  }, []);

  const handleToggleComplete = useCallback((itemId: string) => {
    setCategorizedEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === itemId
          ? { ...entry, isCompleted: !entry.isCompleted }
          : entry
      )
    );
  }, []);

  const handleAddTaskDirectly = useCallback((taskText: string) => {
    const newTask: Entry = {
      id: `direct-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text: taskText,
      type: 'task',
      priority: 5,
      createdAt: new Date().toISOString(),
    };
    setCategorizedEntries((prevEntries) => [...prevEntries, newTask]);
  }, []);

  const handleDeleteEntry = useCallback((itemId: string) => {
    setCategorizedEntries((prevEntries) =>
      prevEntries.filter((entry) => entry.id !== itemId)
    );
  }, []);


  const handleSetError = useCallback((message: string | null) => {
      setErrorMessage(message);
      if (message) {
          setCategorizedEntries([]);
      }
      setIsLoading(false);
  }, []);


  const value = {
    categorizedEntries,
    isLoading,
    errorMessage,
    handleCategorise,
    handleUpdateCategory,
    handleUpdateNote,
    handleUpdateTitle,
    handleUpdateStartTime,
    handleUpdateEndTime,
    handleReorderEntries,
    handleAddTaskDirectly,
    handleToggleComplete,
    handleDeleteEntry,
    setIsLoading,
    setErrorMessage: handleSetError,
  };

  return (
    <EntriesContext.Provider value={value}>
      {children}
    </EntriesContext.Provider>
  );
};

export const useEntries = (): EntriesContextType => {
  const context = useContext(EntriesContext);
  if (context === undefined) {
    throw new Error('useEntries must be used within an EntriesProvider');
  }
  return context;
};
