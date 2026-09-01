import React from 'react';
import { useHomeData } from '../hooks/useHomeData';
import { HeroBillboard } from '../components/HeroBillboard';
import { CollectionsShowcase } from '../components/CollectionsShowcase';
import { FeaturedProductsGrid } from '../components/FeaturedProductsGrid';
import { BrandStorySection } from '../components/BrandStorySection';
import { ClientTestimonials } from '../components/ClientTestimonials';
import { NewsletterSection } from '../components/NewsletterSection';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { ErrorState } from '@/components/feedback/ErrorState';

export const HomePage: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useHomeData();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto px-4 py-20">
        <ErrorState
          title="Boutique Connection Interrupted"
          message={error instanceof Error ? error.message : 'Unable to synchronize with the fragrance catalog.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* 1. Hero Billboard */}
      <HeroBillboard hero={data.hero} />

      {/* 2. Collections Showcase */}
      <CollectionsShowcase collections={data.collections} />

      {/* 3. Featured Extraits */}
      <FeaturedProductsGrid products={data.featuredProducts} />

      {/* 4. Brand Heritage Story */}
      <BrandStorySection story={data.story} />

      {/* 5. Client Testimonials */}
      <ClientTestimonials />

      {/* 6. Newsletter Invitation */}
      <NewsletterSection />
    </div>
  );
};
