import React, { useState } from 'react';
import Image from 'next/image';
import { useJournalStore } from '@/store/journalStore';

interface HeaderProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, isDarkMode }) => {
  const [showMenu, setShowMenu] = useState(false);
  const exportEntries = useJournalStore((s) => s.exportEntries);
  const clearAllEntries = useJournalStore((s) => s.clearAllEntries);
  
  const closeMenu = () => setShowMenu(false);

  const onDashboard = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMenu();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _onNewScript = () => {
    window.dispatchEvent(new CustomEvent('new-script'));
    // Smoothly scroll to main editor area
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSearch = () => {
    // Dispatch a custom event to open the search UI in the page
    window.dispatchEvent(new CustomEvent('open-search'));
    closeMenu();
  };

  const onStats = () => {
    window.dispatchEvent(new CustomEvent('open-stats'));
    closeMenu();
  };

  const onSettings = () => {
    // Simple settings: export and clear data prompt
    const choice = window.prompt('Settings:\nType "export" to download all entries, or "clear" to delete everything.');
    if (!choice) return;
    if (choice.toLowerCase() === 'export') {
      const data = exportEntries();
      // lazy dynamic import to avoid circular
      import('@/lib/utils').then(({ downloadJson }) => {
        downloadJson(data, 'soul-scripts-entries.json');
      });
    } else if (choice.toLowerCase() === 'clear') {
      if (window.confirm('This will delete all entries locally. Continue?')) {
        clearAllEntries();
      }
    }
    closeMenu();
  };
  
  const menuItems = [
    { label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', onClick: onDashboard },
    { label: 'Search Entries', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', onClick: onSearch },
    { label: 'Stats & Insights', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', onClick: onStats },
    { label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', onClick: onSettings },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1c]/80 border-b border-white/20 dark:border-white/10 transition-all duration-500">
      <div className="container mx-auto px-4 lg:px-6 py-4 flex justify-between items-center relative max-w-7xl">
        <div className="flex items-center space-x-4 z-20">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            <Image 
              src="/images/Logo.png" 
              alt="Soul Scripts Logo" 
              width={48}
              height={48}
              className="relative object-contain group-hover:scale-105 transition-transform duration-300 rounded-xl"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Soul</span>
              <span className="text-gray-800 dark:text-white ml-1">Scripts</span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">Your personal sanctuary</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 z-20">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="relative p-2.5 rounded-xl bg-white/50 dark:bg-[#2a2a2a]/80 hover:bg-white dark:hover:bg-[#333333] border border-gray-200/50 dark:border-white/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 group"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 group-hover:rotate-45 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 group-hover:rotate-12 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          {/* Menu button */}
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="relative p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 hover:from-indigo-500/20 hover:via-purple-500/20 hover:to-pink-500/20 border border-purple-200/50 dark:border-purple-800/50 transition-all duration-300 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-purple-600 dark:text-purple-400 transition-transform duration-300 ${showMenu ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse"></span>
          </button>
        </div>
        
        {/* Dropdown Menu */}
        <div 
          className={`absolute top-full right-4 mt-3 w-64 backdrop-blur-xl bg-white/90 dark:bg-[#1c1c1c]/95 rounded-2xl shadow-xl shadow-purple-500/10 border border-white/20 dark:border-white/10 transition-all duration-300 z-10 transform origin-top-right overflow-hidden ${
            showMenu ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="p-2">
            {menuItems.map((item, index) => (
              <button 
                key={index}
                onClick={item.onClick}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-indigo-500/10 hover:via-purple-500/10 hover:to-pink-500/10 rounded-xl transition-all duration-200 group"
              >
                <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 group-hover:from-indigo-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 mr-3 transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;