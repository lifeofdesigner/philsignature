import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex items-center gap-2 p-2 rounded-full border border-luxury-border/60 transition-all duration-300 select-none touch-manipulation',
        isDark
          ? 'text-luxury-sand hover:text-luxury-gold hover:border-luxury-gold/50 bg-luxury-charcoal/60'
          : 'text-luxury-cream hover:text-luxury-gold hover:border-luxury-gold/60 bg-luxury-charcoal/80 shadow-sm',
        className
      )}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 scale-100 text-luxury-gold" />
        ) : (
          <Moon className="h-4 w-4 transition-transform duration-300 rotate-0 scale-100 text-luxury-gold" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs uppercase tracking-luxury font-medium pr-1">
          {isDark ? 'Light Theme' : 'Dark Theme'}
        </span>
      )}
    </button>
  );
};

