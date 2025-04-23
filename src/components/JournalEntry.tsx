import React, { useState, useEffect } from 'react';
import { useJournalStore, JournalEntry as JournalEntryType } from '@/store/journalStore';
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
  
  const dateString = formatDate(date);
  const existingEntry = getEntryByDate(dateString);
  
  const [content, setContent] = useState(existingEntry?.content || '');
  const [debouncedContent] = useDebounce(content, 1000);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    setContent(existingEntry?.content || '');
  }, [existingEntry, date]);
  
  useEffect(() => {
    if (debouncedContent !== existingEntry?.content) {
      saveEntry();
    }
  }, [debouncedContent]);
  
  const saveEntry = () => {
    if (!content.trim()) return;
    
    setIsSaving(true);
    
    if (existingEntry) {
      updateEntry(existingEntry.id, content);
    } else {
      addEntry({
        date: dateString,
        content,
        shared: false,
        sharedWith: [],
      });
    }
    
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };
  
  const handleDeleteEntry = () => {
    if (existingEntry && window.confirm('Are you sure you want to delete this entry?')) {
      deleteEntry(existingEntry.id);
      setContent('');
    }
  };
  
  return (
    <div className="journal-entry">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem' 
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'rgb(var(--foreground-rgb))' }}>
          {formatDisplayDate(date)}
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isSaving && <span style={{ fontSize: '0.875rem', color: 'rgb(var(--muted-color))' }}>Saving...</span>}
          {existingEntry && (
            <button 
              onClick={handleDeleteEntry}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.875rem',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your thoughts for today..."
        style={{
          width: '100%',
          minHeight: '300px',
          padding: '1rem',
          borderRadius: '0.375rem',
          border: '1px solid rgba(var(--foreground-rgb), 0.2)',
          backgroundColor: 'rgba(var(--background-start-rgb), 0.3)',
          color: 'rgb(var(--foreground-rgb))',
          resize: 'vertical',
          outline: 'none'
        }}
      />
    </div>
  );
};

export default JournalEntry; 