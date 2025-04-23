'use client';

import React, { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import JournalEntry from '@/components/JournalEntry';
import SoundPlayer from '@/components/SoundPlayer';
import NetworkStatus from '@/components/NetworkStatus';
import ShareEntries from '@/components/ShareEntries';
import Header from '@/components/Header';
import { registerServiceWorker } from '@/lib/serviceWorker';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Register service worker for offline support
    registerServiceWorker();
    
    // Check preferred theme
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-journal-background-light via-purple-50/30 to-white dark:from-journal-background-dark dark:via-indigo-950/20 dark:to-gray-900 transition-colors duration-500 overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-[10%] w-72 h-72 bg-pink-200 dark:bg-pink-900/30 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-40 left-[5%] w-72 h-72 bg-yellow-200 dark:bg-yellow-900/20 rounded-full blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-20 right-[20%] w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <Header toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <NetworkStatus />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-lg p-5 transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in">
              <Calendar onSelectDate={handleDateSelect} />
            </div>
            
            <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-lg p-5 transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in animation-delay-300">
              <SoundPlayer />
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-9 space-y-6">
            <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in animation-delay-150">
              <JournalEntry date={selectedDate} />
            </div>
            
            <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in animation-delay-450">
              <ShareEntries />
            </div>
          </div>
        </div>
      </main>
      
      {/* Additional decorative elements */}
      <div className="fixed bottom-5 right-5 z-30">
        <button 
          className="bg-journal-primary/90 hover:bg-journal-primary text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          aria-label="Quick actions"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="absolute right-full mr-2 bg-white dark:bg-gray-800 text-journal-text-light dark:text-journal-text-dark px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow pointer-events-none">
            New Entry
          </span>
        </button>
      </div>
    </div>
  );
}
