import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Truck,
  PackageCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Package,
  Check,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderDetail } from '@/features/checkout/hooks/useOrders';

interface StepMilestone {
  index: number;
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TRACKING_STEPS: StepMilestone[] = [
  {
    index: 1,
    key: 'received',
    title: 'Order Received',
    description: "We've received your order and are preparing it.",
    icon: Clock,
  },
  {
    index: 2,
    key: 'payment_confirmed',
    title: 'Payment Confirmed',
    description: 'Your payment has been confirmed.',
    icon: CreditCard,
  },
  {
    index: 3,
    key: 'processing',
    title: 'Processing Order',
    description: 'Your order is being prepared.',
    icon: Sparkles,
  },
  {
    index: 4,
    key: 'ready',
    title: 'Ready for Delivery',
    description: 'Your order is ready and will be delivered soon.',
    icon: Package,
  },
  {
    index: 5,
    key: 'out_for_delivery',
    title: 'Out for Delivery',
    description: 'Your order is on the way.',
    icon: Truck,
  },
  {
    index: 6,
    key: 'delivered',
    title: 'Delivered',
    description: 'Your order has been delivered. Enjoy your fragrance!',
    icon: CheckCircle2,
  },
];

interface ResolvedStatus {
  stepIndex: number; // 1 to 6
  title: string;
  description: string;
  badgeText: string;
  isSpecialState?: boolean;
}

function resolveCustomerStatus(
  fulfillmentStatus?: string | null,
  financialStatus?: string | null
): ResolvedStatus {
  const normFulfillment = (fulfillmentStatus || '').toLowerCase();
  const normFinancial = (financialStatus || '').toLowerCase();

  if (normFulfillment === 'cancelled') {
    return {
      stepIndex: 0,
      title: 'Order Cancelled',
      description: 'Your order has been cancelled. Please contact our concierge team for assistance.',
      badgeText: 'Cancelled',
      isSpecialState: true,
    };
  }

  if (normFulfillment === 'delivered') {
    return {
      stepIndex: 6,
      title: 'Delivered',
      description: 'Your order has been delivered. Enjoy your fragrance!',
      badgeText: 'Delivered',
    };
  }

  if (normFulfillment === 'shipped') {
    return {
      stepIndex: 5,
      title: 'Out for Delivery',
      description: 'Your order is on the way.',
      badgeText: 'Out for Delivery',
    };
  }

  if (normFulfillment === 'packed') {
    return {
      stepIndex: 4,
      title: 'Ready for Delivery',
      description: 'Your order is ready and will be delivered soon.',
      badgeText: 'Ready for Delivery',
    };
  }

  if (normFulfillment === 'processing') {
    return {
      stepIndex: 3,
      title: 'Processing Order',
      description: 'Your order is being prepared.',
      badgeText: 'Processing',
    };
  }

  if (normFinancial === 'paid') {
    return {
      stepIndex: 2,
      title: 'Payment Confirmed',
      description: 'Your payment has been confirmed.',
      badgeText: 'Payment Confirmed',
    };
  }

  // Default initial status
  return {
    stepIndex: 1,
    title: 'Order Received',
    description: "We've received your order and are preparing it.",
    badgeText: 'Order Received',
  };
}

export const TrackOrderPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrder = searchParams.get('orderNumber') || '';
  const initialEmail = searchParams.get('email') || '';

  const [orderNumberInput, setOrderNumberInput] = useState(initialOrder);
  const [submittedQuery, setSubmittedQuery] = useState({
    order: initialOrder.trim().toUpperCase(),
    email: initialEmail.trim(),
  });

  // Sync state when URL query params change
  useEffect(() => {
    if (initialOrder) {
      setOrderNumberInput(initialOrder);
      setSubmittedQuery({
        order: initialOrder.trim().toUpperCase(),
        email: initialEmail.trim(),
      });
    }
  }, [initialOrder, initialEmail]);

  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useOrderDetail(submittedQuery.order, submittedQuery.email);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = orderNumberInput.trim().toUpperCase();
    if (!cleanNumber) return;

