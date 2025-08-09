'use client';

import React, { useState, useMemo } from 'react';
import { useJournalStore } from '../store/journalStore';

const WritingStats: React.FC = () => {
  const entries = useJournalStore((s) => s.entries);
  const [showDetails, setShowDetails] = useState(false);

  const countWords = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;

  const todaysWordCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysEntry = entries.find((e) => e.date === today);
    return todaysEntry ? countWords(todaysEntry.content) : 0;
  }, [entries]);

  const totalWords = useMemo(() => {
    return entries.reduce((sum, e) => sum + countWords(e.content), 0);
  }, [entries]);

  const currentStreak = useMemo(() => {
    let streak = 0;
    const currentDate = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(currentDate.getDate() - i);
      const dateString = checkDate.toISOString().split('T')[0];
      const hasEntry = entries.some(
        (e) => e.date === dateString && e.content.trim().length > 0
      );
      if (hasEntry) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [entries]);
  
  const getStreakMessage = () => {
    if (currentStreak === 0) return 'Start your writing journey today! ✨';
    if (currentStreak === 1) return 'Great start! Keep the momentum going! 🚀';
    if (currentStreak <= 3) return "Building a habit! You're doing great! 💪";
    if (currentStreak <= 7) return "Amazing streak! You're on fire! 🔥";
    if (currentStreak <= 30) return 'Incredible dedication! Keep it up! 🌟';
    return "Writing master! Your consistency is inspiring! 👑";
  };
  
  const getTodaysGoal = () => {
    const targetWords = 250;
    const progress = Math.min((todaysWordCount / targetWords) * 100, 100);
    return { targetWords, progress };
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden glass shadow transition-all duration-300 group hover:shadow-md border border-gray-100 dark:border-gray-700 animate-fade-in">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <div className="relative">
              <span className="inline-block w-3 h-3 bg-journal-primary rounded-full mr-2"></span>
              <span className="absolute -inset-0.5 bg-journal-primary rounded-full opacity-60 animate-ping"></span>
            </div>
            <span className="text-sm font-medium text-journal-text-light dark:text-journal-text-dark">
              Writing Dashboard
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-journal-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-sm font-semibold text-journal-primary">
                {currentStreak} day streak
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-journal-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-journal-text-light dark:text-journal-text-dark">
                {todaysWordCount} words today
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-xs px-3 py-1.5 bg-journal-primary/10 text-journal-primary rounded-full font-medium">
            {totalWords.toLocaleString()} total words
          </div>
          
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 text-journal-muted-light dark:text-journal-muted-dark transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {showDetails && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-journal-text-light dark:text-journal-text-dark">
                    Today&apos;s Goal Progress
                  </span>
                  <span className="text-xs text-journal-muted-light dark:text-journal-muted-dark">
                    {todaysWordCount} / {getTodaysGoal().targetWords} words
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-journal-primary to-journal-secondary transition-all duration-1000"
                    style={{ width: `${getTodaysGoal().progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-journal-primary/5 dark:bg-journal-primary/10 rounded-lg">
                <svg className="w-5 h-5 text-journal-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm text-journal-text-light dark:text-journal-text-dark">
                  {getStreakMessage()}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-journal-primary">
                    {entries.length}
                  </div>
                  <div className="text-xs text-journal-muted-light dark:text-journal-muted-dark">
                    Total Scripts
                  </div>
                </div>
                
                <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-journal-secondary">
                    {Math.ceil(totalWords / 250) || 0}
                  </div>
                  <div className="text-xs text-journal-muted-light dark:text-journal-muted-dark">
                    Pages Written
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-journal-muted-light dark:text-journal-muted-dark mb-1">
                  💡 Writing Tip of the Day
                </div>
                <div className="text-sm text-journal-text-light dark:text-journal-text-dark italic">
                  &ldquo;Write freely without editing yourself initially. Let your thoughts flow!&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingStats;