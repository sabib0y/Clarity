'use client';

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';
import type { Entry } from '@/types'; // Removed CategoriseResponse
import { createClient } from '@/lib/supabase/client'; // Import Supabase client
import type { SupabaseClient, User } from '@supabase/supabase-js';

// Define the shape of the database row (matches SQL schema)
// We might not use all fields directly in the frontend Entry type
interface EntryRow {
  id: string;
  user_id: string;
  text: string;
  type: string;
  priority: number;
  note?: string | null; // DB can have null
  created_at: string;
  start_time?: string | null; // DB can have null
  end_time?: string | null; // DB can have null
  is_completed?: boolean | null; // Added completion flag
  sort_order?: number | null; // Added for DnD ordering
}

// Map DB row to frontend Entry type
function mapRowToEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    text: row.text,
    type: row.type,
    priority: row.priority,
    note: row.note ?? undefined, // Handle null from DB
    createdAt: row.created_at,
    startTime: row.start_time ?? undefined, // Handle null from DB
    endTime: row.end_time ?? undefined, // Handle null from DB
    isCompleted: row.is_completed ?? false, // Handle null/missing from DB
    sortOrder: row.sort_order ?? undefined, // Handle null/missing from DB
  };
}

export interface EntriesContextType {
  categorizedEntries: Entry[];
  isLoading: boolean;
  errorMessage: string | null;
  user: User | null; // Add user state
  supabase: SupabaseClient; // Expose client instance
  // handleCategorise: (data: CategoriseResponse) => void; // Responsibility likely shifts to API
  handleUpdateCategory: (itemId: string, newCategory: string) => Promise<void>;
  handleUpdateNote: (itemId: string, newNote: string) => Promise<void>;
  handleUpdateTitle: (itemId: string, newTitle: string) => Promise<void>;
  handleUpdateStartTime: (
    itemId: string,
    newTimestamp: string | null
  ) => Promise<void>;
  handleUpdateEndTime: (
    itemId: string,
    newTimestamp: string | null
  ) => Promise<void>;
  handleReorderEntries: (reorderedEntries: Entry[]) => Promise<void>; // Re-added for DnD
  handleAddTaskDirectly: (taskText: string) => Promise<void>;
  handleToggleComplete: (itemId: string) => Promise<void>;
  handleDeleteEntry: (itemId: string) => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  setErrorMessage: (message: string | null) => void;
  fetchEntries: () => Promise<void>; // Add function to fetch entries
}

const EntriesContext = createContext<EntriesContextType | undefined>(undefined);

interface EntriesProviderProps {
  children: ReactNode;
}

