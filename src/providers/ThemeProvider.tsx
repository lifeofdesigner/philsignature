import React, { createContext, useContext, useEffect } from 'react';

export type Theme = 'dark';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

/**
 * Permanent Dark Theme Provider for Philz Signature Storefront.
 * Enforces dark theme on both desktop and mobile at all times.
 * Automatic time-of-day or system preference light switching is permanently removed.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
    try {
      localStorage.setItem('ps-theme', 'dark');
    } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark', setTheme: () => {}, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  return useContext(ThemeContext);
};
