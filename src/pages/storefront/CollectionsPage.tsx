import React, { useState } from 'react';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { Collection } from '@/types/database';

export const CollectionsPage: React.FC = () => {
  const [collections] = useState<Collection[]>([]);

  return (
    <div className="container mx-auto px-4 sm:px-8 py-12">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Curated Portfolios
        </span>
        <h1 className="font-serif text-4xl text-white font-normal mt-2">
          The Collections
        </h1>
        <p className="text-xs text-luxury-muted mt-3 font-light leading-relaxed">
          From the Private Reserve to the signature Oud Edition, each narrative is composed around exceptional raw harvests.
        </p>
      </div>

      {collections.length === 0 ? (
        <EmptyState
          title="Collections Awaiting Harvest"
          description="Curated collection portfolios will synchronize with Supabase in Phase 4."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Collections grid */}
        </div>
      )}
    </div>
  );
};
