import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CmsHeroContent } from '@/services/CMSService';

export interface HeroBillboardProps {
  hero: CmsHeroContent;
}

export const HeroBillboard: React.FC<HeroBillboardProps> = ({ hero }) => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-luxury-black border-b border-luxury-border">
      {/* Background with adaptive theme gradient mask */}
      <div className="absolute inset-0 z-0">
        <img
          src={hero.background_image}
          alt="Philz Signature Luxury Perfumes"
          className="w-full h-full object-cover object-center opacity-30 dark:opacity-40 scale-105 transition-transform duration-1000 ease-out"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/70 to-luxury-black/30" />
        <div className="absolute inset-0 bg-radial-vignette opacity-50 dark:opacity-70 pointer-events-none" />
      </div>

      {/* Editorial Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center max-w-4xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-luxury-gold/40 bg-luxury-charcoal/90 text-luxury-gold text-[10px] sm:text-xs uppercase tracking-luxury-wide font-medium backdrop-blur-sm shadow-sm">
          <Sparkles className="h-3 w-3" />
          <span>{hero.badge}</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl text-luxury-cream font-normal tracking-tight leading-[1.1]">
          {hero.headline}
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-luxury-sand font-light max-w-2xl mx-auto leading-relaxed">
          {hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to={hero.primary_cta_url}>
            <Button variant="luxury" size="lg" className="w-full sm:w-auto gap-2 text-xs">
              <span>{hero.primary_cta_text}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Link to={hero.secondary_cta_url}>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-xs">
              <span>{hero.secondary_cta_text}</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

