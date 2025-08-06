'use client';

import React, { useState, useEffect } from 'react';
import { useJournalStore } from '@/store/journalStore';
import { formatDisplayDate } from '@/lib/utils';
import { FiBook, FiUser } from 'react-icons/fi';
import Link from 'next/link';

export default function SharedEntryPage({ params }: { params: { entryId: string } }) {
  const { entryId } = params;
  const entries = useJournalStore((state) => state.entries);
  const [entry, setEntry] = useState(entries.find(e => e.id === entryId));
  
  useEffect(() => {
    setEntry(entries.find(e => e.id === entryId));
  }, [entries, entryId]);
  
  if (!entry) {
    return (
      <div className="min-h-screen bg-journal-background dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <FiBook className="text-journal-primary" size={48} />
          </div>
          <h1 className="text-2xl font-bold mb-4">Entry Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This journal entry doesn't exist or is no longer shared.
          </p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 rounded-md bg-journal-primary text-white"
          >
            Go to Journal
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-journal-background dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6 mb-6">
        <div style={{ maxWidth: '48rem', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center space-x-2">
            <FiBook className="text-journal-primary" size={24} />
            <h1 className="text-2xl font-bold">Soul Scripts</h1>
          </div>
          <Link 
            href="/"
            className="px-4 py-2 rounded-md bg-journal-primary text-white"
          >
            Go to Your Journal
          </Link>
        </div>
      </header>
      
      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1rem' }}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">{formatDisplayDate(new Date(entry.date))}</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Shared journal entry
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FiUser size={18} />
              <span>Author's Journal</span>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md whitespace-pre-wrap">
            {entry.content}
          </div>
        </div>
      </div>
    </div>
  );
} 