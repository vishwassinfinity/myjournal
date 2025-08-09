import React, { useState } from 'react';
import { useJournalStore } from '@/store/journalStore';
import { useNetworkStore } from '@/store/networkStore';

const ShareEntries: React.FC = () => {
  const entries = useJournalStore((state) => state.entries);
  const shareEntry = useJournalStore((state) => state.shareEntry);
  const unshareEntry = useJournalStore((s) => s.unshareEntry);
  const getEntryById = useJournalStore((s) => s.getEntryById);
  const revokeShareLink = useJournalStore((s) => s.revokeShareLink);
  const toggleShareStatus = useJournalStore((s) => s.toggleShareStatus);
  const isOnline = useNetworkStore((s) => s.isOnline);
  const isWorkingOffline = useNetworkStore((s) => s.isWorkingOffline);
  
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const entriesWithContent = entries.filter(entry => entry.content.trim().length > 0);
  const current = selectedEntryId ? getEntryById(selectedEntryId) : undefined;
  
  const handleEntrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedEntryId(value === '' ? null : value);
    setShareSuccess(false);
    setShareError(null);
    setCopied(false);
  };
  
  const handleShareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntryId || !shareEmail) {
      setShareError('Select an entry and enter an email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shareEmail)) {
      setShareError('Invalid email');
      return;
    }
    setIsSharing(true);
    setShareError(null);
    setTimeout(() => {
      try {
        shareEntry(selectedEntryId, shareEmail.toLowerCase());
        setShareSuccess(true);
        setShareEmail('');
      } catch {
        setShareError('Share failed');
      } finally {
        setIsSharing(false);
      }
    }, 400);
  };

  const copyLink = async () => {
    if (!current?.shareToken) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/shared/${current.shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setShareError('Copy failed');
    }
  };

  const removeEmail = (email: string) => {
    if (!current) return;
    unshareEntry(current.id, email);
  };

  const revokeLink = () => {
    if (!current) return;
    if (confirm('Revoke link and remove all shares?')) {
      revokeShareLink(current.id);
      setCopied(false);
      setShareSuccess(false);
    }
  };

  const togglePublic = () => {
    if (current) toggleShareStatus(current.id);
  };

  const isDisabled = !isOnline || isWorkingOffline;

  return (
    <div className={`space-y-6 ${isDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <h2 className="text-2xl font-bold text-journal-text-light dark:text-journal-text-dark">
        Share Your Scripts
      </h2>

      {isDisabled && (
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl text-center">
          <p className="text-journal-muted-light dark:text-journal-muted-dark">
            Sharing is disabled in offline mode. Please connect to the internet to share your scripts.
          </p>
        </div>
      )}

      {!isDisabled && entriesWithContent.length === 0 && (
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl text-center">
          <p className="text-journal-muted-light dark:text-journal-muted-dark">
            Write some scripts first to share them
          </p>
        </div>
      )}

      {!isDisabled && entriesWithContent.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 shadow-inner space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium mb-1">
              Select a script
            </label>
            <select
              value={selectedEntryId || ''}
              onChange={handleEntrySelect}
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              <option value="">-- Select --</option>
              {entriesWithContent.map(entry => (
                <option key={entry.id} value={entry.id}>
                  {entry.title?.trim() || 'Untitled'} • {entry.date}{entry.shared ? ' (Shared)' : ''}
                </option>
              ))}
            </select>
          </div>

          {current && (
            <div className="space-y-5">
              <form onSubmit={handleShareSubmit} className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Add collaborator email"
                    className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSharing}
                    className="px-4 py-2 rounded-lg bg-journal-primary hover:bg-journal-secondary text-white text-sm flex items-center gap-2 disabled:opacity-70"
                  >
                    {isSharing ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Sharing
                      </>
                    ) : 'Share'}
                  </button>
                </div>
                {shareError && <div className="text-xs text-red-500">{shareError}</div>}
                {shareSuccess && !shareError && <div className="text-xs text-green-600">Shared.</div>}
              </form>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <button onClick={togglePublic} className={`px-3 py-1 rounded-md border ${current.shared ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 dark:border-gray-600'}`}>
                  {current.shared ? 'Public Enabled' : 'Enable Public'}
                </button>
                {current.shareToken && (
                  <>
                    <button onClick={copyLink} className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button onClick={revokeLink} className="px-3 py-1 rounded-md border border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
                      Revoke
                    </button>
                  </>
                )}
              </div>

              {current.sharedWith.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Collaborators</div>
                  <ul className="space-y-1 text-sm">
                    {current.sharedWith.map(email => (
                      <li key={email} className="flex items-center justify-between bg-white/70 dark:bg-gray-700/40 rounded-md px-3 py-1">
                        <span>{email}</span>
                        <button onClick={() => removeEmail(email)} className="text-red-500 hover:text-red-600 text-xs">Remove</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShareEntries;