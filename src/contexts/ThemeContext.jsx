import { createContext, useContext, useEffect, useState, useCallback } from 'react';

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function resolveTheme(preference) {
  if (preference === 'auto') return getSystemTheme();
  return preference;
}

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => {
    try {
      const stored = localStorage.getItem('upstock-theme');
      return stored === 'dark' || stored === 'light' || stored === 'auto' ? stored : 'dark';
    } catch {
      return 'dark';
    }
  });

  const resolved = resolveTheme(preference);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
    try {
      localStorage.setItem('upstock-theme', preference);
    } catch (_) { /* localStorage may be unavailable */ }
  }, [preference, resolved]);

  useEffect(() => {
    if (preference !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => {
      const r = getSystemTheme();
      document.documentElement.setAttribute('data-theme', r);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference]);

  const toggleTheme = useCallback(() => {
    setPreference(prev => {
      if (prev === 'auto') return 'dark';
      return prev === 'dark' ? 'light' : 'dark';
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: preference, resolvedTheme: resolved, toggleTheme, setTheme: setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
