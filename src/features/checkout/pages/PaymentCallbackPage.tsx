import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  Loader2,
  PackageCheck,
  Truck,
  ArrowRight,
  ShieldCheck,
  XCircle,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '@/features/cart/hooks/useCart';
import { supabase } from '@/lib/supabase';

interface VerifiedOrderData {
  id: string;
  orderNumber: string;
  financialStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  fulfillmentStatus: string;
  totalAmount: number;
  email: string;
  phone?: string;
  paymentMethod: string;
  paymentReference?: string;
  createdAt: string;
  shippingAddress?: Record<string, string>;
  items?: Array<{
    id: string;
    product_name: string;
    sku?: string;
    quantity: number;
    price?: number;
    subtotal: number;
    product_image_url?: string;
  }>;
}

type VerificationState = 'checking' | 'paid' | 'pending' | 'failed' | 'not_found';

const MAX_POLL_ATTEMPTS = 15; // 15 attempts * 2s = 30 seconds max polling
const POLL_INTERVAL_MS = 2000;

export const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const reference = (searchParams.get('reference') || searchParams.get('trxref') || '').trim();

  const [state, setState] = useState<VerificationState>('checking');
  const [order, setOrder] = useState<VerifiedOrderData | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Connecting with boutique servers to verify Paystack confirmation...'
  );

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredConfetti = useRef<boolean>(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Strictly Read-Only Status Check.
   * Calls the backend status API or reads from Supabase directly.
   * NEVER modifies or marks the order as paid from this page!
   */
  const checkVerifiedStatus = useCallback(async (ref: string): Promise<VerifiedOrderData | null> => {
    // 1. Try serverless read-only endpoint first
    try {
      const res = await fetch(`/api/paystack/status?reference=${encodeURIComponent(ref)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.exists && data?.order) {
          return data.order as VerifiedOrderData;
        }
      }
    } catch {
      // Fallback to Supabase client query if serverless endpoint is unreachable
    }

    // 2. Direct read-only fallback via client Supabase
    try {
      let { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          financial_status,
          fulfillment_status,
          total_amount,
          email,
          phone,
          payment_method,
          payment_reference,
          created_at,
          shipping_address,
          items:order_items (
            id,
            product_name,
            sku,
            quantity,
            price,
            subtotal,
            product_image_url
          )
        `)
        .or(`order_number.eq.${ref},payment_reference.eq.${ref}`)
        .maybeSingle();

      // Check payment_transactions table if not found by primary columns
      if (!data && !error) {
        const { data: tx } = await supabase
          .from('payment_transactions')
          .select('order_id')
          .eq('reference', ref)
          .maybeSingle();

        if (tx?.order_id) {
          const { data: byTxOrderId } = await supabase
            .from('orders')
            .select(`
              id,
              order_number,
              financial_status,
              fulfillment_status,
              total_amount,
              email,
              phone,
              payment_method,
              payment_reference,
              created_at,
              shipping_address,
              items:order_items (
                id,
                product_name,
                sku,
                quantity,
                price,
                subtotal,
                product_image_url
              )
            `)
            .eq('id', tx.order_id)
            .maybeSingle();

          if (byTxOrderId) data = byTxOrderId;
        }
      }

      if (!error && data) {
        return {
          id: data.id,
          orderNumber: data.order_number,
          financialStatus: data.financial_status as VerifiedOrderData['financialStatus'],
          fulfillmentStatus: data.fulfillment_status,
          totalAmount: Number(data.total_amount),
          email: data.email,
          phone: data.phone,
          paymentMethod: data.payment_method,
          paymentReference: data.payment_reference,
          createdAt: data.created_at,
          shippingAddress: data.shipping_address as Record<string, string>,
          items: data.items || [],
        };
      }
    } catch (err) {
      console.warn('[PaymentCallback] Fallback query error:', err);
    }

    return null;
  }, []);

  const runVerification = useCallback(
    async (currentPoll: number) => {
      if (!reference) {
        setState('not_found');
        return;
      }

      setStatusMessage(
        currentPoll === 0
          ? 'Verifying transaction status with Paystack webhook...'
          : `Awaiting webhook finalization (attempt ${currentPoll + 1} of ${MAX_POLL_ATTEMPTS})...`
      );

      const verifiedOrder = await checkVerifiedStatus(reference);

      if (verifiedOrder) {
        setOrder(verifiedOrder);

        if (verifiedOrder.financialStatus === 'paid') {
          setState('paid');
          clearCart();
          if (!hasTriggeredConfetti.current) {
            hasTriggeredConfetti.current = true;
            try {
              confetti({
                particleCount: 90,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#d4af37', '#fef08a', '#10b981', '#f59e0b'],
              });
            } catch {
              // Non-blocking confetti
            }
          }
          return;
        }

        if (verifiedOrder.financialStatus === 'failed') {
          setState('failed');
          return;
        }

        // If financial_status is still pending, continue polling for webhook completion
        if (currentPoll < MAX_POLL_ATTEMPTS - 1) {
          pollTimerRef.current = setTimeout(() => {
            runVerification(currentPoll + 1);
          }, POLL_INTERVAL_MS);
          return;
        } else {
          // Reached max poll attempts - webhook may still be processing in background
          setState('pending');
          return;
        }
      } else {
        // Order not found on initial check - retry a few times in case of replica lag
        if (currentPoll < 3) {
          pollTimerRef.current = setTimeout(() => {
            runVerification(currentPoll + 1);
          }, POLL_INTERVAL_MS);
        } else {
          setState('not_found');
        }
      }
    },
    [reference, checkVerifiedStatus, clearCart]
  );

  useEffect(() => {
    runVerification(0);

    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, [runVerification]);

  const handleManualRefresh = () => {
    setState('checking');
    runVerification(0);
  };

  return (
    <div className="min-h-screen bg-luxury-black pb-24 pt-12">
      <div className="container mx-auto px-4 sm:px-8 max-w-3xl">
        {/* CHECKING / VERIFYING STATE */}
        {state === 'checking' && (
          <div className="bg-luxury-card border border-luxury-gold/30 p-10 text-center rounded relative overflow-hidden mb-8 shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-luxury-gold/10 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>

            <span className="text-[10px] uppercase tracking-luxury-widest text-luxury-gold font-medium block mb-2">
              Paystack Live Verification
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-luxury-cream font-normal mb-3">
              Verifying Payment Confirmation
            </h1>
            <p className="text-xs text-luxury-muted max-w-md mx-auto leading-relaxed mb-6">
              {statusMessage}
            </p>

            <div className="inline-flex items-center gap-3 bg-luxury-black/60 border border-luxury-border px-5 py-2.5 rounded-sm text-xs">
              <span className="text-luxury-muted">Reference:</span>
              <span className="text-luxury-gold font-mono font-semibold tracking-wider">
                {reference || 'Unavailable'}
              </span>
            </div>

            <p className="text-[11px] text-luxury-muted/70 mt-6 italic">
              Please keep this page open while our single source of truth verifies your transaction.
            </p>
          </div>
        )}

        {/* VERIFIED PAID STATE */}
        {state === 'paid' && order && (
          <>
            <div className="bg-luxury-card border border-luxury-gold/50 p-8 sm:p-10 text-center rounded relative overflow-hidden mb-8 shadow-2xl">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <span className="text-[10px] uppercase tracking-luxury-widest text-emerald-400 font-semibold block mb-2">
                Webhook Verified &bull; Single Source of Truth
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl text-luxury-cream font-normal mb-2">
                Payment Confirmed
              </h1>
              <p className="text-xs text-luxury-muted max-w-lg mx-auto leading-relaxed mb-6">
                Your payment has been successfully confirmed and verified via Paystack. Your luxury fragrance allocation is secured, and transactional receipts have been sent to your email.
              </p>

              <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-luxury-black/70 border border-luxury-border px-6 py-3 rounded-sm text-xs">
                <div>
                  <span className="text-luxury-muted mr-2">Consignment Number:</span>
                  <span className="text-luxury-gold font-mono font-bold tracking-wider">{order.orderNumber}</span>
                </div>
                <div className="border-l border-luxury-border/60 pl-4">
                  <span className="text-luxury-muted mr-2">Amount Paid:</span>
                  <span className="text-luxury-cream font-serif font-bold">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Itemized Order Summary */}
            <div className="bg-luxury-card border border-luxury-border rounded-sm p-6 sm:p-8 space-y-6 mb-8 shadow-xl">
              <div className="flex items-center justify-between border-b border-luxury-border pb-4">
                <h3 className="font-serif text-base text-luxury-cream font-normal flex items-center gap-2">
                  <PackageCheck className="h-4 w-4 text-luxury-gold" />
                  <span>Verified Order Summary</span>
                </h3>
                <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 border rounded-sm font-medium text-emerald-400 border-emerald-800/40 bg-emerald-950/60">
                  Paid via Paystack
                </span>
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs py-2 border-b border-luxury-border/40 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        {item.product_image_url && (
                          <img
                            src={item.product_image_url}
                            alt={item.product_name}
                            className="w-10 h-12 object-cover rounded-sm bg-luxury-card border border-luxury-border"
                          />
                        )}
                        <div>
                          <h4 className="font-serif text-luxury-cream">{item.product_name}</h4>
                          <p className="text-[10px] text-luxury-muted">
                            Qty: {item.quantity} &bull; {item.sku || 'Official Scent'}
                          </p>
                        </div>
                      </div>
                      <span className="text-luxury-cream font-medium">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-luxury-muted">Fragrance items registered with order.</p>
                )}
              </div>

              {/* Total Card */}
              <div className="border-t border-luxury-border pt-4 flex justify-between items-baseline">
                <span className="font-serif text-sm text-luxury-cream">Total Verified Amount</span>
                <span className="font-serif text-lg text-luxury-gold font-bold">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Delivery & Security Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-8">
              <div className="bg-luxury-card border border-luxury-border rounded-sm p-5">
                <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-muted block mb-1 font-medium">
                  Dispatch Recipient
                </span>
                <p className="text-luxury-cream font-medium">
                  {order.shippingAddress?.first_name} {order.shippingAddress?.last_name}
                </p>
                <p className="text-luxury-muted">{order.shippingAddress?.address_line1 || order.shippingAddress?.street_address}</p>
                <p className="text-luxury-muted">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p className="text-luxury-muted mt-1">{order.email}</p>
              </div>

              <div className="bg-luxury-card border border-luxury-border rounded-sm p-5">
                <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-muted block mb-1 font-medium">
                  Transaction Audit
                </span>
                <p className="text-luxury-cream font-medium uppercase tracking-wider">{order.paymentMethod}</p>
                <p className="text-luxury-muted text-[11px] font-mono mt-0.5">Ref: {reference}</p>
                <div className="flex items-center gap-1.5 mt-3 text-[11px] text-luxury-gold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Protected by Paystack Secure Banking</span>
                </div>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() =>
                  navigate(`/track-order?orderNumber=${order.orderNumber}&email=${encodeURIComponent(order.email)}`)
                }
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black rounded-sm text-xs font-semibold uppercase tracking-luxury-wide transition-colors cursor-pointer"
              >
                <Truck className="h-4 w-4" />
                <span>Track Consignment</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/checkout/confirmation/${order.orderNumber}`)}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-8 py-3 bg-luxury-gold text-black hover:bg-luxury-gold-light rounded-sm text-xs font-semibold uppercase tracking-luxury-wide transition-colors cursor-pointer"
              >
                <span>View Full Receipt</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}

        {/* PENDING STATE (Awaiting Webhook Finalization) */}
        {state === 'pending' && (
          <div className="bg-luxury-card border border-amber-500/40 p-8 sm:p-10 text-center rounded relative overflow-hidden mb-8 shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Clock className="h-8 w-8" />
            </div>

            <span className="text-[10px] uppercase tracking-luxury-widest text-amber-400 font-medium block mb-2">
              Payment Under Review
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-luxury-cream font-normal mb-2">
              Awaiting Gateway Finalization
            </h1>
            <p className="text-xs text-luxury-muted max-w-lg mx-auto leading-relaxed mb-6">
              Your payment has been received by Paystack and is undergoing bank verification. As soon as the webhook completes, your order confirmation will automatically be transmitted to your email.
            </p>

            <div className="inline-flex items-center gap-3 bg-luxury-black/60 border border-luxury-border px-5 py-2.5 rounded-sm text-xs mb-8">
              <span className="text-luxury-muted">Reference:</span>
              <span className="text-luxury-gold font-mono font-bold tracking-wider">{reference}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleManualRefresh}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black rounded-sm text-xs font-semibold uppercase tracking-luxury-wide transition-colors cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Re-check Verification Status</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-8 py-3 bg-luxury-gold text-black hover:bg-luxury-gold-light rounded-sm text-xs font-semibold uppercase tracking-luxury-wide transition-colors cursor-pointer"
              >
                <span>Return to Store</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* FAILED STATE */}
        {state === 'failed' && (
          <div className="bg-luxury-card border border-red-500/40 p-8 sm:p-10 text-center rounded relative overflow-hidden mb-8 shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400">
              <XCircle className="h-8 w-8" />
            </div>

            <span className="text-[10px] uppercase tracking-luxury-widest text-red-400 font-medium block mb-2">
              Payment Not Successful
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-luxury-cream font-normal mb-2">
              Transaction Was Not Completed
            </h1>
            <p className="text-xs text-luxury-muted max-w-lg mx-auto leading-relaxed mb-6">
              Your transaction was declined or canceled by the payment processor. No funds were debited for this acquisition. You may retry payment or select an alternate payment method.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-8 py-3 bg-luxury-gold text-black hover:bg-luxury-gold-light rounded-sm text-xs font-semibold uppercase tracking-luxury-wide transition-colors cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Return to Checkout</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 border border-luxury-border text-luxury-cream hover:bg-luxury-card rounded-sm text-xs font-medium uppercase tracking-luxury-wide transition-colors cursor-pointer"
              >
                <span>Contact Boutique Concierge</span>
              </button>
            </div>
          </div>
        )}

        {/* NOT FOUND / INVALID SESSION STATE */}
        {state === 'not_found' && (
          <div className="bg-luxury-card border border-luxury-border p-8 sm:p-10 text-center rounded relative overflow-hidden mb-8">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold">
              <AlertCircle className="h-8 w-8" />
            </div>

            <span className="text-[10px] uppercase tracking-luxury-widest text-luxury-muted font-medium block mb-2">
              Session Notice
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-luxury-cream font-normal mb-2">
              Transaction Reference Not Found
            </h1>
            <p className="text-xs text-luxury-muted max-w-md mx-auto leading-relaxed mb-6">
              We could not find an active transaction reference for this session. Please check your order history or return to the storefront.
            </p>

            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-8 py-3 bg-luxury-gold text-black hover:bg-luxury-gold-light rounded-sm text-xs font-semibold uppercase tracking-luxury-wide transition-colors cursor-pointer"
            >
              <span>Explore Boutique</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
