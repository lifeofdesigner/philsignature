import React, { useState } from 'react';
import { Shield, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import type { Profile } from '@/types/database';

export const AdminUsersPage: React.FC = () => {
  const [users] = useState<Profile[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Staff & Permissions
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">
            Users & Roles (RBAC)
          </h1>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          <span>Invite Staff Member</span>
        </Button>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={<Shield className="h-5 w-5" />}
          title="Staff Directory Initializing"
          description="Role assignments (Super Admin, Staff, Customer) are ready to configure in Supabase."
        />
      ) : (
        <div />
      )}
    </div>
  );
};

