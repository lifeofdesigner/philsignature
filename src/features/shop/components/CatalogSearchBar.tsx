import React from 'react';
import { Search, X } from 'lucide-react';

export interface CatalogSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const CatalogSearchBar: React.FC<CatalogSearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search by name, note, or code...',
}) => {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-luxury-muted pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-luxury-card border border-luxury-border focus:border-luxury-gold text-white text-xs pl-10 pr-9 py-2.5 transition-colors focus:outline-none focus:ring-1 focus:ring-luxury-gold/50"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-luxury-muted hover:text-white transition-colors"
          aria-label="Clear search query"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

