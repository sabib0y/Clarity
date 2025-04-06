'use client';

import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default styles for react-calendar
import { format } from 'date-fns';

// Define the type for the value state and onChange handler
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface MonthNavigatorProps {
  selectedDate: Date | undefined;
  // react-calendar uses onChange which returns Value type
  onSelectDate: (value: Value) => void;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({ selectedDate, onSelectDate }) => {

  // Handler to adapt react-calendar's onChange to our expected single date format
  const handleChange = (value: Value) => {
    // We only care about single date selection
    if (value instanceof Date) {
      onSelectDate(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      // If it returns a range, take the start date
       onSelectDate(value[0]);
     } else {
        onSelectDate(null); // Pass null instead of undefined
     }
   };

  // Basic footer showing selected date
  const footer = selectedDate ? (
    <p className="text-center text-sm mt-4 text-gray-600 dark:text-gray-400">
      You selected {format(selectedDate, 'PPP')}.
    </p>
  ) : (
    <p className="text-center text-sm mt-4 text-gray-500 dark:text-gray-400">
      Please pick a day.
    </p>
  );

  return (
    <div className="flex flex-col items-center">
      <Calendar
        onChange={handleChange}
        value={selectedDate}
        // Basic Tailwind styling via className prop
        // These target the default classes provided by react-calendar
        className="react-calendar bg-transparent border-none" // Remove default border/bg
        tileClassName={({ date, view }) => {
          // Add custom classes to tiles (days)
          const classes = ['rounded-full flex items-center justify-center h-9 w-9'];
          if (view === 'month') {
            // Add hover effect for non-disabled days
            classes.push('hover:bg-gray-100 dark:hover:bg-gray-700');
            // Style today's date
            if (format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
              classes.push('bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100');
            }
          }
          return classes.join(' ');
        }}
        navigationLabel={({ date }) => (
          <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {format(date, 'MMMM yyyy')}
          </span>
        )}
        // Add other props and styling as needed
      />
      {footer}
    </div>
  );
};

export default MonthNavigator;
