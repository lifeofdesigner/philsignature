import React from 'react';
import { useHomeData } from '../hooks/useHomeData';
import { useModularHome } from '../hooks/useModularHome';
import { HeroBillboard } from '../components/HeroBillboard';
import { CollectionsShowcase } from '../components/CollectionsShowcase';
import { FeaturedProductsGrid } from '../components/FeaturedProductsGrid';
import { BrandStorySection } from '../components/BrandStorySection';
import { ClientTestimonials } from '../components/ClientTestimonials';
import { NewsletterSection } from '../components/NewsletterSection';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { ErrorState } from '@/components/feedback/ErrorState';
import { cn } from '@/lib/utils';
import type { CmsHomepageSection } from '@/services/CMSService';

export const HomePage: React.FC = () => {
  const { data, isLoading: isHomeDataLoading, isError, error, refetch } = useHomeData();
  const { sections, isLoading: isLayoutLoading } = useModularHome();

  if (isHomeDataLoading || isLayoutLoading) {
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

  const renderSection = (section: CmsHomepageSection) => {
    const spacingClasses = {
      compact: 'py-8 sm:py-12',
      normal: 'py-14 sm:py-20',
      generous: 'py-20 sm:py-28',
    }[section.spacing || 'normal'];

    const bgClasses = {
      default: '',
      black: 'bg-black',
      charcoal: 'bg-luxury-charcoal',
      card: 'bg-luxury-card',
      radial_luxury: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-luxury-charcoal via-black to-black',
    }[section.background || 'default'];

    switch (section.type) {
      case 'hero':
        return <HeroBillboard key={section.id} hero={data.hero} />;
      case 'collections':
        return (
          <div key={section.id} className={cn(spacingClasses, bgClasses)}>
            <CollectionsShowcase collections={data.collections} />
          </div>
        );
      case 'featured_products':
        return (
          <div key={section.id} className={cn(spacingClasses, bgClasses)}>
            <FeaturedProductsGrid products={data.featuredProducts} />
          </div>
        );
      case 'brand_story':
        return (
          <div key={section.id} className={cn(spacingClasses, bgClasses)}>
            <BrandStorySection story={data.story} />
          </div>
        );
      case 'testimonials':
        return (
          <div key={section.id} className={cn(spacingClasses, bgClasses)}>
            <ClientTestimonials />
          </div>
        );
      case 'newsletter':
        return (
          <div key={section.id} className={cn(spacingClasses, bgClasses)}>
            <NewsletterSection />
          </div>
        );
      case 'custom_html':
        return section.custom_content ? (
          <div
            key={section.id}
            className={cn('container mx-auto px-4', spacingClasses, bgClasses)}
            dangerouslySetInnerHTML={{ __html: section.custom_content }}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {sections.map((section) => renderSection(section))}
    </div>
  );
};
