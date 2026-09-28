import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/ProductService';
import { categoryService } from '@/services/CategoryService';
import { collectionService } from '@/services/CollectionService';

const ADMIN_PRODUCTS_KEY = ['admin-products'];

export const useAdminProducts = () => {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ADMIN_PRODUCTS_KEY,
    queryFn: () => productService.getCatalog({ status: 'all' }),
    staleTime: 1000 * 30,
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories-lookup'],
    queryFn: () => categoryService.getAllCategories(),
    staleTime: 1000 * 60 * 10,
  });

  const collectionsQuery = useQuery({
    queryKey: ['admin-collections-lookup'],
    queryFn: () => collectionService.getCollections(),
    staleTime: 1000 * 60 * 10,
  });

  const createMutation = useMutation({
    mutationFn: (input: unknown) => productService.createProduct(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: unknown }) => productService.updateProduct(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_KEY }),
  });

  const setImagesMutation = useMutation({
    mutationFn: ({ id, images }: { id: string; images: string[] }) => productService.setProductImages(id, images),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_KEY }),
  });

  return {
    products: productsQuery.data ?? [],
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error,
    categories: categoriesQuery.data ?? [],
    collections: collectionsQuery.data ?? [],
    createProduct: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProduct: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProduct: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    setProductImages: setImagesMutation.mutateAsync,
    isSavingImages: setImagesMutation.isPending,
  };
};
