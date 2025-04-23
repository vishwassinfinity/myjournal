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
    <div style={{ minHeight: '100vh' }}>
      <Header toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      
      <div className="journal-container">
        <NetworkStatus />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Calendar onSelectDate={handleDateSelect} />
              <SoundPlayer />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <JournalEntry date={selectedDate} />
              <ShareEntries />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
