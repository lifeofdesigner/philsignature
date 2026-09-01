import React from 'react';
import { Clock } from 'lucide-react';

interface MaintenanceStateProps {
  estimatedTime?: string;
}

export const MaintenanceState: React.FC<MaintenanceStateProps> = ({
  estimatedTime = 'Short duration',
}) => {
  return (
    <div className="min-h-screen bg-luxury-black flex flex-col items-center justify-center p-8 text-center">
      <div className="relative h-20 w-20 mb-8">
        <div className="absolute inset-0 border border-luxury-gold/30 rounded-full animate-pulse" />
        <div className="absolute inset-2 border border-luxury-gold/60 rounded-full flex items-center justify-center">
          <Clock className="h-8 w-8 text-luxury-gold stroke-[1.5]" />
        </div>
      </div>
      <span className="text-[11px] uppercase tracking-luxury-wide text-luxury-gold font-medium mb-3">
        PHILZ SIGNATURE ATELIER
      </span>
      <h1 className="font-serif text-4xl text-white font-normal mb-4">
        Under Private Curation
      </h1>
      <p className="text-sm text-luxury-muted max-w-md mx-auto leading-relaxed mb-6 font-light">
        Our digital boutique is undergoing a brief olfactory refresh. Our perfumers are fine-tuning the collection.
      </p>
      <div className="inline-flex items-center gap-2 border border-luxury-border/80 bg-luxury-charcoal/60 px-4 py-2 text-xs text-luxury-sand">
        <span>Estimated Reopening:</span>
        <span className="text-luxury-gold font-medium">{estimatedTime}</span>
      </div>
    </div>
  );
};

