import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/ReviewService';
import type { Review } from '@/types/database';

const ADMIN_REVIEWS_KEY = ['admin-reviews'];

export const useAdminReviews = () => {
  const queryClient = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ADMIN_REVIEWS_KEY,
    queryFn: () => reviewService.getAllReviewsAdmin(),
    staleTime: 1000 * 30,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Review['status'] }) => reviewService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewService.deleteReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_REVIEWS_KEY }),
  });

  return {
    reviews: reviewsQuery.data ?? [],
    isLoading: reviewsQuery.isLoading,
    isError: reviewsQuery.isError,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingId: updateStatusMutation.isPending ? updateStatusMutation.variables?.id : null,
    deleteReview: deleteMutation.mutateAsync,
  };
};
