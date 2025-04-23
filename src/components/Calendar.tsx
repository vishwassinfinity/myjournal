import React, { useState } from 'react';
import ReactCalendar from 'react-calendar';
import { format } from 'date-fns';
import { useJournalStore } from '@/store/journalStore';
import { formatDate } from '@/lib/utils';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface CalendarProps {
  onSelectDate: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onSelectDate }) => {
  const [value, setValue] = useState<Date>(new Date());
  const entries = useJournalStore((state) => state.entries);

  const handleDateChange = (newValue: Value) => {
    if (newValue instanceof Date) {
      setValue(newValue);
      onSelectDate(newValue);
    }
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const hasEntry = entries.some(
        (entry) => entry.date === formatDate(date)
      );
      return hasEntry ? (
        <div style={{ 
          height: '0.5rem', 
          width: '0.5rem', 
          borderRadius: '50%', 
          backgroundColor: '#F97316', 
          margin: '0.25rem auto 0' 
        }}></div>
      ) : null;
    }
    return null;
  };

  return (
    <div className="calendar-container">
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: 'rgb(var(--foreground-rgb))'
      }}>
        Select Date
      </h2>
      <div>
        <ReactCalendar
          onChange={handleDateChange}
          value={value}
          tileContent={tileContent}
          className="rounded-lg border-0 shadow-none w-full bg-transparent"
        />
      </div>
      <div style={{
        marginTop: '1rem', 
        textAlign: 'center', 
        fontWeight: '500',
        color: 'rgb(var(--foreground-rgb))'
      }}>
        {format(value, 'MMMM d, yyyy')}
      </div>
    </div>
  );
};

export default Calendar; 