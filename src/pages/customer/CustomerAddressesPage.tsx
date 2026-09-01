import React, { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { CustomerAddress } from '@/types/database';

export const CustomerAddressesPage: React.FC = () => {
  const [addresses] = useState<CustomerAddress[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            Delivery Addresses
          </span>
          <h1 className="font-serif text-2xl text-white font-normal mt-1">
            Saved Destinations
          </h1>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          <span>Add Address</span>
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-5 w-5" />}
          title="No Delivery Addresses Saved"
          description="Save primary and secondary shipping locations for seamless one-click boutique checkout."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Address cards */}
        </div>
      )}
    </div>
  );
};
