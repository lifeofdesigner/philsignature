import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ShoppingBag, Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminOrders } from '../hooks/useAdminOrders';
import type { Order, OrderFulfillmentStatus } from '@/types/database';

const FULFILLMENT_STATUSES: OrderFulfillmentStatus[] = ['pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const AdminOrdersPage: React.FC = () => {
  const { orders, isLoading, isError, updateFulfillmentStatus } = useAdminOrders();

  const [search, setSearch] = useState('');
  const [financialFilter, setFinancialFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim();
    return orders.filter((o) => {
      const matchesStatus = financialFilter === 'all' || o.financial_status === financialFilter;
      const matchesQuery = !query || o.order_number.toLowerCase().includes(query) || o.email.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [orders, search, financialFilter]);

  const handleStatusChange = async (order: Order, status: OrderFulfillmentStatus) => {
    if (status === order.fulfillment_status) return;
    setUpdatingId(order.id);
    try {
      await updateFulfillmentStatus({ orderId: order.id, status });
      toast.success(`Order ${order.order_number} marked as ${status}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Fulfillment & Consignments
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">Orders</h1>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="bg-luxury-card border border-luxury-border p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-luxury-muted" />
            <Input
              placeholder="Search order number or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-luxury-charcoal"
            />
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-luxury-black border border-luxury-border rounded text-xs">
            {(['all', 'paid', 'pending'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFinancialFilter(st)}
                className={`px-3 py-1.5 rounded uppercase tracking-wider text-[10px] font-medium transition-colors cursor-pointer ${
                  financialFilter === st ? 'bg-luxury-gold text-luxury-black font-semibold' : 'text-luxury-muted hover:text-white'
                }`}
              >
                {st === 'all' ? `All (${orders.length})` : st}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-5 w-5" />}
          title={orders.length === 0 ? 'No Orders Received' : 'No Matching Orders'}
          description={
            orders.length === 0
              ? 'Customer orders with real-time status updates (Pending, Paid, Packed, Shipped, Delivered) will appear here.'
              : 'Try adjusting your search query or filter.'
          }
        />
      ) : (
        <div className="bg-luxury-card border border-luxury-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-luxury-border text-left text-[10px] uppercase tracking-wider text-luxury-muted">
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Fulfillment</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-luxury-border/60 last:border-0 hover:bg-luxury-charcoal/40">
                  <td className="p-4 font-mono text-xs text-white font-semibold">{order.order_number}</td>
                  <td className="p-4 text-luxury-muted text-xs">{formatDate(order.created_at)}</td>
                  <td className="p-4 text-luxury-muted text-xs">{order.email}</td>
                  <td className="p-4 text-luxury-gold font-medium">{formatCurrency(order.total_amount)}</td>
                  <td className="p-4">
                    <span
                      className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-medium border ${
                        order.financial_status === 'paid'
                          ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                          : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                      }`}
                    >
                      {order.financial_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={order.fulfillment_status}
                        onChange={(e) => handleStatusChange(order, e.target.value as OrderFulfillmentStatus)}
                        disabled={updatingId === order.id}
                        className="h-8 bg-luxury-charcoal/80 border border-luxury-border px-2 text-xs text-luxury-cream focus:outline-none focus:border-luxury-gold/70 disabled:opacity-50"
                      >
                        {FULFILLMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {updatingId === order.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-luxury-muted" />}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="text-luxury-muted hover:text-luxury-gold transition-colors cursor-pointer text-xs uppercase tracking-wider"
                      >
                        Inspect
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-luxury-card border border-luxury-border w-full max-w-2xl p-6 space-y-5 rounded max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-luxury-border pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-luxury-gold font-medium">Order Detail</span>
                <h3 className="font-serif text-xl text-white mt-0.5">{selectedOrder.order_number}</h3>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="text-luxury-muted hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-luxury-black/60 border border-luxury-border p-3.5 rounded text-xs">
              <div>
                <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Placed</span>
                <span className="text-white font-medium">{formatDate(selectedOrder.created_at)}</span>
              </div>
              <div>
                <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Payment</span>
                <span className="text-white uppercase font-mono text-[11px]">{selectedOrder.payment_method}</span>
              </div>
              <div>
                <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Financial</span>
                <span className="capitalize text-emerald-400 font-medium">{selectedOrder.financial_status}</span>
              </div>
              <div>
                <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Fulfillment</span>
                <span className="capitalize text-luxury-gold font-medium">{selectedOrder.fulfillment_status}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] uppercase tracking-wider text-luxury-muted font-medium">
                Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="border border-luxury-border rounded divide-y divide-luxury-border/60 overflow-hidden">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-3 bg-luxury-card/30 flex items-center justify-between text-xs">
                    <span className="text-white">{item.product_name} × {item.quantity}</span>
                    <span className="text-luxury-gold">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-luxury-black/40 border border-luxury-border p-4 rounded text-xs space-y-2">
              <div className="flex justify-between text-luxury-muted"><span>Subtotal</span><span className="text-white">{formatCurrency(selectedOrder.subtotal)}</span></div>
              <div className="flex justify-between text-luxury-muted"><span>Shipping</span><span className="text-white">{selectedOrder.shipping_amount === 0 ? 'Complimentary' : formatCurrency(selectedOrder.shipping_amount)}</span></div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-luxury-gold"><span>Discount</span><span>-{formatCurrency(selectedOrder.discount_amount)}</span></div>
              )}
              <div className="border-t border-luxury-border pt-2 flex justify-between font-serif text-sm font-semibold">
                <span className="text-white">Total</span>
                <span className="text-luxury-gold">{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
            </div>

            {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] uppercase tracking-wider text-luxury-muted font-medium">Consignment Timeline</h4>
                <div className="space-y-2">
                  {selectedOrder.timeline.map((t, idx) => (
                    <div key={t.id || idx} className="flex items-start gap-2 text-[11px]">
                      <div className="h-1.5 w-1.5 rounded-full bg-luxury-gold mt-1 shrink-0" />
                      <div>
                        <p className="text-white font-medium">{t.title}</p>
                        {t.description && <p className="text-luxury-muted text-[10px]">{t.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
