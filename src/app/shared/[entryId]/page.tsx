'use client';

import React, { useState, useEffect, use } from 'react';
import { useJournalStore } from '@/store/journalStore';
import { formatDisplayDate } from '@/lib/utils';
import Link from 'next/link';

export default function SharedEntryPage({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = use(params);
  const entries = useJournalStore((state) => state.entries);
  const hydrated = useJournalStore((state) => state.hydrated);
  
  // Find entry by shareToken (the entryId in URL is actually the shareToken)
  const [entry, setEntry] = useState(entries.find(e => e.shareToken === entryId || e.id === entryId));
  
  useEffect(() => {
    // Check both shareToken and id for flexibility
    const found = entries.find(e => e.shareToken === entryId || e.id === entryId);
    if (found && found.shared) {
      setEntry(found);
    } else {
      setEntry(undefined);
    }
  }, [entries, entryId]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-xl mb-4">
            <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" className="opacity-25"/>
              <path d="M4 12a8 8 0 018-8" className="opacity-75"/>
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Loading shared entry...</p>
        </div>
      </div>
    );
  }
  
  if (!entry || !entry.shared) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-white/20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 mb-6">
            <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Entry Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            This journal entry doesn&apos;t exist or is no longer shared.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Journal
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-[10%] w-96 h-96 bg-purple-300/30 dark:bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-[5%] w-80 h-80 bg-indigo-300/30 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-300/20 dark:bg-pink-600/10 rounded-full blur-3xl -translate-x-1/2"></div>
      </div>

      <header className="relative z-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 py-5 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Soul Scripts</h1>
          </div>
          <Link 
            href="/"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 text-sm"
          >
            Go to Your Journal
          </Link>
        </div>
      </header>
      
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-10">
        <article className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
          {/* Header section */}
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border-b border-indigo-100/50 dark:border-indigo-800/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Shared Journal Entry
                </p>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatDisplayDate(new Date(entry.date))}
                </h2>
                {entry.title && (
                  <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 italic">&ldquo;{entry.title}&rdquo;</p>
                )}
              </div>
              {entry.mood && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-700/60 shadow-sm">
                  <span className="text-2xl">{entry.mood.emoji}</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{entry.mood.label}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Content section */}
          <div className="p-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-200 leading-relaxed text-lg font-serif">
                {entry.content}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700/30">
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last modified: {new Date(entry.lastModified).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </article>
      </main>
    </div>
  );
} 