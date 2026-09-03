import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/types/database';
import { ProductCard } from '@/features/shop/components/ProductCard';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/common/MotionWrapper';

export interface FeaturedProductsGridProps {
  products: Product[];
}

export const FeaturedProductsGrid: React.FC<FeaturedProductsGridProps> = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-24 sm:py-32 bg-black border-b border-white/10">
      <div className="container mx-auto px-6 sm:px-12 lg:px-16">
        <FadeIn direction="up" distance={16}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 sm:mb-16 gap-4">
            <div className="space-y-2">
              <span className="text-[10px] sm:text-xs uppercase tracking-luxury-wide text-luxury-gold font-medium block">
                ✦ Haute Parfumerie
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-white font-normal tracking-tight">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs uppercase tracking-luxury text-luxury-gold hover:text-white flex items-center gap-1.5 transition-colors font-medium group"
            >
              <span>View All Creations</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeIn>

        <StaggerContainer staggerDelay={0.08} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product, index) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} priority={index < 2} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};


