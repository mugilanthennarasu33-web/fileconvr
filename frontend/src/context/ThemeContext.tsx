import React, { createContext, useContext, useEffect, useState } from 'react';
import { safeStorage } from '../utils/safeStorage';

type Theme = 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme] = useState<Theme>('light');

  useEffect(() => {
    // Strictly enforce light mode SaaS appearance
    const root = document.documentElement;
    root.classList.remove('dark');
    safeStorage.setItem('fileconvr_theme', 'light');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => {}, isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
