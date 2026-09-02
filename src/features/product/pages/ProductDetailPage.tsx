import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useProductDetail } from '../hooks/useProductDetail';
import { ProductGallery } from '../components/ProductGallery';
import { OlfactoryPyramid } from '../components/OlfactoryPyramid';
import { ProductPurchaseCard } from '../components/ProductPurchaseCard';
import { ProductMetaAccordion } from '../components/ProductMetaAccordion';
import { RelatedProductsRow } from '../components/RelatedProductsRow';
import { ProductReviewsSection } from '../components/ProductReviewsSection';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { product, relatedProducts, reviews, isLoading, isError, error, isNotFound, refetch } =
    useProductDetail(slug);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isNotFound) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <EmptyState
          title="Perfume Not Found"
          description="This perfume may no longer be available. Browse our shop to find something you'll love."
          actionLabel="Go to Shop"
          onAction={() => window.location.assign('/shop')}
        />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-20">
        <ErrorState
          title="Could Not Load This Perfume"
          message={error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black text-luxury-cream py-10 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-luxury text-luxury-muted hover:text-luxury-gold transition-colors font-medium"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Back to Shop</span>
          </Link>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Left Column: Gallery & Olfactory Pyramid (7 cols) */}
          <div className="lg:col-span-7 space-y-10">
            <ProductGallery
              images={product.images}
              productName={product.name}
            />

            {/* Fragrance Notes Component (Desktop View) */}
            <div className="hidden lg:block">
              <OlfactoryPyramid
                topNotes={product.top_notes}
                middleNotes={product.middle_notes}
                baseNotes={product.base_notes}
              />
            </div>
          </div>

          {/* Right Column: Pricing, Cart Action, Accordion Details (5 cols) */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
            <ProductPurchaseCard product={product} />

            {/* Fragrance Notes Component (Mobile View: placed directly after purchase card) */}
            <div className="block lg:hidden">
              <OlfactoryPyramid
                topNotes={product.top_notes}
                middleNotes={product.middle_notes}
                baseNotes={product.base_notes}
              />
            </div>

            <ProductMetaAccordion
              details={product.details}
              ingredients={product.ingredients}
              howToUse={product.how_to_use}
            />
          </div>
        </div>

        {/* Related Scent Harmonies Row */}
        <RelatedProductsRow
          products={relatedProducts}
          currentFamily={product.fragrance_family}
        />

        {/* Verified Reviews Section */}
        <ProductReviewsSection
          reviews={reviews}
          rating={product.rating ? Number(product.rating) : 5.0}
          reviewsCount={product.reviews_count}
        />
      </div>
    </div>
  );
};
