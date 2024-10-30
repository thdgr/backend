import React from 'react';
import { format, setMonth } from 'date-fns';
import { hu } from 'date-fns/locale';
import { useCalendarStore } from '../store';

interface MonthSidebarProps {
  currentDate: Date;
  onMonthSelect: (date: Date) => void;
}

export default function MonthSidebar({ currentDate, onMonthSelect }: MonthSidebarProps) {
  const { toggleSidebar } = useCalendarStore();
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = setMonth(currentDate, i);
    return {
      name: format(date, 'MMMM', { locale: hu }),
      date,
    };
  });

  const handleMonthClick = (date: Date) => {
    onMonthSelect(date);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <div className="fixed md:relative w-64 h-full bg-white border-r border-gray-200 p-4 z-20 shadow-lg md:shadow-none">
      <div className="h-full overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Hónapok</h2>
        <div className="space-y-1">
          {months.map((month) => (
            <button
              key={month.name}
              onClick={() => handleMonthClick(month.date)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                format(month.date, 'M') === format(currentDate, 'M')
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'hover:bg-gray-50'
              }`}
            >
              {month.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}