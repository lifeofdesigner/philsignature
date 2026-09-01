import React from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';

export const AdminMediaPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Digital Asset Vault
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">
            Media Library
          </h1>
          <p className="text-xs text-luxury-muted font-light mt-1">
            Store high-resolution photography, campaign reels, and boutique assets in Supabase Storage.
          </p>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5">
          <Upload className="h-3.5 w-3.5" />
          <span>Upload Media</span>
        </Button>
      </div>

      <EmptyState
        icon={<ImageIcon className="h-5 w-5" />}
        title="No Media Assets Uploaded"
        description="Connect to Supabase Storage buckets (products, banners, logos) in Phase 8."
        actionLabel="Select Local File"
      />
    </div>
  );
};
