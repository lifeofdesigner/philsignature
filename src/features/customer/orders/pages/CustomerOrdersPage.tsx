import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, PackageCheck, Truck, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCustomerOrders } from '@/features/checkout/hooks/useOrders';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { ROUTES } from '@/constants/routes';

export const CustomerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useCustomerOrders(user?.id);

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

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Order Archive
        </span>
        <h1 className="font-serif text-2xl text-white font-normal mt-1">
          Acquisitions History
        </h1>
        <p className="text-xs text-luxury-muted mt-1">
          Review your private bespoke fragrance acquisitions and track consignment sillage.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-5 w-5" />}
          title="No Past Orders on Record"
          description="Your private fragrance acquisitions will be cataloged here once fulfilled."
          actionLabel="Explore Haute Parfums"
          onAction={() => navigate(ROUTES.SHOP)}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPaid = order.financial_status === 'paid';
            return (
              <div
                key={order.id}
                className="bg-luxury-card border border-luxury-border p-5 rounded space-y-4 hover:border-luxury-gold/40 transition-colors"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-luxury-border/60 pb-3 text-xs">
                  <div>
                    <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Reference</span>
                    <span className="font-mono font-bold text-luxury-gold">{order.order_number}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Acquisition Date</span>
                    <span className="text-white">{formatDate(order.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Financial Status</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                        isPaid
                          ? 'text-green-400 border-green-500/30 bg-green-500/10'
                          : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                      }`}
                    >
                      {isPaid ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                      {order.financial_status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Total Amount</span>
                    <span className="font-serif font-medium text-white">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="flex flex-wrap items-center gap-3">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 bg-luxury-black/50 border border-luxury-border px-2.5 py-1.5 rounded text-xs"
                    >
                      {item.product_image_url && (
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
                          className="w-6 h-8 object-cover rounded bg-luxury-card shrink-0"
                        />
                      )}
                      <span className="text-white truncate max-w-[140px]">{item.product_name}</span>
                      <span className="text-[10px] text-luxury-gold">×{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between border-t border-luxury-border/40 text-xs">
                  <div className="flex items-center gap-1 text-[11px] text-luxury-muted">
                    <PackageCheck className="h-3.5 w-3.5 text-luxury-gold" />
                    <span className="capitalize">Fulfillment: {order.fulfillment_status}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/checkout/confirmation/${order.order_number}`)}
                      className="text-luxury-muted hover:text-white transition-colors cursor-pointer"
                    >
                      View Memoir
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/track-order?orderNumber=${order.order_number}&email=${encodeURIComponent(order.email)}`)}
                      className="inline-flex items-center gap-1 text-luxury-gold hover:text-luxury-gold-light transition-colors cursor-pointer"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      <span>Track Consignment</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
