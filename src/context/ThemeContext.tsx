import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { AppTheme, isAppTheme, THEME_EVENT, THEME_KEY } from '@/lib/settings';
import { ThemeContext, ThemeContextValue } from '@/context/theme';

function readStoredTheme(): AppTheme {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(THEME_KEY);
  return isAppTheme(stored) ? stored : 'dark';
}

function applyTheme(theme: AppTheme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => readStoredTheme());

  const updateTheme = useCallback((nextTheme: AppTheme) => {
    applyTheme(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme: nextTheme } }));
    setThemeState(nextTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_KEY && isAppTheme(event.newValue)) {
        applyTheme(event.newValue);
        setThemeState(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    isLightTheme: theme === 'light',
    setTheme: updateTheme,
    toggleTheme: () => updateTheme(theme === 'light' ? 'dark' : 'light'),
  }), [theme, updateTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
