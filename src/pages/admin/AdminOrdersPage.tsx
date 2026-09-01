import React, { useState } from 'react';
import { ShoppingBag, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { Order } from '@/types/database';

export const AdminOrdersPage: React.FC = () => {
  const [orders] = useState<Order[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Fulfillment & Consignments
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">
            Orders
          </h1>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </Button>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-5 w-5" />}
          title="No Orders Received"
          description="Customer orders with real-time status updates (Pending, Paid, Packed, Shipped, Delivered) will appear here."
        />
      ) : (
        <div>{/* Orders table in Phase 7 */}</div>
      )}
    </div>
  );
};
