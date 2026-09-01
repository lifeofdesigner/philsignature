import React from 'react';
import { Truck, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const AdminShippingPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Logistics & Delivery
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">
            Shipping Methods
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="luxury" size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>Add Delivery Zone</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            <span>Save Rules</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-luxury-gold" />
            <h3 className="font-serif text-lg text-white font-normal">
              Nationwide Standard Delivery
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Flat Rate (NGN)" defaultValue="5000" />
            <Input label="Free Shipping Threshold (NGN)" defaultValue="150000" />
            <Input label="Estimated Transit (Days)" defaultValue="2-4 Business Days" />
          </div>
        </div>

        <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-luxury-gold" />
            <h3 className="font-serif text-lg text-white font-normal">
              Lagos Express Courier
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Express Rate (NGN)" defaultValue="8000" />
            <Input label="Free Shipping Threshold (NGN)" defaultValue="200000" />
            <Input label="Estimated Transit" defaultValue="Same Day / 24 Hours" />
          </div>
        </div>
      </div>
    </div>
  );
};

