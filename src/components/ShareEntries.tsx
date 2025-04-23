import React, { useState } from 'react';
import { useJournalStore } from '@/store/journalStore';
import { useNetworkStore } from '@/store/networkStore';
import { formatDisplayDate, copyToClipboard, generateShareLink } from '@/lib/utils';
import { FiShare2, FiCheck, FiX, FiCopy } from 'react-icons/fi';

const ShareEntries: React.FC = () => {
  const entries = useJournalStore((state) => state.entries);
  const shareEntry = useJournalStore((state) => state.shareEntry);
  const unshareEntry = useJournalStore((state) => state.unshareEntry);
  const toggleShareStatus = useJournalStore((state) => state.toggleShareStatus);
  const { isOnline, isWorkingOffline } = useNetworkStore();
  
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  
  // Filter for entries that have content
  const entriesWithContent = entries.filter(entry => entry.content.trim().length > 0);
  
  const handleEntrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedEntryId(value === '' ? null : value);
    setShareSuccess(false);
    setShareError(null);
  };
  
  const handleShareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEntryId || !shareEmail) {
      setShareError('Please select an entry and enter an email address');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shareEmail)) {
      setShareError('Please enter a valid email address');
      return;
    }
    
    setIsSharing(true);
    setShareError(null);
    
    // Simulate API call
    setTimeout(() => {
      try {
        const entry = entries.find(e => e.id === selectedEntryId);
        if (entry) {
          // Update the entry sharing status
          shareEntry(selectedEntryId, shareEmail);
          
          setShareSuccess(true);
          setShareEmail('');
        } else {
          setShareError('Entry not found');
        }
      } catch (error) {
        setShareError('Failed to share the entry. Please try again.');
      } finally {
        setIsSharing(false);
      }
    }, 1000);
  };
  
  const isDisabled = !isOnline || isWorkingOffline;
  const selectedEntry = entries.find(e => e.id === selectedEntryId);
  
  const containerStyle = {
    backgroundColor: 'rgb(var(--card-bg))',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '1rem',
    marginBottom: '1.5rem',
    opacity: isDisabled ? 0.6 : 1
  };
  
  const headingStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: 'rgb(var(--foreground-rgb))'
  };
  
  if (isDisabled) {
    return (
      <div style={containerStyle}>
        <h2 style={headingStyle}>Share Your Journal</h2>
        <p style={{ color: 'rgb(var(--muted-color))' }}>
          Sharing is disabled in offline mode. Please connect to the internet to share your journal.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-journal-text-light dark:text-journal-text-dark">
        Share Your Journal
      </h2>
      
      {entriesWithContent.length === 0 ? (
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl text-center">
          <p className="text-journal-muted-light dark:text-journal-muted-dark">
            Write some journal entries first to share them
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 shadow-inner">
          <form onSubmit={handleShareSubmit} className="space-y-5">
            <div>
              <label 
                htmlFor="entry-select" 
                className="block text-sm font-medium text-journal-text-light dark:text-journal-text-dark mb-2"
              >
                Select an entry to share
              </label>
              <select
                id="entry-select"
                value={selectedEntryId || ''}
                onChange={handleEntrySelect}
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-journal-text-light dark:text-journal-text-dark focus:ring-2 focus:ring-journal-primary focus:border-transparent"
              >
                <option value="">-- Select an entry --</option>
                {entriesWithContent.map(entry => (
                  <option key={entry.id} value={entry.id}>
                    {entry.date} {entry.shared ? '(Shared)' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label 
                htmlFor="share-email" 
                className="block text-sm font-medium text-journal-text-light dark:text-journal-text-dark mb-2"
              >
                Share with (email address)
              </label>
              <input
                id="share-email"
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-journal-text-light dark:text-journal-text-dark focus:ring-2 focus:ring-journal-primary focus:border-transparent"
              />
            </div>
            
            {shareError && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {shareError}
              </div>
            )}
            
            {shareSuccess && (
              <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg text-sm">
                Entry successfully shared with {shareEmail}!
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSharing}
                className="px-5 py-2.5 bg-journal-primary hover:bg-journal-secondary text-white rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSharing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sharing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Entry
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {selectedEntryId && entries.find(e => e.id === selectedEntryId)?.sharedWith?.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-journal-text-light dark:text-journal-text-dark mb-3">
            Already Shared With:
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <ul className="space-y-2">
              {entries.find(e => e.id === selectedEntryId)?.sharedWith?.map((email, idx) => (
                <li key={idx} className="flex items-center gap-2 text-journal-text-light dark:text-journal-text-dark">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {email}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareEntries; 