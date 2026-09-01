import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-luxury font-medium transition-colors select-none',
  {
    variants: {
      variant: {
        default:
          'bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/30',
        gold:
          'bg-luxury-gold text-luxury-black font-semibold',
        outline:
          'border border-luxury-border text-luxury-sand',
        secondary:
          'bg-luxury-charcoal text-luxury-cream border border-luxury-border',
        success:
          'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50',
        warning:
          'bg-amber-950/60 text-amber-300 border border-amber-800/50',
        destructive:
          'bg-red-950/60 text-red-400 border border-red-800/50',
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

