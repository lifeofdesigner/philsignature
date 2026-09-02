import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Shield, Search, Loader2, ChevronDown, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/database';
import { ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS, type Permission } from '@/lib/permissions';

const ROLE_ORDER: UserRole[] = [
  'super_admin',
  'administrator',
  'manager',
  'content_editor',
  'inventory_staff',
  'order_staff',
  'customer_support',
  'staff',
  'customer',
];

const PERMISSION_GROUPS: { label: string; permissions: { key: Permission; label: string }[] }[] = [
  {
    label: 'Website Content',
    permissions: [
      { key: 'cms:read', label: 'View website content' },
      { key: 'cms:write', label: 'Edit website content' },
      { key: 'cms:publish', label: 'Publish content live' },
      { key: 'cms:hero', label: 'Edit homepage slider' },
      { key: 'cms:menu', label: 'Edit navigation menus' },
      { key: 'cms:homepage', label: 'Rearrange homepage sections' },
      { key: 'cms:appearance', label: 'Change colors & branding' },
    ],
  },
  {
    label: 'Catalog & Inventory',
    permissions: [
      { key: 'products:read', label: 'View products' },
      { key: 'products:write', label: 'Add & edit products' },
      { key: 'products:delete', label: 'Delete products' },
      { key: 'inventory:manage', label: 'Manage stock levels' },
      { key: 'categories:manage', label: 'Manage categories' },
      { key: 'collections:manage', label: 'Manage collections' },
      { key: 'media:manage', label: 'Manage media library' },
    ],
  },
  {
    label: 'Sales & Orders',
    permissions: [
      { key: 'orders:read', label: 'View orders' },
      { key: 'orders:write', label: 'Edit orders' },
      { key: 'orders:shipping', label: 'Update fulfillment status' },
      { key: 'shipping:manage', label: 'Manage shipping methods' },
      { key: 'payments:view', label: 'View payment settings' },
      { key: 'analytics:view', label: 'View sales analytics' },
    ],
  },
  {
    label: 'Customers & Community',
    permissions: [
      { key: 'customers:read', label: 'View customers' },
      { key: 'customers:write', label: 'Edit customer accounts' },
      { key: 'reviews:manage', label: 'Moderate reviews' },
      { key: 'coupons:manage', label: 'Manage discount codes' },
    ],
  },
  {
    label: 'Administration & Security',
    permissions: [
      { key: 'users:read', label: 'View staff & customers' },
      { key: 'users:manage', label: 'Manage staff accounts' },
      { key: 'roles:manage', label: 'Assign roles' },
      { key: 'settings:manage', label: 'Change store settings' },
      { key: 'security:manage', label: 'Manage security settings' },
      { key: 'delete:anything', label: 'Delete any record' },
    ],
  },
];

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { users, isLoading, isError, setRole, isSettingRoleId, setActiveStatus, isSettingActiveId } = useAdminUsers();
  const [search, setSearch] = useState('');
  const [showMatrix, setShowMatrix] = useState(false);

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
                      <select
                        value={u.role}
                        disabled={isSelf || isSettingRoleId === u.id}
                        onChange={(e) => handleRoleChange(u.id, name, e.target.value as UserRole)}
                        className="bg-luxury-card border border-luxury-border text-[11px] text-luxury-cream px-2 py-1 rounded-sm focus:ring-1 focus:ring-luxury-gold focus:outline-none cursor-pointer"
                      >
                        {ROLE_ORDER.map((role) => (
                          <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                        ))}
                      </select>
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
                        <div className="flex items-center justify-end gap-2">
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

      <div className="bg-luxury-card border border-luxury-border">
        <button
          type="button"
          onClick={() => setShowMatrix((p) => !p)}
          className="w-full flex items-center justify-between p-4 cursor-pointer"
        >
          <div className="text-left">
            <h3 className="font-serif text-lg text-white font-normal">What Each Role Can Do</h3>
            <p className="text-xs text-luxury-muted font-light mt-0.5">
              A plain-English breakdown of what every role is allowed to access.
            </p>
          </div>
          <ChevronDown className={`h-4 w-4 text-luxury-muted transition-transform ${showMatrix ? 'rotate-180' : ''}`} />
        </button>

        {showMatrix && (
          <div className="border-t border-luxury-border/60 p-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ROLE_ORDER.filter((r) => r !== 'customer').map((role) => (
                <div key={role} className="bg-luxury-charcoal/40 border border-luxury-border p-3">
                  <p className="text-xs font-medium text-luxury-gold">{ROLE_LABELS[role]}</p>
                  <p className="text-[11px] text-luxury-muted mt-1 leading-relaxed">{ROLE_DESCRIPTIONS[role]}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-luxury-card p-2 text-left text-[10px] uppercase tracking-wider text-luxury-muted font-medium border-b border-luxury-border">
                      Permission
                    </th>
                    {ROLE_ORDER.filter((r) => r !== 'customer').map((role) => (
                      <th
                        key={role}
                        className="p-2 text-center text-[9px] uppercase tracking-wider text-luxury-muted font-medium border-b border-luxury-border whitespace-nowrap"
                      >
                        {ROLE_LABELS[role]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSION_GROUPS.map((group) => (
                    <React.Fragment key={group.label}>
                      <tr>
                        <td
                          colSpan={ROLE_ORDER.length}
                          className="pt-4 pb-1 px-2 text-[10px] uppercase tracking-wider text-luxury-gold font-medium"
                        >
                          {group.label}
                        </td>
                      </tr>
                      {group.permissions.map(({ key, label }) => (
                        <tr key={key} className="border-b border-luxury-border/40 hover:bg-luxury-charcoal/30">
                          <td className="sticky left-0 bg-luxury-card p-2 text-luxury-cream whitespace-nowrap">{label}</td>
                          {ROLE_ORDER.filter((r) => r !== 'customer').map((role) => {
                            const granted = ROLE_PERMISSIONS[role].includes(key);
                            return (
                              <td key={role} className="p-2 text-center">
                                {granted ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-400 inline-block" />
                                ) : (
                                  <X className="h-3.5 w-3.5 text-luxury-muted/30 inline-block" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
