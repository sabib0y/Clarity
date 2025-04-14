export type Entry = {
  id: string;
  text: string;
  type: string;
  priority: number;
  note?: string;
  createdAt: string;
  startTime?: string;
  endTime?: string;
  isCompleted?: boolean;
  sortOrder?: number; // Added for drag-and-drop ordering
  category?: EntryCategory; // Use the specific type
};

// Define the specific categories
export type EntryCategory = 'Task' | 'Event' | 'Idea' | 'Feeling' | 'Note';

export type CategoriseResponse = {
  entries: Entry[];
};
