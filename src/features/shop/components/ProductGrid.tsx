import React from 'react';
import type { Product } from '@/types/database';
import { ProductCard } from './ProductCard';

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-luxury-card border border-luxury-border p-3 sm:p-4 space-y-3 sm:space-y-4 animate-pulse rounded-sm">
            <div className="aspect-[3/4] bg-luxury-charcoal rounded-sm" />
            <div className="h-3 sm:h-4 bg-luxury-charcoal w-3/4" />
            <div className="h-2.5 sm:h-3 bg-luxury-charcoal w-1/2" />
            <div className="h-3 sm:h-4 bg-luxury-charcoal w-1/3 pt-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

