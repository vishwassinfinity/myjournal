import React, { useEffect } from 'react';
import { useNetworkStore } from '@/store/networkStore';
import { FiWifi, FiWifiOff } from 'react-icons/fi';

const NetworkStatus: React.FC = () => {
  const { isOnline, isWorkingOffline, setIsOnline, toggleWorkingOffline } = useNetworkStore();
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);
  
  return (
    <div style={{
      backgroundColor: 'rgb(var(--card-bg))',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '1rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {isOnline ? (
          <FiWifi style={{ color: '#22c55e' }} size={20} />
        ) : (
          <FiWifiOff style={{ color: '#ef4444' }} size={20} />
        )}
        <span>
          {isOnline ? 'Online' : 'Offline'} - 
          {isWorkingOffline ? ' Working offline mode enabled' : ' Working offline mode disabled'}
        </span>
      </div>
      
      <button
        onClick={toggleWorkingOffline}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          backgroundColor: isWorkingOffline ? 'rgb(var(--card-bg))' : '#4B6BFB',
          color: isWorkingOffline ? 'rgb(var(--foreground-rgb))' : 'white',
          border: isWorkingOffline ? '1px solid rgba(var(--foreground-rgb), 0.2)' : 'none',
          cursor: 'pointer'
        }}
      >
        {isWorkingOffline ? 'Disable Offline Mode' : 'Enable Offline Mode'}
      </button>
    </div>
  );
};

export default NetworkStatus; 