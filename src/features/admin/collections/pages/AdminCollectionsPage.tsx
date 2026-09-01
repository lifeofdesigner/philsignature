import React, { useState } from 'react';
import { Layers, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { Collection } from '@/types/database';

export const AdminCollectionsPage: React.FC = () => {
  const [collections] = useState<Collection[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Curated Lines
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">
            Collections
          </h1>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          <span>New Collection</span>
        </Button>
      </div>

      {collections.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-5 w-5" />}
          title="No Collections Established"
          description="Manage curated groupings like Private Reserve and The Oud Edition."
        />
      ) : (
        <div />
      )}
    </div>
  );
};

