import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
  fullscreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  className,
  fullscreen = false,
}) => {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-4 p-8 text-center',
        className
      )}
    >
      {/* Luxury Rotating Monogram Ring */}
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 border border-luxury-gold/20 rounded-full animate-ping opacity-30" />
        <div className="absolute inset-0 border-t-2 border-r-2 border-luxury-gold rounded-full animate-spin duration-1000" />
        <div className="absolute inset-2 border border-luxury-gold/40 rounded-full flex items-center justify-center">
          <span className="font-serif text-xs tracking-widest text-luxury-gold font-medium">
            PS
          </span>
        </div>
      </div>
      <p className="text-xs uppercase tracking-luxury text-luxury-muted font-light animate-pulse">
        {message}
      </p>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxury-black/90 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};

