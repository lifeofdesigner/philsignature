import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { Review } from '@/types/database';

export const AdminReviewsPage: React.FC = () => {
  const [reviews] = useState<Review[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Testimonials & Feedback
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">
            Customer Reviews
          </h1>
          <p className="text-xs text-luxury-muted font-light mt-1">
            Moderate, approve, reject, or feature verified customer ratings.
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={<Star className="h-5 w-5" />}
          title="No Reviews Submitted"
          description="Customer testimonials and olfactory reviews will appear here for review."
        />
      ) : (
        <div />
      )}
    </div>
  );
};

