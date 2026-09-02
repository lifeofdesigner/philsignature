import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useShopCatalog } from '../hooks/useShopCatalog';
import { CatalogSearchBar } from '../components/CatalogSearchBar';
import { ProductSortDropdown } from '../components/ProductSortDropdown';
import { ProductFilterDrawer } from '../components/ProductFilterDrawer';
import { ProductGrid } from '../components/ProductGrid';
import { CatalogPagination } from '../components/CatalogPagination';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';

export const ShopPage: React.FC = () => {
  const {
    products,
    allFilteredCount,
    totalPages,
    currentPage,
    collections,
    isLoading,
    isError,
    error,
    family,
    collectionId,
    inStockOnly,
    searchQuery,
    sortBy,
    isFilterOpen,
    hasActiveFilters,
    setFamily,
    setCollectionId,
    setInStockOnly,
    setSearchQuery,
    setSortBy,
    setPage,
    setIsFilterOpen,
    resetFilters,
    refetch,
  } = useShopCatalog();

  return (
    <div className="min-h-screen bg-luxury-black text-luxury-cream py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            Our Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-luxury-cream font-normal tracking-tight">
            Shop All Perfumes
          </h1>
          <p className="text-xs sm:text-sm text-luxury-sand font-light leading-relaxed">
            Browse our full range of premium perfumes — from rich ouds to fresh citrus blends and everything in between.
          </p>
        </div>

        {/* Top Controls: Search, Filter Toggle, Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-luxury-card border border-luxury-border">
          <CatalogSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or scent type..."
          />

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 text-xs py-2 px-3 border border-luxury-border bg-black text-luxury-sand hover:text-white"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-luxury-gold" />
              <span>Filters {hasActiveFilters && '•'}</span>
            </button>

            <ProductSortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {/* Main Body: Filter Drawer + Product Grid */}
        <div className="flex items-start gap-8">
          {/* Filter Sidebar / Drawer */}
          <ProductFilterDrawer
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            family={family}
            onFamilyChange={setFamily}
            collectionId={collectionId}
            onCollectionChange={setCollectionId}
            collections={collections}
            inStockOnly={inStockOnly}
            onInStockChange={setInStockOnly}
            hasActiveFilters={hasActiveFilters}
            onReset={resetFilters}
          />

          {/* Catalog Listing Area */}
          <div className="flex-1 space-y-8">
            {isError ? (
              <ErrorState
                title="Could Not Load Perfumes"
                message={error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
                onRetry={() => refetch()}
              />
            ) : !isLoading && products.length === 0 ? (
              <EmptyState
                title="No Perfumes Found"
                description="No perfumes match your search or filter. Try a different keyword or clear your filters."
                actionLabel={hasActiveFilters ? 'Clear Filters' : undefined}
                onAction={hasActiveFilters ? resetFilters : undefined}
              />
            ) : (
              <>
                <div className="text-[11px] uppercase tracking-wider text-luxury-muted flex items-center justify-between">
                  <span>
                    Showing {products.length} of {allFilteredCount} Perfumes
                  </span>
                </div>

                <ProductGrid products={products} isLoading={isLoading} />

                <CatalogPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
