import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ROUTES } from '@/constants/routes';
import type { Order } from '@/types/database';

export const CustomerOrdersPage: React.FC = () => {
  const [orders] = useState<Order[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Order Archive
        </span>
        <h1 className="font-serif text-2xl text-white font-normal mt-1">
          Acquisitions History
        </h1>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-5 w-5" />}
          title="No Past Orders on Record"
          description="Your private fragrance acquisitions will be listed here once fulfilled."
          actionLabel="Explore Salon"
          onAction={() => window.location.assign(ROUTES.SHOP)}
        />
      ) : (
        <div className="space-y-4" />
      )}
    </div>
  );
};

