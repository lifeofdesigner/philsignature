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

import type { FragranceFamily } from '@/types/database';

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
    gender,
    inStockOnly,
    searchQuery,
    sortBy,
    isFilterOpen,
    hasActiveFilters,
    setFamily,
    setCollectionId,
    setGender,
    setInStockOnly,
    setSearchQuery,
    setSortBy,
    setPage,
    setIsFilterOpen,
    resetFilters,
    refetch,
  } = useShopCatalog();

  const fragranceFamilies: { label: string; value: FragranceFamily | string | 'all' }[] = [
    { label: 'All Fragrances', value: 'all' },
    { label: 'Woody & Oud', value: 'Woody' },
    { label: 'Floral Collection', value: 'Floral' },
    { label: 'Vanilla & Gourmand', value: 'Vanilla' },
    { label: 'Fresh & Citrus', value: 'Fresh' },
    { label: 'Bold & Spicy', value: 'Spicy' },
  ];

  return (
    <div className="min-h-screen bg-black text-luxury-cream py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-8 lg:px-12 space-y-10 sm:space-y-12">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] sm:text-xs uppercase tracking-luxury-wide text-luxury-gold font-medium block">
            ✦ The Haute Parfumerie Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal tracking-tight">
            All Perfumes & Extraits
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-white/70 font-light leading-relaxed max-w-xl mx-auto">
            Handcrafted with rare botanical extracts and high-concentration perfume oils for lasting elegance and distinctive sillage.
          </p>

          {/* Quick Audience / Gender Selector */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {[
              { label: 'All Fragrances', value: 'all' },
              { label: 'Unisex', value: 'unisex' },
              { label: 'Men', value: 'men' },
              { label: 'Women', value: 'women' },
            ].map((g) => {
              const isSelected = gender === g.value;
              return (
                <button
                  key={g.label}
                  type="button"
                  onClick={() => setGender(g.value)}
                  className={`px-3 py-1 rounded-xs text-[11px] uppercase tracking-luxury font-medium transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-luxury-gold text-black font-semibold shadow-xs'
                      : 'text-luxury-sand/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>

          {/* Quick Fragrance Family Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {fragranceFamilies.map((f) => {
              const isSelected = family === f.value;
              return (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => setFamily(f.value as FragranceFamily)}
                  className={`px-3 py-1 rounded-full text-[11px] tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-white/20 text-white font-medium border border-luxury-gold shadow-xs'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/30'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Controls: Search, Filter Toggle, Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-neutral-950/80 border border-white/10 rounded-xs shadow-xl backdrop-blur-md">
          <CatalogSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, notes, or scent..."
          />

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden min-h-[42px] flex items-center gap-2 text-xs py-2 px-4 border border-white/20 bg-white/5 text-white hover:text-luxury-gold rounded-xs cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-luxury-gold" />
              <span>Filters</span>
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
            gender={gender}
            onGenderChange={setGender}
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
                <div className="text-[11px] uppercase tracking-wider text-white/50 flex items-center justify-between font-mono">
                  <span>
                    Showing {products.length} of {allFilteredCount} Flacons
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
