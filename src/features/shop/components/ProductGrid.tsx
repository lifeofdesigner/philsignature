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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-luxury-card border border-luxury-border p-4 space-y-4 animate-pulse">
            <div className="aspect-[3/4] bg-luxury-charcoal" />
            <div className="h-4 bg-luxury-charcoal w-3/4" />
            <div className="h-3 bg-luxury-charcoal w-1/2" />
            <div className="h-4 bg-luxury-charcoal w-1/3 pt-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

