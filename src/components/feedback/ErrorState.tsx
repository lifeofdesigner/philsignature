import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We could not complete your request. Please try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto',
        className
      )}
    >
      <div className="h-12 w-12 rounded-full border border-red-800/60 bg-red-950/30 flex items-center justify-center mb-4 text-red-400">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="font-serif text-2xl text-luxury-cream font-normal mb-2">{title}</h3>
      <p className="text-xs text-luxury-muted leading-relaxed mb-6 font-light">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RotateCcw className="h-3.5 w-3.5" />
          Try Again
        </Button>
      )}
    </div>
  );
};

