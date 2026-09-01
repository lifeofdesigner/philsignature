import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-xs uppercase tracking-luxury font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-luxury-gold disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        luxury:
          'bg-luxury-gold text-luxury-black hover:bg-luxury-gold-light shadow-sm active:scale-[0.99]',
        dark:
          'bg-luxury-charcoal text-luxury-cream border border-luxury-border hover:border-luxury-gold/50 hover:text-white',
        outline:
          'border border-luxury-border text-luxury-cream bg-transparent hover:border-luxury-gold hover:text-luxury-gold',
        goldOutline:
          'border border-luxury-gold/60 text-luxury-gold bg-transparent hover:bg-luxury-gold hover:text-luxury-black',
        ghost:
          'text-luxury-cream/80 hover:text-white hover:bg-luxury-charcoal/50',
        link:
          'text-luxury-gold underline-offset-4 hover:underline p-0 h-auto',
        destructive:
          'bg-red-900/60 text-red-200 border border-red-800/80 hover:bg-red-900',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4 text-[11px]',
        lg: 'h-13 px-8 text-sm',
        icon: 'h-10 w-10 p-0',
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

