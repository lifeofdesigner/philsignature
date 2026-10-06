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
import { SEO } from '@/components/common/SEO';

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
    family,
    collectionId,
    categoryId,
    gender,
    inStockOnly,
    searchQuery,
    sortBy,
    isFilterOpen,
    hasActiveFilters,
    setFamily,
    setCollectionId,
    setCategoryId,
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
    { label: 'All Scent Profiles', value: 'all' },
    { label: 'Woody & Warm', value: 'Woody' },
    { label: 'Floral & Rose', value: 'Floral' },
    { label: 'Vanilla & Gourmand', value: 'Vanilla' },
    { label: 'Fresh & Crisp', value: 'Fresh' },
    { label: 'Citrus & Tropical', value: 'Citrus' },
  ];

  const selectedCollection = collections.find(
    (c) => c.id === collectionId || c.slug === collectionId
  );

  return (
    <div className="min-h-screen bg-black text-luxury-cream py-12 sm:py-20">
      <SEO
        title="Shop Luxury Fragrances | Philz Signature"
        description="Explore the complete Philz Signature fragrance portfolio. Discover artisanal extraits de parfum, luxury candles, and room sprays crafted for distinct presence."
        canonical="/shop"
        ogType="website"
      />
      <div className="container mx-auto px-4 sm:px-8 lg:px-12 space-y-10 sm:space-y-12">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] sm:text-xs uppercase tracking-luxury-wide text-luxury-gold font-medium block">
            {selectedCollection
              ? `✦ ${selectedCollection.tagline || selectedCollection.name}`
              : categoryId === 'candles'
              ? '✦ Official Scented Candle Collection'
              : categoryId === 'room-spray' || categoryId === 'room-sprays'
              ? '✦ Official Room Spray Collection'
              : categoryId === 'perfumes'
              ? '✦ The Haute Parfumerie Collection'
              : '✦ The Philz Signature Boutique'}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal tracking-tight">
            {selectedCollection
              ? selectedCollection.name
              : categoryId === 'candles'
              ? 'Hand-Poured Scented Candles'
              : categoryId === 'room-spray' || categoryId === 'room-sprays'
              ? 'Fine Mist Room Sprays'
              : categoryId === 'perfumes'
              ? 'All Perfumes & Extraits'
              : 'All Olfactory Creations'}
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-white/70 font-light leading-relaxed max-w-xl mx-auto">
            {selectedCollection
              ? selectedCollection.description
              : categoryId === 'candles'
              ? 'Handcrafted 300g luxury soy candles infused with bespoke aromatic essences. Designed to transform any living space into a sanctuary of warmth, serenity, and distinction.'
              : categoryId === 'room-spray' || categoryId === 'room-sprays'
              ? 'Handcrafted 150ml fine fragrance atmospheric mists poured in Lagos with ergonomic trigger atomizers. Instant atmosphere transformations for living areas, bedrooms, and fine fabrics.'
              : categoryId === 'perfumes'
              ? 'Handcrafted with rare botanical extracts and high-concentration perfume oils for lasting elegance and distinctive sillage.'
              : 'Handcrafted with rare botanical extracts, concentrated perfume oils, luxury soy candles, and fine room mists for enduring sillage and elevated living.'}
          </p>

          {/* Luxury Product Category Selector */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            {[
              { label: 'All Creations', value: 'all' },
              { label: 'Perfume Body Oils', value: 'perfumes' },
              { label: 'Scented Candles', value: 'candles' },
              { label: 'Reed Diffusers', value: 'reed-diffusers' },
              { label: 'Room Sprays', value: 'room-spray' },
            ].map((cat) => {
              const isSelected =
                (cat.value === 'all' && categoryId === 'all' && collectionId === 'all') ||
                (cat.value !== 'all' &&
                  (categoryId === cat.value ||
                    (cat.value === 'room-spray' && categoryId === 'room-sprays') ||
                    (cat.value === 'candles' && categoryId === 'candle')));
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setCategoryId(cat.value)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-luxury font-medium transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-luxury-gold text-black font-semibold shadow-md'
                      : 'text-luxury-sand/80 hover:text-white bg-white/5 border border-white/10 hover:border-luxury-gold/40'
                  }`}
                >
                  {cat.label}
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
            placeholder={categoryId === 'candles' ? "Search scented candles by name or notes..." : "Search by name, notes, or scent..."}
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
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
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
                message="We could not load our perfumes right now. Please try again."
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
