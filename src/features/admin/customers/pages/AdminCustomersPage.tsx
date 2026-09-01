import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Users, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminCustomers } from '../hooks/useAdminCustomers';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const AdminCustomersPage: React.FC = () => {
  const { customers, isLoading, isError, setActiveStatus, isUpdatingId } = useAdminCustomers();
  const [search, setSearch] = useState('');

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return customers;
    return customers.filter(
      (c) =>
        c.email.toLowerCase().includes(query) ||
        `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase().includes(query)
    );
  }, [customers, search]);

  const handleToggleActive = async (userId: string, currentStatus: boolean, name: string) => {
    try {
      await setActiveStatus({ userId, isActive: !currentStatus });
      toast.success(`${name} was ${!currentStatus ? 'reactivated' : 'deactivated'}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update customer status.');
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">Client Directory</span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">Privileged Customers</h1>
        </div>
      </div>

      {customers.length > 0 && (
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

      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title={customers.length === 0 ? 'No Registered Patrons Yet' : 'No Matching Customers'}
          description={
            customers.length === 0
              ? 'Customer accounts, lifetime value, and order records will synchronize here.'
              : 'Try adjusting your search query.'
          }
        />
      ) : (
        <div className="bg-luxury-card border border-luxury-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-luxury-border text-left text-[10px] uppercase tracking-wider text-luxury-muted">
                <th className="p-4 font-medium">Patron</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium">Orders</th>
                <th className="p-4 font-medium">Lifetime Spend</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ') || '—';
                return (
                  <tr key={customer.id} className="border-b border-luxury-border/60 last:border-0 hover:bg-luxury-charcoal/40">
                    <td className="p-4">
                      <div className="text-white font-medium">{name}</div>
                      <div className="text-[11px] text-luxury-muted font-mono">{customer.email}</div>
                    </td>
                    <td className="p-4 text-luxury-muted text-xs">{formatDate(customer.created_at)}</td>
                    <td className="p-4 text-white">{customer.orderCount}</td>
                    <td className="p-4 text-luxury-gold font-medium">{formatCurrency(customer.lifetimeSpend)}</td>
                    <td className="p-4">
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-medium border ${
                          customer.is_active
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                            : 'text-red-400 border-red-500/30 bg-red-500/10'
                        }`}
                      >
                        {customer.is_active ? 'active' : 'deactivated'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(customer.id, customer.is_active, name)}
                          disabled={isUpdatingId === customer.id}
                          className="text-luxury-muted hover:text-luxury-gold transition-colors cursor-pointer text-xs uppercase tracking-wider disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                          {isUpdatingId === customer.id && <Loader2 className="h-3 w-3 animate-spin" />}
                          <span>{customer.is_active ? 'Deactivate' : 'Reactivate'}</span>
                        </button>
                      </div>
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
