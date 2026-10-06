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
import { SEO } from '@/components/common/SEO';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { product, relatedProducts, reviews, isLoading, isError, isNotFound, refetch } =
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
          message="We could not load this perfume right now. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const isCandle =
    product?.category?.slug === 'candles' ||
    product?.category_id === 'c3333333-3333-3333-3333-333333333333' ||
    Boolean(product?.concentration?.toLowerCase().includes('candle'));

  const isRoomSpray =
    product?.category?.slug === 'room-sprays' ||
    product?.category?.slug === 'room-spray' ||
    product?.category_id === 'c4444444-4444-4444-4444-444444444444' ||
    Boolean(product?.concentration?.toLowerCase().includes('room spray'));

  const backLink = isCandle
    ? "/shop?category=candles"
    : isRoomSpray
    ? "/shop?category=room-spray"
    : "/shop";

  const backLabel = isCandle
    ? "Back to Candles"
    : isRoomSpray
    ? "Back to Room Sprays"
    : "Back to Shop";

  const primaryImage =
    typeof product.images?.[0] === 'string'
      ? product.images[0]
      : (product.images?.[0] as any)?.image_url || 'https://www.philzsignature.com/brand/philz-favicon.png';

  const cleanDescription = (product.description || product.short_description || `Discover ${product.name} by Philz Signature. Handcrafted luxury fragrance.`)
    .replace(/<[^>]*>/g, '')
    .slice(0, 155);

  const isInStock = (product.stock_quantity ?? 0) > 0;

  return (
    <div className="min-h-screen bg-luxury-black text-luxury-cream py-10 sm:py-16">
      <SEO
        title={`${product.name} | Philz Signature Parfums`}
        description={cleanDescription}
        canonical={`/product/${product.slug}`}
        ogType="product"
        ogImage={primaryImage}
        structuredData={{
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": product.name,
          "image": [primaryImage],
          "description": cleanDescription,
          "brand": {
            "@type": "Brand",
            "name": "Philz Signature"
          },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "NGN",
            "price": product.price,
            "availability": isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": `https://www.philzsignature.com/product/${product.slug}`
          }
        }}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs uppercase tracking-luxury text-luxury-muted">
          <Link
            to={backLink}
            className="inline-flex items-center gap-1.5 hover:text-luxury-gold transition-colors font-medium"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>{backLabel}</span>
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-luxury-sand truncate max-w-xs">{product.name}</span>
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
              isCandle={isCandle}
              isRoomSpray={isRoomSpray}
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
