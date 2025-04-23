import React, { useState, useEffect, useRef } from 'react';
import { useJournalStore, JournalEntry as JournalEntryType, MoodType } from '@/store/journalStore';
import { formatDisplayDate, formatDate } from '@/lib/utils';
import { useDebounce } from 'use-debounce';

interface JournalEntryProps {
  date: Date;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ date }) => {
  const getEntryByDate = useJournalStore((state) => state.getEntryByDate);
  const addEntry = useJournalStore((state) => state.addEntry);
  const updateEntry = useJournalStore((state) => state.updateEntry);
  const deleteEntry = useJournalStore((state) => state.deleteEntry);
  const setMood = useJournalStore((state) => state.setMood);
  
  const dateString = formatDate(date);
  const existingEntry = getEntryByDate(dateString);
  
  const [content, setContent] = useState(existingEntry?.content || '');
  const [debouncedContent] = useDebounce(content, 1000);
  const [isSaving, setIsSaving] = useState(false);
  const [isNewEntry, setIsNewEntry] = useState(!existingEntry);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodType | undefined>(existingEntry?.mood);
  const [moodApplied, setMoodApplied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    setContent(existingEntry?.content || '');
    setIsNewEntry(!existingEntry);
    setCurrentMood(existingEntry?.mood);
  }, [existingEntry, date]);
  
  useEffect(() => {
    if (debouncedContent !== existingEntry?.content) {
      saveEntry();
    }
  }, [debouncedContent]);
  
  const saveEntry = () => {
    if (!content.trim()) return;
    
    setIsSaving(true);
    setIsNewEntry(false);
    
    if (existingEntry) {
      updateEntry(existingEntry.id, content);
    } else {
      const newEntry = {
        date: dateString,
        content,
        shared: false,
        sharedWith: [],
      };
      
      addEntry(newEntry);
    }
    
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };
  
  const handleDeleteEntry = () => {
    if (existingEntry && window.confirm('Are you sure you want to delete this entry?')) {
      deleteEntry(existingEntry.id);
      setContent('');
      setIsNewEntry(true);
      setCurrentMood(undefined);
    }
  };
  
  const focusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  const moodOptions = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😔', label: 'Sad' },
    { emoji: '😌', label: 'Calm' },
    { emoji: '😤', label: 'Angry' },
    { emoji: '😰', label: 'Anxious' },
    { emoji: '🥰', label: 'Loving' },
  ];
  
  const getMoodClass = (moodEmoji: string) => {
    switch(moodEmoji) {
      case '😊': // Happy
        return 'mood-happy';
      case '😔': // Sad
        return 'mood-sad';
      case '😌': // Calm
        return 'mood-calm';
      case '😤': // Angry
        return 'mood-angry';
      case '😰': // Anxious
        return 'mood-anxious';
      case '🥰': // Loving
        return 'mood-loving';
      default:
        return '';
    }
  };
  
  const getMoodBackground = (moodEmoji: string) => {
    switch(moodEmoji) {
      case '😊': // Happy
        return 'bg-yellow-50 dark:bg-yellow-900/10';
      case '😔': // Sad
        return 'bg-blue-50 dark:bg-blue-900/10';
      case '😌': // Calm
        return 'bg-green-50 dark:bg-green-900/10';
      case '😤': // Angry
        return 'bg-red-50 dark:bg-red-900/10';
      case '😰': // Anxious
        return 'bg-purple-50 dark:bg-purple-900/10';
      case '🥰': // Loving
        return 'bg-pink-50 dark:bg-pink-900/10';
      default:
        return '';
    }
  };
  
  const setEntryMood = (mood: MoodType) => {
    setCurrentMood(mood);
    setShowMoodSelector(false);
    setMoodApplied(true);
    
    setTimeout(() => {
      setMoodApplied(false);
    }, 2000);
    
    if (existingEntry) {
      setMood(existingEntry.id, mood);
    } else {
      // Create a new entry with the mood if it doesn't exist yet
      const newEntry = {
        date: dateString,
        content: content || `Feeling ${mood.label} today`,
        shared: false,
        sharedWith: [],
        mood: mood,
      };
      
      addEntry(newEntry);
      setIsNewEntry(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full relative animate-scale-in">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-journal-text-light dark:text-journal-text-dark flex items-center text-shadow transition-all duration-300">
          {formatDisplayDate(date)}
          {isNewEntry && (
            <span className="ml-3 text-sm font-normal text-journal-accent bg-journal-accent/10 px-2 py-1 rounded-full animate-pulse">
              New Entry
            </span>
          )}
          {currentMood && (
            <span 
              className={`ml-3 text-2xl transition-all duration-300 transform hover:scale-150 ${moodApplied ? 'scale-150 animate-bounce' : ''}`} 
              title={`Feeling ${currentMood.label}`}
            >
              {currentMood.emoji}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <button
            onClick={() => setShowMoodSelector(!showMoodSelector)}
            className={`px-2.5 py-1.5 ${currentMood ? 'bg-journal-primary text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'} rounded-lg transition-colors duration-200 text-journal-text-light dark:text-journal-text-dark flex items-center gap-1.5 group ${currentMood ? getMoodClass(currentMood.emoji) : ''}`}
          >
            <span className="text-lg group-hover:animate-wiggle">{currentMood ? currentMood.emoji : '😊'}</span>
            <span className="text-xs font-medium">{currentMood ? 'Change Mood' : 'Set Mood'}</span>
          </button>
          
          {isSaving && (
            <span className="text-sm text-journal-muted-light dark:text-journal-muted-dark flex items-center animate-fade-in">
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          )}
          
          {existingEntry && (
            <button 
              onClick={handleDeleteEntry}
              className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>
      
      {showMoodSelector && (
        <div className="absolute top-16 right-0 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 border border-gray-200 dark:border-gray-700 animate-fade-in">
          <div className="grid grid-cols-3 gap-2">
            {moodOptions.map(mood => (
              <button 
                key={mood.label} 
                onClick={() => setEntryMood(mood)}
                className={`flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 ${
                  currentMood?.emoji === mood.emoji ? 'bg-gray-100 dark:bg-gray-700 ring-2 ring-journal-primary' : ''
                } ${getMoodClass(mood.emoji)} hover:scale-110`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-xs mt-1">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex-grow relative h-full animate-fade-in animation-delay-150">
        {isNewEntry && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center pointer-events-none animate-pulse-glow">
            <p className="text-journal-muted-light dark:text-journal-muted-dark text-lg mb-3">
              Begin writing your thoughts for today...
            </p>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-journal-muted-light dark:text-journal-muted-dark animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        )}
        
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onClick={focusTextarea}
          placeholder=""
          className={`w-full h-full min-h-[350px] p-6 rounded-xl border border-gray-200 dark:border-gray-700 
                   ${currentMood ? getMoodBackground(currentMood.emoji) : 'bg-white/80 dark:bg-gray-800/50'} 
                   backdrop-blur-sm text-journal-text-light dark:text-journal-text-dark focus:ring-2 focus:ring-journal-primary 
                   focus:outline-none resize-none transition duration-300 shadow-inner text-lg leading-relaxed
                   ${currentMood ? 'border-' + currentMood.label.toLowerCase() + '-200 dark:border-' + currentMood.label.toLowerCase() + '-800' : ''}`}
        />
      </div>
      
      <div className="mt-4 flex justify-between items-center text-sm text-journal-muted-light dark:text-journal-muted-dark">
        <div>
          {content && (
            <span>{content.split(' ').length} words</span>
          )}
        </div>
        <div className="flex gap-4">
          <button className="hover:text-journal-primary transition-colors" title="Format text">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <button className="hover:text-journal-primary transition-colors" title="Add image">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <button className="hover:text-journal-primary transition-colors" title="Voice notes">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalEntry; 