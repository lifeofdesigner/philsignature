import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Star, Check, X, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminReviews } from '../hooks/useAdminReviews';
import type { Review } from '@/types/database';

const STATUS_FILTERS = ['all', 'submitted', 'approved', 'rejected'] as const;

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const AdminReviewsPage: React.FC = () => {
  const { reviews, isLoading, isError, updateStatus, isUpdatingId, deleteReview } = useAdminReviews();
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const filteredReviews = useMemo(() => {
    if (statusFilter === 'all') return reviews;
    return reviews.filter((r) => r.status === statusFilter);
  }, [reviews, statusFilter]);

  const handleStatusChange = async (review: Review, status: Review['status']) => {
    try {
      await updateStatus({ id: review.id, status });
      toast.success(`Review ${status}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update review status.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeletingId(deleteTarget.id);
    try {
      await deleteReview(deleteTarget.id);
      toast.success('Review removed.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete review.');
    } finally {
      setIsDeletingId(null);
    }
  };

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={<Star className="h-5 w-5" />}
        title="Unable to Load Reviews"
        description="Reviews could not be retrieved from Supabase. Please retry."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Testimonials & Feedback
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">Customer Reviews</h1>
          <p className="text-xs text-luxury-muted font-light mt-1">
            Moderate, approve, or reject verified customer ratings.
          </p>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="flex items-center gap-1.5 p-1 bg-luxury-black border border-luxury-border rounded text-xs w-fit">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded uppercase tracking-wider text-[10px] font-medium transition-colors cursor-pointer ${
                statusFilter === st ? 'bg-luxury-gold text-luxury-black font-semibold' : 'text-luxury-muted hover:text-white'
              }`}
            >
              {st === 'all' ? `All (${reviews.length})` : st}
            </button>
          ))}
        </div>
      )}

      {filteredReviews.length === 0 ? (
        <EmptyState
          icon={<Star className="h-5 w-5" />}
          title={reviews.length === 0 ? 'No Reviews Submitted' : 'No Matching Reviews'}
          description={
            reviews.length === 0
              ? 'Customer testimonials and olfactory reviews will appear here for review.'
              : 'Try a different status filter.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review) => {
            const reviewerName = [review.customer?.first_name, review.customer?.last_name].filter(Boolean).join(' ') || review.customer?.email || 'Anonymous';
            return (
              <div key={review.id} className="bg-luxury-card border border-luxury-border p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">{reviewerName}</span>
                      {review.is_verified_purchase && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-luxury-muted">
                      {review.product?.name || 'Unknown product'} • {formatDate(review.created_at)}
                    </div>
                  </div>
                  <span
                    className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-medium border ${
                      review.status === 'approved'
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : review.status === 'rejected'
                        ? 'text-red-400 border-red-500/30 bg-red-500/10'
                        : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    }`}
                  >
                    {review.status}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-luxury-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-current' : 'opacity-30'}`} />
                  ))}
                </div>

                {review.title && <p className="text-sm text-white font-medium">{review.title}</p>}
                <p className="text-xs text-luxury-muted">{review.comment}</p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-luxury-border/60">
                  {isUpdatingId === review.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-luxury-muted" />
                  ) : (
                    <>
                      {review.status !== 'approved' && (
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleStatusChange(review, 'approved')}>
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </Button>
                      )}
                      {review.status !== 'rejected' && (
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleStatusChange(review, 'rejected')}>
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(review)}
                        className="p-1.5 text-luxury-muted hover:text-red-400 transition-colors cursor-pointer"
                        aria-label="Delete review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-luxury-card border border-luxury-border w-full max-w-md p-6 space-y-5 rounded">
            <h3 className="font-serif text-lg text-white">Remove Review?</h3>
            <p className="text-sm text-luxury-muted">This will permanently delete this review. This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeletingId === deleteTarget.id}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isDeletingId === deleteTarget.id} className="gap-2">
                {isDeletingId === deleteTarget.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
