import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { Product } from '@/types/database';

export const ShopPage: React.FC = () => {
  const [products] = useState<Product[]>([]);

  return (
    <div className="container mx-auto px-4 sm:px-8 py-12">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Haute Parfumerie
        </span>
        <h1 className="font-serif text-4xl text-white font-normal mt-2">
          The Fragrance Salon
        </h1>
        <p className="text-xs text-luxury-muted mt-3 font-light leading-relaxed">
          Explore artisanal compositions, rare extraits, and sensory home diffusers handcrafted by master perfumers.
        </p>
      </div>

      <div className="flex items-center justify-between border-y border-luxury-border/60 py-3 mb-10">
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters & Families</span>
        </Button>
        <span className="text-xs text-luxury-muted font-light">
          {products.length} Compositions
        </span>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No fragrances loaded"
          description="Connecting to the live Supabase catalog in Phase 4."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" />
      )}
    </div>
  );
};

