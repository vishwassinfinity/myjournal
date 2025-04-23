import React, { useState, useEffect } from 'react';

const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState(100);
  
  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine);
    
    // Add event listeners for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      simulateConnectionQuality();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality(0);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Simulate connection quality
    simulateConnectionQuality();
    
    // Simulate connection quality fluctuations
    const interval = setInterval(() => {
      if (isOnline) {
        simulateConnectionQuality();
      }
    }, 5000);
    
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);
  
  const simulateConnectionQuality = () => {
    // Simulate network quality between 70-100%
    const quality = Math.floor(Math.random() * 30) + 70;
    setConnectionQuality(quality);
  };
  
  const toggleOfflineMode = () => {
    setOfflineModeEnabled(!offlineModeEnabled);
  };
  
  const getQualityColor = () => {
    if (connectionQuality >= 90) return 'bg-green-500';
    if (connectionQuality >= 70) return 'bg-yellow-500';
    if (connectionQuality >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="my-4 rounded-xl overflow-hidden glass shadow transition-all duration-300 group hover:shadow-md border border-gray-100 dark:border-gray-700 animate-fade-in">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
        <div className="flex items-center gap-4">
          {isOnline ? (
            <div className="flex items-center">
              <div className="relative">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span className="absolute -inset-0.5 bg-green-500 rounded-full opacity-60 animate-ping"></span>
              </div>
              <span className="text-sm font-medium text-journal-text-light dark:text-journal-text-dark">
                {offlineModeEnabled ? 'Online (Offline Mode)' : 'Online'}
              </span>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              <span className="text-sm font-medium text-journal-text-light dark:text-journal-text-dark">Offline</span>
            </div>
          )}
          
          {isOnline && !offlineModeEnabled && (
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getQualityColor()} transition-all duration-1000`} 
                  style={{ width: `${connectionQuality}%` }}
                ></div>
              </div>
              <span className="text-xs text-journal-muted-light dark:text-journal-muted-dark">
                {connectionQuality}%
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleOfflineMode();
            }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none flex items-center ${
              offlineModeEnabled 
                ? 'bg-journal-primary text-white hover:bg-journal-secondary shadow-inner' 
                : 'bg-gray-100 dark:bg-gray-700 text-journal-text-light dark:text-journal-text-dark hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {offlineModeEnabled ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                Disable Offline Mode
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Enable Offline Mode
              </>
            )}
          </button>
          
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 text-journal-muted-light dark:text-journal-muted-dark transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {showDetails && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/50 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-journal-muted-light dark:text-journal-muted-dark mb-1">Last Sync</span>
              <span className="text-sm text-journal-text-light dark:text-journal-text-dark">
                {new Date().toLocaleString()}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xs text-journal-muted-light dark:text-journal-muted-dark mb-1">Storage Used</span>
              <div className="flex items-center gap-2">
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-journal-secondary transition-all duration-1000 w-2/3"></div>
                </div>
                <span className="text-xs whitespace-nowrap">12.3 MB</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xs text-journal-muted-light dark:text-journal-muted-dark mb-1">Sync Status</span>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-journal-text-light dark:text-journal-text-dark">All entries synced</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-3">
            <button 
              className="text-xs text-journal-primary hover:text-journal-secondary transition-colors flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Force Sync
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkStatus; 