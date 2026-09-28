import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Shield,
  Search,
  Loader2,
  Check,
  X,
  History,
  Trash2,
  RefreshCw,
  Lock,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  UserPlus,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole, TrashItem } from '@/types/database';
import {
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  type Permission,
  isSuperAdmin,
  hasPermission,
} from '@/lib/permissions';
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
];

const PERMISSION_GROUPS: { label: string; description: string; permissions: { key: Permission; label: string }[] }[] = [
  {
    label: 'Website Content & CMS',
    description: 'Control storefront pages, hero banners, visual layout and design',
    permissions: [
      { key: 'cms:read', label: 'View website content' },
      { key: 'cms:write', label: 'Edit website content' },
      { key: 'cms:publish', label: 'Publish content live' },
      { key: 'cms:hero', label: 'Edit hero slider' },
      { key: 'cms:menu', label: 'Edit navigation menus' },
      { key: 'cms:homepage', label: 'Rearrange homepage sections' },
      { key: 'cms:appearance', label: 'Change brand colors & theme' },
    ],
  },
  {
    label: 'Catalog & Formulations',
    description: 'Perfumes, categories, collections, and media assets',
    permissions: [
      { key: 'products:read', label: 'View products & formulations' },
      { key: 'products:write', label: 'Add & edit products' },
      { key: 'products:delete', label: 'Delete products' },
      { key: 'inventory:manage', label: 'Manage stock levels' },
      { key: 'categories:manage', label: 'Manage fragrance categories' },
      { key: 'collections:manage', label: 'Manage collections' },
      { key: 'media:manage', label: 'Manage media asset vault' },
    ],
  },
  {
    label: 'Commerce, Orders & Logistics',
    description: 'Checkout fulfillment, dispatch tracking, shipping zones, and payments',
    permissions: [
      { key: 'orders:read', label: 'View customer orders' },
      { key: 'orders:write', label: 'Edit orders & addresses' },
      { key: 'orders:shipping', label: 'Update courier tracking' },
      { key: 'shipping:manage', label: 'Manage shipping zones & rates' },
      { key: 'payments:view', label: 'View payment gateways' },
      { key: 'analytics:view', label: 'View executive sales analytics' },
    ],
  },
  {
    label: 'Customers & Promotions',
    description: 'Customer directory, reviews moderation, and privilege discount coupons',
    permissions: [
      { key: 'customers:read', label: 'View customer profiles' },
      { key: 'customers:write', label: 'Edit customer status' },
      { key: 'reviews:manage', label: 'Moderate customer reviews' },
      { key: 'coupons:manage', label: 'Manage discount coupons' },
    ],
  },
  {
    label: 'System, Roles & Security',
    description: 'High-privilege system configuration and user management',
    permissions: [
      { key: 'users:read', label: 'View staff directory' },
      { key: 'users:manage', label: 'Manage staff accounts' },
      { key: 'roles:manage', label: 'Assign & elevate roles' },
      { key: 'settings:manage', label: 'Edit general store settings' },
      { key: 'security:manage', label: 'Manage security & RBAC' },
      { key: 'delete:anything', label: 'Permanently delete records' },
    ],
  },
];

