import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { Product } from '@/types/database';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product] = useState<Product | null>(null);

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10">
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-luxury text-luxury-muted hover:text-luxury-gold mb-8 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to Salon</span>
      </Link>

      {!product ? (
        <EmptyState
          title={`Fragrance "${slug}" Not Yet Staged`}
          description="Connecting to Supabase product details, olfactory pyramid visualizer, and reviews in Phase 4."
          actionLabel="View All Creations"
          onAction={() => window.location.assign('/shop')}
        />
      ) : (
        <div>{/* Product details view */}</div>
      )}
    </div>
  );
};
