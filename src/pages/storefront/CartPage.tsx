import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { CartItem } from '@/types';

export const CartPage: React.FC = () => {
  const [items] = useState<CartItem[]>([]);

  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 max-w-4xl">
      <div className="text-center space-y-3 mb-12">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Your Selection
        </span>
        <h1 className="font-serif text-4xl text-white font-normal">
          Shopping Bag
        </h1>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-5 w-5" />}
          title="Your Bag is Currently Untouched"
          description="You have not yet added any extrait de parfum flacons or home diffusers to your order."
          actionLabel="Explore Fragrance Salon"
          onAction={() => window.location.assign('/shop')}
        />
      ) : (
        <div className="space-y-8">{/* Cart Items View in Phase 4 */}</div>
      )}
    </div>
  );
};
