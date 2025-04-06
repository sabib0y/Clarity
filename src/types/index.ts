// Defines the structure for a categorized entry from the mind dump
export type Entry = {
  id: string; // Unique identifier for the entry
  text: string; // The original text or title of the entry
  type: string; // The category (e.g., 'task', 'event', 'idea', 'feeling', 'note')
  priority: number; // Time-based priority (1-5) assigned by AI
  note?: string; // Optional user-added notes for the entry
  createdAt: string; // ISO timestamp string indicating when the entry was categorized
  startTime?: string; // Optional ISO timestamp for the start time/date
  endTime?: string; // Optional ISO timestamp for the end time/date
  isCompleted?: boolean; // Flag indicating if the task is completed (defaults to false)
};

// Defines the expected structure of the response from the /api/categorise endpoint
export type CategoriseResponse = {
  entries: Entry[];
};
