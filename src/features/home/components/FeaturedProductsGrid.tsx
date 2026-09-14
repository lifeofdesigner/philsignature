import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Product } from '@/types/database';
import { ProductCard } from '@/features/shop/components/ProductCard';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/common/MotionWrapper';

export interface FeaturedProductsGridProps {
  products: Product[];
  allProducts?: Product[];
}

export const FeaturedProductsGrid: React.FC<FeaturedProductsGridProps> = ({ products, allProducts = [] }) => {
  const [activeTab, setActiveTab] = useState<'featured' | 'bestsellers' | 'picks'>('featured');

  const pool = allProducts.length > 0 ? allProducts : products;

  const displayProducts = useMemo(() => {
    if (activeTab === 'bestsellers') {
      const best = pool.filter((p) => p.is_bestseller);
      return best.length >= 4 ? best.slice(0, 8) : pool.slice(0, 8);
    }
    if (activeTab === 'picks') {
      return pool.slice().reverse().slice(0, 8);
    }
    return products.slice(0, 8);
  }, [activeTab, pool, products]);

  if (!displayProducts || displayProducts.length === 0) return null;

  return (
    <section className="py-24 sm:py-32 bg-black border-b border-white/10">
      <div className="container mx-auto px-6 sm:px-12 lg:px-16">
        <FadeIn direction="up" distance={16}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 sm:mb-12 gap-6">
            <div className="space-y-2">
              <span className="text-[10px] sm:text-xs uppercase tracking-luxury-wide text-luxury-gold font-medium flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                <span>HAUTE PARFUMERIE & CANDLE CATALOG</span>
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-white font-normal tracking-tight">
                Signature Creations
              </h2>
            </div>

            {/* Merchandising Tabs */}
            <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-full">
              {[
                { id: 'featured', label: 'Featured' },
                { id: 'bestsellers', label: 'Best Sellers' },
                { id: 'picks', label: 'Signature Picks' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-luxury-gold text-black font-semibold shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        <StaggerContainer key={activeTab} staggerDelay={0.06} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {displayProducts.map((product, index) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} priority={index < 2} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="pt-12 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/20 hover:border-luxury-gold bg-white/5 hover:bg-luxury-gold hover:text-black text-white text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 shadow-md group"
          >
            <span>Explore All {allProducts.length > 0 ? `${allProducts.length} Creations` : 'Creations'}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};


