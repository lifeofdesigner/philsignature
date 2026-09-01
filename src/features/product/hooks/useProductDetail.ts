import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/ProductService';
import type { Product, Review } from '@/types/database';

export const useProductDetail = (slug?: string) => {
  // Query 1: Main Product
  const productQuery = useQuery<Product | null>({
    queryKey: ['product-detail', slug],
    queryFn: () => (slug ? productService.getProductBySlug(slug) : Promise.resolve(null)),
    enabled: Boolean(slug && slug.trim() !== ''),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30,
    retry: 1,
  });

  const product = productQuery.data;

  // Query 2: Related Fragrances
  const relatedQuery = useQuery<Product[]>({
    queryKey: ['product-related', product?.fragrance_family, product?.id],
    queryFn: () =>
      product && product.fragrance_family
        ? productService.getRelatedProducts(product.fragrance_family, product.id, 4)
        : Promise.resolve([]),
    enabled: Boolean(product && product.fragrance_family),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
  });

  // Query 3: Reviews
  const reviewsQuery = useQuery<Review[]>({
    queryKey: ['product-reviews', product?.id],
    queryFn: () => (product ? productService.getProductReviews(product.id) : Promise.resolve([])),
    enabled: Boolean(product?.id),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 20,
  });

  return {
    product: productQuery.data,
    relatedProducts: relatedQuery.data || [],
    reviews: reviewsQuery.data || [],
    isLoading: productQuery.isLoading,
    isError: productQuery.isError,
    error: productQuery.error,
    isNotFound: !productQuery.isLoading && productQuery.data === null,
    refetch: productQuery.refetch,
  };
};

