import React, { useState } from 'react';
import { Package, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { Product } from '@/types/database';

export const AdminProductsPage: React.FC = () => {
  const [products] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Catalog Management
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">
            Fragrance Products
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
          <Button variant="luxury" size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>Add Formulation</span>
          </Button>
        </div>
      </div>

      <div className="bg-luxury-card border border-luxury-border p-4 flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search fragrances by title, notes, SKU, or family..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md bg-luxury-charcoal"
        />
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-5 w-5" />}
          title="No Products Staged"
          description="The complete PHILZ SIGNATURE catalog (Beyond You, Nomad, Fierce Elixir, Hera, Promise, Guidance, Oud en Botella) will be seeded into Supabase in Phase 2."
          actionLabel="Create First Product"
        />
      ) : (
        <div />
      )}
    </div>
  );
};

