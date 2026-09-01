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
      {/* 1. Formulation Details */}
      {details && (
        <div>
          <button
            type="button"
            onClick={() => toggle('details')}
            className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-luxury text-white hover:text-luxury-gold transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-luxury-gold" />
              <span>Formulation & Packaging</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${openSection === 'details' ? 'rotate-180 text-luxury-gold' : 'text-luxury-muted'}`}
            />
          </button>
          {openSection === 'details' && (
            <div className="pb-4 text-xs text-luxury-sand font-light leading-relaxed">
              {details}
            </div>
          )}
        </div>
      )}

      {/* 2. Scent Ritual & Application */}
      <div>
        <button
          type="button"
          onClick={() => toggle('ritual')}
          className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-luxury text-white hover:text-luxury-gold transition-colors"
        >
          <span className="flex items-center gap-2">
            <Droplets className="h-3.5 w-3.5 text-luxury-gold" />
            <span>The Application Ritual</span>
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${openSection === 'ritual' ? 'rotate-180 text-luxury-gold' : 'text-luxury-muted'}`}
          />
        </button>
        {openSection === 'ritual' && (
          <div className="pb-4 text-xs text-luxury-sand font-light leading-relaxed space-y-2">
            <p>
              {howToUse ||
                'Apply to arterial pulse points: the warm hollow of the clavicle, the wrists, and behind the ears. Formulated at pure extrait concentration, a minimal application radiates with extraordinary persistence.'}
            </p>
          </div>
        )}
      </div>

      {/* 3. Pure Botanical Ingredients */}
      <div>
        <button
          type="button"
          onClick={() => toggle('ingredients')}
          className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-luxury text-white hover:text-luxury-gold transition-colors"
        >
          <span className="flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 text-luxury-gold" />
            <span>Botanical Absolutes & Sourcing</span>
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

