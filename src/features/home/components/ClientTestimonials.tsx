import React from 'react';
import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { reviewService } from '@/services/ReviewService';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/common/MotionWrapper';
import type { Review } from '@/types/database';

export const ClientTestimonials: React.FC = () => {
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['approved-client-reviews'],
    queryFn: () => reviewService.getApprovedReviews(3),
    staleTime: 1000 * 60 * 5,
  });

  // Strict compliance: Do not fabricate testimonials. Hide section if real data is unavailable.
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 sm:py-28 bg-luxury-black border-b border-luxury-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl space-y-12">
        <FadeIn direction="up" distance={16}>
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
              ✦ Customer Experiences
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-luxury-cream font-normal">
              Verified Client Reviews
            </h2>
          </div>
        </FadeIn>

        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {reviews.map((r) => {
            const authorName = r.customer?.first_name
              ? `${r.customer.first_name} ${r.customer.last_name || ''}`
              : 'Privileged Patron';

            return (
              <StaggerItem key={r.id}>
                <div
                  className="h-full p-6 sm:p-8 bg-luxury-card border border-luxury-border rounded-sm shadow-xs flex flex-col justify-between space-y-6 hover:border-luxury-gold/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-luxury-gold">
                      {[...Array(r.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    {r.title && (
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                        {r.title}
                      </h4>
                    )}
                    <p className="text-xs sm:text-sm text-luxury-sand font-light italic leading-relaxed">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-luxury-border/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-luxury-cream font-medium">
                      <span>{authorName}</span>
                      <span className="text-[10px] text-luxury-muted">• Verified Buyer</span>
                    </div>
                    {r.product?.name && (
                      <span className="text-[10px] uppercase tracking-wider text-luxury-gold font-mono block">
                        {r.product.name}
                      </span>
                    )}
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
};
