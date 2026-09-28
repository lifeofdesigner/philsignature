import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle2, Clock, Loader2, PackageCheck, Truck, ArrowRight, ShieldCheck, XCircle } from 'lucide-react';
import { useOrderDetail } from '../hooks/useOrders';
import { BankTransferDetails } from '../components/BankTransferDetails';
import { paymentService, type SupportedGateway } from '@/services/PaymentService';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { ErrorState } from '@/components/feedback/ErrorState';

const RETRYABLE_GATEWAYS: SupportedGateway[] = ['paystack', 'flutterwave', 'korapay'];

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const methodParam = searchParams.get('method');
  const [isRetrying, setIsRetrying] = useState(false);

  const { data: order, isLoading, error, refetch } = useOrderDetail(orderNumber);
  const { data: bankConfig } = useQuery({
    queryKey: ['payment-bank-transfer-config'],
    queryFn: () => paymentService.getBankTransferConfig(),
    staleTime: 1000 * 60 * 10,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl">
        <ErrorState
          title="Order Not Found"
          message="We could not find this order. Please check your order number and try again."
          onRetry={refetch}
        />
      </div>
    );
  }

  const isPaid = order.financial_status === 'paid';
  const isBankTransfer = order.payment_method === 'bank_transfer' || methodParam === 'bank_transfer';
  const isFailedOrPending = !isPaid && !isBankTransfer;
  const shippingAddr = (order.shipping_address as Record<string, string>) || {};
  const canRetryGateway = RETRYABLE_GATEWAYS.includes(order.payment_method as SupportedGateway);

  const handleRetryPayment = async () => {
    if (!canRetryGateway) {
      navigate('/checkout');
      return;
    }
    setIsRetrying(true);
    try {
      await paymentService.initializeCheckout(order.payment_method as SupportedGateway, {
        email: order.email,
        phone: order.phone,
        name: `${shippingAddr.first_name || ''} ${shippingAddr.last_name || ''}`.trim() || order.email,
        amount: order.total_amount,
        reference: order.order_number,
        metadata: { order_id: order.id },
        onSuccess: async (reference) => {
          try {
            const result = await paymentService.verifyPayment(
              order.payment_method as SupportedGateway,
              reference,
              order.id
            );
            if (!result.success) {
              toast.error(result.reason || 'We could not verify your payment. Please try again or contact support.');
              return;
            }
            toast.success('Payment confirmed!');
            await refetch();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error verifying payment');
          } finally {
            setIsRetrying(false);
          }
        },
        onCancel: () => {
          setIsRetrying(false);
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start payment. Please try again.');
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black pb-24 pt-12">
      <div className="container mx-auto px-4 sm:px-8 max-w-3xl">
        {/* Header Status Card */}
        <div className="bg-luxury-card border border-luxury-gold/30 p-8 text-center rounded relative overflow-hidden mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-luxury-gold/10 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold">
            {isPaid ? (
              <CheckCircle2 className="h-7 w-7" />
            ) : isFailedOrPending ? (
              <XCircle className="h-7 w-7 text-red-400" />
            ) : (
              <Clock className="h-7 w-7 text-amber-400" />
            )}
          </div>

          <span className="text-[10px] uppercase tracking-luxury-widest text-luxury-gold font-medium block mb-1">
            {isPaid ? 'Payment Confirmed' : isFailedOrPending ? 'Payment Not Completed' : 'Order Placed — Waiting for Payment'}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-luxury-cream font-normal mb-2">
            {isFailedOrPending ? 'Your Payment Was Not Completed' : 'Thank You for Your Order!'}
          </h1>
          <p className="text-xs text-luxury-muted max-w-md mx-auto leading-relaxed">
            {isPaid
              ? 'Your order has been confirmed and sent to our team. A confirmation email has been sent to you.'
              : isFailedOrPending
              ? 'We saved your order, but your payment was cancelled or could not be verified. Your items are still in your cart — please retry payment to complete your purchase.'
              : 'Your order has been saved. Please complete your bank transfer using your order number as the reference.'}
          </p>

          <div className="mt-6 inline-flex items-center gap-3 bg-luxury-card border border-luxury-border px-5 py-2.5 rounded-sm text-xs">
            <span className="text-luxury-muted">Order Number:</span>
            <span className="text-luxury-gold font-mono font-bold tracking-wider">{order.order_number}</span>
          </div>

          {isFailedOrPending && (
            <div className="mt-6">
              <button
                type="button"
                onClick={handleRetryPayment}
                disabled={isRetrying}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-8 py-3 bg-luxury-gold text-black hover:bg-luxury-gold-light disabled:opacity-60 rounded-sm text-xs font-semibold uppercase tracking-luxury-wide transition-colors cursor-pointer"
              >
                <span>{isRetrying ? 'Processing...' : 'Retry Payment'}</span>
                {isRetrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Bank Transfer Instructions (if applicable) */}
        {isBankTransfer && !isPaid && bankConfig && (
          <div className="mb-8">
            <BankTransferDetails config={bankConfig} orderNumber={order.order_number} />
          </div>
        )}

        <div className="bg-luxury-card border border-luxury-border rounded-sm p-6 space-y-6 mb-8">
          <div className="flex items-center justify-between border-b border-luxury-border pb-4">
            <h3 className="font-serif text-base text-luxury-cream font-normal flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-luxury-gold" />
              <span>Order Details</span>
            </h3>
            <span
              className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 border rounded-sm font-medium ${
                isPaid
                  ? 'text-emerald-700 border-emerald-300 bg-emerald-50 dark:text-emerald-300 dark:border-emerald-800/40 dark:bg-emerald-950/60'
                  : isFailedOrPending
                  ? 'text-red-700 border-red-300 bg-red-50 dark:text-red-300 dark:border-red-800/40 dark:bg-red-950/60'
                  : 'text-amber-800 border-amber-300 bg-amber-50 dark:text-amber-300 dark:border-amber-800/40 dark:bg-amber-950/60'
              }`}
            >
              {isPaid ? 'Paid' : isFailedOrPending ? 'Payment Not Completed' : 'Payment Pending'}
            </span>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-luxury-border/40 last:border-0">
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
                    <p className="text-[10px] text-luxury-muted">Qty: {item.quantity} • 100ml</p>
                  </div>
                </div>
                <span className="text-luxury-cream font-medium">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>

          {/* Financial Totals */}
          <div className="border-t border-luxury-border pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-luxury-muted">
              <span>Subtotal</span>
              <span className="text-luxury-cream">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-luxury-muted">
              <span>Delivery Fee</span>
              <span className="text-luxury-cream">
                {order.shipping_amount === 0 ? 'FREE' : formatCurrency(order.shipping_amount)}
              </span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-luxury-gold">
                <span>Discount ({order.coupon_code})</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div className="border-t border-luxury-border pt-3 flex justify-between items-baseline">
              <span className="font-serif text-sm text-luxury-cream">Total Amount</span>
              <span className="font-serif text-base text-luxury-gold font-bold">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping & Recipient Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-8">
          <div className="bg-luxury-card border border-luxury-border rounded-sm p-5">
            <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-muted block mb-1 font-medium">
              Delivery Address
            </span>
            <p className="text-luxury-cream font-medium">{shippingAddr.first_name} {shippingAddr.last_name}</p>
            <p className="text-luxury-muted">{shippingAddr.address_line1 || shippingAddr.street_address}</p>
            <p className="text-luxury-muted">{shippingAddr.city}, {shippingAddr.state}</p>
            <p className="text-luxury-muted">{shippingAddr.country}</p>
          </div>

          <div className="bg-luxury-card border border-luxury-border rounded-sm p-5">
            <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-muted block mb-1 font-medium">
              Payment Info
            </span>
            <p className="text-luxury-cream font-medium uppercase tracking-wider">{order.payment_method}</p>
            {order.payment_reference && (
              <p className="text-luxury-muted text-[11px] font-mono mt-0.5">Ref: {order.payment_reference}</p>
            )}
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-luxury-gold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>100% Genuine Perfume Guaranteed</span>
            </div>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(`/track-order?orderNumber=${order.order_number}&email=${encodeURIComponent(order.email)}`)}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black rounded-sm text-xs font-semibold uppercase tracking-luxury-wide transition-colors cursor-pointer"
          >
            <Truck className="h-4 w-4" />
            <span>Track My Order</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-8 py-3 bg-luxury-gold text-black hover:bg-luxury-gold-light rounded-sm text-xs font-semibold uppercase tracking-luxury-wide transition-colors cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