export const AdminUsersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'staff';
  const { user: currentUser, profile, role } = useAuth();
  const currentRole = (profile?.role || role || undefined) as UserRole | undefined;
  const userIsSuperAdmin = isSuperAdmin(currentRole);
  const canManageRoles = userIsSuperAdmin || hasPermission(currentRole, 'roles:manage');
  const assignableRoles = userIsSuperAdmin ? ROLE_ORDER : ROLE_ORDER.filter((r) => r !== 'super_admin');

  const {
    users,
    isLoading,
    setRole,
    isSettingRoleId,
    setActiveStatus,
    isSettingActiveId,
    createUser,
    isCreatingUser,
    canCreateUsers,
    rbacMatrix,
    isLoadingRbac,
    saveRbacMatrix,
    isSavingRbac,
    resetRbacMatrix,
    isResettingRbac,
  } = useAdminUsers();

  const [search, setSearch] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'staff' as UserRole,
  });
  const [auditLogs, setAuditLogs] = useState<ExtendedActivityLog[]>([]);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Local editable copy of the matrix
  const [localMatrix, setLocalMatrix] = useState<Record<UserRole, Permission[]>>(rbacMatrix);
  const [selectedMatrixRole, setSelectedMatrixRole] = useState<UserRole>('admin');

  useEffect(() => {
    if (rbacMatrix) {
      setLocalMatrix(rbacMatrix);
    }
  }, [rbacMatrix]);

  useEffect(() => {
    if (currentTab === 'matrix' && !userIsSuperAdmin) {
      setSearchParams({ tab: 'staff' });
    }
  }, [currentTab, userIsSuperAdmin, setSearchParams]);

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

  // Non-super-admins must never learn who holds the Super Admin role, so
  // those accounts are excluded from the staff directory entirely for them.
  const visibleUsers = useMemo(
    () => (userIsSuperAdmin ? users : users.filter((u) => u.role !== 'super_admin')),
    [users, userIsSuperAdmin]
  );

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return visibleUsers;
    return visibleUsers.filter(
      (u) =>
        u.email.toLowerCase().includes(query) ||
        `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(query)
    );
  }, [visibleUsers, search]);

  const handleRoleChange = async (userId: string, name: string, newRole: UserRole) => {
    if (newRole === 'super_admin' && !userIsSuperAdmin) {
      toast.error('Only a Super Administrator can assign the Super Admin role.');
      return;
    }
    try {
      await setRole({ userId, role: newRole });
      await auditLogService.recordAction('CHANGE_ROLE', 'user', userId, { new_role: newRole }, currentUser?.id);
      toast.success(`${name} role updated to ${ROLE_LABELS[newRole] || newRole}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update role.');
    }
  };

  const handleToggleActive = async (userId: string, name: string, current: boolean, targetRole: UserRole) => {
    if (targetRole === 'super_admin' && !userIsSuperAdmin) {
      toast.error('Only a Super Administrator can suspend or reactivate a Super Admin account.');
      return;
    }
    try {
      await setActiveStatus({ userId, isActive: !current });
      await auditLogService.recordAction('TOGGLE_ACTIVE', 'user', userId, { is_active: !current }, currentUser?.id);
      toast.success(`${name} status set to ${!current ? 'Active' : 'Suspended'}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update account status.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.role === 'super_admin' && !userIsSuperAdmin) {
      toast.error('Only a Super Administrator can create a Super Admin account.');
      return;
    }
    try {
      await createUser(newUser);
      await auditLogService.recordAction(
        'CREATE_USER',
        'user',
        newUser.email,
        { role: newUser.role },
        currentUser?.id
      );
      toast.success(`${ROLE_LABELS[newUser.role] || newUser.role} account created for ${newUser.email}.`);
      setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'staff' });
      setShowCreateUser(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create account.');
    }
  };

  const handleRestoreTrash = async (item: TrashItem) => {
    try {
      await trashService.restoreItem(item);
      setTrashItems((prev) => prev.filter((i) => i.id !== item.id));
      await auditLogService.recordAction('RESTORE_TRASH', item.entity_type, item.entity_id, { name: item.entity_name }, currentUser?.id);
      toast.success(`Restored ${item.entity_name} successfully.`);
    } catch {
      toast.error('Failed to restore item.');
    }
  };

  // Matrix manipulation helpers
  const handleTogglePermission = (targetRole: UserRole, permKey: Permission) => {
    if (targetRole === 'super_admin') {
      toast.info('Super Administrator permissions are fully enabled by system design and cannot be restricted.');
      return;
    }
    setLocalMatrix((prev) => {
      const currentList = prev[targetRole] || [];
      const exists = currentList.includes(permKey);
      const updatedList = exists
        ? currentList.filter((p) => p !== permKey)
        : [...currentList, permKey];
      return {
        ...prev,
        [targetRole]: updatedList,
      };
    });
  };


  const handleSaveMatrix = async () => {
    try {
      await saveRbacMatrix(localMatrix);
      await auditLogService.recordAction('UPDATE_RBAC_MATRIX', 'security', 'role_permissions', { updated_by: currentUser?.email }, currentUser?.id);
      toast.success('Role permissions matrix saved successfully to database.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save role permissions.');
    }
  };

  const handleResetMatrix = async () => {
    if (!confirm('Reset all role permissions to standard system defaults?')) return;
    try {
      const def = await resetRbacMatrix();
      setLocalMatrix(def);
      await auditLogService.recordAction('RESET_RBAC_MATRIX', 'security', 'role_permissions', {}, currentUser?.id);
      toast.success('Role permissions reset to default system configuration.');
    } catch {
      toast.error('Failed to reset role permissions.');
    }
  };

  if (isLoading || isLoadingRbac) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      {/* SaaS Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">
            Users, Roles &amp; Access Control (RBAC)
          </h1>
          <p className="text-xs text-black font-semibold mt-1">
            Configure dynamic role permissions, assign staff roles, and monitor system audit activity.
          </p>
        </div>

        {userIsSuperAdmin && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span>Super Admin Mode</span>
            </span>
          </div>
        )}
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        {[
          { id: 'staff', label: 'Staff Directory & Roles', icon: Shield },
          { id: 'matrix', label: 'Role Permissions Matrix', icon: Lock, superAdminOnly: true },
          { id: 'audit', label: 'Audit Trail Logs', icon: History },
          { id: 'trash', label: 'Recycle Bin', icon: Trash2 },
        ].filter((tab) => !tab.superAdminOnly || userIsSuperAdmin).map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-slate-900 text-black font-bold bg-slate-100/80'
                  : 'border-transparent text-black hover:text-black hover:border-slate-300'
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black" />
              <Input
                placeholder="Search staff by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs bg-white border-slate-300 text-black focus:border-slate-900"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-black font-medium">
                Total Accounts: <span className="font-bold text-black">{filteredUsers.length}</span>
              </div>
              {canManageRoles && canCreateUsers && (
                <Button
                  size="sm"
                  onClick={() => setShowCreateUser(true)}
                  className="gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>New Staff / Admin Account</span>
                </Button>
              )}
            </div>
          </div>

          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 text-black uppercase tracking-wider border-b border-slate-200 font-bold">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Assigned Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Account Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {filteredUsers.map((u) => {
                      const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email;
                      const isMe = u.id === currentUser?.id;
                      const isUpdatingRole = isSettingRoleId === u.id;
                      const isUpdatingActive = isSettingActiveId === u.id;
                      // Regular admins can manage roles, but never on a Super Admin's own row.
                      const canEditThisRole = canManageRoles && (userIsSuperAdmin || u.role !== 'super_admin');

                      return (
                        <tr key={u.id} className="hover:bg-slate-100 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-black text-sm">{name}</div>
                            <div className="text-xs text-black font-mono mt-0.5">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            {canEditThisRole ? (
                              <select
                                value={u.role}
                                disabled={isMe || isUpdatingRole}
                                onChange={(e) => handleRoleChange(u.id, name, e.target.value as UserRole)}
                                className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-black font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:opacity-60 disabled:bg-white shadow-2xs"
                              >
                                {assignableRoles.map((r) => (
                                  <option key={r} value={r}>
                                    {ROLE_LABELS[r] || r}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold text-black bg-slate-100 border border-slate-200">
                                {ROLE_LABELS[u.role] || u.role}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                u.is_active
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}
                            >
                              {u.is_active ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {canEditThisRole ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isMe || isUpdatingActive}
                                onClick={() => handleToggleActive(u.id, name, u.is_active, u.role)}
                                className={`text-xs h-7 px-2.5 font-medium border-slate-300 ${
                                  u.is_active
                                    ? 'text-rose-700 hover:bg-rose-50 hover:text-rose-800'
                                    : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
                                }`}
                              >
                                {isUpdatingActive ? <Loader2 className="h-3 w-3 animate-spin" /> : u.is_active ? 'Suspend Account' : 'Reactivate'}
                              </Button>
                            ) : (
                              <span className="text-xs text-black font-medium">—</span>
                            )}
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

      {/* Tab 2: Dynamic Permission Matrix (Super Admin only) */}
      {currentTab === 'matrix' && userIsSuperAdmin && (
        <div className="space-y-6">
          {/* Header Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-black" />
                <h3 className="text-base font-bold text-black">Custom Role-Based Access Control</h3>
              </div>
              <p className="text-xs text-black font-normal mt-1">
                {userIsSuperAdmin
                  ? 'Check or uncheck permissions for any role. Click "Save Permissions" to persist changes to database.'
                  : 'View permissions assigned to each system role. Contact Super Administrator to request permission changes.'}
              </p>
            </div>

            {userIsSuperAdmin && (
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetMatrix}
                  disabled={isResettingRbac || isSavingRbac}
                  className="gap-1.5 text-xs text-black border-slate-300 hover:bg-slate-100 font-medium"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-black" />
                  <span>Reset to Defaults</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handleSaveMatrix}
                  disabled={isSavingRbac || isResettingRbac}
                  className="gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs"
                >
                  {isSavingRbac ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>Save Role Permissions</span>
                </Button>
              </div>
            )}
          </div>

          {/* Quick Role Inspector / Single Role Mode Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-black">Highlight Focus Role:</span>
              <select
                value={selectedMatrixRole}
                onChange={(e) => setSelectedMatrixRole(e.target.value as UserRole)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1 text-xs font-semibold text-black focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {ROLE_ORDER.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]} {r === 'super_admin' ? '(Locked)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-black font-medium flex items-center gap-1.5">
              <Info className="h-4 w-4 text-black" />
              <span>{ROLE_DESCRIPTIONS[selectedMatrixRole]}</span>
            </div>
          </div>

          {/* Full Interactive Matrix Table */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-black uppercase tracking-wider border-b border-slate-200 font-bold">
                    <tr>
                      <th className="py-3.5 px-4 border-r border-slate-200 w-80 text-black">
                        Capability / Permission
                      </th>
                      {ROLE_ORDER.slice(0, 8).map((r) => {
                        const isFocused = r === selectedMatrixRole;
                        return (
                          <th
                            key={r}
                            className={`py-3 px-3 text-center border-r border-slate-200 min-w-[120px] transition-colors ${
                              isFocused ? 'bg-slate-900 text-white' : 'text-black'
                            }`}
                          >
                            <div className="font-bold">{ROLE_LABELS[r]}</div>
                            {r === 'super_admin' && (
                              <span className="text-[9px] font-mono tracking-normal block text-slate-300 mt-0.5">
                                Full Root
                              </span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {PERMISSION_GROUPS.map((group) => (
                      <React.Fragment key={group.label}>
                        <tr className="bg-slate-200/80 text-black font-bold uppercase tracking-wider text-[11px]">
                          <td colSpan={9} className="py-2.5 px-4 border-y border-slate-300">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-black">{group.label}</span>
                              <span className="text-[10px] font-normal text-black normal-case">
                                {group.description}
                              </span>
                            </div>
                          </td>
                        </tr>
                        {group.permissions.map((perm) => (
                          <tr key={perm.key} className="hover:bg-slate-100 transition-colors">
                            <td className="py-3 px-4 font-semibold text-black border-r border-slate-200">
                              <div className="text-black font-medium">{perm.label}</div>
                              <div className="text-[10px] text-black font-mono mt-0.5">{perm.key}</div>
                            </td>
                            {ROLE_ORDER.slice(0, 8).map((r) => {
                              const isSuper = r === 'super_admin';
                              const rolePerms = localMatrix[r] || [];
                              const has = isSuper || rolePerms.includes(perm.key);
                              const isFocused = r === selectedMatrixRole;

                              return (
                                <td
                                  key={r}
                                  className={`py-3 px-3 text-center border-r border-slate-100 transition-colors ${
                                    isFocused ? 'bg-white' : ''
                                  }`}
                                >
                                  {isSuper ? (
                                    <span className="inline-flex items-center justify-center h-6 w-6 rounded bg-emerald-100 text-emerald-800 font-bold">
                                      <Check className="h-4 w-4" />
                                    </span>
                                  ) : userIsSuperAdmin ? (
                                    <button
                                      type="button"
                                      onClick={() => handleTogglePermission(r, perm.key)}
                                      className={`inline-flex items-center justify-center h-6 w-6 rounded border transition-all cursor-pointer ${
                                        has
                                          ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                                          : 'bg-white border-slate-300 text-transparent hover:border-slate-500'
                                      }`}
                                      title={`${has ? 'Revoke' : 'Grant'} ${perm.label} for ${ROLE_LABELS[r]}`}
                                    >
                                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                                    </button>
                                  ) : (
                                    <span
                                      className={`inline-flex p-1 rounded ${
                                        has
                                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                          : 'text-black'
                                      }`}
                                    >
                                      {has ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
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
        </div>
      )}

      {/* Tab 3: Audit Trail Logs */}
      {currentTab === 'audit' && (
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-base font-bold text-black flex items-center gap-2">
              <History className="h-4 w-4 text-black" />
              <span>Audit Trail Activity Logs</span>
            </CardTitle>
            <CardDescription className="text-black">
              Immutable chronological record of administrative actions, permission edits, and database updates
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingLogs ? (
              <div className="p-8 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-black" />
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-black">No activity logs recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-black uppercase tracking-wider border-b border-slate-200 font-bold">
                    <tr>
                      <th className="py-3 px-4">Date &amp; Time</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Entity</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-100 transition-colors">
                        <td className="py-3 px-4 font-mono text-black text-xs">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-black">{log.user_email}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-black border border-slate-300 uppercase">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-black font-mono text-xs">{log.entity_type}</td>
                        <td className="py-3 px-4 text-black font-mono text-[11px] max-w-md truncate">
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
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-base font-bold text-black flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-black" />
              <span>Soft Delete Recycle Bin</span>
            </CardTitle>
            <CardDescription className="text-black">
              Recover accidentally deleted products, collections, categories, or media items
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingLogs ? (
              <div className="p-8 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-black" />
              </div>
            ) : trashItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-black">Recycle Bin is currently empty.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-black uppercase tracking-wider border-b border-slate-200 font-bold">
                    <tr>
                      <th className="py-3 px-4">Item Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Deleted Date</th>
                      <th className="py-3 px-4 text-right">Recovery Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trashItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-100 transition-colors">
                        <td className="py-3 px-4 font-bold text-black">{item.entity_name}</td>
                        <td className="py-3 px-4 font-mono text-black text-xs">{item.entity_type}</td>
                        <td className="py-3 px-4 text-black text-xs">{new Date(item.created_at).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            onClick={() => handleRestoreTrash(item)}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-7 px-3 gap-1.5 font-semibold"
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

      {/* Create Staff / Admin Account Modal (any role with roles:manage; Super Admin role reserved for Super Admins) */}
      {showCreateUser && canManageRoles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 space-y-5 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-black" />
                <span>New Staff / Admin Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateUser(false)}
                className="text-black hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="First name"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser((p) => ({ ...p, firstName: e.target.value }))}
                  required
                  className="!bg-white !text-black placeholder:!text-black !border-slate-300 text-xs"
                />
                <Input
                  placeholder="Last name"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser((p) => ({ ...p, lastName: e.target.value }))}
                  required
                  className="!bg-white !text-black placeholder:!text-black !border-slate-300 text-xs"
                />
              </div>
              <Input
                type="email"
                placeholder="Email address"
                value={newUser.email}
                onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                required
                className="!bg-white !text-black placeholder:!text-black !border-slate-300 text-xs"
              />
              <Input
                type="password"
                placeholder="Password (min 8 chars, mixed case, symbols)"
                value={newUser.password}
                onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                required
                className="!bg-white !text-black placeholder:!text-black !border-slate-300 text-xs"
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-black">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value as UserRole }))}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-black font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {assignableRoles.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r] || r}
                    </option>
                  ))}
                </select>
                {!userIsSuperAdmin && (
                  <p className="text-[11px] text-black font-medium">
                    Only a Super Administrator can create another Super Admin account.
                  </p>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateUser(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isCreatingUser}
                  className="gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                >
                  {isCreatingUser ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                  <span>{isCreatingUser ? 'Creating...' : 'Create Account'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
