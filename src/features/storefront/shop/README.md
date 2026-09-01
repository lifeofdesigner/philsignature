# Storefront: Shop Feature

## Purpose
Catalog browsing experience with multi-dimensional filtering (Fragrance Family, Gender, Olfactory Notes, Price range, Collections) and sorting.

## Flow
1. User navigates to `/shop`.
2. URL search parameters populate initial filter state.
3. `ProductService.getCatalog()` fetches matching fragrances.
4. Results render in responsive grid with quick-add to bag.

## Dependencies
- `@/services/ProductService`
- `@/hooks/useProducts`
- `@/types/database`

## Database Tables
- `products`
- `categories`
- `collections`

## Future Improvements
- Infinite scrolling with TanStack Query `useInfiniteQuery`.
- Scent comparison modal.

