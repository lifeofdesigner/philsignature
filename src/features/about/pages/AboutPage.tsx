import React from 'react';
import { Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 max-w-4xl space-y-16">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-luxury-gold/30 bg-luxury-charcoal/50 text-luxury-gold text-[10px] uppercase tracking-luxury-wide">
          <Sparkles className="h-3 w-3" />
          <span>Our Story</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-luxury-cream font-light">
          About Philz Signature
        </h1>
        <p className="text-sm text-luxury-muted font-light max-w-xl mx-auto leading-relaxed">
          We create modern luxury perfumes using the finest raw materials, blended for lasting elegance and bold personality.
        </p>
      </div>

      <div className="border-t border-luxury-border/60 pt-12 grid grid-cols-1 md:grid-cols-2 gap-12 text-xs text-luxury-muted leading-relaxed font-light">
        <div className="space-y-4">
          <h3 className="font-serif text-2xl text-luxury-cream font-normal">Our Philosophy</h3>
          <p>
            PHILZ SIGNATURE was created to change the way people think about perfume. Every bottle uses pure, high-concentration fragrance oils — so your scent lasts longer and smells richer on your skin.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="font-serif text-2xl text-luxury-cream font-normal">Where We Source</h3>
          <p>
            From the forests of Cambodia to the rose fields of Taif and the citrus groves of the Mediterranean — our ingredients are carefully sourced from the best places in the world.
          </p>
        </div>
      </div>
    </div>
  );
};
