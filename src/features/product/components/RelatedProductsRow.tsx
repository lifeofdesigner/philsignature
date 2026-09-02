import React from 'react';
import type { Product } from '@/types/database';
import { ProductCard } from '@/features/shop/components/ProductCard';

export interface RelatedProductsRowProps {
  products: Product[];
  currentFamily?: string | null;
}

export const RelatedProductsRow: React.FC<RelatedProductsRowProps> = ({
  products,
  currentFamily,
}) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="pt-20 border-t border-luxury-border">
      <div className="space-y-2 mb-8">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          More Perfumes
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-white font-normal">
          {currentFamily ? `More from the ${currentFamily} Family` : 'You May Also Like'}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

