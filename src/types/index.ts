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
};

export type CategoriseResponse = {
  entries: Entry[];
};
