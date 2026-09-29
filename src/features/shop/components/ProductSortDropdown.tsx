import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { CatalogFilterOptions } from '@/services/ProductService';

export interface ProductSortDropdownProps {
  value?: CatalogFilterOptions['sortBy'];
  onChange: (val: CatalogFilterOptions['sortBy']) => void;
}

export const ProductSortDropdown: React.FC<ProductSortDropdownProps> = ({
  value = 'featured',
  onChange,
}) => {
  return (
    <div className="relative inline-flex items-center gap-2">
      <ArrowUpDown className="h-3.5 w-3.5 text-luxury-gold shrink-0" />
      <span className="text-[10px] uppercase tracking-luxury text-luxury-muted hidden sm:inline">
        Sort By:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CatalogFilterOptions['sortBy'])}
        className="min-h-[44px] bg-luxury-card border border-luxury-border text-luxury-cream text-xs py-2 px-3 rounded-sm focus:outline-none focus:border-luxury-gold cursor-pointer"
        aria-label="Sort products by"
      >
        <option value="featured">Featured Allocations</option>
        <option value="newest">Newest Arrivals</option>
        <option value="bestseller">Bestseller Creations</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating">Client Acclaim (Rating)</option>
      </select>
    </div>
  );
};

