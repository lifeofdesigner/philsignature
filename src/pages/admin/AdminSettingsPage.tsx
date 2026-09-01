import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const AdminSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Global Boutique Preferences
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">
            Store Settings
          </h1>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5">
          <Save className="h-3.5 w-3.5" />
          <span>Save Changes</span>
        </Button>
      </div>

      <div className="bg-luxury-card border border-luxury-border p-6 space-y-6">
        <h3 className="font-serif text-lg text-white font-normal border-b border-luxury-border/60 pb-3">
          Brand & Identity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Store Name" defaultValue="PHILZ SIGNATURE" />
          <Input label="Official Slogan" defaultValue="Artisanal Parfums & Haute Fragrance" />
          <Input label="Contact Email" defaultValue="concierge@philzsignature.com" />
          <Input label="Boutique Phone" defaultValue="+234800000000" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Primary Currency Code" defaultValue="NGN" />
          <Input label="Currency Symbol" defaultValue="₦" />
        </div>
      </div>
    </div>
  );
};
