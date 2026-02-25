import { useState, useEffect, useCallback } from 'react';

export const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('noor-theme');
    return stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('noor-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = useCallback(() => setIsDark(prev => !prev), []);

  return { isDark, toggle };
};