    setSearchParams({ orderNumber: cleanNumber });
    setSubmittedQuery({ order: cleanNumber, email: '' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const currentStatus = order
    ? resolveCustomerStatus(order.fulfillment_status, order.financial_status)
    : null;

  return (
    <div className="min-h-screen bg-luxury-black pb-28 pt-10 text-white selection:bg-luxury-gold selection:text-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        
        {/* Header Billboard */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 mb-10"
        >
          <div className="h-14 w-14 rounded-full border border-luxury-gold/40 bg-luxury-card/80 backdrop-blur-md flex items-center justify-center mx-auto text-luxury-gold shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <Truck className="h-6 w-6" />
          </div>
          <span className="text-[10px] uppercase tracking-luxury-widest text-luxury-gold font-semibold block">
            Philz Signature Consignment Tracking
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-luxury-cream font-normal tracking-wide">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-luxury-muted font-light max-w-md mx-auto leading-relaxed">
            Enter your order number to follow the journey of your bespoke fragrances from creation to delivery.
          </p>
        </motion.div>

        {/* Search Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-luxury-card border border-luxury-border/80 p-6 sm:p-8 rounded-sm shadow-xl backdrop-blur-sm mb-8"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label
                htmlFor="orderNumberInput"
                className="block text-[11px] uppercase tracking-wider text-luxury-cream mb-2 font-medium"
              >
                Enter your order number
              </label>
              <div className="relative">
                <input
                  id="orderNumberInput"
                  type="text"
                  placeholder="PS-5266-6151"
                  value={orderNumberInput}
                  onChange={(e) => setOrderNumberInput(e.target.value.toUpperCase())}
                  required
                  autoFocus={!initialOrder}
                  className="w-full h-12 min-h-[48px] bg-black/60 border border-luxury-border p-3.5 pr-12 text-sm text-luxury-cream placeholder:text-luxury-muted/60 font-mono tracking-wider focus:outline-none focus:border-luxury-gold focus-visible:ring-1 focus-visible:ring-luxury-gold transition-all rounded-sm uppercase"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-luxury-muted">
                  <PackageCheck className="h-4 w-4" />
                </div>
              </div>
              <p className="text-[10px] text-luxury-muted/70 mt-1.5 font-light">
                Example: <span className="font-mono text-luxury-gold">PS-5266-6151</span> • Provided in your order confirmation email or SMS.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !orderNumberInput.trim()}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 py-3 px-6 bg-luxury-gold text-black hover:bg-luxury-gold-light active:scale-[0.99] text-xs font-semibold uppercase tracking-luxury-wide transition-all cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(212,175,55,0.25)]"
            >
              <Search className="h-4 w-4" />
              <span>Track Order</span>
            </button>
          </form>
        </motion.div>

        {/* State 1: Loading State */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading-state"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-luxury-card border border-luxury-gold/30 p-12 text-center rounded-sm shadow-xl space-y-4"
            >
              <div className="relative w-12 h-12 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-luxury-gold/20 animate-ping" />
                <div className="w-12 h-12 rounded-full border-2 border-luxury-gold border-t-transparent animate-spin flex items-center justify-center" />
              </div>
              <div className="space-y-1">
                <p className="font-serif text-lg text-luxury-cream">
                  Finding your order...
                </p>
                <p className="text-xs text-luxury-muted font-light">
                  Retrieving latest consignment status for <span className="font-mono text-luxury-gold">{submittedQuery.order}</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* State 2: Error State */}
          {!isLoading && isError && (
            <motion.div
              key="error-state"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-luxury-card border border-red-500/30 p-8 text-center rounded-sm shadow-xl space-y-4"
            >
              <div className="h-12 w-12 rounded-full border border-red-500/40 bg-red-950/20 flex items-center justify-center mx-auto text-red-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <p className="font-serif text-base text-luxury-cream">
                  We couldn't load your order details. Please try again.
                </p>
                <p className="text-xs text-luxury-muted font-light">
                  A network or service interruption occurred while connecting to our dispatch systems.
                </p>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-sm text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </button>
            </motion.div>
          )}

          {/* State 3: Order Not Found State */}
          {!isLoading && !isError && submittedQuery.order && !order && (
            <motion.div
              key="not-found-state"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-luxury-card border border-luxury-border p-8 text-center rounded-sm shadow-xl space-y-3"
            >
              <div className="h-12 w-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center mx-auto text-luxury-muted">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <p className="font-serif text-base text-luxury-cream">
                  We couldn't find an order with that number. Please check and try again.
                </p>
                <p className="text-xs text-luxury-muted font-light max-w-md mx-auto">
                  Please verify that <span className="font-mono text-luxury-gold font-medium">{submittedQuery.order}</span> matches the order reference sent in your receipt.
                </p>
              </div>
            </motion.div>
          )}

          {/* State 4: Order Results Found */}
          {!isLoading && !isError && order && currentStatus && (
            <motion.div
              key="results-state"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* PRIMARY STATUS BANNER */}
              <div className="bg-luxury-card border border-luxury-gold/40 rounded-sm shadow-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-luxury-gold/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
                  <div>
                    <span className="text-[10px] text-luxury-muted uppercase tracking-luxury font-medium block">
                      Order Reference
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-luxury-gold tracking-wide">
                      {order.order_number}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] text-luxury-muted uppercase tracking-luxury font-medium block mb-1">
                      Current Status
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs uppercase tracking-wider font-semibold border border-luxury-gold/40 bg-luxury-gold/10 text-luxury-gold">
                      <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold animate-pulse" />
                      <span>{currentStatus.title}</span>
                    </span>
                  </div>
                </div>

                {/* Status Highlight Banner */}
                <div className="bg-black/50 border border-white/10 rounded-sm p-4 sm:p-5 flex items-start gap-3.5 mb-6">
                  <div className="h-9 w-9 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center shrink-0 text-luxury-gold mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base text-luxury-cream font-medium">
                      {currentStatus.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-luxury-muted/90 font-light mt-0.5 leading-relaxed">
                      {currentStatus.description}
                    </p>
                  </div>
                </div>

                {/* Key Order Meta (Clean, sanitized - NO technical or DB IDs) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-luxury-muted tracking-wider block font-medium">
                      Order Date
                    </span>
                    <span className="text-luxury-cream font-light mt-0.5 block">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-luxury-muted tracking-wider block font-medium">
                      Destination
                    </span>
                    <span className="text-luxury-cream font-light mt-0.5 block">
                      {order.shipping_address?.city
                        ? `${order.shipping_address.city}, ${order.shipping_address.state || 'Nigeria'}`
                        : 'Nigeria'}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase text-luxury-muted tracking-wider block font-medium">
                      Total Items
                    </span>
                    <span className="text-luxury-cream font-light mt-0.5 block">
                      {order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1} Fragrance Creation(s)
                    </span>
                  </div>
                </div>
              </div>

              {/* PROGRESS STEPPER (6 Customer Milestones) */}
              <div className="bg-luxury-card border border-luxury-border/80 rounded-sm shadow-xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
                  <h3 className="font-serif text-base text-luxury-cream font-medium flex items-center gap-2">
                    <Truck className="h-4 w-4 text-luxury-gold" />
                    <span>Fulfillment Journey</span>
                  </h3>
                  <span className="text-[11px] text-luxury-gold font-mono">
                    Step {Math.min(currentStatus.stepIndex, 6)} of 6
                  </span>
                </div>

                {/* Stepper Timeline */}
                <div className="relative pl-6 sm:pl-8 space-y-6 sm:space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                  {TRACKING_STEPS.map((step) => {
                    const isCompleted = currentStatus.stepIndex >= step.index;
                    const isCurrent = currentStatus.stepIndex === step.index;
                    const StepIcon = step.icon;

                    return (
                      <div key={step.key} className="relative flex items-start gap-4">
                        {/* Step Circle Indicator */}
                        <div
                          className={`absolute -left-6 sm:-left-8 top-0.5 h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-luxury-gold text-black shadow-[0_0_12px_rgba(212,175,55,0.6)]'
                              : 'bg-luxury-card border border-white/20 text-white/40'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          ) : (
                            <span className="text-[10px] font-mono">{step.index}</span>
                          )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-sm font-medium ${
                                isCurrent
                                  ? 'text-luxury-gold font-semibold'
                                  : isCompleted
                                  ? 'text-luxury-cream'
                                  : 'text-white/50'
                              }`}
                            >
                              {step.title}
                            </h4>
                            {isCurrent && (
                              <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-luxury-gold/15 border border-luxury-gold/40 text-luxury-gold rounded-full">
                                In Progress
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-xs mt-0.5 leading-relaxed font-light ${
                              isCurrent
                                ? 'text-luxury-cream'
                                : isCompleted
                                ? 'text-luxury-muted'
                                : 'text-white/40'
                            }`}
                          >
                            {step.description}
                          </p>
                        </div>

                        <div className="hidden sm:block text-luxury-gold/60">
                          <StepIcon className="h-4 w-4" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ORDER ITEMS LIST */}
              {order.items && order.items.length > 0 && (
                <div className="bg-luxury-card border border-luxury-border/80 rounded-sm shadow-xl p-6 sm:p-8 space-y-4">
                  <h3 className="font-serif text-base text-luxury-cream font-medium flex items-center gap-2 border-b border-white/10 pb-3">
                    <ShoppingBag className="h-4 w-4 text-luxury-gold" />
                    <span>Creations in this Consignment</span>
                  </h3>

                  <div className="divide-y divide-white/5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.product_image_url ? (
                            <img
                              src={item.product_image_url}
                              alt={item.product_name}
                              className="h-12 w-10 object-cover rounded-xs border border-white/10 bg-black shrink-0"
                            />
                          ) : (
                            <div className="h-12 w-10 rounded-xs border border-white/10 bg-white/5 flex items-center justify-center shrink-0 text-luxury-gold">
                              <Sparkles className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-serif text-sm text-luxury-cream truncate">
                              {item.product_name}
                            </h4>
                            <p className="text-[11px] text-luxury-muted font-light mt-0.5">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>

                        <span className="font-mono text-xs font-semibold text-luxury-gold whitespace-nowrap">
                          {formatCurrency(item.subtotal || item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Summary */}
                  <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-luxury-muted">
                      <span>Subtotal</span>
                      <span className="font-mono text-luxury-cream">{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-luxury-muted">
                      <span>Delivery</span>
                      <span className="font-mono text-luxury-cream">
                        {order.shipping_amount === 0 ? 'COMPLIMENTARY' : formatCurrency(order.shipping_amount)}
                      </span>
                    </div>
                    {Number(order.discount_amount || 0) > 0 && (
                      <div className="flex justify-between text-luxury-gold">
                        <span>Bespoke Privilege Discount</span>
                        <span className="font-mono">-{formatCurrency(order.discount_amount)}</span>
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                      <span className="font-serif text-sm text-luxury-cream">Total</span>
                      <span className="font-mono text-base font-bold text-luxury-gold">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* CLIENT CONCIERGE HELP CARD */}
              <div className="bg-luxury-card/60 border border-white/10 rounded-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-luxury-gold font-medium block">
                    Questions Regarding Your Delivery?
                  </span>
                  <p className="text-xs text-luxury-muted font-light">
                    Our fragrance concierge team is available to assist with special delivery instructions or delivery inquiries.
                  </p>
                </div>
                <a
                  href="https://wa.me/message/OJXETPKJE7L4M1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-sm border border-luxury-gold/50 text-luxury-gold hover:bg-luxury-gold hover:text-black transition-colors text-xs font-semibold uppercase tracking-wider"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Contact Concierge</span>
                </a>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Initial Prompt State (when no search executed yet) */}
        {!submittedQuery.order && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 border border-white/10 rounded-sm p-6 sm:p-8 bg-luxury-card/40 text-center space-y-4"
          >
            <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium block">
              Frequently Asked Questions
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs">
              <div className="bg-black/40 border border-white/5 p-4 rounded-xs space-y-1">
                <h4 className="text-luxury-cream font-medium">Where do I find my order number?</h4>
                <p className="text-luxury-muted font-light leading-relaxed">
                  Your order number starts with <span className="font-mono text-luxury-gold">PS-</span> and is included in your confirmation email, receipt, and SMS notification.
                </p>
              </div>
              <div className="bg-black/40 border border-white/5 p-4 rounded-xs space-y-1">
                <h4 className="text-luxury-cream font-medium">Do I need an account to track?</h4>
                <p className="text-luxury-muted font-light leading-relaxed">
                  No account is required. Both guest patrons and registered clients can track consignments using their order number.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-luxury-muted">
              <span>Looking to explore new scent creations?</span>
              <Link to="/shop" className="text-luxury-gold hover:underline font-medium">
                Visit Haute Parfumerie Boutique →
              </Link>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
export default TrackOrderPage;
