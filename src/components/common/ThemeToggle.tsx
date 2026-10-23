import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  /** Use dark-colored icons (for placing on a light nav/surface) */
  dark?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, dark }) => {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'h-8.5 w-8.5 rounded-full flex items-center justify-center transition-all shrink-0 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]',
        dark
          ? 'text-[#1A1209] hover:text-luxury-gold hover:bg-black/5 border border-transparent hover:border-black/15 drop-shadow-none'
          : 'text-white/80 hover:text-luxury-gold hover:bg-white/10 border border-transparent hover:border-white/15',
        className
      )}
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
};
