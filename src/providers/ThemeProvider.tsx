import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qTheme = params.get('theme') as Theme;
      if (qTheme === 'light' || qTheme === 'dark') {
        localStorage.setItem('ps-theme', qTheme);
        return qTheme;
      }
    }
    const saved = localStorage.getItem('ps-theme') as Theme;
    if (saved) return saved;
    return defaultTheme || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;

    const applySystemTheme = () => {
      const hour = new Date().getHours();
      const isDaytime = hour >= 6 && hour < 18;
      root.classList.remove('light', 'dark');
      root.classList.add(isDaytime ? 'light' : 'dark');
    };

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      applySystemTheme();
      const interval = window.setInterval(applySystemTheme, 15 * 60 * 1000);
      return () => window.clearInterval(interval);
    }

    root.classList.add(theme);
    localStorage.setItem('ps-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

