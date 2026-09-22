import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Users, Loader2, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { EnterpriseDataTable, type Column } from '@/components/common/EnterpriseDataTable';
import { useAdminCustomers, type CustomerWithStats } from '../hooks/useAdminCustomers';
import { auditLogService } from '@/services/AuditLogService';
import { useAuth } from '@/hooks/useAuth';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const AdminCustomersPage: React.FC = () => {
  const { user } = useAuth();
  const { customers, isLoading, isError, setActiveStatus, isUpdatingId } = useAdminCustomers();
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (statusFilter === 'active' && !c.is_active) return false;
      if (statusFilter === 'suspended' && c.is_active) return false;
      return true;
    });
  }, [customers, statusFilter]);

  const handleToggleActive = async (userId: string, currentStatus: boolean, name: string) => {
    try {
      await setActiveStatus({ userId, isActive: !currentStatus });
      await auditLogService.recordAction('TOGGLE_CUSTOMER_ACTIVE', 'customer', userId, { is_active: !currentStatus }, user?.id);
      if (selectedCustomer?.id === userId) {
        setSelectedCustomer({ ...selectedCustomer, is_active: !currentStatus });
      }
      toast.success(`${name} account was ${!currentStatus ? 'reactivated' : 'deactivated'}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update customer status.');
    }
  };

  const columns: Column<CustomerWithStats>[] = [
    {
      key: 'name',
      header: 'Customer',
      accessor: (c) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {(c.first_name?.[0] || c.email?.[0] || 'C').toUpperCase()}
          </div>
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => setSelectedCustomer(c)}
              className="font-bold text-slate-900 hover:text-slate-900 hover:underline text-left cursor-pointer truncate block"
            >
              {[c.first_name, c.last_name].filter(Boolean).join(' ') || 'Anonymous Patron'}
            </button>
            <div className="text-[11px] text-slate-700 font-mono truncate">{c.email}</div>
          </div>
        </div>
      ),
      sortValue: (c) => `${c.first_name || ''} ${c.last_name || ''}`,
    },
    {
      key: 'created_at',
      header: 'Member Since',
      accessor: (c) => <span className="text-slate-800 font-medium">{formatDate(c.created_at)}</span>,
      sortValue: (c) => c.created_at,
    },
    {
      key: 'orderCount',
      header: 'Orders',
      accessor: (c) => (
        <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
          {c.orderCount} orders
        </span>
      ),
      sortValue: (c) => c.orderCount,
    },
    {
      key: 'lifetimeSpend',
      header: 'Lifetime Spend',
      accessor: (c) => <span className="font-bold text-slate-900">{formatCurrency(c.lifetimeSpend)}</span>,
      sortValue: (c) => c.lifetimeSpend,
    },
    {
      key: 'is_active',
      header: 'Status',
      accessor: (c) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
            c.is_active
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-red-50 text-red-900 border border-red-300'
          }`}
        >
          {c.is_active ? 'Active' : 'Suspended'}
        </span>
      ),
      sortValue: (c) => (c.is_active ? 'Active' : 'Suspended'),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      accessor: (c) => {
        const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.email;
        const isUpdating = isUpdatingId === c.id;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedCustomer(c)}
              className="text-xs h-7 px-2.5 border-slate-300 text-slate-700 hover:bg-slate-50 gap-1 cursor-pointer"
            >
              <Eye className="h-3 w-3 text-slate-700" />
              <span>Inspect</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isUpdating}
              onClick={() => handleToggleActive(c.id, c.is_active, name)}
              className={`text-xs h-7 px-2.5 border-slate-300 ${
                c.is_active ? 'text-red-700 hover:bg-red-50' : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : c.is_active ? 'Suspend' : 'Reactivate'}
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={<Users className="h-5 w-5" />}
        title="Unable to Load Customers"
        description="The client directory could not be retrieved from Supabase. Please retry."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* SaaS Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Client & Customer Directory
          </h1>
          <p className="text-xs text-slate-700 font-semibold mt-1">
            Registered patrons, order history stats, lifetime acquisitions, and account standing.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Account Status:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(['all', 'active', 'suspended'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer capitalize ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-800 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? `All (${customers.length})` : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enterprise Data Table */}
      <EnterpriseDataTable
        data={filteredCustomers}
        columns={columns}
        keyExtractor={(c) => c.id}
        searchPlaceholder="Search customer name or email..."
        exportFilename="customers_directory.csv"
        defaultSortKey="lifetimeSpend"
        emptyMessage="No customer records found matching current filters."
      />

      {/* Customer Profile Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-lg p-6 rounded-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {(selectedCustomer.first_name?.[0] || selectedCustomer.email?.[0] || 'C').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {[selectedCustomer.first_name, selectedCustomer.last_name].filter(Boolean).join(' ') || 'Customer Profile'}
                  </h3>
                  <div className="text-[11px] text-slate-700 font-mono">{selectedCustomer.email}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-slate-700 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-700 font-medium">Total Orders Placed</div>
                <div className="text-lg font-bold text-slate-900">{selectedCustomer.orderCount}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-700 font-medium">Lifetime Acquisition</div>
                <div className="text-lg font-bold text-slate-900">{formatCurrency(selectedCustomer.lifetimeSpend)}</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-semibold text-slate-900">Patron Information</div>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-700 block text-[10px] uppercase">Registered:</span>
                  <span className="font-medium">{formatDate(selectedCustomer.created_at)}</span>
                </div>
                <div>
                  <span className="text-slate-700 block text-[10px] uppercase">Standing:</span>
                  <span className={`font-bold ${selectedCustomer.is_active ? 'text-emerald-800' : 'text-red-700'}`}>
                    {selectedCustomer.is_active ? 'Active Customer' : 'Suspended'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleToggleActive(
                    selectedCustomer.id,
                    selectedCustomer.is_active,
                    [selectedCustomer.first_name, selectedCustomer.last_name].filter(Boolean).join(' ') || selectedCustomer.email
                  )
                }
                className={selectedCustomer.is_active ? 'text-red-700 border-red-200 hover:bg-red-50' : 'text-emerald-800 border-emerald-200 hover:bg-emerald-50'}
              >
                {selectedCustomer.is_active ? 'Suspend Account' : 'Reactivate Account'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedCustomer(null)}
                className="border-slate-300 text-slate-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomersPage;
