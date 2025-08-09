'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useJournalStore, MoodType } from '@/store/journalStore';
import { formatDisplayDate, formatDate } from '@/lib/utils';

// Local debounced value hook to avoid extra dependency
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface JournalEntryProps {
  date: Date;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ date }) => {
  const hydrated = useJournalStore((s) => s.hydrated);
  const exportEntries = useJournalStore((s) => s.exportEntries);
  const entriesCount = useJournalStore((s) => s.entries.length);
  const getEntriesByDate = useJournalStore((s) => s.getEntriesByDate);
  const getEntryByDate = useJournalStore((s) => s.getEntryByDate);
  const addEntry = useJournalStore((s) => s.addEntry);
  const updateEntry = useJournalStore((s) => s.updateEntry);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);
  const setEntryTitle = useJournalStore((s) => s.setEntryTitle);

  // Mark as used (subscription only)
  void entriesCount;

  const dateString = formatDate(date);
  const entriesForDate = getEntriesByDate(dateString);
  const defaultEntry = getEntryByDate(dateString);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(defaultEntry?.id ?? null);
  const activeEntry = entriesForDate.find((e) => e.id === activeEntryId) || defaultEntry || null;

  const [content, setContent] = useState(activeEntry?.content || '');
  const debouncedContent = useDebouncedValue(content, 500);
  const [isSaving, setIsSaving] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodType | undefined>(activeEntry?.mood);
  const [isOnline, setIsOnline] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDirty, setIsDirty] = useState(false);

  const [isRenaming, setIsRenaming] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActiveEntryId(activeEntry?.id || null);
    setContent(activeEntry?.content || '');
    setCurrentMood(activeEntry?.mood);
    setIsDirty(false);
  }, [dateString, activeEntry?.id, activeEntry?.content, activeEntry?.mood]);

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

  useEffect(() => {
    if (!hydrated) return; // wait until store hydrated
    if (!isDirty) return;
    if (!activeEntryId && !content.trim()) return;

    setIsSaving(true);
    if (activeEntryId) {
      if (debouncedContent !== (activeEntry?.content || '')) {
        updateEntry(activeEntryId, debouncedContent);
      }
    } else if (content.trim()) {
      const newId = addEntry({
        date: dateString,
        content: debouncedContent,
        shared: false,
        sharedWith: [],
      });
      setActiveEntryId(newId);
    }
    const t = setTimeout(() => setIsSaving(false), 400);
    setIsDirty(false);
    return () => clearTimeout(t);
  }, [debouncedContent, isDirty, activeEntryId, addEntry, content, dateString, updateEntry, activeEntry?.content, hydrated]);

  const newScript = () => {
    setActiveEntryId(null);
    setContent('');
    setCurrentMood(undefined);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  useEffect(() => {
    const handler = () => newScript();
    window.addEventListener('journal-new-script', handler as EventListener);
    window.addEventListener('new-script', handler as EventListener);
    return () => {
      window.removeEventListener('journal-new-script', handler as EventListener);
      window.removeEventListener('new-script', handler as EventListener);
    };
  }, [dateString]);

  const handleDeleteEntry = () => {
    if (activeEntryId && window.confirm('Delete this script?')) {
      deleteEntry(activeEntryId);
      newScript();
    }
  };

  const getMoodBackground = (moodEmoji: string) => {
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
  };

  useEffect(() => {
    // sync title input with active entry
    setTitleInput(activeEntry?.title || '');
  }, [activeEntry?.id, activeEntry?.title]);

  const startRename = () => {
    setIsRenaming(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };
  const commitRename = () => {
    if (activeEntryId) {
      const t = titleInput.trim();
      setEntryTitle(activeEntryId, t);
    }
    setIsRenaming(false);
  };

  const handleDownloadBackup = () => {
    const data = JSON.stringify(exportEntries(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full relative animate-scale-in">
      {!hydrated && (
        <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm bg-white/60 dark:bg-gray-900/60">
          <div className="flex items-center gap-3 text-journal-text-light dark:text-journal-text-dark">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" className="opacity-25"/><path d="M4 12a8 8 0 018-8" className="opacity-75"/></svg>
            <span>Loading your data...</span>
          </div>
        </div>
      )}
      <div className="flex flex-wrap justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <h2 suppressHydrationWarning className="text-3xl font-bold text-journal-text-light dark:text-journal-text-dark flex items-center text-shadow transition-all duration-300">
            {formatDisplayDate(date)}
          </h2>
          {activeEntry && (
            <div className="flex items-center gap-2">
              {!isRenaming ? (
                <>
                  <span className="text-sm px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-journal-text-light dark:text-journal-text-dark">
                    {(activeEntryId === activeEntry.id && isRenaming) ? (titleInput.trim() || 'Untitled') : (activeEntry.title?.trim() || 'Untitled')}
                  </span>
                  <button
                    onClick={startRename}
                    className="text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    disabled={isOnline}
                    title="Rename script"
                  >
                    Rename
                  </button>
                </>
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
                    className="text-sm px-2 py-1 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 outline-none"
                    placeholder="Untitled"
                    disabled={isOnline}
                  />
                  <button
                    onClick={commitRename}
                    className="text-xs px-2 py-1 rounded-md bg-journal-primary text-white"
                    disabled={isOnline}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <button
            onClick={newScript}
            disabled={isOnline || !hydrated}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 ${(isOnline || !hydrated) ? 'opacity-50 cursor-not-allowed' : 'bg-journal-primary text-white hover:bg-journal-secondary'}`}
          >
            + New Script for this day
          </button>
          <button
            onClick={handleDownloadBackup}
            disabled={!hydrated}
            className={`px-3 py-1.5 text-sm rounded-lg border ${!hydrated ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-600' : 'border-journal-primary text-journal-primary dark:text-white dark:border-journal-primary hover:bg-journal-primary hover:text-white dark:hover:bg-journal-secondary'} transition-colors`}
          >
            Backup
          </button>
          {isSaving && (
            <span className="text-sm text-journal-muted-light dark:text-journal-muted-dark flex items-center">
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          )}
          {activeEntryId && (
            <button
              onClick={handleDeleteEntry}
              disabled={!hydrated}
              className={`px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 flex items-center ${!hydrated ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {entriesForDate.length > 0 && (
        <div className="mb-3 flex gap-2 flex-wrap">
          {entriesForDate.map((e, idx) => {
            const label = (e.id === activeEntryId && isRenaming)
              ? (titleInput.trim() || 'Untitled')
              : (e.title?.trim() || `Script ${idx + 1}`);
            return (
              <button
                key={e.id}
                onClick={() => {
                  setActiveEntryId(e.id);
                  setContent(e.content);
                  setCurrentMood(e.mood);
                }}
                className={`px-2 py-1 text-xs rounded-md border ${e.id === activeEntryId ? 'bg-journal-primary text-white border-journal-primary' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}
                title={label}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex-grow relative h-full animate-fade-in animation-delay-150">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            if (!isOnline) {
              setContent(e.target.value);
              setIsDirty(true);
            }
          }}
          placeholder=""
          readOnly={isOnline || !hydrated}
          className={`w-full h-full min-h-[350px] p-6 rounded-xl border border-gray-200 dark:border-gray-700 ${currentMood ? getMoodBackground(currentMood.emoji) : 'bg-white/80 dark:bg-gray-800/50'} backdrop-blur-sm text-journal-text-light dark:text-journal-text-dark ${(isOnline || !hydrated) ? 'cursor-default' : 'focus:ring-2 focus:ring-journal-primary cursor-text'} focus:outline-none resize-none transition duration-300 shadow-inner text-lg leading-relaxed`}
        />
      </div>
    </div>
  );
};

export default JournalEntry;