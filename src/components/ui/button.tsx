import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs uppercase tracking-luxury font-medium rounded-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold focus-visible:ring-offset-2 focus-visible:ring-offset-luxury-black disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer touch-manipulation',
  {
    variants: {
      variant: {
        luxury:
          'bg-luxury-gold text-black font-semibold hover:bg-luxury-gold-light hover:shadow-[0_2px_12px_rgba(197,168,128,0.35)] active:scale-[0.99]',
        dark:
          'bg-luxury-charcoal text-luxury-cream border border-luxury-border hover:border-luxury-gold/60 hover:text-luxury-gold active:scale-[0.99]',
        outline:
          'border border-luxury-border text-luxury-cream bg-transparent hover:border-luxury-gold hover:text-luxury-gold hover:bg-luxury-gold/5 active:scale-[0.99]',
        goldOutline:
          'border border-luxury-gold/70 text-luxury-gold bg-transparent hover:bg-luxury-gold hover:text-black active:scale-[0.99]',
        ghost:
          'text-luxury-cream/85 hover:text-luxury-cream hover:bg-luxury-charcoal active:scale-[0.99]',
        link:
          'text-luxury-gold underline-offset-4 hover:underline p-0 h-auto hover:text-luxury-gold-light',
        destructive:
          'bg-red-950/40 text-red-400 border border-red-800/80 hover:bg-red-900/60 hover:text-red-200 active:scale-[0.99]',
      },
      size: {
        default: 'h-11 min-h-[44px] px-6 py-2',
        sm: 'h-10 min-h-[40px] px-4 text-[11px]',
        lg: 'h-12 min-h-[48px] px-8 text-sm',
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px] p-0',
      },
    },
    defaultVariants: {
      variant: 'luxury',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
