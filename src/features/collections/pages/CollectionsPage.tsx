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
          title="Collections Unavailable"
          message={error instanceof Error ? error.message : 'Unable to retrieve boutique collections.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            Curated Portfolios
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-white font-normal tracking-tight">
            The Collections
          </h1>
          <p className="text-xs sm:text-sm text-luxury-sand font-light leading-relaxed">
            From the deep nocturnal mysteries of Cambodian Oud to pristine Mediterranean citrus gardens, discover our themed olfactory suites.
          </p>
        </div>

        {collections.length === 0 ? (
          <EmptyState
            title="No Collections Found"
            description="Our master perfumers are currently aging new private reserve portfolios."
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
