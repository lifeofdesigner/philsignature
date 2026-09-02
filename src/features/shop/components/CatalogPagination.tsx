import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const CatalogPagination: React.FC<CatalogPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 pt-12" aria-label="Catalog navigation">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="h-10 w-10 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-sm border border-luxury-border bg-luxury-card text-luxury-sand disabled:opacity-30 disabled:pointer-events-none hover:text-luxury-gold hover:border-luxury-gold transition-colors cursor-pointer"
        aria-label="Previous catalog page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {[...Array(totalPages)].map((_, i) => {
        const pageNum = i + 1;
        const isActive = pageNum === currentPage;
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`h-10 w-10 min-h-[40px] min-w-[40px] rounded-sm text-xs font-mono transition-colors border cursor-pointer ${
              isActive
                ? 'bg-luxury-gold text-black border-luxury-gold font-bold'
                : 'bg-luxury-card text-luxury-sand border-luxury-border hover:border-luxury-gold/60 hover:text-luxury-cream'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="h-10 w-10 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-sm border border-luxury-border bg-luxury-card text-luxury-sand disabled:opacity-30 disabled:pointer-events-none hover:text-luxury-gold hover:border-luxury-gold transition-colors cursor-pointer"
        aria-label="Next catalog page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};

