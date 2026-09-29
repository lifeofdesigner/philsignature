import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-[11px] uppercase tracking-wider text-black dark:text-luxury-cream font-semibold mb-1">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-11 min-h-[44px] w-full rounded-sm bg-white dark:bg-luxury-card border border-slate-300 dark:border-luxury-border px-3.5 py-2 text-sm text-black dark:text-luxury-cream placeholder:text-slate-500 dark:placeholder:text-luxury-muted focus:outline-none focus:border-luxury-gold focus-visible:ring-1 focus-visible:ring-luxury-gold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-600 focus:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };

