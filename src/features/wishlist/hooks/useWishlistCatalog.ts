import { useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/services/WishlistService';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/types/database';

export const useWishlistCatalog = () => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const queryClient = useQueryClient();
  const customerId = user?.id;

  const { data: products = [], isLoading, isError, error, refetch } = useQuery<Product[]>({
    queryKey: ['wishlist-products', customerId || 'guest'],
    queryFn: () => wishlistService.getWishlistProducts(customerId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10,
  });

  const moveToCart = (product: Product) => {
    addItem(product, 1);
    // Remove from wishlist after moving to bag
    wishlistService.toggleWishlist(product.id, customerId).then(() => {
      queryClient.invalidateQueries({ queryKey: ['wishlist-products'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-ids'] });
    });
  };

  const removeFromWishlist = (productId: string) => {
    wishlistService.toggleWishlist(productId, customerId).then(() => {
      queryClient.invalidateQueries({ queryKey: ['wishlist-products'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-ids'] });
    });
  };

  return {
    products,
    itemCount: products.length,
    isLoading,
    isError,
    error,
    moveToCart,
    removeFromWishlist,
    refetch,
  };
};

