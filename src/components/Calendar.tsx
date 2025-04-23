import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { useJournalStore } from '@/store/journalStore';
import { formatDate } from '@/lib/utils';

interface CalendarProps {
  onSelectDate: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const entries = useJournalStore(state => state.entries);
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    onSelectDate(day);
  };
  
  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-journal-text-light dark:text-journal-text-dark">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-journal-text-light dark:text-journal-text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={nextMonth}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-journal-text-light dark:text-journal-text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  const renderDays = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div 
            key={day} 
            className="text-center text-xs font-semibold text-journal-muted-light dark:text-journal-muted-dark py-2"
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
    
    let days = eachDayOfInterval({ start: startDate, end: endDate });
    let formattedDate = '';
    
    // Get data about entries
    const entryMap = new Map();
    
    entries.forEach(entry => {
      entryMap.set(entry.date, {
        hasEntry: true,
        mood: entry.mood
      });
    });
    
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
    
    for (let day of days) {
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
        dayClasses += ' bg-journal-primary text-white shadow-md z-10';
      } else if (mood) {
        dayClasses += ` ${getMoodClass(mood.emoji)} text-gray-800 shadow-sm`;
      }
      
      week.push(
        <div
          key={day.toString()}
          className={`p-1 text-center relative group day-with-mood ${mood ? 'has-mood' : ''}`}
          onClick={() => onDateClick(cloneDay)}
        >
          <div 
            className={`cursor-pointer rounded-lg flex items-center justify-center w-full h-full aspect-square ${dayClasses} 
                     ${!isSameMonth(day, monthStart) ? 'text-gray-400 dark:text-gray-600' : 'text-journal-text-light dark:text-journal-text-dark'}
                     hover:transform hover:scale-105 hover:shadow-sm`}
          >
            <div className="relative">
              {formattedDate}
            </div>
          </div>
          
          {hasEntry && !mood && !isSameDay(day, selectedDate) && (
            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-journal-accent rounded-full"></span>
          )}
          
          {mood && !isSameDay(day, selectedDate) && (
            <>
              <div className={`absolute w-full h-0.5 bottom-0 left-0 ${getMoodColor(mood.emoji)}`}></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="bg-black/70 text-white text-xs py-1 px-2 rounded-md whitespace-nowrap">
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
  
  // Get mood color class for the selected date
  const getMoodColorClass = (mood: { emoji: string; label: string } | undefined) => {
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
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 transition-colors duration-300">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      <div className="text-center mt-3 font-medium text-journal-text-light dark:text-journal-text-dark">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm">{format(selectedDate, 'MMMM d, yyyy')}</span>
          {selectedMood && (
            <div className="flex items-center gap-1 ml-2 p-1 px-2 rounded-full" 
                 style={{backgroundColor: `var(--${selectedMood.label.toLowerCase()}-color, #888)`, opacity: 0.2}}>
              <span 
                className="text-lg" 
                title={`Feeling ${selectedMood.label}`}
              >
                {selectedMood.emoji}
              </span>
              <span className="text-xs font-medium">{selectedMood.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar; 