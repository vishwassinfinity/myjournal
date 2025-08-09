'use client';

import React, { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import JournalEntry from '@/components/JournalEntry';
import SoundPlayer from '@/components/SoundPlayer';
import NetworkStatus from '@/components/NetworkStatus';
import ShareEntries from '@/components/ShareEntries';
import Header from '@/components/Header';
import { useNetworkStore } from '@/store/networkStore';
import { registerServiceWorker } from '@/lib/serviceWorker';
import { useJournalStore } from '@/store/journalStore';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const initializeNetworkStatus = useNetworkStore((state) => state.initializeNetworkStatus);
  const entries = useJournalStore((s) => s.entries);
  
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    // Register service worker for offline support
    registerServiceWorker();
    
    // Initialize network status after hydration
    initializeNetworkStatus();
    
    // Check preferred theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);

    // listen to menu events
    const openSearch = () => setShowSearch(true);
    const openStats = () => setShowStats(true);
    const newScript = () => {
      // No-op here; the JournalEntry component has its own button + logic.
      // We just ensure the editor is visible (scroll top)
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Optionally, could bubble another event; JournalEntry listens for this same event already.
      window.dispatchEvent(new CustomEvent('journal-new-script'));
    };
    window.addEventListener('open-search', openSearch as EventListener);
    window.addEventListener('open-stats', openStats as EventListener);
    window.addEventListener('new-script', newScript as EventListener);
    return () => {
      window.removeEventListener('open-search', openSearch as EventListener);
      window.removeEventListener('open-stats', openStats as EventListener);
      window.removeEventListener('new-script', newScript as EventListener);
    };
  }, [initializeNetworkStatus]);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const results = query
    ? entries.filter(e => e.content.toLowerCase().includes(query.toLowerCase()))
    : [];
  
  // Basic stats
  const totalEntries = entries.length;
  const words = entries.reduce((sum, e) => sum + (e.content?.trim().split(/\s+/).filter(Boolean).length || 0), 0);
  const avgWords = totalEntries ? Math.round(words / totalEntries) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-journal-background-light via-purple-50/30 to-white dark:from-journal-background-dark dark:via-indigo-950/20 dark:to-gray-900 transition-colors duration-500 overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-[10%] w-72 h-72 bg-pink-200 dark:bg-pink-900/30 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-40 left-[5%] w-72 h-72 bg-yellow-200 dark:bg-yellow-900/20 rounded-full blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-20 right-[20%] w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <Header toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      
      <main className="container mx-auto px-4 py-8 max-w-full relative z-10">
        <NetworkStatus />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Left sidebar */}
          <div className="lg:col-span-3 space-y-8">
            <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in">
              <Calendar onSelectDate={handleDateSelect} />
            </div>
            
            <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in animation-delay-300">
              <SoundPlayer />
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-9 space-y-8">
            <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-lg p-10 transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in animation-delay-150">
              <JournalEntry date={selectedDate} />
            </div>
            
            <div className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in animation-delay-450">
              <ShareEntries />
            </div>
          </div>
        </div>
      </main>
      
      {/* Search drawer */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setShowSearch(false)} />
          <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your scripts..."
                className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-sm outline-none"
              />
              <button onClick={() => setShowSearch(false)} className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-md">Close</button>
            </div>
            <div className="space-y-2 overflow-auto max-h-[80vh] pr-1">
              {results.length === 0 && query && (
                <div className="text-sm text-journal-muted-light dark:text-journal-muted-dark">No results</div>
              )}
              {results.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setSelectedDate(new Date(e.date));
                    setShowSearch(false);
                  }}
                  className="block w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="text-xs text-journal-muted-light dark:text-journal-muted-dark">{e.date}</div>
                  <div className="text-sm line-clamp-2">{e.content}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats modal */}
      {showStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowStats(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-2xl w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
                <div className="text-2xl font-bold">{totalEntries}</div>
                <div className="text-xs text-journal-muted-light dark:text-journal-muted-dark">Entries</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
                <div className="text-2xl font-bold">{words}</div>
                <div className="text-xs text-journal-muted-light dark:text-journal-muted-dark">Total words</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
                <div className="text-2xl font-bold">{avgWords}</div>
                <div className="text-xs text-journal-muted-light dark:text-journal-muted-dark">Avg words/entry</div>
              </div>
            </div>
            <div className="mt-6 text-right">
              <button onClick={() => setShowStats(false)} className="px-4 py-2 rounded-md bg-journal-primary text-white">Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Additional decorative elements */}
      <div className="fixed bottom-5 right-5 z-30">
        <button 
          className="bg-journal-primary/90 hover:bg-journal-primary text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          aria-label="Quick actions"
          onClick={() => window.dispatchEvent(new CustomEvent('new-script'))}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="absolute right-full mr-2 bg-white dark:bg-gray-800 text-journal-text-light dark:text-journal-text-dark px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow pointer-events-none">
            New Script
          </span>
        </button>
      </div>
    </div>
  );
}
