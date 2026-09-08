import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FragranceFamily, Collection } from '@/types/database';

const FRAGRANCE_FAMILIES: FragranceFamily[] = [
  'Woody',
  'Oriental',
  'Floral',
  'Fresh',
  'Gourmand',
  'Chypre',
  'Aromatic',
];

export interface ProductFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  family: FragranceFamily | string | 'all';
  onFamilyChange: (fam: FragranceFamily | string | 'all') => void;
  collectionId: string | 'all';
  onCollectionChange: (colId: string | 'all') => void;
  gender?: string | 'all';
  onGenderChange?: (gender: string | 'all') => void;
  collections: Collection[];
  inStockOnly: boolean;
  onInStockChange: (inStock: boolean) => void;
  hasActiveFilters: boolean;
  onReset: () => void;
}

export const ProductFilterDrawer: React.FC<ProductFilterDrawerProps> = ({
  isOpen,
  onClose,
  family,
  onFamilyChange,
  collectionId,
  onCollectionChange,
  gender = 'all',
  onGenderChange,
  collections,
  inStockOnly,
  onInStockChange,
  hasActiveFilters,
  onReset,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer / Sidebar */}
      <aside
        className={`fixed lg:static top-0 right-0 h-full lg:h-auto w-80 lg:w-64 bg-luxury-card lg:bg-transparent border-l lg:border-l-0 border-luxury-border z-50 lg:z-0 p-6 space-y-8 overflow-y-auto transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between lg:hidden border-b border-luxury-border pb-4">
          <span className="text-xs uppercase tracking-luxury text-luxury-gold font-medium">
            Filters
          </span>
          <button onClick={onClose} className="p-1 text-luxury-muted hover:text-white" aria-label="Close filters">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Header Reset */}
        <div className="hidden lg:flex items-center justify-between border-b border-luxury-border/60 pb-3">
          <span className="text-xs uppercase tracking-luxury text-luxury-sand font-medium">
            Filter Perfumes
          </span>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-[10px] text-luxury-gold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* 1. Target Audience / Gender */}
        {onGenderChange && (
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium block">
              Audience & Profile
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'All', value: 'all' },
                { label: 'Unisex', value: 'unisex' },
                { label: 'Men', value: 'men' },
                { label: 'Women', value: 'women' },
              ].map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => onGenderChange(g.value)}
                  className={`text-xs py-2 px-3 rounded-xs transition-colors text-center ${
                    gender === g.value
                      ? 'bg-luxury-gold text-black font-semibold'
                      : 'text-luxury-sand hover:text-white bg-white/5 border border-white/10 hover:border-luxury-gold/40'
                  }`}
                >
                  <span>{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. Fragrance Family */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium block">
            Fragrance Family
          </span>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => onFamilyChange('all')}
              className={`w-full text-left text-xs py-1.5 px-2.5 transition-colors flex items-center justify-between rounded-xs ${
                family === 'all'
                  ? 'bg-luxury-gold text-black font-semibold'
                  : 'text-luxury-sand hover:text-white hover:bg-luxury-charcoal'
              }`}
            >
              <span>All Fragrance Families</span>
            </button>
            {FRAGRANCE_FAMILIES.map((fam) => (
              <button
                key={fam}
                type="button"
                onClick={() => onFamilyChange(fam)}
                className={`w-full text-left text-xs py-1.5 px-2.5 transition-colors flex items-center justify-between rounded-xs ${
                  family === fam
                    ? 'bg-luxury-gold text-black font-semibold'
                    : 'text-luxury-sand hover:text-white hover:bg-luxury-charcoal'
                }`}
              >
                <span>{fam}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Collections Filter */}
        {collections.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-luxury-border/50">
            <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium block">
              Boutique Line
            </span>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => onCollectionChange('all')}
                className={`w-full text-left text-xs py-1.5 px-2.5 transition-colors ${
                  collectionId === 'all'
                    ? 'bg-luxury-gold text-black font-semibold'
                    : 'text-luxury-sand hover:text-white hover:bg-luxury-charcoal'
                }`}
              >
                <span>All Collections</span>
              </button>
              {collections.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => onCollectionChange(col.id)}
                  className={`w-full text-left text-xs py-1.5 px-2.5 transition-colors truncate ${
                    collectionId === col.id
                      ? 'bg-luxury-gold text-black font-semibold'
                      : 'text-luxury-sand hover:text-white hover:bg-luxury-charcoal'
                  }`}
                >
                  <span className="truncate">{col.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. In-Stock Filter */}
        <div className="pt-4 border-t border-luxury-border/50">
          <label className="flex items-center gap-3 cursor-pointer text-xs text-luxury-sand hover:text-white">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => onInStockChange(e.target.checked)}
              className="accent-luxury-gold h-4 w-4 rounded-none"
            />
            <span>In-Stock Allocations Only</span>
          </label>
        </div>

        {/* Mobile Apply Button */}
        <div className="lg:hidden pt-4 border-t border-luxury-border">
          <Button variant="luxury" size="default" onClick={onClose} className="w-full text-xs">
            Show Filtered Creations
          </Button>
        </div>
      </aside>
    </>
  );
};

