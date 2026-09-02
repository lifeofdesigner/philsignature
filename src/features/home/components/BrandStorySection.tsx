import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import type { CmsStoryContent } from '@/services/CMSService';
import { FadeIn } from '@/components/common/MotionWrapper';

export interface BrandStorySectionProps {
  story: CmsStoryContent;
}

export const BrandStorySection: React.FC<BrandStorySectionProps> = ({ story }) => {
  return (
    <section className="py-24 sm:py-32 bg-luxury-charcoal border-b border-luxury-border relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Editorial Visual */}
          <FadeIn direction="right" distance={24} duration={0.8}>
            <div className="relative aspect-[4/5] overflow-hidden bg-luxury-black border border-luxury-border rounded-sm shadow-md">
              <img
                src={story.image1_url || 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=85'}
                alt="Philz Signature Perfume Creation"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-luxury-black/90 backdrop-blur-md border border-luxury-border/60 rounded-xs">
                <span className="text-[9px] uppercase tracking-luxury text-luxury-gold block font-medium">
                  Our Philosophy
                </span>
                <p className="font-serif text-sm text-luxury-cream italic mt-1 font-light">
                  &ldquo;{story.quote}&rdquo;
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Narrative Content */}
          <FadeIn direction="left" distance={24} duration={0.8} delay={0.1}>
            <div className="space-y-6 lg:pl-6">
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5" />
                  <span>Our Story</span>
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl text-luxury-cream font-normal leading-tight">
                  {story.title}
                </h2>
              </div>

              <p className="text-sm sm:text-base text-luxury-sand font-light leading-relaxed">
                {story.philosophy}
              </p>

              <p className="text-xs sm:text-sm text-luxury-muted font-light leading-relaxed">
                {story.sourcing}
              </p>

              <div className="pt-4">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-luxury text-luxury-gold hover:text-luxury-gold-light transition-colors font-medium border-b border-luxury-gold pb-1"
                >
                  <span>Read Our Story</span>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

