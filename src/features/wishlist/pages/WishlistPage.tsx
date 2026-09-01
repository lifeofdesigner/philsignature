import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useWishlistCatalog } from '../hooks/useWishlistCatalog';
import { WishlistItemCard } from '../components/WishlistItemCard';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';

export const WishlistPage: React.FC = () => {
  const { products, itemCount, isLoading, isError, error, moveToCart, removeFromWishlist, refetch } =
    useWishlistCatalog();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-20">
        <ErrorState
          title="Wishlist Unavailable"
          message={error instanceof Error ? error.message : 'Unable to synchronize private wishlist.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-10 max-w-4xl">
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            Saved Creations
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-white font-normal tracking-tight">
            Your Fragrance Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-luxury-sand font-light">
            {itemCount > 0
              ? `You have reserved ${itemCount} extrait ${itemCount === 1 ? 'creation' : 'creations'} in your personal archive.`
              : 'Curate your private archive of olfactory desires.'}
          </p>
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="Your Fragrance Portfolio is Empty"
            description="Explore our artisanal extraits and bookmark your chosen olfactory creations."
            actionLabel="Discover Creations"
            onAction={() => window.location.assign('/shop')}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-luxury-muted pb-2 border-b border-luxury-border">
              <span>{itemCount} Saved Flacons</span>
              <Link to="/shop" className="text-luxury-gold hover:underline flex items-center gap-1">
                <span>Continue Exploring</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {products.map((product) => (
                <WishlistItemCard
                  key={product.id}
                  product={product}
                  onMoveToCart={moveToCart}
                  onRemove={removeFromWishlist}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
