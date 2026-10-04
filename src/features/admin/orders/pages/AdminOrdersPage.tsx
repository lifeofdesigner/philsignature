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
  Loader2,
} from 'lucide-react';
import { AdminButton, AdminInput } from '@/components/admin-ui';
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
  const { orders, isLoading, isError, updateFulfillmentStatus, confirmPayment, isConfirmingPayment } =
    useAdminOrders();
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

  const handleConfirmBankTransfer = async (order: Order) => {
    if (!confirm(`Confirm that a bank transfer payment of ${formatCurrency(order.total_amount)} was received for Order #${order.order_number}?`)) {
      return;
    }
    try {
      const reference = `MANUAL-${user?.email || 'admin'}-${Date.now()}`;
      await confirmPayment({ orderId: order.id, reference, paymentMethod: 'bank_transfer' });
      await auditLogService.recordAction('CONFIRM_BANK_TRANSFER', 'order', order.id, { reference }, user?.id);
      setSelectedOrder((prev) => (prev && prev.id === order.id ? { ...prev, financial_status: 'paid' } : prev));
      toast.success(`Order #${order.order_number} marked as paid.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to confirm payment.');
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
          className="font-bold text-black hover:text-black hover:underline cursor-pointer text-left"
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
          <div className="font-mono text-black font-medium">{o.email}</div>
          {o.phone && <div className="text-[11px] text-black">{o.phone}</div>}
        </div>
      ),
      sortValue: (o) => o.email,
    },
    {
      key: 'created_at',
      header: 'Date Placed',
      accessor: (o) => <span className="text-black">{formatDate(o.created_at)}</span>,
      sortValue: (o) => o.created_at,
    },
    {
      key: 'total_amount',
      header: 'Total Amount',
      accessor: (o) => <span className="font-bold text-black">{formatCurrency(o.total_amount)}</span>,
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
          className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 text-black font-semibold focus:outline-hidden focus:ring-1 focus:ring-slate-600 capitalize cursor-pointer"
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
        <AdminButton
          size="sm"
          variant="secondary"
          onClick={() => handleOpenInspect(o)}
          className="text-xs h-7 px-2.5 gap-1"
        >
          <Eye className="h-3 w-3" />
          <span>Inspect</span>
        </AdminButton>
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
          <h1 className="text-2xl font-bold text-black tracking-tight">
            Orders & Consignments Fulfillment
          </h1>
          <p className="text-xs text-black font-semibold mt-1">
            Track customer checkouts, update parcel dispatch status, and inspect transaction manifests.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-black">Financial:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(['all', 'paid', 'pending'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFinancialFilter(st)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer capitalize ${
                  financialFilter === st
                    ? 'bg-white text-black shadow-2xs'
                    : 'text-black hover:text-black'
                }`}
              >
                {st === 'all' ? `All (${orders.length})` : st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-black">Fulfillment:</span>
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="bg-white border border-slate-300 text-black rounded-lg px-2.5 py-1 font-medium focus:ring-1 focus:ring-slate-600 capitalize"
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
                  <h3 className="text-lg font-bold text-black">Order #{selectedOrder.order_number}</h3>
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
                <span className="text-[11px] text-black font-medium">Placed on {formatDate(selectedOrder.created_at)}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-black hover:text-black rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-black font-medium">Current Fulfillment Status:</span>
                <div className="font-bold text-black uppercase text-xs mt-0.5">
                  {selectedOrder.fulfillment_status}
                </div>
              </div>
              <select
                value={selectedOrder.fulfillment_status}
                disabled={updatingId === selectedOrder.id}
                onChange={(e) => handleStatusChange(selectedOrder, e.target.value as OrderFulfillmentStatus)}
                className="bg-white border border-slate-300 text-black font-semibold rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-slate-600 capitalize cursor-pointer"
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
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="font-semibold text-black flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-black" />
                  <span>Customer Contact</span>
                </div>
                <div className="text-black font-medium">{selectedOrder.email}</div>
                {selectedOrder.phone && (
                  <div className="text-black flex items-center gap-1">
                    <Phone className="h-3 w-3 text-black" />
                    <span>{selectedOrder.phone}</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="font-semibold text-black flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-black" />
                  <span>Payment Settlement</span>
                </div>
                <div className="text-black capitalize font-medium">Gateway: {selectedOrder.payment_method || 'Online Card'}</div>
                <div className="font-bold text-black text-sm">{formatCurrency(selectedOrder.total_amount)}</div>
                {selectedOrder.payment_method === 'bank_transfer' && selectedOrder.financial_status === 'pending' && (
                  <AdminButton
                    size="sm"
                    variant="success"
                    disabled={isConfirmingPayment}
                    onClick={() => handleConfirmBankTransfer(selectedOrder)}
                    className="w-full mt-1.5 gap-1.5"
                  >
                    {isConfirmingPayment ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    <span>Mark Payment Received</span>
                  </AdminButton>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-semibold text-black flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-black" />
                <span>Shipping Destination</span>
              </div>
              {shippingAddr && typeof shippingAddr === 'object' ? (
                <div className="text-black space-y-0.5 leading-relaxed font-normal">
                  <div className="font-semibold text-black">{shippingAddr.recipient_name || shippingAddr.street}</div>
                  <div>{shippingAddr.street}</div>
                  <div>
                    {[shippingAddr.city, shippingAddr.state, shippingAddr.postal_code].filter(Boolean).join(', ')}
                  </div>
                  <div>{shippingAddr.country || 'Nigeria'}</div>
                  {shippingAddr.phone && <div className="text-black">Phone: {shippingAddr.phone}</div>}
                </div>
              ) : (
                <div className="text-black italic">No formal address payload provided.</div>
              )}
            </div>

            {/* Order Items List */}
            <div className="space-y-2">
              <div className="font-semibold text-black flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-black" />
                <span>Line Items ({selectedOrder.items?.length || 0})</span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white text-black font-semibold border-b border-slate-200">
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
                        <tr key={idx} className="hover:bg-slate-100">
                          <td className="py-2.5 px-3 font-medium text-black">{item.product_name}</td>
                          <td className="py-2.5 px-3 text-black">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-black">{formatCurrency(item.price)}</td>
                          <td className="py-2.5 px-3 text-black font-bold text-right">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-black">
                          Single consignment purchase ({formatCurrency(selectedOrder.total_amount)})
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="text-black font-semibold">{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {Number(selectedOrder.tax_amount || 0) > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax{selectedOrder.tax_rate ? ` (${selectedOrder.tax_rate}%)` : ''}</span>
                  <span className="text-black font-semibold">{formatCurrency(selectedOrder.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span className="text-black font-semibold">
                  {selectedOrder.shipping_amount === 0 ? 'Complimentary' : formatCurrency(selectedOrder.shipping_amount)}
                </span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount {selectedOrder.coupon_code ? `(${selectedOrder.coupon_code})` : ''}</span>
                  <span className="font-semibold">-{formatCurrency(selectedOrder.discount_amount)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-black">
                <span>Final Total</span>
                <span className="text-black">{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
            </div>

            {/* Dispatch Tracking Input */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-semibold text-black">Courier Tracking Code</div>
                <div className="text-black text-[11px]">Attach tracking number for customer order lookup</div>
              </div>
              <div className="flex items-center gap-2">
                <AdminInput
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="e.g. DHL-81928374"
                  className="text-xs w-44 font-mono"
                />
                <AdminButton size="sm" variant="primary" onClick={handleSaveTrackingNumber} className="text-xs h-9">
                  Save
                </AdminButton>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <AdminButton
                variant="secondary"
                onClick={() => setSelectedOrder(null)}
              >
                Close Drawer
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
