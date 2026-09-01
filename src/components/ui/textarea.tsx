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
          <label className="block text-xs uppercase tracking-luxury text-luxury-cream/70 font-medium">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'flex min-h-[100px] w-full bg-luxury-charcoal/80 border border-luxury-border px-3.5 py-2.5 text-sm text-luxury-cream placeholder:text-luxury-muted focus:outline-none focus:border-luxury-gold/70 transition-colors disabled:cursor-not-allowed disabled:opacity-50 resize-y',
            error && 'border-red-600 focus:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
