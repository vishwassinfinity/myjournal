'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useJournalStore, MoodType, JournalEntry as JournalEntryType } from '@/store/journalStore';
import { formatDisplayDate, formatDate } from '@/lib/utils';

// Optimized debounce hook - simpler and typed correctly
function useDebouncedCallback(
  callback: (newContent: string, entryId: string | null) => void,
  delay: number
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  
  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (newContent: string, entryId: string | null) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(newContent, entryId);
      }, delay);
    },
    [delay]
  );
}

interface JournalEntryProps {
  date: Date;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ date }) => {
  // Subscribe to specific state pieces to minimize re-renders
  const hydrated = useJournalStore((s) => s.hydrated);
  const entries = useJournalStore((s) => s.entries);
  
  // Get store actions once (they're stable references)
  const addEntry = useJournalStore((s) => s.addEntry);
  const updateEntry = useJournalStore((s) => s.updateEntry);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);
  const setEntryTitle = useJournalStore((s) => s.setEntryTitle);
  const exportEntries = useJournalStore((s) => s.exportEntries);

  const dateString = useMemo(() => formatDate(date), [date]);
  
  // Memoize filtered entries to prevent recalculation on every render
  const entriesForDate = useMemo(
    () => entries.filter((e: JournalEntryType) => e.date === dateString).sort((a: JournalEntryType, b: JournalEntryType) => b.lastModified - a.lastModified),
    [entries, dateString]
  );
  
  const defaultEntry = useMemo(
    () => entriesForDate[0] || undefined,
    [entriesForDate]
  );

  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  
  // Memoize active entry lookup
  const activeEntry = useMemo(
    () => entriesForDate.find((e: JournalEntryType) => e.id === activeEntryId) || defaultEntry || null,
    [entriesForDate, activeEntryId, defaultEntry]
  );

  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodType | undefined>(undefined);
  const [isOnline, setIsOnline] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSavedContentRef = useRef<string>('');

  const [isRenaming, setIsRenaming] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync state when date or active entry changes (not on every keystroke)
  useEffect(() => {
    const entry = defaultEntry;
    setActiveEntryId(entry?.id || null);
    setContent(entry?.content || '');
    setCurrentMood(entry?.mood);
    lastSavedContentRef.current = entry?.content || '';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateString, defaultEntry?.id]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // Debounced save function - this is the key performance optimization
  const saveContent = useDebouncedCallback(
    (newContent: string, entryId: string | null) => {
      if (!hydrated) return;
      
      // Skip if content hasn't actually changed
      if (newContent === lastSavedContentRef.current) return;
      
      setIsSaving(true);
      
      if (entryId) {
        updateEntry(entryId, newContent);
      } else if (newContent.trim()) {
        const newId = addEntry({
          date: dateString,
          content: newContent,
          shared: false,
          sharedWith: [],
        });
        setActiveEntryId(newId);
      }
      
      lastSavedContentRef.current = newContent;
      setTimeout(() => setIsSaving(false), 300);
    },
    800 // Increased debounce delay for smoother typing
  );

  // Handle content change - instant local state update, debounced save
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (isOnline) return;
      const newContent = e.target.value;
      setContent(newContent); // Immediate local update
      saveContent(newContent, activeEntryId); // Debounced save
    },
    [isOnline, activeEntryId, saveContent]
  );

  const newScript = useCallback(() => {
    setActiveEntryId(null);
    setContent('');
    setCurrentMood(undefined);
    lastSavedContentRef.current = '';
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    const handler = () => newScript();
    window.addEventListener('journal-new-script', handler as EventListener);
    window.addEventListener('new-script', handler as EventListener);
    return () => {
      window.removeEventListener('journal-new-script', handler as EventListener);
      window.removeEventListener('new-script', handler as EventListener);
    };
  }, [newScript]);

  const handleDeleteEntry = useCallback(() => {
    if (activeEntryId && window.confirm('Delete this script?')) {
      deleteEntry(activeEntryId);
      newScript();
    }
  }, [activeEntryId, deleteEntry, newScript]);

  const getMoodBackground = useCallback((moodEmoji: string) => {
    switch (moodEmoji) {
      case '😊':
        return 'bg-yellow-50 dark:bg-yellow-900/10';
      case '😔':
        return 'bg-blue-50 dark:bg-blue-900/10';
      case '😌':
        return 'bg-green-50 dark:bg-green-900/10';
      case '😤':
        return 'bg-red-50 dark:bg-red-900/10';
      case '😰':
        return 'bg-purple-50 dark:bg-purple-900/10';
      case '🥰':
        return 'bg-pink-50 dark:bg-pink-900/10';
      default:
        return '';
    }
  }, []);

  useEffect(() => {
    // sync title input with active entry
    setTitleInput(activeEntry?.title || '');
  }, [activeEntry?.id, activeEntry?.title]);

  const startRename = useCallback(() => {
    setIsRenaming(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  }, []);

  const commitRename = useCallback(() => {
    if (activeEntryId) {
      const t = titleInput.trim();
      setEntryTitle(activeEntryId, t);
    }
    setIsRenaming(false);
  }, [activeEntryId, titleInput, setEntryTitle]);

  const handleDownloadBackup = useCallback(() => {
    const data = JSON.stringify(exportEntries(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportEntries]);

  return (
    <div className="flex flex-col h-full relative">
      {!hydrated && (
        <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-md bg-white/70 dark:bg-[#1c1c1c]/80 rounded-2xl">
          <div className="flex flex-col items-center gap-4 text-gray-600 dark:text-gray-300">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-purple-200 dark:border-purple-800"></div>
              <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
            </div>
            <span className="text-sm font-medium">Loading your journal...</span>
          </div>
        </div>
      )}
      
      {/* Header section */}
      <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
        <div className="flex flex-col gap-2">
          <h2 suppressHydrationWarning className="text-2xl lg:text-3xl font-display font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-indigo-700 dark:from-white dark:via-purple-300 dark:to-indigo-300 bg-clip-text text-transparent">
            {formatDisplayDate(date)}
          </h2>
          {activeEntry && (
            <div className="flex items-center gap-2">
              {!isRenaming ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border border-purple-200/50 dark:border-purple-700/50 text-purple-700 dark:text-purple-300 font-medium">
                    {activeEntry.title?.trim() || 'Untitled'}
                  </span>
                  <button
                    onClick={startRename}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                    disabled={isOnline}
                    title="Rename script"
                  >
                    Rename
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    ref={titleInputRef}
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') setIsRenaming(false);
                    }}
                    className="text-sm px-3 py-1.5 rounded-lg bg-white dark:bg-[#2a2a2a] border border-purple-300 dark:border-gray-600 outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Untitled"
                    disabled={isOnline}
                  />
                  <button
                    onClick={commitRename}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-sm"
                    disabled={isOnline}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={newScript}
            disabled={isOnline || !hydrated}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${(isOnline || !hydrated) ? 'opacity-50 cursor-not-allowed bg-gray-200 dark:bg-[#2a2a2a] text-gray-500' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5'}`}
          >
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Script
            </span>
          </button>
          <button
            onClick={handleDownloadBackup}
            disabled={!hydrated}
            className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-300 ${!hydrated ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-600 text-gray-400' : 'border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30'}`}
          >
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Backup
            </span>
          </button>
          {isSaving && (
            <span className="text-sm text-purple-500 dark:text-purple-400 flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <div className="w-3 h-3 rounded-full border-2 border-purple-300 border-t-purple-500 animate-spin"></div>
              Saving...
            </span>
          )}
          {activeEntryId && (
            <button
              onClick={handleDeleteEntry}
              disabled={!hydrated}
              className={`px-4 py-2 text-sm font-medium bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-red-500/20 hover:-translate-y-0.5 flex items-center gap-1.5 ${!hydrated ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Script tabs */}
      {entriesForDate.length > 0 && (
        <div className="mb-4 flex gap-2 flex-wrap">
          {entriesForDate.map((e: JournalEntryType, idx: number) => {
            const label = (e.id === activeEntryId && isRenaming)
              ? (titleInput.trim() || 'Untitled')
              : (e.title?.trim() || `Script ${idx + 1}`);
            const isActive = e.id === activeEntryId;
            return (
              <button
                key={e.id}
                onClick={() => {
                  setActiveEntryId(e.id);
                  setContent(e.content);
                  setCurrentMood(e.mood);
                  lastSavedContentRef.current = e.content;
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${isActive 
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/20' 
                  : 'bg-gray-100 dark:bg-[#2a2a2a] border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333333]'}`}
                title={label}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Textarea */}
      <div className="flex-grow relative">
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${currentMood ? getMoodBackground(currentMood.emoji) : 'from-purple-100/50 via-white to-indigo-100/50 dark:from-[#2a2a2a]/50 dark:via-[#1c1c1c] dark:to-[#2a2a2a]/50'} transition-colors duration-500`}></div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing your thoughts..."
          readOnly={isOnline || !hydrated}
          className={`journal-textarea relative w-full h-full min-h-[350px] p-6 lg:p-8 rounded-2xl border border-purple-200/50 dark:border-gray-600/50 bg-transparent text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${(isOnline || !hydrated) ? 'cursor-default' : 'focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 dark:focus:border-gray-500 cursor-text'} focus:outline-none resize-none transition-all duration-300 text-lg leading-relaxed`}
        />
      </div>
    </div>
  );
};

export default JournalEntry;