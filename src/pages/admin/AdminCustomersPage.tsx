import React, { useState } from 'react';
import { Users, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { Profile } from '@/types/database';

export const AdminCustomersPage: React.FC = () => {
  const [customers] = useState<Profile[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Client Directory
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">
            Privileged Customers
          </h1>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </Button>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No Registered Patrons Yet"
          description="Customer accounts, lifetime value, and order records will synchronize here."
        />
      ) : (
        <div>{/* Customers list in Phase 7 */}</div>
      )}
    </div>
  );
};
