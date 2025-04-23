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
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  
  const handleShare = () => {
    if (selectedEntryId && email.trim()) {
      shareEntry(selectedEntryId, email.trim());
      setEmail('');
    }
  };
  
  const handleCopyLink = (entryId: string) => {
    const link = generateShareLink(entryId);
    copyToClipboard(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
    <div style={containerStyle}>
      <h2 style={headingStyle}>Share Your Journal</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          marginBottom: '0.5rem',
          color: 'rgb(var(--foreground-rgb))'
        }}>
          Select an entry to share
        </label>
        <select 
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '0.375rem',
            border: '1px solid rgba(var(--foreground-rgb), 0.2)',
            backgroundColor: 'rgba(var(--background-start-rgb), 0.3)',
            color: 'rgb(var(--foreground-rgb))'
          }}
          value={selectedEntryId || ''}
          onChange={(e) => setSelectedEntryId(e.target.value || null)}
        >
          <option value="">-- Select an entry --</option>
          {entries.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {formatDisplayDate(new Date(entry.date))}
            </option>
          ))}
        </select>
      </div>
      
      {selectedEntryId && selectedEntry && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder="Friend's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: '1px solid rgba(var(--foreground-rgb), 0.2)',
                backgroundColor: 'rgba(var(--background-start-rgb), 0.3)',
                color: 'rgb(var(--foreground-rgb))'
              }}
            />
            <button 
              onClick={handleShare}
              disabled={!email.trim()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#4B6BFB',
                color: 'white',
                borderRadius: '0.375rem',
                opacity: !email.trim() ? 0.5 : 1,
                cursor: !email.trim() ? 'not-allowed' : 'pointer',
                border: 'none'
              }}
            >
              <FiShare2 size={18} />
            </button>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500',
                color: 'rgb(var(--foreground-rgb))'
              }}>
                Enable public sharing
              </label>
              <button
                onClick={() => toggleShareStatus(selectedEntryId)}
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: '1.5rem',
                  width: '2.75rem',
                  borderRadius: '9999px',
                  backgroundColor: selectedEntry.shared ? '#4B6BFB' : 'rgb(var(--muted-color), 0.3)',
                  transition: 'background-color 0.3s',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <span style={{
                  position: 'absolute',
                  right: selectedEntry.shared ? '2px' : 'auto',
                  left: selectedEntry.shared ? 'auto' : '2px',
                  width: '1.25rem',
                  height: '1.25rem',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  transition: 'left 0.3s, right 0.3s'
                }} />
              </button>
            </div>
          </div>
          
          {selectedEntry.shared && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem',
              backgroundColor: 'rgba(var(--foreground-rgb), 0.05)',
              borderRadius: '0.375rem'
            }}>
              <span style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Public link available
              </span>
              <button
                onClick={() => handleCopyLink(selectedEntryId)}
                style={{
                  padding: '0.25rem',
                  borderRadius: '50%',
                  backgroundColor: '#4B6BFB',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
              </button>
            </div>
          )}
          
          {selectedEntry.sharedWith.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                marginBottom: '0.5rem',
                color: 'rgb(var(--foreground-rgb))'
              }}>
                Shared with:
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {selectedEntry.sharedWith.map((email) => (
                  <li key={email} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(var(--foreground-rgb), 0.05)',
                    borderRadius: '0.375rem'
                  }}>
                    <span style={{ fontSize: '0.875rem' }}>{email}</span>
                    <button
                      onClick={() => unshareEntry(selectedEntryId, email)}
                      style={{
                        padding: '0.25rem',
                        borderRadius: '50%',
                        color: '#ef4444',
                        backgroundColor: 'transparent',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FiX size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShareEntries; 