import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Shield, Search, Loader2, Check, X, History, Trash2, RefreshCw, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole, TrashItem } from '@/types/database';
import { ROLE_LABELS, ROLE_PERMISSIONS, type Permission } from '@/lib/permissions';
import { auditLogService } from '@/services/AuditLogService';
import { trashService } from '@/services/TrashService';
import type { ExtendedActivityLog } from '@/repositories/AuditLogRepository';

const ROLE_ORDER: UserRole[] = [
  'super_admin',
  'admin',
  'administrator',
  'store_manager',
  'content_manager',
  'marketing',
  'customer_support',
  'finance',
  'inventory_staff',
  'sales_staff',
  'order_staff',
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

export const AdminUsersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'staff';
  const { user: currentUser } = useAuth();
  const { users, isLoading, setRole, isSettingRoleId, setActiveStatus, isSettingActiveId } = useAdminUsers();
  const [search, setSearch] = useState('');
  const [auditLogs, setAuditLogs] = useState<ExtendedActivityLog[]>([]);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    if (currentTab === 'audit') {
      setIsLoadingLogs(true);
      auditLogService.fetchLogs(100).then((res) => {
        setAuditLogs(res);
        setIsLoadingLogs(false);
      });
    } else if (currentTab === 'trash') {
      setIsLoadingLogs(true);
      trashService.getTrashItems().then((res) => {
        setTrashItems(res);
        setIsLoadingLogs(false);
      });
    }
  }, [currentTab]);

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
      await auditLogService.recordAction('CHANGE_ROLE', 'user', userId, { new_role: role }, currentUser?.id);
      toast.success(`${name} role updated to ${ROLE_LABELS[role] || role}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update role.');
    }
  };

  const handleToggleActive = async (userId: string, name: string, current: boolean) => {
    try {
      await setActiveStatus({ userId, isActive: !current });
      await auditLogService.recordAction('TOGGLE_ACTIVE', 'user', userId, { is_active: !current }, currentUser?.id);
      toast.success(`${name} status set to ${!current ? 'Active' : 'Suspended'}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update account status.');
    }
  };

  const handleRestoreTrash = async (item: TrashItem) => {
    try {
      await trashService.restoreItem(item);
      setTrashItems((prev) => prev.filter((i) => i.id !== item.id));
      await auditLogService.recordAction('RESTORE_TRASH', item.entity_type, item.entity_id, { name: item.entity_name }, currentUser?.id);
      toast.success(`Restored ${item.entity_name} successfully.`);
    } catch (err) {
      toast.error('Failed to restore item.');
    }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Users, Roles & Audit Security (RBAC)
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Database-driven permission matrix, staff directory, audit trail logs, and recycle bin.
          </p>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        {[
          { id: 'staff', label: 'Staff Directory & Roles', icon: Shield },
          { id: 'matrix', label: 'RBAC Permission Matrix', icon: Lock },
          { id: 'audit', label: 'Audit Trail Logs', icon: History },
          { id: 'trash', label: 'Recycle Bin / Trash', icon: Trash2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-amber-700 text-amber-950 font-bold bg-amber-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Staff Directory */}
      {currentTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search staff by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs bg-white border-slate-200 focus:border-amber-600"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Total Accounts: <span className="font-bold text-slate-900">{filteredUsers.length}</span>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200 font-medium">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role Tag</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {filteredUsers.map((u) => {
                      const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email;
                      const isMe = u.id === currentUser?.id;
                      const isUpdatingRole = isSettingRoleId === u.id;
                      const isUpdatingActive = isSettingActiveId === u.id;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={u.role}
                              disabled={isMe || isUpdatingRole}
                              onChange={(e) => handleRoleChange(u.id, name, e.target.value as UserRole)}
                              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-hidden focus:border-amber-600 disabled:opacity-50"
                            >
                              {ROLE_ORDER.map((r) => (
                                <option key={r} value={r}>
                                  {ROLE_LABELS[r] || r}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                u.is_active
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-red-50 text-red-800 border border-red-200'
                              }`}
                            >
                              {u.is_active ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isMe || isUpdatingActive}
                              onClick={() => handleToggleActive(u.id, name, u.is_active)}
                              className="text-xs h-7 px-2.5 border-slate-200 text-slate-700"
                            >
                              {isUpdatingActive ? <Loader2 className="h-3 w-3 animate-spin" /> : u.is_active ? 'Suspend' : 'Activate'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Permission Matrix */}
      {currentTab === 'matrix' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">Database Role & Permission Matrix</CardTitle>
            <CardDescription>Visual matrix of default permission definitions stored in Supabase</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold border-r border-slate-200 w-64">Permission Name</th>
                    {ROLE_ORDER.slice(0, 7).map((r) => (
                      <th key={r} className="py-3 px-3 font-semibold text-center border-r border-slate-200 min-w-[100px]">
                        {ROLE_LABELS[r]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PERMISSION_GROUPS.map((group) => (
                    <React.Fragment key={group.label}>
                      <tr className="bg-slate-100/70 text-slate-900 font-bold uppercase tracking-wider text-[10px]">
                        <td colSpan={8} className="py-2 px-4 border-y border-slate-200">
                          {group.label}
                        </td>
                      </tr>
                      {group.permissions.map((perm) => (
                        <tr key={perm.key} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-medium text-slate-800 border-r border-slate-200">
                            <div>{perm.label}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{perm.key}</div>
                          </td>
                          {ROLE_ORDER.slice(0, 7).map((r) => {
                            const has = ROLE_PERMISSIONS[r]?.includes(perm.key);
                            return (
                              <td key={r} className="py-2.5 px-3 text-center border-r border-slate-100">
                                {has ? (
                                  <span className="inline-flex p-1 rounded bg-emerald-100 text-emerald-800">
                                    <Check className="h-3.5 w-3.5" />
                                  </span>
                                ) : (
                                  <span className="inline-flex p-1 rounded text-slate-300">
                                    <X className="h-3.5 w-3.5" />
                                  </span>
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
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Audit Trail Logs */}
      {currentTab === 'audit' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <History className="h-4 w-4 text-amber-700" />
              <span>Audit Trail Activity Logs</span>
            </CardTitle>
            <CardDescription>Immutable record of all admin edits, role changes, and system events</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingLogs ? (
              <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-amber-600" /></div>
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No activity logs recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200 font-medium">
                    <tr>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Entity</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{log.user_email}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 uppercase">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{log.entity_type}</td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Recycle Bin */}
      {currentTab === 'trash' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-amber-700" />
              <span>Soft Delete Recycle Bin</span>
            </CardTitle>
            <CardDescription>Recover deleted products, pages, menus, or media instantly</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingLogs ? (
              <div className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-amber-600" /></div>
            ) : trashItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Recycle Bin is currently empty.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200 font-medium">
                    <tr>
                      <th className="py-3 px-4">Item Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Deleted Date</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trashItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">{item.entity_name}</td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{item.entity_type}</td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">{new Date(item.created_at).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            onClick={() => handleRestoreTrash(item)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-7 px-2.5 gap-1"
                          >
                            <RefreshCw className="h-3 w-3" /> Restore
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminUsersPage;