export const EntriesProvider: React.FC<EntriesProviderProps> = ({
  children,
}) => {
  const supabase = createClient(); // Initialize Supabase client
  const [user, setUser] = useState<User | null>(null);
  const [categorizedEntries, setCategorizedEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch user session and set up auth listener
  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      // Fetch initial entries only if user is logged in
      if (session?.user) {
        await fetchEntries(supabase, session.user.id);
      } else {
        setIsLoading(false); // Not logged in, stop loading
        setCategorizedEntries([]); // Clear entries if logged out
      }
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // Fetch entries when user logs in, clear when logs out
      if (session?.user) {
        fetchEntries(supabase, session.user.id);
      } else {
        setCategorizedEntries([]);
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, [supabase]); // Dependency array includes supabase client instance

  // Fetch entries from Supabase
  const fetchEntries = useCallback(
    async (client: SupabaseClient, userId: string | undefined) => {
      if (!userId) {
        setCategorizedEntries([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      try {
        const { data, error } = await client
          .from('entries')
          .select('*')
          .eq('user_id', userId)
          .order('sort_order', { ascending: true, nullsFirst: false }); // Order by sort_order

        if (error) throw error;

        setCategorizedEntries(data?.map(mapRowToEntry) || []);
      } catch (error: unknown) { // Use unknown instead of any
        console.error('Detailed error fetching entries:', error); // More detailed log
        // Attempt to stringify for more info, fallback for circular structures
        try {
          console.error('Stringified error:', JSON.stringify(error, null, 2));
        } catch (stringifyError) {
          console.error('Could not stringify error:', stringifyError);
        }
        // Type guard to safely access error properties
        const message = error instanceof Error ? error.message : 'Unknown error';
        setErrorMessage(`Failed to load entries: ${message}`);
        setCategorizedEntries([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Re-fetch entries manually if needed (e.g., after API categorization)
  const triggerFetchEntries = useCallback(async () => {
    if (user) {
      await fetchEntries(supabase, user.id);
    }
  }, [user, supabase, fetchEntries]);


  // --- Refactored Handlers ---

  const handleUpdateCategory = useCallback(
    async (itemId: string, newCategory: string) => {
      if (!user) return;
      // Optimistic update (optional)
      // setCategorizedEntries((prev) => prev.map(e => e.id === itemId ? {...e, type: newCategory} : e));
      try {
        const { error } = await supabase
          .from('entries')
          .update({ type: newCategory })
          .eq('id', itemId)
          .eq('user_id', user.id); // Ensure user owns the entry
        if (error) throw error;
        // Re-fetch or update local state more accurately
        await triggerFetchEntries();
      } catch (error: unknown) {
        console.error('Error updating category:', error);
        const message = error instanceof Error ? error.message : String(error);
        setErrorMessage(`Failed to update category: ${message}`);
        // Revert optimistic update if needed
        await triggerFetchEntries();
      }
    },
    [user, supabase, triggerFetchEntries]
  );

  const handleUpdateNote = useCallback(
    async (itemId: string, newNote: string) => {
      if (!user) return;
      try {
        const { error } = await supabase
          .from('entries')
          .update({ note: newNote })
          .eq('id', itemId)
          .eq('user_id', user.id);
        if (error) throw error;
        await triggerFetchEntries();
      } catch (error: unknown) {
        console.error('Error updating note:', error);
        const message = error instanceof Error ? error.message : String(error);
        setErrorMessage(`Failed to update note: ${message}`);
        await triggerFetchEntries();
      }
    },
    [user, supabase, triggerFetchEntries]
  );

  const handleUpdateTitle = useCallback(
    async (itemId: string, newTitle: string) => {
      if (!user) return;
      try {
        const { error } = await supabase
          .from('entries')
          .update({ text: newTitle })
          .eq('id', itemId)
          .eq('user_id', user.id);
        if (error) throw error;
        await triggerFetchEntries();
      } catch (error: unknown) {
        console.error('Error updating title:', error);
        const message = error instanceof Error ? error.message : String(error);
        setErrorMessage(`Failed to update title: ${message}`);
        await triggerFetchEntries();
      }
    },
    [user, supabase, triggerFetchEntries]
  );

  const handleUpdateStartTime = useCallback(
    async (itemId: string, newTimestamp: string | null) => {
      if (!user) return;
      try {
        const updates: Partial<EntryRow> = { start_time: newTimestamp };
        if (newTimestamp === null) {
          updates.end_time = null; // Also clear end time if start time is cleared
        }
        const { error } = await supabase
          .from('entries')
          .update(updates)
          .eq('id', itemId)
          .eq('user_id', user.id);
        if (error) throw error;
        await triggerFetchEntries();
      } catch (error: unknown) {
        console.error('Error updating start time:', error);
        const message = error instanceof Error ? error.message : String(error);
        setErrorMessage(`Failed to update start time: ${message}`);
        await triggerFetchEntries();
      }
    },
    [user, supabase, triggerFetchEntries]
  );

  const handleUpdateEndTime = useCallback(
    async (itemId: string, newTimestamp: string | null) => {
      if (!user) return;
      try {
        const { error } = await supabase
          .from('entries')
          .update({ end_time: newTimestamp })
          .eq('id', itemId)
          .eq('user_id', user.id);
        if (error) throw error;
        await triggerFetchEntries();
      } catch (error: unknown) {
        console.error('Error updating end time:', error);
        const message = error instanceof Error ? error.message : String(error);
        setErrorMessage(`Failed to update end time: ${message}`);
        await triggerFetchEntries();
      }
    },
    [user, supabase, triggerFetchEntries]
  );

  const handleToggleComplete = useCallback(
    async (itemId: string) => {
      if (!user) return;
      // Find current state first
      const entry = categorizedEntries.find(e => e.id === itemId);
      if (!entry) return;

      try {
        const { error } = await supabase
          .from('entries')
          .update({ is_completed: !entry.isCompleted }) // Toggle based on current state
          .eq('id', itemId)
          .eq('user_id', user.id);
        if (error) throw error;
        await triggerFetchEntries();
      } catch (error: unknown) {
        console.error('Error toggling complete:', error);
        const message = error instanceof Error ? error.message : String(error);
        setErrorMessage(`Failed to toggle complete: ${message}`);
        await triggerFetchEntries();
      }
    },
    [user, supabase, categorizedEntries, triggerFetchEntries] // Add categorizedEntries dependency
  );

  const handleAddTaskDirectly = useCallback(
    async (taskText: string) => {
      if (!user) return;
      const newTaskRow: Omit<EntryRow, 'id' | 'created_at' | 'user_id'> & { user_id: string } = {
        user_id: user.id, // Associate with current user
        text: taskText,
        type: 'task',
        priority: 5, // Default priority
        note: null,
        start_time: null,
        end_time: null,
        // is_completed: false, // REMOVED - Let DB handle default
        sort_order: null, // Explicitly set sort_order to null
      };
      try {
        // Explicitly list columns in the insert object
        const { error } = await supabase.from('entries').insert({
          user_id: newTaskRow.user_id,
          text: newTaskRow.text,
          type: newTaskRow.type,
          priority: newTaskRow.priority,
          note: newTaskRow.note,
          start_time: newTaskRow.start_time,
          end_time: newTaskRow.end_time,
          sort_order: newTaskRow.sort_order,
          // We are still omitting is_completed, letting the DB handle the default
        });
        if (error) throw error;
        await triggerFetchEntries(); // Re-fetch to get the new task with DB-generated ID/timestamp
      } catch (error: unknown) {
        console.error('Detailed error adding task:', error); // More detailed log
        // Attempt to stringify for more info, fallback for circular structures
        try {
          console.error('Stringified error:', JSON.stringify(error, null, 2));
        } catch (stringifyError) {
          console.error('Could not stringify error:', stringifyError);
        }
        // Try to get a more specific message
        let message = 'Unknown error';
        if (error instanceof Error) {
          message = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          // Handle potential Supabase error object structure
          message = String(error.message);
        } else {
          message = String(error);
        }
        setErrorMessage(`Failed to add task: ${message}`);
      }
    },
    [user, supabase, triggerFetchEntries]
  );

  const handleDeleteEntry = useCallback(
    async (itemId: string) => {
      if (!user) return;
      // Optimistic update (optional)
      // setCategorizedEntries((prev) => prev.filter((entry) => entry.id !== itemId));
      try {
        const { error } = await supabase
          .from('entries')
          .delete()
          .eq('id', itemId)
          .eq('user_id', user.id); // Ensure user owns the entry
        if (error) throw error;
        // If not optimistic, re-fetch
         await triggerFetchEntries();
      } catch (error: unknown) {
        console.error('Error deleting entry:', error);
        const message = error instanceof Error ? error.message : String(error);
        setErrorMessage(`Failed to delete entry: ${message}`);
        // Revert optimistic update if needed
         await triggerFetchEntries();
      }
    },
    [user, supabase, triggerFetchEntries]
  );

  const handleReorderEntries = useCallback(
    async (reorderedEntries: Entry[]) => {
      if (!user) return;

      // Optimistic update (apply immediately to UI)
      // Ensure we are setting a NEW array reference using spread operator
      setCategorizedEntries([...reorderedEntries]);

      // Removed unused 'updates' constant
      // Removed console.log

      try {
        // Removed console.log
        // Prepare updates for Supabase using explicit update calls
        const updatePromises = reorderedEntries.map((entry, index) =>
          supabase
            .from('entries')
            .update({ sort_order: index })
            .eq('id', entry.id)
            // Ensure user owns the entry being updated (redundant if RLS is correct, but safe)
            .eq('user_id', user.id)
        );

        // Removed console.log
        // Execute all update promises
        const results = await Promise.all(updatePromises);
        // Removed console.log

        // Check for errors in any of the updates
        const updateError = results.find((result) => result.error)?.error;

        if (updateError) {
          // Removed console.error
          // Revert optimistic update on error
          // Removed console.log
          await triggerFetchEntries();
          throw updateError; // Throw the specific Supabase error
        }
        // Removed console.log
        // No need to re-fetch on success, rely on optimistic update.
        // await triggerFetchEntries(); // REMOVED THIS LINE
      } catch (error: unknown) { // Catch errors from Promise.all or the throw above
        // Removed console.error
        const message = error instanceof Error ? error.message : String(error);
        setErrorMessage(`Failed to reorder entries: ${message}`);
        // Ensure UI reverts if something went wrong
        await triggerFetchEntries();
      }
    },
    [user, supabase, triggerFetchEntries]
  );


  // --- End Refactored Handlers ---

  const handleSetError = useCallback((message: string | null) => {
    setErrorMessage(message);
    // Don't clear entries on error anymore, let fetch handle it
    // if (message) {
    //     setCategorizedEntries([]);
    // }
    setIsLoading(false); // Ensure loading stops on manual error set
  }, []);

  const value: EntriesContextType = {
    categorizedEntries,
    isLoading,
    errorMessage,
    user, // Expose user
    supabase, // Expose client
    // handleCategorise, // Commented out - needs rethink with API changes
    handleUpdateCategory,
    handleUpdateNote,
    handleUpdateTitle,
    handleUpdateStartTime,
    handleUpdateEndTime,
    handleReorderEntries, // Re-added
    handleAddTaskDirectly,
    handleToggleComplete,
    handleDeleteEntry,
    setIsLoading,
    setErrorMessage: handleSetError,
    fetchEntries: triggerFetchEntries, // Expose fetch function
  };

  return (
    <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>
  );
};

export const useEntries = (): EntriesContextType => {
  const context = useContext(EntriesContext);
  if (context === undefined) {
    throw new Error('useEntries must be used within an EntriesProvider');
  }
  return context;
};
