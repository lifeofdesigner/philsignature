import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 text-[10px] uppercase tracking-luxury font-medium rounded-sm transition-colors select-none',
  {
    variants: {
      variant: {
        default:
          'bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/30',
        gold:
          'bg-luxury-gold text-black font-semibold shadow-xs',
        outline:
          'border border-luxury-border text-luxury-sand bg-transparent',
        secondary:
          'bg-luxury-charcoal text-luxury-cream border border-luxury-border',
        success:
          'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50',
        warning:
          'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/50',
        destructive:
          'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
