import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse bg-luxury-charcoal/80 border border-luxury-border/40',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };

