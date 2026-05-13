import { createContext } from 'react';
import { AppTheme } from '@/lib/settings';

export type ThemeContextValue = {
  theme: AppTheme;
  isLightTheme: boolean;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
