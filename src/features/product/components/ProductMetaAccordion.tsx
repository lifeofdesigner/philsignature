import React, { useState } from 'react';
import { ChevronDown, Droplets, Sparkles, RefreshCw, Flame } from 'lucide-react';

export interface ProductMetaAccordionProps {
  details?: string | null;
  ingredients?: string | null;
  howToUse?: string | null;
  isCandle?: boolean;
  isRoomSpray?: boolean;
}

export const ProductMetaAccordion: React.FC<ProductMetaAccordionProps> = ({
  details,
  ingredients,
  howToUse,
  isCandle = false,
  isRoomSpray = false,
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

      {/* 2. How to Use / Candle Care */}
      <div>
        <button
          type="button"
          onClick={() => toggle('ritual')}
          className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-luxury text-luxury-cream hover:text-luxury-gold transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            {isCandle ? (
              <Flame className="h-3.5 w-3.5 text-luxury-gold" />
            ) : isRoomSpray ? (
              <Sparkles className="h-3.5 w-3.5 text-luxury-gold" />
            ) : (
              <Droplets className="h-3.5 w-3.5 text-luxury-gold" />
            )}
            <span>{isCandle ? 'Candle Care & Burn Ritual' : isRoomSpray ? 'Directions & Misting Ritual' : 'How to Use'}</span>
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${openSection === 'ritual' ? 'rotate-180 text-luxury-gold' : 'text-luxury-muted'}`}
          />
        </button>
        {openSection === 'ritual' && (
          <div className="pb-4 text-xs text-luxury-sand font-light leading-relaxed space-y-2 whitespace-pre-line">
            <p>
              {howToUse ||
                (isCandle
                  ? 'Trim wick to 1/4 inch before each lighting. Burn for 2-3 hours on first burn to create a full wax pool. Keep away from drafts, pets, and children.'
                  : isRoomSpray
                  ? 'Hold upright and mist 2 to 3 pumps into the center of the room or toward linens and curtains from 30cm away. Allow the fine aromatic mist to disperse naturally.'
                  : 'Apply directly onto pulse points (wrists, neck, inner elbows, collarbones). Gently dab without rubbing to preserve the delicate olfactory composition.')}
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
              (isCandle
                ? '100% Pure Natural Soy Wax, Lead-Free Cotton Wick, Essential Fragrance Oils, Phthalate-Free Aromatic Concentrates.'
                : isRoomSpray
                ? 'Aqua (Demineralized Water), Alcohol Denat., Parfum (Fine Fragrance Concentrates), PEG-40 Hydrogenated Castor Oil, Dipropylene Glycol.'
                : 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citronellol, Geraniol, Eugenol, Farnesol, Benzyl Benzoate.')}
          </div>
        )}
      </div>
    </div>
  );
};

