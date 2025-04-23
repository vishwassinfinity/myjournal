import React from 'react';
import { FiMoon, FiSun, FiBook } from 'react-icons/fi';

interface HeaderProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, isDarkMode }) => {
  return (
    <header style={{
      backgroundColor: 'rgb(var(--card-bg))',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      padding: '1rem 1.5rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{ 
        maxWidth: '56rem', 
        margin: '0 auto', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiBook style={{ color: '#4B6BFB' }} size={24} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'rgb(var(--foreground-rgb))' }}>
            MyJournal
          </h1>
        </div>
        <button
          onClick={toggleTheme}
          style={{
            padding: '0.5rem',
            borderRadius: '9999px',
            backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
            color: 'rgb(var(--foreground-rgb))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header; 