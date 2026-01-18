'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    registerServiceWorker();
    initializeNetworkStatus();
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);

    const openSearch = () => setShowSearch(true);
    const openStats = () => setShowStats(true);
    const newScript = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
  
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => {
      document.documentElement.classList.toggle('dark', !prev);
      return !prev;
    });
  }, []);
  
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-[#121212] dark:via-[#161616] dark:to-[#1a1a1a] transition-colors duration-700 overflow-hidden relative">
      {/* Animated mesh gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-purple-300/40 via-violet-300/30 to-fuchsia-300/40 dark:from-gray-700/15 dark:via-gray-800/10 dark:to-gray-700/15 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-blue-300/30 via-indigo-300/25 to-purple-300/30 dark:from-gray-700/10 dark:via-gray-800/10 dark:to-gray-700/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 right-1/3 w-[550px] h-[550px] bg-gradient-to-br from-pink-300/35 via-rose-300/30 to-purple-300/35 dark:from-gray-700/10 dark:via-gray-800/10 dark:to-gray-700/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      
      <Header toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      
      <main className="container mx-auto px-4 py-6 lg:py-10 max-w-7xl relative z-10">
        <NetworkStatus />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mt-4">
          {/* Left sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-card rounded-2xl p-6 transition-all duration-500 hover:shadow-glow animate-fade-in">
              <Calendar onSelectDate={handleDateSelect} />
            </div>
            
            <div className="glass-card rounded-2xl p-6 transition-all duration-500 hover:shadow-glow animate-fade-in animation-delay-300">
              <SoundPlayer />
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-9 space-y-6">
            <div className="glass-card rounded-2xl p-6 lg:p-8 transition-all duration-500 hover:shadow-glow animate-fade-in animation-delay-150 min-h-[500px]">
              <JournalEntry date={selectedDate} />
            </div>
            
            <div className="glass-card rounded-2xl p-6 lg:p-8 transition-all duration-500 hover:shadow-glow animate-fade-in animation-delay-450">
              <ShareEntries />
            </div>
          </div>
        </div>
      </main>
      
      {/* Search drawer */}
      {showSearch && (
        <SearchDrawer
          query={query}
          setQuery={setQuery}
          onClose={() => setShowSearch(false)}
          onSelectDate={setSelectedDate}
        />
      )}

      {/* Stats modal */}
      {showStats && (
        <StatsModal onClose={() => setShowStats(false)} />
      )}
      
      {/* Floating action button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button 
          className="group relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4 rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
          aria-label="New Script"
          onClick={() => window.dispatchEvent(new CustomEvent('new-script'))}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
            New Script
          </span>
        </button>
      </div>
    </div>
  );
}

// Separate component to avoid re-renders when search is closed
function SearchDrawer({
  query,
  setQuery,
  onClose,
  onSelectDate,
}: {
  query: string;
  setQuery: (q: string) => void;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
}) {
  const entries = useJournalStore((s) => s.entries);
  
  const results = useMemo(
    () => query
      ? entries.filter(e => e.content.toLowerCase().includes(query.toLowerCase()))
      : [],
    [entries, query]
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white dark:bg-[#1c1c1c] h-full p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your scripts..."
            className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-[#2a2a2a] text-sm outline-none"
          />
          <button onClick={onClose} className="px-3 py-2 text-sm bg-gray-200 dark:bg-[#2a2a2a] rounded-md">Close</button>
        </div>
        <div className="space-y-2 overflow-auto max-h-[80vh] pr-1">
          {results.length === 0 && query && (
            <div className="text-sm text-journal-muted-light dark:text-journal-muted-dark">No results</div>
          )}
          {results.map((e) => (
            <button
              key={e.id}
              onClick={() => {
                onSelectDate(new Date(e.date));
                onClose();
              }}
              className="block w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
            >
              <div className="text-xs text-journal-muted-light dark:text-journal-muted-dark">{e.date}</div>
              <div className="text-sm line-clamp-2">{e.content}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Separate component to only load stats when modal is open
function StatsModal({ onClose }: { onClose: () => void }) {
  const entries = useJournalStore((s) => s.entries);
  
  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const words = entries.reduce((sum, e) => sum + (e.content?.trim().split(/\s+/).filter(Boolean).length || 0), 0);
    const avgWords = totalEntries ? Math.round(words / totalEntries) : 0;
    return { totalEntries, words, avgWords };
  }, [entries]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1c1c1c] rounded-xl p-6 shadow-2xl w-full max-w-lg border dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#2a2a2a] text-center">
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
            <div className="text-xs text-journal-muted-light dark:text-journal-muted-dark">Entries</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#2a2a2a] text-center">
            <div className="text-2xl font-bold">{stats.words}</div>
            <div className="text-xs text-journal-muted-light dark:text-journal-muted-dark">Total words</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#2a2a2a] text-center">
            <div className="text-2xl font-bold">{stats.avgWords}</div>
            <div className="text-xs text-journal-muted-light dark:text-journal-muted-dark">Avg words/entry</div>
          </div>
        </div>
        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-journal-primary text-white">Close</button>
        </div>
      </div>
    </div>
  );
}
