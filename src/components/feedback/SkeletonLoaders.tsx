import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Component Skeleton Loader (e.g. Flacon Card)
export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-3 bg-luxury-card border border-luxury-border/40 p-4', className)}>
    <Skeleton className="h-64 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <div className="flex items-center justify-between pt-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

// Page Skeleton Loader (Storefront Header + Grid)
export const PageSkeleton: React.FC = () => (
  <div className="container mx-auto px-4 sm:px-8 py-12 space-y-8">
    <div className="space-y-3 text-center max-w-md mx-auto">
      <Skeleton className="h-3 w-24 mx-auto" />
      <Skeleton className="h-8 w-64 mx-auto" />
      <Skeleton className="h-4 w-full" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
    </div>
  </div>
);

// Admin Data Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="w-full bg-luxury-card border border-luxury-border p-4 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-9 w-32" />
    </div>
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  </div>
);

