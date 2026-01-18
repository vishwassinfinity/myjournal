import React, { useState, useMemo, useCallback, memo } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { useJournalStore } from '@/store/journalStore';
import { formatDate } from '@/lib/utils';

interface CalendarProps {
  onSelectDate: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = memo(function Calendar({ onSelectDate }) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const entries = useJournalStore(state => state.entries);
  
  // Memoize entry map to avoid recalculating on every render
  const entryMap = useMemo(() => {
    const map = new Map<string, { hasEntry: boolean; mood?: { emoji: string; label: string } }>();
    entries.forEach(entry => {
      map.set(entry.date, {
        hasEntry: true,
        mood: entry.mood
      });
    });
    return map;
  }, [entries]);
  
  const prevMonth = useCallback(() => {
    setCurrentMonth(prev => subMonths(prev, 1));
  }, []);
  
  const nextMonth = useCallback(() => {
    setCurrentMonth(prev => addMonths(prev, 1));
  }, []);
  
  const onDateClick = useCallback((day: Date) => {
    setSelectedDate(day);
    onSelectDate(day);
  }, [onSelectDate]);
  
  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-1">
          <button 
            onClick={prevMonth}
            className="p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-[#2a2a2a] transition-all duration-200 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-[#2a2a2a] transition-all duration-200 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  const renderDays = () => {
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    return (
      <div className="grid grid-cols-7 gap-1 mb-3">
        {weekDays.map((day, i) => (
          <div 
            key={`${day}-${i}`} 
            className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };
  
  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const dateFormat = 'd';
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    let formattedDate = '';
    
    const getMoodClass = (moodEmoji: string) => {
      switch(moodEmoji) {
        case '😊': // Happy
          return 'calendar-mood-happy mood-happy';
        case '😔': // Sad
          return 'calendar-mood-sad mood-sad';
        case '😌': // Calm
          return 'calendar-mood-calm mood-calm';
        case '😤': // Angry
          return 'calendar-mood-angry mood-angry';
        case '😰': // Anxious
          return 'calendar-mood-anxious mood-anxious';
        case '🥰': // Loving
          return 'calendar-mood-loving mood-loving';
        default:
          return '';
      }
    };
    
    const getMoodColor = (moodEmoji: string) => {
      switch(moodEmoji) {
        case '😊': // Happy
          return 'bg-yellow-400';
        case '😔': // Sad
          return 'bg-blue-500';
        case '😌': // Calm
          return 'bg-green-500';
        case '😤': // Angry
          return 'bg-red-500';
        case '😰': // Anxious
          return 'bg-purple-500';
        case '🥰': // Loving
          return 'bg-pink-500';
        default:
          return 'bg-gray-400';
      }
    };
    
    const weeks = [];
    let week = [];
    
    for (const day of days) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      const dateString = formatDate(day);
      const entryInfo = entryMap.get(dateString);
      const hasEntry = entryInfo?.hasEntry;
      const mood = entryInfo?.mood;
      
      let dayClasses = 'transition-all duration-300';
      
      if (!isSameMonth(day, monthStart)) {
        dayClasses += ' opacity-40';
      } else if (isSameDay(day, selectedDate)) {
        dayClasses += ' bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 z-10 scale-105';
      } else if (mood) {
        dayClasses += ` ${getMoodClass(mood.emoji)} text-gray-800 dark:text-gray-200`;
      }
      
      week.push(
        <div
          key={day.toString()}
          className={`p-0.5 text-center relative group day-with-mood ${mood ? 'has-mood' : ''}`}
          onClick={() => onDateClick(cloneDay)}
        >
          <div 
            className={`cursor-pointer rounded-xl flex items-center justify-center w-full h-full aspect-square text-sm font-medium ${dayClasses} 
                     ${!isSameMonth(day, monthStart) ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}
                     hover:bg-purple-100 dark:hover:bg-[#2a2a2a] hover:scale-105`}
          >
            <div className="relative">
              {formattedDate}
            </div>
          </div>
          
          {hasEntry && !mood && !isSameDay(day, selectedDate) && (
            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
          )}
          
          {mood && !isSameDay(day, selectedDate) && (
            <>
              <div className={`absolute w-full h-0.5 bottom-0 left-0 rounded-full ${getMoodColor(mood.emoji)}`}></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20">
                <div className="bg-gray-900/90 dark:bg-gray-100/90 text-white dark:text-gray-900 text-xs py-1 px-2 rounded-lg whitespace-nowrap backdrop-blur-sm">
                  {mood.emoji} {mood.label}
                </div>
              </div>
            </>
          )}
        </div>
      );
      
      if (week.length === 7) {
        weeks.push(
          <div key={day.toString()} className="grid grid-cols-7 gap-1 mb-1">
            {week}
          </div>
        );
        week = [];
      }
    }
    
    if (week.length > 0) {
      weeks.push(
        <div key={`last-${week[0]?.key}`} className="grid grid-cols-7 gap-1 mb-1">
          {week}
        </div>
      );
    }
    
    return <div className="mb-2">{weeks}</div>;
  };
  
  // Find the mood for selected date to show in the footer
  const getSelectedDateMood = () => {
    const dateString = formatDate(selectedDate);
    const entry = entries.find(e => e.date === dateString);
    return entry?.mood;
  };
  
  const selectedMood = getSelectedDateMood();
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _getMoodColorClass = (mood: { emoji: string; label: string } | undefined) => {
    if (!mood) return '';
    
    switch (mood.emoji) {
      case '😊': // Happy
        return 'bg-yellow-400 dark:bg-yellow-500';
      case '😔': // Sad
        return 'bg-blue-500 dark:bg-blue-600';
      case '😌': // Calm
        return 'bg-green-500 dark:bg-green-600';
      case '😤': // Angry
        return 'bg-red-500 dark:bg-red-600';
      case '😰': // Anxious
        return 'bg-purple-500 dark:bg-purple-600';
      case '🥰': // Loving
        return 'bg-pink-500 dark:bg-pink-600';
      default:
        return 'bg-gray-400 dark:bg-gray-500';
    }
  };
  
  return (
    <div className="transition-colors duration-300">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      <div className="text-center mt-4 pt-4 border-t border-purple-100 dark:border-gray-700">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{format(selectedDate, 'MMMM d, yyyy')}</span>
          {selectedMood && (
            <div className="flex items-center gap-1 ml-1 py-1 px-2 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-[#2a2a2a] dark:to-[#2a2a2a]">
              <span className="text-base" title={`Feeling ${selectedMood.label}`}>
                {selectedMood.emoji}
              </span>
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">{selectedMood.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default Calendar;