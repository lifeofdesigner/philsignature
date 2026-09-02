import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/types/database';
import { ProductCard } from '@/features/shop/components/ProductCard';

export interface FeaturedProductsGridProps {
  products: Product[];
}

export const FeaturedProductsGrid: React.FC<FeaturedProductsGridProps> = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-luxury-black border-b border-luxury-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
              Top Picks
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-luxury-cream font-normal">
              Featured Perfumes
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs uppercase tracking-luxury text-luxury-gold hover:text-luxury-gold-light flex items-center gap-1.5 transition-colors font-medium"
          >
            <span>View All Perfumes</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 2} />
          ))}
        </div>
      </div>
    </section>
  );
};

