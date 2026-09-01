import React from 'react';
import { Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 max-w-4xl space-y-16">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-luxury-gold/30 bg-luxury-charcoal/50 text-luxury-gold text-[10px] uppercase tracking-luxury-wide">
          <Sparkles className="h-3 w-3" />
          <span>The Atelier Narrative</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-white font-light">
          The Art of Philz Signature
        </h1>
        <p className="text-sm text-luxury-muted font-light max-w-xl mx-auto leading-relaxed">
          Crafting modern luxury perfumes grounded in rare extractions, timeless elegance, and bold individuality.
        </p>
      </div>

      <div className="border-t border-luxury-border/60 pt-12 grid grid-cols-1 md:grid-cols-2 gap-12 text-xs text-luxury-muted leading-relaxed font-light">
        <div className="space-y-4">
          <h3 className="font-serif text-2xl text-white font-normal">Our Philosophy</h3>
          <p>
            PHILZ SIGNATURE was conceived to redefine the olfactory landscape through artisanal integrity. Every flacon is formulated using pure extraits, ensuring longevity, complexity, and undeniable presence.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="font-serif text-2xl text-white font-normal">The Sourcing Ethos</h3>
          <p>
            From the deep woods of Cambodia to the rose fields of Taif and Mediterranean bergamot groves, our distillations honor the natural spirit of each botanical harvest.
          </p>
        </div>
      </div>
    </div>
  );
};
