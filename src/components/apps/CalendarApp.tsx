import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
const CalendarApp = () => {
  const [cursor, setCursor] = useState(new Date());
  const today = new Date();
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array(days).fill(0).map((_, i) => i + 1)];
  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft size={18}/></button>
        <div className="font-semibold">{cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div>
        <button onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight size={18}/></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm flex-1">
        {cells.map((d, i) => {
          const isToday = d && d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return <div key={i} className={`aspect-square flex items-center justify-center rounded-full ${isToday ? 'bg-[var(--color-accent)] text-white' : d ? 'hover:bg-black/5 dark:hover:bg-white/10' : ''}`}>{d || ''}</div>;
        })}
      </div>
    </div>
  );
};
export default CalendarApp;
