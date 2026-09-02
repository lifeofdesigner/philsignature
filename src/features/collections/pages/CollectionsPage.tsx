import React from 'react';
import { useCollectionsData } from '../hooks/useCollectionsData';
import { CollectionCard } from '../components/CollectionCard';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';

export const CollectionsPage: React.FC = () => {
  const { collections, isLoading, isError, error, refetch } = useCollectionsData();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-20">
        <ErrorState
          title="Could Not Load Collections"
          message={error instanceof Error ? error.message : 'Unable to load collections right now. Please try again.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black text-luxury-cream py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            Perfume Collections
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-luxury-cream font-normal tracking-tight">
            Our Collections
          </h1>
          <p className="text-xs sm:text-sm text-luxury-sand font-light leading-relaxed">
            Explore our curated perfume collections, grouped by scent character and mood.
          </p>
        </div>

        {collections.length === 0 ? (
          <EmptyState
            title="No Collections Found"
            description="We are preparing new perfume collections. Please check back soon."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((col) => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
