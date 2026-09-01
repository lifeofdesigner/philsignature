import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, PackageCheck, Clock, Truck, Loader2 } from 'lucide-react';
import { useOrderDetail } from '@/features/checkout/hooks/useOrders';

export const TrackOrderPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrder = searchParams.get('orderNumber') || '';
  const initialEmail = searchParams.get('email') || '';

  const [orderNumberInput, setOrderNumberInput] = useState(initialOrder);
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [searchQuery, setSearchQuery] = useState({ order: initialOrder, email: initialEmail });

  useEffect(() => {
    if (initialOrder) {
      setOrderNumberInput(initialOrder);
      setSearchQuery({ order: initialOrder, email: initialEmail });
    }
  }, [initialOrder, initialEmail]);

  const { data: order, isLoading } = useOrderDetail(searchQuery.order, searchQuery.email);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumberInput.trim()) return;
    setSearchParams({ orderNumber: orderNumberInput.trim(), email: emailInput.trim() });
    setSearchQuery({ order: orderNumberInput.trim(), email: emailInput.trim() });
  };

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-luxury-black pb-24 pt-12">
      <div className="container mx-auto px-4 sm:px-8 max-w-2xl">
        {/* Header Billboard */}
        <div className="text-center space-y-3 mb-10">
          <div className="h-12 w-12 rounded-full border border-luxury-gold/40 bg-luxury-card flex items-center justify-center mx-auto text-luxury-gold">
            <Clock className="h-5 w-5" />
          </div>
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            Consignment Tracking
          </span>
          <h1 className="font-serif text-3xl text-white font-normal">
            Track Consignment Sillage
          </h1>
          <p className="text-xs text-luxury-muted font-light leading-relaxed">
            Enter your unique PHILZ SIGNATURE order reference (e.g. PS-10492) to inspect real-time dispatch milestones.
          </p>
        </div>

        {/* Search Query Form */}
        <div className="bg-luxury-card border border-luxury-border p-6 rounded shadow-xl mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                Order Number *
              </label>
              <input
                type="text"
                placeholder="e.g. PS-8492-1204"
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value.toUpperCase())}
                required
                className="w-full bg-luxury-black border border-luxury-border p-3 text-xs text-white placeholder:text-luxury-muted/40 font-mono tracking-wider focus:outline-none focus:border-luxury-gold transition-colors rounded"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                Account / Delivery Email (Optional verification)
              </label>
              <input
                type="email"
                placeholder="client@domain.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-luxury-black border border-luxury-border p-3 text-xs text-white placeholder:text-luxury-muted/40 focus:outline-none focus:border-luxury-gold transition-colors rounded"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !orderNumberInput.trim()}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-luxury-gold text-luxury-black hover:bg-luxury-gold-light text-xs font-medium uppercase tracking-luxury-wide transition-colors cursor-pointer rounded disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Locating Manifest...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Locate Consignment</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Search Results */}
        {searchQuery.order && !isLoading && (
          <div>
            {order ? (
              <div className="space-y-6 animate-fadeIn">
                {/* Status Card */}
                <div className="bg-luxury-card border border-luxury-gold/30 p-6 rounded space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-luxury-border pb-4">
                    <div>
                      <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Manifest Reference</span>
                      <span className="font-mono text-base font-bold text-luxury-gold">{order.order_number}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Fulfillment Stage</span>
                      <span className="text-xs text-white uppercase tracking-wider font-medium px-2 py-0.5 border border-luxury-border rounded bg-luxury-black">
                        {order.fulfillment_status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-luxury-muted">
                    <div>
                      <span className="text-[10px] uppercase text-luxury-muted tracking-wider block">Placed On</span>
                      <span className="text-white">{formatDate(order.created_at)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-luxury-muted tracking-wider block">Payment</span>
                      <span className="text-white capitalize">{order.payment_method} ({order.financial_status})</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Milestones */}
                <div className="bg-luxury-card border border-luxury-border p-6 rounded space-y-4">
                  <h3 className="font-serif text-sm text-white font-medium flex items-center gap-2">
                    <Truck className="h-4 w-4 text-luxury-gold" />
                    <span>Consignment Progression Milestones</span>
                  </h3>

                  {order.timeline && order.timeline.length > 0 ? (
                    <div className="relative pl-6 space-y-6 border-l border-luxury-gold/30 ml-2 mt-4">
                      {order.timeline.map((entry, idx) => (
                        <div key={entry.id || idx} className="relative">
                          <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-luxury-black border-2 border-luxury-gold flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-luxury-gold" />
                          </div>
                          <div>
                            <div className="flex items-baseline justify-between gap-2">
                              <h4 className="text-xs font-medium text-white">{entry.title}</h4>
                              <span className="text-[10px] text-luxury-muted">{formatDate(entry.created_at)}</span>
                            </div>
                            <p className="text-xs text-luxury-muted mt-0.5">{entry.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-luxury-muted">Initial atelier processing initiated.</p>
                  )}
                </div>

                {/* Manifest Products */}
                <div className="bg-luxury-card border border-luxury-border p-6 rounded space-y-3">
                  <h3 className="font-serif text-sm text-white font-medium flex items-center gap-2">
                    <PackageCheck className="h-4 w-4 text-luxury-gold" />
                    <span>Enclosed Flacons</span>
                  </h3>
                  <div className="space-y-2.5">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs py-1.5 border-b border-luxury-border/40 last:border-0">
                        <div className="flex items-center gap-2.5">
                          {item.product_image_url && (
                            <img
                              src={item.product_image_url}
                              alt={item.product_name}
                              className="w-8 h-10 object-cover rounded bg-luxury-black border border-luxury-border"
                            />
                          )}
                          <span className="text-white">{item.product_name}</span>
                          <span className="text-luxury-muted">×{item.quantity}</span>
                        </div>
                        <span className="text-luxury-gold">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-luxury-card border border-luxury-border p-8 text-center rounded space-y-2 animate-fadeIn">
                <p className="font-serif text-base text-white font-normal">Consignment Not Located</p>
                <p className="text-xs text-luxury-muted">
                  No active or historical order matching reference "{searchQuery.order}" was found. Please verify your reference number.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
