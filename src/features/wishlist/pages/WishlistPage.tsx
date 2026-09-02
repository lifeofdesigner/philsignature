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
          title="Could Not Load Wishlist"
          message={error instanceof Error ? error.message : 'Unable to load your saved perfumes right now.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black text-luxury-cream py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-10 max-w-4xl">
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            My Wishlist
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-luxury-cream font-normal tracking-tight">
            Saved Perfumes
          </h1>
          <p className="text-xs sm:text-sm text-luxury-sand font-light">
            {itemCount > 0
              ? `You have ${itemCount} ${itemCount === 1 ? 'perfume' : 'perfumes'} saved in your wishlist.`
              : 'Save your favorite perfumes here and buy them whenever you are ready.'}
          </p>
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="Your Wishlist is Empty"
            description="You have not saved any perfumes yet. Explore our shop and add your favorites."
            actionLabel="Start Shopping"
            onAction={() => window.location.assign('/shop')}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-luxury-muted pb-2 border-b border-luxury-border">
              <span>{itemCount} Saved {itemCount === 1 ? 'Perfume' : 'Perfumes'}</span>
              <Link to="/shop" className="text-luxury-gold hover:underline flex items-center gap-1">
                <span>Continue Shopping</span>
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
