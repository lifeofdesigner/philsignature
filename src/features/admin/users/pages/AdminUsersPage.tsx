import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Shield, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/database';

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { users, isLoading, isError, setRole, isSettingRoleId, setActiveStatus, isSettingActiveId } = useAdminUsers();
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(query) ||
        `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(query)
    );
  }, [users, search]);

  const handleRoleChange = async (userId: string, name: string, role: UserRole) => {
    try {
      await setRole({ userId, role });
      toast.success(`${name} is now ${role.replace('_', ' ')}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update role.');
    }
  };

  const handleToggleActive = async (userId: string, name: string, current: boolean) => {
    try {
      await setActiveStatus({ userId, isActive: !current });
      toast.success(`${name} was ${!current ? 'reactivated' : 'deactivated'}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update account status.');
    }
  };

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={<Shield className="h-5 w-5" />}
        title="Unable to Load Users"
        description="The staff directory could not be retrieved from Supabase. Please retry."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">Staff & Permissions</span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">Users & Roles (RBAC)</h1>
          <p className="text-xs text-luxury-muted font-light mt-1">
            Promote, demote, and manage access for every registered account.
          </p>
        </div>
      </div>

      {users.length > 0 && (
        <div className="bg-luxury-card border border-luxury-border p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-luxury-muted" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-luxury-charcoal"
            />
          </div>
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Shield className="h-5 w-5" />}
          title={users.length === 0 ? 'No Users Found' : 'No Matching Users'}
          description={
            users.length === 0
              ? 'Registered accounts will appear here once patrons sign up or staff are provisioned.'
              : 'Try adjusting your search query.'
          }
        />
      ) : (
        <div className="bg-luxury-card border border-luxury-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-luxury-border text-left text-[10px] uppercase tracking-wider text-luxury-muted">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || '—';
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="border-b border-luxury-border/60 last:border-0 hover:bg-luxury-charcoal/40">
                    <td className="p-4">
                      <div className="text-white font-medium">{name}</div>
                      <div className="text-[11px] text-luxury-muted font-mono">{u.email}</div>
                    </td>
                    <td className="p-4 text-luxury-muted text-xs">{formatDate(u.created_at)}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] uppercase font-semibold border ${
                          u.role === 'super_admin'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-600/60'
                            : u.role === 'staff'
                            ? 'bg-blue-950/60 text-blue-300 border-blue-600/60'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-medium border ${
                          u.is_active
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                            : 'text-red-400 border-red-500/30 bg-red-500/10'
                        }`}
                      >
                        {u.is_active ? 'active' : 'deactivated'}
                      </span>
                    </td>
                    <td className="p-4">
                      {isSelf ? (
                        <span className="text-[10px] text-luxury-muted italic">Current session</span>
                      ) : isSettingRoleId === u.id || isSettingActiveId === u.id ? (
                        <div className="flex justify-end">
                          <Loader2 className="h-4 w-4 animate-spin text-luxury-muted" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {u.role !== 'customer' && (
                            <Button variant="outline" size="sm" className="text-[10px] h-7 px-2" onClick={() => handleRoleChange(u.id, name, 'customer')}>
                              Set Customer
                            </Button>
                          )}
                          {u.role !== 'staff' && (
                            <Button variant="outline" size="sm" className="text-[10px] h-7 px-2" onClick={() => handleRoleChange(u.id, name, 'staff')}>
                              Set Staff
                            </Button>
                          )}
                          {u.role !== 'super_admin' && (
                            <Button variant="luxury" size="sm" className="text-[10px] h-7 px-2" onClick={() => handleRoleChange(u.id, name, 'super_admin')}>
                              Promote Admin
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] h-7 px-2"
                            onClick={() => handleToggleActive(u.id, name, u.is_active)}
                          >
                            {u.is_active ? 'Deactivate' : 'Reactivate'}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
