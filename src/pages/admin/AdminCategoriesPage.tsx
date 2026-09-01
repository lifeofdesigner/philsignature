import React, { useState } from 'react';
import { Tags, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { Category } from '@/types/database';

export const AdminCategoriesPage: React.FC = () => {
  const [categories] = useState<Category[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Formulation Hierarchy
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">
            Categories
          </h1>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          <span>New Category</span>
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={<Tags className="h-5 w-5" />}
          title="No Categories Configured"
          description="Categories such as Extrait de Parfum, Eau de Parfum, and Home Fragrance will seed in Phase 2."
        />
      ) : (
        <div>{/* Categories list */}</div>
      )}
    </div>
  );
};
