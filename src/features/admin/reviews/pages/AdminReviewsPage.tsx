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

  const stats = useMemo(() => {
    const total = reviews.length;
    const pending = reviews.filter((r) => r.status === 'submitted').length;
    const approved = reviews.filter((r) => r.status === 'approved').length;
    const rejected = reviews.filter((r) => r.status === 'rejected').length;
    const avgRating = total > 0 ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / total).toFixed(1) : '5.0';

    return { total, pending, approved, rejected, avgRating };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (statusFilter === 'all') return reviews;
    return reviews.filter((r) => r.status === statusFilter);
  }, [reviews, statusFilter]);

  const handleStatusChange = async (review: Review, status: Review['status']) => {
    try {
      await updateStatus({ id: review.id, status });
      toast.success(`Review ${status} successfully.`);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Testimonials &amp; Reviews</h1>
          <p className="text-xs text-slate-700 font-semibold mt-1">
            Moderate, approve, or reject customer ratings and olfactory reviews across the fragrance collection.
          </p>
        </div>
      </div>

      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Average Rating</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-1.5">
            <span>{stats.avgRating}</span>
            <Star className="w-5 h-5 text-amber-500 fill-amber-400 inline" />
          </div>
          <div className="text-xs text-slate-700 mt-1">From {stats.total} total reviews</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pending Moderation</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.pending}</div>
          <div className="text-xs text-slate-700 mt-1">Awaiting verification</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Published</div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{stats.approved}</div>
          <div className="text-xs text-slate-700 mt-1">Live on storefront</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Rejected</div>
          <div className="text-2xl font-bold text-slate-700 mt-1">{stats.rejected}</div>
          <div className="text-xs text-slate-700 mt-1">Declined or flagged</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 w-fit">
        {STATUS_FILTERS.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer capitalize ${
              statusFilter === st
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-800 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {st === 'all'
              ? `All Reviews (${reviews.length})`
              : st === 'submitted'
              ? `Pending (${stats.pending})`
              : `${st} (${st === 'approved' ? stats.approved : stats.rejected})`}
          </button>
        ))}
      </div>

      {filteredReviews.length === 0 ? (
        <EmptyState
          icon={<Star className="h-5 w-5" />}
          title={reviews.length === 0 ? 'No Reviews Submitted' : 'No Matching Reviews'}
          description={
            reviews.length === 0
              ? 'Customer testimonials and olfactory reviews will appear here for review.'
              : 'Try selecting a different status filter above.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review) => {
            const reviewerName =
              [review.customer?.first_name, review.customer?.last_name].filter(Boolean).join(' ') ||
              review.customer?.email ||
              'Verified Client';

            return (
              <div
                key={review.id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 font-bold text-sm">{reviewerName}</span>
                      {review.is_verified_purchase && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-700 font-medium">
                      Product:{' '}
                      <span className="font-semibold text-slate-800">
                        {review.product?.name || 'Fragrance Item'}
                      </span>{' '}
                      • {formatDate(review.created_at)}
                    </div>
                  </div>

                  <span
                    className={`text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold border ${
                      review.status === 'approved'
                        ? 'text-emerald-800 border-emerald-200 bg-emerald-50'
                        : review.status === 'rejected'
                        ? 'text-red-800 border-red-200 bg-red-50'
                        : 'text-amber-900 border-amber-300 bg-amber-50'
                    }`}
                  >
                    {review.status === 'submitted' ? 'Pending Review' : review.status}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < (review.rating || 5) ? 'fill-amber-400 text-amber-500' : 'text-slate-200 fill-slate-100'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-1.5">{review.rating} / 5</span>
                </div>

                {review.title && <p className="text-sm text-slate-900 font-semibold">{review.title}</p>}
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                  {review.comment || 'No written comment provided.'}
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  {isUpdatingId === review.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-700" />
                  ) : (
                    <>
                      {review.status !== 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-300 font-medium"
                          onClick={() => handleStatusChange(review, 'approved')}
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve &amp; Publish</span>
                        </Button>
                      )}
                      {review.status !== 'rejected' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-slate-800 hover:text-red-600 hover:bg-red-50 border-slate-300 font-medium"
                          onClick={() => handleStatusChange(review, 'rejected')}
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(review)}
                        className="p-1.5 text-slate-700 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer rounded"
                        title="Delete Review"
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-md p-6 space-y-4 rounded-xl shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Remove Customer Review?</h3>
            <p className="text-sm text-slate-800">
              This will permanently remove this customer testimonial from the database. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeletingId === deleteTarget.id}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeletingId === deleteTarget.id}
                className="gap-2"
              >
                {isDeletingId === deleteTarget.id && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Delete Review</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
