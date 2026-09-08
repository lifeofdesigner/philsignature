import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Collection } from '@/types/database';

export interface CollectionCardProps {
  collection: Collection;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  return (
    <Link
      to={`/shop?collection=${collection.id}`}
      className="group relative h-[420px] overflow-hidden bg-luxury-card border border-luxury-border rounded-sm shadow-xs flex flex-col justify-end p-8 transition-all duration-500 hover:border-luxury-gold/70 hover:shadow-md"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={
            collection.banner_url ||
            collection.image_url ||
            '/products/philz-signature-perfume-body-oil.jpg'
          }
          alt={collection.name}
          className="w-full h-full object-cover object-center opacity-40 group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/80 to-transparent" />
      </div>

      <div className="relative z-10 space-y-3">
        <span className="text-[10px] uppercase tracking-luxury text-luxury-gold block font-medium">
          {collection.tagline || 'Private Botanical Reserve'}
        </span>
        <h2 className="font-serif text-3xl text-luxury-cream font-normal group-hover:text-luxury-gold transition-colors">
          {collection.name}
        </h2>
        <p className="text-xs text-luxury-sand font-light line-clamp-2 leading-relaxed">
          {collection.description}
        </p>
        <div className="pt-2 flex items-center gap-2 text-xs text-luxury-cream group-hover:text-luxury-gold transition-colors font-medium">
          <span>Explore Collection</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

