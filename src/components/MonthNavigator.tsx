'use client';

import React, { useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, parseISO, isValid, isSameDay, eachDayOfInterval, startOfDay } from 'date-fns';
import type { Entry } from '@/types';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface MonthNavigatorProps {
  selectedDate: Date | undefined;
  onSelectDate: (value: Value) => void;
  entries: Entry[];
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({ selectedDate, onSelectDate, entries }) => {

  const datesWithEntries = useMemo(() => {
    const dates = new Set<string>();
    entries.forEach(entry => {
      if (entry.startTime && isValid(parseISO(entry.startTime))) {
        const startDate = startOfDay(parseISO(entry.startTime));
        let endDate = startDate;

        if (entry.endTime && isValid(parseISO(entry.endTime))) {
          const parsedEndTime = startOfDay(parseISO(entry.endTime));
          if (parsedEndTime > startDate) {
            endDate = parsedEndTime;
          }
        }

        try {
           const intervalDates = eachDayOfInterval({ start: startDate, end: endDate });
           intervalDates.forEach(intervalDate => {
             dates.add(format(intervalDate, 'yyyy-MM-dd'));
           });
        } catch (error) {
           console.error("Error calculating date interval for entry:", entry.id, error);
           dates.add(format(startDate, 'yyyy-MM-dd'));
        }

      }
    });
    return dates;
  }, [entries]);

  const handleChange = (value: Value) => {
    if (value instanceof Date) {
      onSelectDate(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
       onSelectDate(value[0]);
     } else {
        onSelectDate(null);
     }
   };

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
        className="react-calendar bg-transparent border-none"
        tileClassName={({ date, view }) => {
          const classes = ['react-calendar__tile--custom rounded-full flex items-center justify-center h-9 w-9'];
          const dateString = format(date, 'yyyy-MM-dd');

          if (view === 'month') {
            classes.push('hover:bg-gray-100 dark:hover:bg-gray-700');

            if (dateString === format(new Date(), 'yyyy-MM-dd') && !isSameDay(date, selectedDate || new Date(0))) {
              classes.push('!bg-gray-200 dark:!bg-gray-600 !text-gray-900 dark:!text-gray-100');
            }

            if (datesWithEntries.has(dateString) && !isSameDay(date, selectedDate || new Date(0))) {
              classes.push('has-entries');
            }
          }
          return classes.join(' ');
        }}
        navigationLabel={({ date }) => (
          <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {format(date, 'MMMM yyyy')}
          </span>
        )}
      />
      {footer}
    </div>
  );
};

export default MonthNavigator;
