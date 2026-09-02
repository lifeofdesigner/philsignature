import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import type { Review } from '@/types/database';

export interface ProductReviewsSectionProps {
  reviews: Review[];
  rating?: number;
  reviewsCount?: number;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  reviews,
  rating = 5.0,
  reviewsCount = 0,
}) => {
  return (
    <section className="pt-20 border-t border-luxury-border space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            Customer Feedback
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-white font-normal">
            Customer Reviews & Ratings
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-luxury-gold">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <span className="font-serif text-lg text-white font-normal">
            {rating.toFixed(1)}
          </span>
          <span className="text-xs text-luxury-muted">
            ({reviewsCount || reviews.length} verified reviews)
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="p-8 bg-luxury-card border border-luxury-border text-center space-y-2">
          <p className="text-xs text-luxury-sand font-light">
            No reviews yet for this perfume.
          </p>
          <p className="text-[11px] text-luxury-muted">
            Customers who purchased will be able to leave a review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="p-6 bg-luxury-card border border-luxury-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-luxury-gold">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] text-luxury-muted font-mono">
                  {new Date(r.created_at).toLocaleDateString('en-GB', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {r.title && (
                <h4 className="font-serif text-sm text-white font-medium">
                  {r.title}
                </h4>
              )}

              <p className="text-xs text-luxury-sand font-light leading-relaxed">
                &ldquo;{r.comment}&rdquo;
              </p>

              {r.is_verified_purchase && (
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified Purchase</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

