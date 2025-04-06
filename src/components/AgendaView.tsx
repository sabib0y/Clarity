'use client';

import React, { useState } from 'react';
import { useEntries } from '@/context/EntriesContext'; // Import the custom hook
import MonthNavigator from './MonthNavigator';
import DailyChronologicalList from './DailyChronologicalList';

// Define the type for the value state and onChange handler from react-calendar
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const AgendaView: React.FC = () => {
  // State remains Date | undefined as that's what DailyChronologicalList expects
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { categorizedEntries } = useEntries(); // Use the custom hook

  // Adapt the handler passed to MonthNavigator
  const handleCalendarChange = (value: Value) => {
     if (value instanceof Date) {
       setSelectedDate(value);
     } else if (Array.isArray(value) && value[0] instanceof Date) {
       // Handle range selection if needed, for now just take the start
       setSelectedDate(value[0]);
     } else {
       setSelectedDate(undefined); // Set to undefined if null or invalid
     }
  };

  // TODO: Implement filtering logic based on selectedDate if needed at this level,
  // or pass categorizedEntries down directly.

  return (
    // Single container with card styling - REMOVED dark:bg-gray-800
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Month Navigator Wrapper */}
      {/* Pass the new handler to MonthNavigator */}
      <div className="day-picker-wrapper flex justify-center">
         <MonthNavigator selectedDate={selectedDate} onSelectDate={handleCalendarChange} />
      </div>

      {/* Divider (optional) */}
      <hr className="border-gray-200 dark:border-gray-700" />

      {/* Daily Chronological List */}
      <div className="overflow-y-auto"> {/* Adjust height/scrolling as needed */}
        <DailyChronologicalList selectedDate={selectedDate} entries={categorizedEntries} />
      </div>
    </div>
  );
};

export default AgendaView;
