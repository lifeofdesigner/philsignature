import React, { useState } from 'react';
import { TicketPercent, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { Coupon } from '@/types/database';

export const AdminCouponsPage: React.FC = () => {
  const [coupons] = useState<Coupon[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Promotions Engine
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">
            Privilege Coupons
          </h1>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          <span>New Coupon</span>
        </Button>
      </div>

      {coupons.length === 0 ? (
        <EmptyState
          icon={<TicketPercent className="h-5 w-5" />}
          title="No Active Coupons"
          description="Create percentage or fixed price discount codes with expiry and minimum spend limits."
        />
      ) : (
        <div />
      )}
    </div>
  );
};

