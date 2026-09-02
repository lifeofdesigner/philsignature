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
  family: FragranceFamily | 'all';
  onFamilyChange: (fam: FragranceFamily | 'all') => void;
  collectionId: string | 'all';
  onCollectionChange: (colId: string | 'all') => void;
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
          <button onClick={onClose} className="p-1 text-luxury-muted hover:text-luxury-cream" aria-label="Close filters">
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

        {/* 1. Fragrance Family */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium block">
            Fragrance Family
          </span>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => onFamilyChange('all')}
              className={`w-full text-left text-xs py-2 px-3 rounded-sm transition-colors flex items-center justify-between cursor-pointer ${
                family === 'all'
                  ? 'bg-luxury-gold text-black font-semibold'
                  : 'text-luxury-sand hover:text-luxury-cream hover:bg-luxury-graphite'
              }`}
            >
              <span>All Fragrance Families</span>
            </button>
            {FRAGRANCE_FAMILIES.map((fam) => (
              <button
                key={fam}
                type="button"
                onClick={() => onFamilyChange(fam)}
                className={`w-full text-left text-xs py-2 px-3 rounded-sm transition-colors flex items-center justify-between cursor-pointer ${
                  family === fam
                    ? 'bg-luxury-gold text-black font-semibold'
                    : 'text-luxury-sand hover:text-luxury-cream hover:bg-luxury-graphite'
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
                className={`w-full text-left text-xs py-2 px-3 rounded-sm transition-colors cursor-pointer ${
                  collectionId === 'all'
                    ? 'bg-luxury-gold text-black font-semibold'
                    : 'text-luxury-sand hover:text-luxury-cream hover:bg-luxury-graphite'
                }`}
              >
                <span>All Collections</span>
              </button>
              {collections.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => onCollectionChange(col.id)}
                  className={`w-full text-left text-xs py-2 px-3 rounded-sm transition-colors truncate cursor-pointer ${
                    collectionId === col.id
                      ? 'bg-luxury-gold text-black font-semibold'
                      : 'text-luxury-sand hover:text-luxury-cream hover:bg-luxury-graphite'
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
          <label className="flex items-center gap-3 cursor-pointer text-xs text-luxury-sand hover:text-luxury-cream">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => onInStockChange(e.target.checked)}
              className="accent-luxury-gold h-4 w-4 rounded-sm"
            />
            <span>In-Stock Only</span>
          </label>
        </div>

        {/* Mobile Apply Button */}
        <div className="lg:hidden pt-4 border-t border-luxury-border">
          <Button variant="luxury" size="default" onClick={onClose} className="w-full text-xs">
            View Results
          </Button>
        </div>
      </aside>
    </>
  );
};

