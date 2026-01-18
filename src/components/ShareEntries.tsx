import React, { useState, useMemo, useCallback, memo } from 'react';
import { useJournalStore } from '@/store/journalStore';
import { useNetworkStore } from '@/store/networkStore';

const ShareEntries: React.FC = memo(function ShareEntries() {
  // Subscribe to specific state pieces
  const entries = useJournalStore((state) => state.entries);
  const shareEntry = useJournalStore((s) => s.shareEntry);
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
  
  // Memoize filtered entries
  const entriesWithContent = useMemo(
    () => entries.filter(entry => entry.content.trim().length > 0),
    [entries]
  );
  
  const current = useMemo(
    () => selectedEntryId ? getEntryById(selectedEntryId) : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedEntryId, entries] // entries dependency to update when entry changes
  );
  
  const handleEntrySelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedEntryId(value === '' ? null : value);
    setShareSuccess(false);
    setShareError(null);
    setCopied(false);
  }, []);
  
  const handleShareSubmit = useCallback((e: React.FormEvent) => {
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
  }, [selectedEntryId, shareEmail, shareEntry]);

  const copyLink = useCallback(async () => {
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
  }, [current?.shareToken]);

  const removeEmail = useCallback((email: string) => {
    if (!current) return;
    unshareEntry(current.id, email);
  }, [current, unshareEntry]);

  const revokeLink = useCallback(() => {
    if (!current) return;
    if (confirm('Revoke link and remove all shares?')) {
      revokeShareLink(current.id);
      setCopied(false);
      setShareSuccess(false);
    }
  }, [current, revokeShareLink]);

  const togglePublic = useCallback(() => {
    if (current) toggleShareStatus(current.id);
  }, [current, toggleShareStatus]);

  const isDisabled = !isOnline || isWorkingOffline;

  return (
    <div className={`space-y-6 ${isDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-800 via-purple-700 to-indigo-700 dark:from-white dark:via-purple-300 dark:to-indigo-300 bg-clip-text text-transparent">
          Share Your Scripts
        </h2>
      </div>

      {isDisabled && (
        <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-[#2a2a2a] dark:to-[#1c1c1c] rounded-2xl text-center border border-gray-200/50 dark:border-gray-700">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-xl bg-gray-200 dark:bg-[#333333]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Sharing is disabled in offline mode. Connect to the internet to share your scripts.
            </p>
          </div>
        </div>
      )}

      {!isDisabled && entriesWithContent.length === 0 && (
        <div className="p-8 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-[#2a2a2a]/50 dark:to-[#1c1c1c] rounded-2xl text-center border border-purple-100 dark:border-gray-700">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-[#333333]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Write some scripts first to share them with others
            </p>
          </div>
        </div>
      )}

      {!isDisabled && entriesWithContent.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-[#2a2a2a]/50 dark:to-[#1c1c1c] rounded-2xl p-6 border border-purple-100/50 dark:border-gray-700 space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select a script to share
            </label>
            <select
              value={selectedEntryId || ''}
              onChange={handleEntrySelect}
              className="w-full p-3 border border-purple-200 dark:border-gray-600 rounded-xl bg-white dark:bg-[#2a2a2a] text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 dark:focus:border-gray-500 outline-none transition-all"
            >
              <option value="">-- Select a script --</option>
              {entriesWithContent.map(entry => (
                <option key={entry.id} value={entry.id}>
                  {entry.title?.trim() || 'Untitled'} • {entry.date}{entry.shared ? ' ✓ Shared' : ''}
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
                    className="flex-1 p-3 border border-purple-200 dark:border-gray-600 rounded-xl bg-white dark:bg-[#2a2a2a] text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-300 dark:focus:border-gray-500 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isSharing}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-70 transition-all duration-300"
                  >
                    {isSharing ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                        Sharing
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Share
                      </>
                    )}
                  </button>
                </div>
                {shareError && <div className="text-xs text-red-500 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{shareError}</div>}
                {shareSuccess && !shareError && <div className="text-xs text-emerald-600 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Successfully shared!</div>}
              </form>

              <div className="flex flex-wrap items-center gap-2">
                <button onClick={togglePublic} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${current.shared ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md shadow-emerald-500/20' : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'}`}>
                  {current.shared ? '✓ Public Link Active' : 'Enable Public Link'}
                </button>
                {current.shareToken && (
                  <>
                    <button onClick={copyLink} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-300 ${copied ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400' : 'border-purple-200 dark:border-gray-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-[#2a2a2a]'}`}>
                      {copied ? '✓ Copied!' : 'Copy Link'}
                    </button>
                    <button onClick={revokeLink} className="px-4 py-2 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-300">
                      Revoke Access
                    </button>
                  </>
                )}
              </div>

              {current.sharedWith.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-purple-100 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Collaborators ({current.sharedWith.length})
                  </div>
                  <ul className="space-y-2">
                    {current.sharedWith.map(email => (
                      <li key={email} className="flex items-center justify-between bg-white dark:bg-[#2a2a2a] rounded-xl px-4 py-2.5 border border-purple-100/50 dark:border-gray-700">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{email}</span>
                        <button onClick={() => removeEmail(email)} className="text-red-500 hover:text-red-600 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/30 px-2 py-1 rounded-lg transition-colors">Remove</button>
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
});

export default ShareEntries;