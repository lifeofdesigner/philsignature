import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ShoppingBag, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { EnterpriseDataTable, type Column } from '@/components/common/EnterpriseDataTable';
import { useAdminOrders } from '../hooks/useAdminOrders';
import type { Order, OrderFulfillmentStatus } from '@/types/database';
import { auditLogService } from '@/services/AuditLogService';
import { useAuth } from '@/hooks/useAuth';

const FULFILLMENT_STATUSES: OrderFulfillmentStatus[] = ['pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const AdminOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { orders, isLoading, isError, updateFulfillmentStatus } = useAdminOrders();
  const [financialFilter, setFinancialFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (financialFilter === 'all') return true;
      return o.financial_status === financialFilter;
    });
  }, [orders, financialFilter]);

  const handleStatusChange = async (order: Order, status: OrderFulfillmentStatus) => {
    if (status === order.fulfillment_status) return;
    setUpdatingId(order.id);
    try {
      await updateFulfillmentStatus({ orderId: order.id, status });
      await auditLogService.recordAction('UPDATE_ORDER_STATUS', 'order', order.id, { new_status: status }, user?.id);
      toast.success(`Order #${order.order_number} status set to ${status}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: Column<Order>[] = [
    {
      key: 'order_number',
      header: 'Order #',
      accessor: (o) => <span className="font-semibold text-slate-900">#{o.order_number}</span>,
      sortValue: (o) => o.order_number,
    },
    {
      key: 'email',
      header: 'Customer Email',
      accessor: (o) => <span className="font-mono text-slate-700">{o.email}</span>,
      sortValue: (o) => o.email,
    },
    {
      key: 'created_at',
      header: 'Date Placed',
      accessor: (o) => <span className="text-slate-600">{formatDate(o.created_at)}</span>,
      sortValue: (o) => o.created_at,
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      accessor: (o) => <span className="font-bold text-slate-900">{formatCurrency(o.total_amount)}</span>,
      sortValue: (o) => Number(o.total_amount),
    },
    {
      key: 'financial_status',
      header: 'Payment',
      accessor: (o) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
            o.financial_status === 'paid'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {o.financial_status}
        </span>
      ),
      sortValue: (o) => o.financial_status,
    },
    {
      key: 'fulfillment_status',
      header: 'Fulfillment Status',
      accessor: (o) => (
        <select
          value={o.fulfillment_status}
          disabled={updatingId === o.id}
          onChange={(e) => handleStatusChange(o, e.target.value as OrderFulfillmentStatus)}
          className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-semibold focus:outline-hidden focus:border-amber-600"
        >
          {FULFILLMENT_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'actions',
      header: 'Details',
      sortable: false,
      accessor: (o) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelectedOrder(o)}
          className="text-xs h-7 px-2.5 border-slate-200 text-slate-700 hover:bg-slate-50 gap-1"
        >
          <Eye className="h-3 w-3" /> Inspect
        </Button>
      ),
    },
  ];

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-5 w-5" />}
        title="Unable to Load Orders"
        description="Orders could not be retrieved from Supabase. Please retry."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* SaaS Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Orders & Consignments Fulfillment
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track customer checkouts, update parcel dispatch status, and inspect transaction manifests.
          </p>
        </div>

        {/* Financial Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-lg text-xs">
          {(['all', 'paid', 'pending'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFinancialFilter(st)}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer capitalize ${
                financialFilter === st
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? `All (${orders.length})` : st}
            </button>
          ))}
        </div>
      </div>

      {/* Enterprise Data Table */}
      <EnterpriseDataTable
        data={filteredOrders}
        columns={columns}
        keyExtractor={(o) => o.id}
        searchPlaceholder="Search order #, customer email..."
        exportFilename="orders_export.csv"
        defaultSortKey="created_at"
      />

      {/* Inspect Order Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-2xl p-6 rounded-xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Order #{selectedOrder.order_number}</h3>
                <span className="text-xs text-slate-500">{formatDate(selectedOrder.created_at)}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <div className="font-semibold text-slate-900">Customer Contact</div>
                <div className="text-slate-600">{selectedOrder.email}</div>
                <div className="text-slate-600">{selectedOrder.phone}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <div className="font-semibold text-slate-900">Payment Breakdown</div>
                <div className="text-slate-600">Method: {selectedOrder.payment_method}</div>
                <div className="font-bold text-slate-900 text-sm">{formatCurrency(selectedOrder.total_amount)}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
              <div className="font-semibold text-slate-900">Shipping Destination</div>
              <div className="text-slate-600">
                {typeof selectedOrder.shipping_address === 'object'
                  ? JSON.stringify(selectedOrder.shipping_address)
                  : String(selectedOrder.shipping_address)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
