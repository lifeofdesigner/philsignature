import React from 'react';
import { toast } from 'sonner';
import { Users, Loader2 } from 'lucide-react';
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

  const handleToggleActive = async (userId: string, currentStatus: boolean, name: string) => {
    try {
      await setActiveStatus({ userId, isActive: !currentStatus });
      await auditLogService.recordAction('TOGGLE_CUSTOMER_ACTIVE', 'customer', userId, { is_active: !currentStatus }, user?.id);
      toast.success(`${name} account was ${!currentStatus ? 'reactivated' : 'deactivated'}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update customer status.');
    }
  };

  const columns: Column<CustomerWithStats>[] = [
    {
      key: 'name',
      header: 'Customer Name',
      accessor: (c) => (
        <span className="font-semibold text-slate-900">
          {[c.first_name, c.last_name].filter(Boolean).join(' ') || 'Anonymous Patron'}
        </span>
      ),
      sortValue: (c) => `${c.first_name || ''} ${c.last_name || ''}`,
    },
    {
      key: 'email',
      header: 'Email Address',
      accessor: (c) => <span className="font-mono text-slate-700">{c.email}</span>,
      sortValue: (c) => c.email,
    },
    {
      key: 'created_at',
      header: 'Member Since',
      accessor: (c) => <span className="text-slate-600">{formatDate(c.created_at)}</span>,
      sortValue: (c) => c.created_at,
    },
    {
      key: 'orderCount',
      header: 'Total Orders',
      accessor: (c) => <span className="font-semibold text-slate-900">{c.orderCount}</span>,
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
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {c.is_active ? 'Active' : 'Suspended'}
        </span>
      ),
      sortValue: (c) => (c.is_active ? 'Active' : 'Suspended'),
    },
    {
      key: 'actions',
      header: 'Action',
      sortable: false,
      accessor: (c) => {
        const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.email;
        const isUpdating = isUpdatingId === c.id;
        return (
          <Button
            size="sm"
            variant="outline"
            disabled={isUpdating}
            onClick={() => handleToggleActive(c.id, c.is_active, name)}
            className="text-xs h-7 px-2.5 border-slate-200 text-slate-700"
          >
            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : c.is_active ? 'Suspend' : 'Reactivate'}
          </Button>
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
          <p className="text-xs text-slate-500 font-medium mt-1">
            Registered patrons, order history stats, lifetime acquisitions, and account standing.
          </p>
        </div>
      </div>

      {/* Enterprise Data Table */}
      <EnterpriseDataTable
        data={customers}
        columns={columns}
        keyExtractor={(c) => c.id}
        searchPlaceholder="Search customer name or email..."
        exportFilename="customers_directory.csv"
        defaultSortKey="lifetimeSpend"
      />
    </div>
  );
};

export default AdminCustomersPage;
