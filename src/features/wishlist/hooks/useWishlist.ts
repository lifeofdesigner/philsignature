import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/services/WishlistService';
import { useAuth } from '@/hooks/useAuth';

export const useWishlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const customerId = user?.id;

  const { data: wishlistIds = [], isLoading } = useQuery<string[]>({
    queryKey: ['wishlist-ids', customerId || 'guest'],
    queryFn: () => wishlistService.getWishlistIds(customerId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10,
  });

  const toggleMutation = useMutation({
    mutationFn: (productId: string) => wishlistService.toggleWishlist(productId, customerId),
    onMutate: async (productId: string) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist-ids', customerId || 'guest'] });
      const previousIds = queryClient.getQueryData<string[]>(['wishlist-ids', customerId || 'guest']) || [];
      const exists = previousIds.includes(productId);
      const nextIds = exists ? previousIds.filter((id) => id !== productId) : [...previousIds, productId];

      queryClient.setQueryData(['wishlist-ids', customerId || 'guest'], nextIds);
      return { previousIds };
    },
    onError: (_err, _productId, context) => {
      if (context?.previousIds) {
        queryClient.setQueryData(['wishlist-ids', customerId || 'guest'], context.previousIds);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist-ids', customerId || 'guest'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-products', customerId || 'guest'] });
    },
  });

  const isInWishlist = (productId: string): boolean => {
    return wishlistIds.includes(productId);
  };

  const toggleWishlist = (productId: string) => {
    toggleMutation.mutate(productId);
  };

  return {
    wishlistIds,
    count: wishlistIds.length,
    isLoading,
    isInWishlist,
    toggleWishlist,
    isToggling: toggleMutation.isPending,
  };
};

