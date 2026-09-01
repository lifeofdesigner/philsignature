import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Collection } from '@/types/database';

export interface CollectionsShowcaseProps {
  collections: Collection[];
}

export const CollectionsShowcase: React.FC<CollectionsShowcaseProps> = ({ collections }) => {
  if (!collections || collections.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-luxury-black border-b border-luxury-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
              Curated Portfolios
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
              Olfactory Collections
            </h2>
          </div>
          <Link
            to="/collections"
            className="text-xs uppercase tracking-luxury text-luxury-gold hover:text-luxury-gold-light flex items-center gap-1.5 transition-colors font-medium"
          >
            <span>View All Portfolios</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {collections.slice(0, 3).map((col) => (
            <Link
              key={col.id}
              to={`/shop?collection=${col.id}`}
              className="group relative h-[380px] sm:h-[440px] overflow-hidden bg-luxury-charcoal border border-luxury-border flex flex-col justify-end p-6 sm:p-8 transition-all duration-500 hover:border-luxury-gold/60"
            >
              <div className="absolute inset-0 z-0">
                <img
                  src={col.image_url || col.banner_url || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'}
                  alt={col.name}
                  className="w-full h-full object-cover object-center opacity-40 group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              </div>

              <div className="relative z-10 space-y-2">
                <span className="text-[9px] uppercase tracking-luxury text-luxury-gold block font-medium">
                  {col.tagline || 'Private Formulation'}
                </span>
                <h3 className="font-serif text-2xl text-white font-normal group-hover:text-luxury-gold transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-luxury-sand font-light line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-luxury-cream group-hover:text-luxury-gold transition-colors font-medium">
                  <span>Explore Collection</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

