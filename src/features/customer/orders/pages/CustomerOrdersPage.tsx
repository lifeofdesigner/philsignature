import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  PackageCheck,
  Truck,
  Clock,
  CheckCircle2,
  ChevronRight,
  Search,
  X,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCustomerOrders } from '@/features/checkout/hooks/useOrders';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { ROUTES } from '@/constants/routes';
import type { Order } from '@/types/database';

export const CustomerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useCustomerOrders(user?.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  // Filter and search
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === 'all' || order.financial_status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      order.order_number.toLowerCase().includes(query) ||
      order.items?.some((item) => item.product_name.toLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-luxury-border/60 pb-5">
        <div>
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            Order History
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-luxury-cream font-normal mt-1">
            My Orders
          </h1>
          <p className="text-xs text-luxury-muted mt-1">
            View and manage all your orders here.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.SHOP)}
          className="self-start sm:self-auto min-h-[40px] px-5 py-2 bg-luxury-gold text-black hover:bg-luxury-gold-light text-xs font-semibold uppercase tracking-luxury-wide transition-colors rounded-sm cursor-pointer"
        >
          Shop More
        </button>
      </div>

      {orders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-luxury-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference or perfume..."
              className="w-full h-10 min-h-[40px] bg-luxury-card border border-luxury-border pl-9 pr-3 py-2 text-xs text-luxury-cream rounded-sm focus:border-luxury-gold focus:outline-none placeholder:text-luxury-muted"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-luxury-muted hover:text-luxury-cream"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-luxury-card border border-luxury-border rounded-sm text-xs">
            {(['all', 'paid', 'pending'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-sm uppercase tracking-wider text-[10px] font-medium transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-luxury-gold text-black font-semibold'
                    : 'text-luxury-muted hover:text-luxury-cream'
                }`}
              >
                {st === 'all' ? `All (${orders.length})` : st}
              </button>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-5 w-5" />}
          title="No Orders Yet"
          description="You have not placed any orders yet. Browse our shop to find your next perfume."
          actionLabel="Shop Now"
          onAction={() => navigate(ROUTES.SHOP)}
        />
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-luxury-card border border-luxury-border rounded-sm shadow-xs space-y-2">
          <p className="text-sm font-serif text-luxury-cream">No matching orders found</p>
          <p className="text-xs text-luxury-muted">Try adjusting your search query or filter settings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isPaid = order.financial_status === 'paid';
            return (
              <div
                key={order.id}
                className="bg-luxury-card border border-luxury-border p-5 rounded space-y-4 hover:border-luxury-gold/40 transition-colors"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-luxury-border/60 pb-3 text-xs">
                  <div>
                    <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Order Number</span>
                    <span className="font-mono font-bold text-luxury-gold">{order.order_number}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Order Date</span>
                    <span className="text-luxury-cream">{formatDate(order.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Payment Status</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border font-medium ${
                        isPaid
                          ? 'text-emerald-700 border-emerald-300 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                          : 'text-amber-800 border-amber-300 bg-amber-50 dark:text-amber-400 dark:border-amber-500/30 dark:bg-amber-500/10'
                      }`}
                    >
                      {isPaid ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                      {order.financial_status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Total Amount</span>
                    <span className="font-serif font-medium text-luxury-cream">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="flex flex-wrap items-center gap-3">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 bg-luxury-charcoal border border-luxury-border px-2.5 py-1.5 rounded-sm text-xs"
                    >
                      {item.product_image_url && (
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
                          className="w-6 h-8 object-cover rounded-sm bg-luxury-card shrink-0"
                        />
                      )}
                      <span className="text-luxury-cream truncate max-w-[160px]">{item.product_name}</span>
                      <span className="text-[10px] text-luxury-gold">×{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between border-t border-luxury-border/40 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-luxury-muted">
                    <PackageCheck className="h-3.5 w-3.5 text-luxury-gold" />
                    <span className="capitalize">Fulfillment: {order.fulfillment_status}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="text-luxury-muted hover:text-luxury-cream transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/checkout/confirmation/${order.order_number}`)}
                      className="text-luxury-muted hover:text-luxury-cream transition-colors cursor-pointer"
                    >
                      View Receipt
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/track-order?orderNumber=${order.order_number}&email=${encodeURIComponent(order.email)}`
                        )
                      }
                      className="inline-flex items-center gap-1 text-luxury-gold hover:text-luxury-gold-light transition-colors cursor-pointer font-medium"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      <span>Track Order</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-luxury-card border border-luxury-border w-full max-w-2xl p-6 rounded space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-luxury-border pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-luxury-gold font-medium">
                  Order Details
                </span>
                <h3 className="font-serif text-xl text-luxury-cream font-normal mt-0.5">
                  Order {selectedOrder.order_number}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-luxury-muted hover:text-luxury-cream p-1 rounded-sm transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Meta Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-luxury-charcoal border border-luxury-border p-3.5 rounded-sm text-xs">
              <div>
                <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Order Date</span>
                <span className="text-luxury-cream font-medium">{formatDate(selectedOrder.created_at)}</span>
              </div>
              <div>
                <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Payment</span>
                <span className="text-emerald-600 dark:text-emerald-400 capitalize font-medium">{selectedOrder.financial_status}</span>
              </div>
              <div>
                <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Delivery</span>
                <span className="text-luxury-gold capitalize font-medium">{selectedOrder.fulfillment_status}</span>
              </div>
              <div>
                <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Method</span>
                <span className="text-luxury-cream uppercase font-mono text-[11px]">{selectedOrder.payment_method}</span>
              </div>
            </div>

            {/* Purchased Items */}
            <div className="space-y-3">
              <h4 className="text-[11px] uppercase tracking-wider text-luxury-muted font-medium">
                Perfumes Ordered ({selectedOrder.items?.length || 0})
              </h4>
              <div className="border border-luxury-border rounded-sm divide-y divide-luxury-border/60 overflow-hidden">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-3 bg-luxury-card flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      {item.product_image_url && (
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
                          className="w-10 h-12 object-cover rounded-sm bg-luxury-card shrink-0 border border-luxury-border"
                        />
                      )}
                      <div>
                        <p className="font-serif text-sm text-luxury-cream">{item.product_name}</p>
                        <p className="text-[11px] text-luxury-muted">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-serif text-sm text-luxury-cream font-medium">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-luxury-charcoal border border-luxury-border p-4 rounded-sm text-xs space-y-2">
              <div className="flex justify-between text-luxury-muted">
                <span>Subtotal</span>
                <span className="text-luxury-cream">{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {Number(selectedOrder.tax_amount || 0) > 0 && (
                <div className="flex justify-between text-luxury-muted">
                  <span>Estimated Tax{selectedOrder.tax_rate ? ` (${selectedOrder.tax_rate}%)` : ''}</span>
                  <span className="text-luxury-cream">{formatCurrency(selectedOrder.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-luxury-muted">
                <span>Delivery Fee</span>
                <span className="text-luxury-cream">
                  {selectedOrder.shipping_amount === 0 ? 'FREE' : formatCurrency(selectedOrder.shipping_amount)}
                </span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-luxury-gold">
                  <span>Discount {selectedOrder.coupon_code ? `(${selectedOrder.coupon_code})` : ''}</span>
                  <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                </div>
              )}
              <div className="border-t border-luxury-border pt-2 flex justify-between font-serif text-sm font-semibold">
                <span className="text-luxury-cream">Total Amount</span>
                <span className="text-luxury-gold">{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
            </div>

            {/* Destination & Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Delivery Address */}
              <div className="bg-luxury-card border border-luxury-border p-4 rounded-sm space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-luxury-gold font-medium">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Delivery Address</span>
                </div>
                <div className="text-luxury-muted space-y-0.5">
                  <p className="text-luxury-cream font-medium">
                    {selectedOrder.shipping_address?.first_name} {selectedOrder.shipping_address?.last_name}
                  </p>
                  <p>{selectedOrder.shipping_address?.address_line1}</p>
                  <p>
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}
                  </p>
                  <p>{selectedOrder.shipping_address?.country}</p>
                  <p className="pt-1 text-[11px] text-luxury-gold">{selectedOrder.shipping_address?.phone}</p>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-luxury-card border border-luxury-border p-4 rounded-sm space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-luxury-gold font-medium">
                  <Truck className="h-3.5 w-3.5" />
                  <span>Order Timeline</span>
                </div>
                {selectedOrder.timeline && selectedOrder.timeline.length > 0 ? (
                  <div className="space-y-2.5 pt-1">
                    {selectedOrder.timeline.map((t, idx) => (
                      <div key={t.id || idx} className="flex items-start gap-2 text-[11px]">
                        <div className="h-1.5 w-1.5 rounded-full bg-luxury-gold mt-1 shrink-0" />
                        <div>
                          <p className="text-luxury-cream font-medium">{t.title}</p>
                          {t.description && <p className="text-luxury-muted text-[10px]">{t.description}</p>}
                          <span className="text-[9px] text-luxury-muted/70">{formatDateTime(t.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-luxury-muted italic text-[11px]">No updates yet</p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-luxury-border">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-luxury-border text-luxury-muted hover:text-luxury-cream text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/checkout/confirmation/${selectedOrder.order_number}`)}
                  className="px-4 py-2 bg-luxury-charcoal hover:bg-luxury-border text-luxury-cream text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                >
                  Full Receipt
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/track-order?orderNumber=${selectedOrder.order_number}&email=${encodeURIComponent(
                        selectedOrder.email
                      )}`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-luxury-gold text-black hover:bg-luxury-gold-light text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Track Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
