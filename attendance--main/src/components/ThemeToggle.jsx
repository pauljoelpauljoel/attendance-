import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'system');

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (theme === 'system') {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <select 
      className="glass-select" 
      style={{ padding: '6px 12px', fontSize: '0.9rem', width: 'auto', background: 'var(--card-bg)' }}
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
    >
      <option value="system">System Mode</option>
      <option value="light">Light Mode</option>
      <option value="dark">Dark Mode</option>
    </select>
  );
};

export default ThemeToggle;
