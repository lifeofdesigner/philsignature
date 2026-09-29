import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-[11px] uppercase tracking-wider text-luxury-sand dark:text-luxury-cream/80 font-semibold mb-1">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'flex min-h-[100px] w-full rounded-sm bg-luxury-card border border-luxury-border px-3.5 py-2.5 text-sm text-luxury-cream placeholder:text-luxury-muted focus:outline-none focus:border-luxury-gold focus-visible:ring-1 focus-visible:ring-luxury-gold transition-colors disabled:cursor-not-allowed disabled:opacity-50 resize-y',
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
Textarea.displayName = 'Textarea';

export { Textarea };

