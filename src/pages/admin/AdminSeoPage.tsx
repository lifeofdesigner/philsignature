import React from 'react';
import { Globe, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const AdminSeoPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Search Visibility
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">
            SEO & Metadata Engine
          </h1>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5">
          <Save className="h-3.5 w-3.5" />
          <span>Save Metadata</span>
        </Button>
      </div>

      <div className="bg-luxury-card border border-luxury-border p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-luxury-border/60 pb-3">
          <Globe className="h-4 w-4 text-luxury-gold" />
          <h3 className="font-serif text-lg text-white font-normal">
            Global Search Engine Defaults
          </h3>
        </div>

        <Input
          label="Default Meta Title"
          defaultValue="PHILZ SIGNATURE | Luxury Parfums & Artisanal Fragrance House"
        />
        <Textarea
          label="Default Meta Description"
          rows={3}
          defaultValue="Discover PHILZ SIGNATURE. An ultra-luxury perfume house creating rare, handcrafted extraits de parfum, artisanal home scents, and bespoke olfactory creations."
        />
        <Input
          label="Keywords (comma separated)"
          defaultValue="luxury perfume, extrait de parfum, oud, niche fragrance, Lagos perfume boutique"
        />
      </div>
    </div>
  );
};
