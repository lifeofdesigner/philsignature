import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { WishlistItem } from '@/types/database';

export const WishlistPage: React.FC = () => {
  const [wishlist] = useState<WishlistItem[]>([]);

  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 max-w-4xl">
      <div className="text-center space-y-2 mb-12">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Personal Archive
        </span>
        <h1 className="font-serif text-4xl text-white font-normal">
          Saved Compositions
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-5 w-5" />}
          title="Your Wishlist is Vacant"
          description="Save precious formulations to your private archive while exploring our salon."
          actionLabel="Discover Extraits"
          onAction={() => window.location.assign('/shop')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Wishlist items */}
        </div>
      )}
    </div>
  );
};
