import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Eye,
  X,
  Truck,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { EnterpriseDataTable, type Column, type BulkAction } from '@/components/common/EnterpriseDataTable';
import { useAdminOrders } from '../hooks/useAdminOrders';
import type { Order, OrderFulfillmentStatus } from '@/types/database';
import { auditLogService } from '@/services/AuditLogService';
import { useAuth } from '@/hooks/useAuth';

const FULFILLMENT_STATUSES: OrderFulfillmentStatus[] = [
  'pending',
  'processing',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const AdminOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { orders, isLoading, isError, updateFulfillmentStatus } = useAdminOrders();
  const [financialFilter, setFinancialFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState<string>('');

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (financialFilter !== 'all' && o.financial_status !== financialFilter) return false;
      if (fulfillmentFilter !== 'all' && o.fulfillment_status !== fulfillmentFilter) return false;
      return true;
    });
  }, [orders, financialFilter, fulfillmentFilter]);

  const handleStatusChange = async (order: Order, status: OrderFulfillmentStatus) => {
    if (status === order.fulfillment_status) return;
    setUpdatingId(order.id);
    try {
      await updateFulfillmentStatus({ orderId: order.id, status });
      await auditLogService.recordAction('UPDATE_ORDER_STATUS', 'order', order.id, { new_status: status }, user?.id);
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...selectedOrder, fulfillment_status: status });
      }
      toast.success(`Order #${order.order_number} status set to ${status}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenInspect = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumberInput(order.tracking_number || '');
  };

  const handleSaveTrackingNumber = async () => {
    if (!selectedOrder) return;
    try {
      await auditLogService.recordAction(
        'UPDATE_TRACKING_NUMBER',
        'order',
        selectedOrder.id,
        { tracking_number: trackingNumberInput },
        user?.id
      );
      setSelectedOrder({ ...selectedOrder, tracking_number: trackingNumberInput });
      toast.success('Tracking number saved to order manifest.');
    } catch {
      toast.error('Failed to save tracking number.');
    }
  };

  const bulkActions: BulkAction<Order>[] = [
    {
      label: 'Mark Processing',
      icon: Clock,
      action: async (items) => {
        try {
          await Promise.all(
            items.map((item) => updateFulfillmentStatus({ orderId: item.id, status: 'processing' }))
          );
          toast.success(`Updated ${items.length} orders to processing.`);
        } catch {
          toast.error('Failed to bulk update orders.');
        }
      },
    },
    {
      label: 'Mark Shipped',
      icon: Truck,
      action: async (items) => {
        try {
          await Promise.all(
            items.map((item) => updateFulfillmentStatus({ orderId: item.id, status: 'shipped' }))
          );
          toast.success(`Updated ${items.length} orders to shipped.`);
        } catch {
          toast.error('Failed to bulk update orders.');
        }
      },
    },
    {
      label: 'Mark Delivered',
      icon: CheckCircle2,
      action: async (items) => {
        try {
          await Promise.all(
            items.map((item) => updateFulfillmentStatus({ orderId: item.id, status: 'delivered' }))
          );
          toast.success(`Updated ${items.length} orders to delivered.`);
        } catch {
          toast.error('Failed to bulk update orders.');
        }
      },
    },
  ];

  const columns: Column<Order>[] = [
    {
      key: 'order_number',
      header: 'Order #',
      accessor: (o) => (
        <button
          type="button"
          onClick={() => handleOpenInspect(o)}
          className="font-bold text-slate-900 hover:text-slate-900 hover:underline cursor-pointer text-left"
        >
          #{o.order_number}
        </button>
      ),
      sortValue: (o) => o.order_number,
    },
    {
      key: 'email',
      header: 'Customer',
      accessor: (o) => (
        <div>
          <div className="font-mono text-slate-800 font-medium">{o.email}</div>
          {o.phone && <div className="text-[11px] text-slate-700">{o.phone}</div>}
        </div>
      ),
      sortValue: (o) => o.email,
    },
    {
      key: 'created_at',
      header: 'Date Placed',
      accessor: (o) => <span className="text-slate-800">{formatDate(o.created_at)}</span>,
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
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-amber-50 text-amber-900 border border-amber-300'
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
          className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-900 font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-600 capitalize cursor-pointer"
        >
          {FULFILLMENT_STATUSES.map((st) => (
            <option key={st} value={st} className="capitalize">
              {st}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      accessor: (o) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleOpenInspect(o)}
          className="text-xs h-7 px-2.5 border-slate-300 text-slate-700 hover:bg-slate-50 gap-1 cursor-pointer"
        >
          <Eye className="h-3 w-3 text-slate-800" />
          <span>Inspect</span>
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

  const shippingAddr = selectedOrder?.shipping_address as {
    recipient_name?: string;
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
  } | null;

  return (
    <div className="space-y-6">
      {/* SaaS Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Orders & Consignments Fulfillment
          </h1>
          <p className="text-xs text-slate-800 font-medium mt-1">
            Track customer checkouts, update parcel dispatch status, and inspect transaction manifests.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Financial:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(['all', 'paid', 'pending'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFinancialFilter(st)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer capitalize ${
                  financialFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-800 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? `All (${orders.length})` : st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Fulfillment:</span>
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1 font-medium focus:ring-1 focus:ring-slate-600 capitalize"
          >
            <option value="all">All Fulfillment Stages</option>
            {FULFILLMENT_STATUSES.map((st) => (
              <option key={st} value={st} className="capitalize">
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enterprise Data Table */}
      <EnterpriseDataTable
        data={filteredOrders}
        columns={columns}
        keyExtractor={(o) => o.id}
        searchPlaceholder="Search order #, customer email, phone..."
        bulkActions={bulkActions}
        exportFilename="orders_export.csv"
        defaultSortKey="created_at"
        emptyMessage="No customer orders found matching current filters."
      />

      {/* Inspect Order Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-2xl p-6 rounded-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Order #{selectedOrder.order_number}</h3>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedOrder.financial_status === 'paid'
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-50 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {selectedOrder.financial_status}
                  </span>
                </div>
                <span className="text-[11px] text-slate-700 font-medium">Placed on {formatDate(selectedOrder.created_at)}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-700 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-800 font-medium">Current Fulfillment Status:</span>
                <div className="font-bold text-slate-900 uppercase text-xs mt-0.5">
                  {selectedOrder.fulfillment_status}
                </div>
              </div>
              <select
                value={selectedOrder.fulfillment_status}
                disabled={updatingId === selectedOrder.id}
                onChange={(e) => handleStatusChange(selectedOrder, e.target.value as OrderFulfillmentStatus)}
                className="bg-white border border-slate-300 text-slate-900 font-semibold rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-slate-600 capitalize cursor-pointer"
              >
                {FULFILLMENT_STATUSES.map((st) => (
                  <option key={st} value={st} className="capitalize">
                    Change to {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer & Payment Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-700" />
                  <span>Customer Contact</span>
                </div>
                <div className="text-slate-800 font-medium">{selectedOrder.email}</div>
                {selectedOrder.phone && (
                  <div className="text-slate-800 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-700" />
                    <span>{selectedOrder.phone}</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-slate-700" />
                  <span>Payment Settlement</span>
                </div>
                <div className="text-slate-700 capitalize font-medium">Gateway: {selectedOrder.payment_method || 'Online Card'}</div>
                <div className="font-bold text-slate-900 text-sm">{formatCurrency(selectedOrder.total_amount)}</div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-700" />
                <span>Shipping Destination</span>
              </div>
              {shippingAddr && typeof shippingAddr === 'object' ? (
                <div className="text-slate-700 space-y-0.5 leading-relaxed font-normal">
                  <div className="font-semibold text-slate-900">{shippingAddr.recipient_name || shippingAddr.street}</div>
                  <div>{shippingAddr.street}</div>
                  <div>
                    {[shippingAddr.city, shippingAddr.state, shippingAddr.postal_code].filter(Boolean).join(', ')}
                  </div>
                  <div>{shippingAddr.country || 'Nigeria'}</div>
                  {shippingAddr.phone && <div className="text-slate-700">Phone: {shippingAddr.phone}</div>}
                </div>
              ) : (
                <div className="text-slate-800 italic">No formal address payload provided.</div>
              )}
            </div>

            {/* Order Items List */}
            <div className="space-y-2">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-slate-700" />
                <span>Line Items ({selectedOrder.items?.length || 0})</span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3">Qty</th>
                      <th className="py-2.5 px-3">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-medium text-slate-900">{item.product_name}</td>
                          <td className="py-2.5 px-3 text-slate-700">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-slate-700">{formatCurrency(item.price)}</td>
                          <td className="py-2.5 px-3 text-slate-900 font-bold text-right">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-700">
                          Single consignment purchase ({formatCurrency(selectedOrder.total_amount)})
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dispatch Tracking Input */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-900">Courier Tracking Code</div>
                <div className="text-slate-700 text-[11px]">Attach tracking number for customer order lookup</div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="e.g. DHL-81928374"
                  className="bg-white border-slate-300 text-xs w-44 font-mono"
                />
                <Button size="sm" onClick={handleSaveTrackingNumber} className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9">
                  Save
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                className="border-slate-300 text-slate-700"
              >
                Close Drawer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
