import React from 'react';
import { Wind, Heart, Mountain } from 'lucide-react';

export interface OlfactoryPyramidProps {
  topNotes?: string[];
  middleNotes?: string[];
  baseNotes?: string[];
}

export const OlfactoryPyramid: React.FC<OlfactoryPyramidProps> = ({
  topNotes = [],
  middleNotes = [],
  baseNotes = [],
}) => {
  const hasNotes = topNotes.length > 0 || middleNotes.length > 0 || baseNotes.length > 0;
  if (!hasNotes) return null;

  return (
    <div className="space-y-6 bg-luxury-card border border-luxury-border p-6 sm:p-8">
      <div className="border-b border-luxury-border/60 pb-4">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium block">
          Fragrance Breakdown
        </span>
        <h3 className="font-serif text-2xl text-white font-normal mt-1">
          Fragrance Notes
        </h3>
        <p className="text-xs text-luxury-muted font-light mt-1">
          How the scent develops on your skin — from the first spray to the lasting base notes.
        </p>
      </div>

      <div className="space-y-6">
        {topNotes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-luxury-gold font-medium">
              <Wind className="h-3.5 w-3.5 shrink-0" />
              <span className="uppercase tracking-wider">Top Notes</span>
              <span className="text-[10px] text-luxury-muted font-normal italic">
                — First 15–30 mins
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {topNotes.map((note, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-black border border-luxury-border/80 text-luxury-cream text-xs font-light tracking-wide"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}

        {middleNotes.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-luxury-border/40">
            <div className="flex items-center gap-2 text-xs text-luxury-gold font-medium">
              <Heart className="h-3.5 w-3.5 shrink-0" />
              <span className="uppercase tracking-wider">Heart Notes</span>
              <span className="text-[10px] text-luxury-muted font-normal italic">
                — 2 to 6 hours
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {middleNotes.map((note, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-black border border-luxury-border/80 text-luxury-cream text-xs font-light tracking-wide"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}

        {baseNotes.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-luxury-border/40">
            <div className="flex items-center gap-2 text-xs text-luxury-gold font-medium">
              <Mountain className="h-3.5 w-3.5 shrink-0" />
              <span className="uppercase tracking-wider">Base Notes</span>
              <span className="text-[10px] text-luxury-muted font-normal italic">
                — 12+ hours
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {baseNotes.map((note, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-black border border-luxury-border/80 text-luxury-cream text-xs font-light tracking-wide"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

