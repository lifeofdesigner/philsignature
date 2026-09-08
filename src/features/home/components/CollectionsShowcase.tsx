import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Collection } from '@/types/database';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/common/MotionWrapper';

export interface CollectionsShowcaseProps {
  collections: Collection[];
}

export const CollectionsShowcase: React.FC<CollectionsShowcaseProps> = ({ collections }) => {
  if (!collections || collections.length === 0) return null;

  return (
    <section className="py-24 sm:py-32 bg-black border-b border-white/10">
      <div className="container mx-auto px-6 sm:px-12 lg:px-16">
        <FadeIn direction="up" distance={16}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 sm:mb-16 gap-4">
            <div className="space-y-2">
              <span className="text-[10px] sm:text-xs uppercase tracking-luxury-wide text-luxury-gold font-medium block">
                ✦ Philz Signature Collection '26
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-white font-normal tracking-tight">
                Discover Scents
              </h2>
            </div>
            <Link
              to="/collections"
              className="text-xs uppercase tracking-luxury text-luxury-gold hover:text-white flex items-center gap-1.5 transition-colors font-medium group"
            >
              <span>View All Collections</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeIn>

        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {collections.map((col) => (
            <StaggerItem key={col.id}>
              <Link
                to={`/shop?collection=${col.id}`}
                className="group relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-neutral-900 border border-white/10 hover:border-luxury-gold/50 flex flex-col justify-end p-6 sm:p-8 transition-all duration-500 rounded-sm shadow-2xl block"
              >
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={col.image_url || col.banner_url || '/products/philz-signature-official-bottle.jpg'}
                    alt={col.name}
                    className="w-full h-full object-cover object-center opacity-50 group-hover:opacity-75 group-hover:scale-108 transition-all duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                <div className="relative z-10 space-y-2.5">
                  <span className="text-[9px] uppercase tracking-luxury-wide text-luxury-gold block font-medium">
                    {col.tagline || 'Haute Parfumerie'}
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal group-hover:text-luxury-gold transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-xs text-white/70 font-light line-clamp-2 leading-relaxed">
                    {col.description}
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-xs text-luxury-gold font-medium group-hover:translate-x-1.5 transition-transform">
                    <span>Explore Collection</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};
