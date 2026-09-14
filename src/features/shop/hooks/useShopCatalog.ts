import { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { productService, type CatalogFilterOptions } from '@/services/ProductService';
import { categoryService } from '@/services/CategoryService';
import { collectionService } from '@/services/CollectionService';
import type { Product, FragranceFamily } from '@/types/database';

export const useShopCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL State initialization
  const initialFamily = (searchParams.get('family') as FragranceFamily) || 'all';
  const initialCollection = searchParams.get('collection') || 'all';
  const initialCategory = searchParams.get('category') || 'all';
  const initialGender = searchParams.get('gender') || 'all';
  const initialSort = (searchParams.get('sort') as CatalogFilterOptions['sortBy']) || 'featured';

  // Local Filter States
  const [family, setFamily] = useState<FragranceFamily | string | 'all'>(initialFamily);
  const [collectionId, setCollectionId] = useState<string | 'all'>(initialCollection);
  const [categoryId, setCategoryId] = useState<string | 'all'>(initialCategory);
  const [gender, setGender] = useState<string | 'all'>(initialGender);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<CatalogFilterOptions['sortBy']>(initialSort);
  const [page, setPage] = useState<number>(1);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Sync state when URL params change (e.g. from Mega Menu or direct links)
  useEffect(() => {
    const fam = (searchParams.get('family') as FragranceFamily) || 'all';
    const col = searchParams.get('collection') || 'all';
    const cat = searchParams.get('category') || 'all';
    const gen = searchParams.get('gender') || 'all';
    const srt = (searchParams.get('sort') as CatalogFilterOptions['sortBy']) || 'featured';
    setFamily(fam);
    setCollectionId(col);
    setCategoryId(cat);
    setGender(gen);
    setSortBy(srt);
  }, [searchParams]);

  const deferredSearch = useDeferredValue(searchQuery);
  const PAGE_SIZE = 12;

  // React Query: Fetch All Published Products
  const productsQuery = useQuery<Product[]>({
    queryKey: ['catalog-products'],
    queryFn: () => productService.getCatalog(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 20,
  });

  // React Query: Fetch Categories
  const categoriesQuery = useQuery({
    queryKey: ['catalog-categories'],
    queryFn: () => categoryService.getAllCategories(),
    staleTime: 1000 * 60 * 15,
  });

  // React Query: Fetch Collections
  const collectionsQuery = useQuery({
    queryKey: ['catalog-collections'],
    queryFn: () => collectionService.getCollections(),
    staleTime: 1000 * 60 * 15,
  });

  // Service Layer Filtering & Sorting
  const filteredProducts = useMemo(() => {
    if (!productsQuery.data) return [];
    return productService.filterAndSort(productsQuery.data, {
      family,
      collectionId,
      categoryId,
      gender,
      minPrice,
      maxPrice,
      inStockOnly,
      searchQuery: deferredSearch,
      sortBy,
    });
  }, [productsQuery.data, family, collectionId, categoryId, gender, minPrice, maxPrice, inStockOnly, deferredSearch, sortBy]);

  // Pagination calculations
  const totalCount = filteredProducts.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page, PAGE_SIZE]);

  // Handlers
  const handleFamilyChange = (newFamily: FragranceFamily | string | 'all') => {
    setFamily(newFamily);
    setPage(1);
    const p = new URLSearchParams(searchParams);
    if (newFamily === 'all') p.delete('family');
    else p.set('family', newFamily);
    setSearchParams(p);
  };

  const handleCollectionChange = (newCollection: string | 'all') => {
    setCollectionId(newCollection);
    setPage(1);
    const p = new URLSearchParams(searchParams);
    if (newCollection === 'all') {
      p.delete('collection');
    } else {
      p.set('collection', newCollection);
      // Clear product category so all creations within the selected boutique collection show
      p.delete('category');
      setCategoryId('all');
    }
    setSearchParams(p);
  };

  const handleCategoryChange = (newCategory: string | 'all') => {
    setCategoryId(newCategory);
    setPage(1);
    const p = new URLSearchParams(searchParams);
    if (newCategory === 'all') {
      p.delete('category');
    } else {
      p.set('category', newCategory);
      // Clear boutique collection so all creations in the selected product category show
      p.delete('collection');
      setCollectionId('all');
    }
    setSearchParams(p);
  };

  const handleGenderChange = (newGender: string | 'all') => {
    setGender(newGender);
    setPage(1);
    const p = new URLSearchParams(searchParams);
    if (newGender === 'all') p.delete('gender');
    else p.set('gender', newGender);
    setSearchParams(p);
  };

  const handleSortChange = (newSort: CatalogFilterOptions['sortBy']) => {
    setSortBy(newSort);
    setPage(1);
    const p = new URLSearchParams(searchParams);
    if (newSort === 'featured') p.delete('sort');
    else p.set('sort', newSort || 'featured');
    setSearchParams(p);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const resetFilters = () => {
    setFamily('all');
    setCollectionId('all');
    setCategoryId('all');
    setGender('all');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setInStockOnly(false);
    setSearchQuery('');
    setSortBy('featured');
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    family !== 'all' ||
    collectionId !== 'all' ||
    categoryId !== 'all' ||
    gender !== 'all' ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    inStockOnly ||
    searchQuery.trim() !== '' ||
    sortBy !== 'featured';

  return {
    // Data
    products: paginatedProducts,
    allFilteredCount: totalCount,
    totalCount,
    totalPages,
    currentPage: page,
    categories: categoriesQuery.data || [],
    collections: collectionsQuery.data || [],
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error,
    // State
    family,
    collectionId,
    categoryId,
    gender,
    minPrice,
    maxPrice,
    inStockOnly,
    searchQuery,
    sortBy,
    isFilterOpen,
    hasActiveFilters,
    // Actions
    setFamily: handleFamilyChange,
    setCollectionId: handleCollectionChange,
    setCategoryId: handleCategoryChange,
    setGender: handleGenderChange,
    setMinPrice,
    setMaxPrice,
    setInStockOnly,
    setSearchQuery: handleSearchChange,
    setSortBy: handleSortChange,
    setPage,
    setIsFilterOpen,
    resetFilters,
    refetch: productsQuery.refetch,
  };
};
