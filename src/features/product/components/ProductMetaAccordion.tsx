import React, { useState } from 'react';
import { ChevronDown, Droplets, Sparkles, RefreshCw } from 'lucide-react';

export interface ProductMetaAccordionProps {
  details?: string | null;
  ingredients?: string | null;
  howToUse?: string | null;
}

export const ProductMetaAccordion: React.FC<ProductMetaAccordionProps> = ({
  details,
  ingredients,
  howToUse,
}) => {
  const [openSection, setOpenSection] = useState<string | null>('details');

  const toggle = (section: string) => {
    setOpenSection((current) => (current === section ? null : section));
  };

  return (
    <div className="border-t border-luxury-border divide-y divide-luxury-border/60">
      {/* 1. Details & Packaging */}
      {details && (
        <div>
          <button
            type="button"
            onClick={() => toggle('details')}
            className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-luxury text-luxury-cream hover:text-luxury-gold transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-luxury-gold" />
              <span>Details & Packaging</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${openSection === 'details' ? 'rotate-180 text-luxury-gold' : 'text-luxury-muted'}`}
            />
          </button>
          {openSection === 'details' && (
            <div className="pb-4 text-xs text-luxury-sand font-light leading-relaxed whitespace-pre-line">
              {details}
            </div>
          )}
        </div>
      )}

      {/* 2. How to Use */}
      <div>
        <button
          type="button"
          onClick={() => toggle('ritual')}
          className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-luxury text-luxury-cream hover:text-luxury-gold transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Droplets className="h-3.5 w-3.5 text-luxury-gold" />
            <span>How to Use</span>
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${openSection === 'ritual' ? 'rotate-180 text-luxury-gold' : 'text-luxury-muted'}`}
          />
        </button>
        {openSection === 'ritual' && (
          <div className="pb-4 text-xs text-luxury-sand font-light leading-relaxed space-y-2 whitespace-pre-line">
            <p>
              {howToUse ||
                'Apply directly onto pulse points (wrists, neck, inner elbows, collarbones). Gently dab without rubbing to preserve the delicate olfactory composition.'}
            </p>
          </div>
        )}
      </div>

      {/* 3. Ingredients */}
      <div>
        <button
          type="button"
          onClick={() => toggle('ingredients')}
          className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-luxury text-luxury-cream hover:text-luxury-gold transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 text-luxury-gold" />
            <span>Ingredients</span>
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${openSection === 'ingredients' ? 'rotate-180 text-luxury-gold' : 'text-luxury-muted'}`}
          />
        </button>
        {openSection === 'ingredients' && (
          <div className="pb-4 text-xs text-luxury-sand font-light leading-relaxed font-mono">
            {ingredients ||
              'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citronellol, Geraniol, Eugenol, Farnesol, Benzyl Benzoate.'}
          </div>
        )}
      </div>
    </div>
  );
};

