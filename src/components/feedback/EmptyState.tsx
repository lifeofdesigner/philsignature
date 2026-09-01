import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = 'No creations found',
  description = 'There are currently no items matching your criteria in the private reserve.',
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto border border-dashed border-luxury-border/60 py-16',
        className
      )}
    >
      <div className="h-12 w-12 rounded-full border border-luxury-border bg-luxury-charcoal flex items-center justify-center mb-4 text-luxury-gold">
        {icon || <Sparkles className="h-5 w-5" />}
      </div>
      <h3 className="font-serif text-xl text-white font-normal mb-2">{title}</h3>
      <p className="text-xs text-luxury-muted leading-relaxed mb-6 font-light">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="goldOutline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

