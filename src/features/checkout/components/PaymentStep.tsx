import React from 'react';
import { ArrowLeft, CreditCard, ShieldCheck, Landmark, Loader2, Sparkles } from 'lucide-react';
import { BankTransferDetails } from './BankTransferDetails';
import type { BankTransferConfig } from '@/services/PaymentService';

interface PaymentStepProps {
  paymentMethod: 'paystack' | 'flutterwave' | 'korapay' | 'bank_transfer';
  setPaymentMethod: (method: 'paystack' | 'flutterwave' | 'korapay' | 'bank_transfer') => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  bankDetails: BankTransferConfig;
  enabledPaymentMethods: Record<'paystack' | 'flutterwave' | 'korapay' | 'bank_transfer', boolean>;
  totalAmount: number;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  paymentMethod,
  setPaymentMethod,
  orderNotes,
  setOrderNotes,
  bankDetails,
  enabledPaymentMethods,
  totalAmount,
  isSubmitting,
  onBack,
  onSubmit,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  type PaymentOptionId = 'paystack' | 'flutterwave' | 'korapay' | 'bank_transfer';

  const allPaymentOptions: {
    id: PaymentOptionId;
    title: string;
    description: string;
    badge?: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'paystack' as PaymentOptionId,
      title: 'Paystack (Cards, Bank Transfer, USSD)',
      description: 'Pay easily with your Nigerian ATM card (Mastercard, Visa, Verve), USSD, or Instant Transfer.',
      badge: 'Recommended',
      icon: <CreditCard className="h-5 w-5 text-luxury-gold" />,
    },
    {
      id: 'flutterwave' as PaymentOptionId,
      title: 'Flutterwave',
      description: 'Pay with International Cards, Mobile Money, or Bank Transfer.',
      icon: <Sparkles className="h-5 w-5 text-luxury-gold" />,
    },
    {
      id: 'korapay' as PaymentOptionId,
      title: 'Korapay',
      description: 'Pay with Cards, Bank Transfer, or Mobile Money.',
      icon: <CreditCard className="h-5 w-5 text-luxury-gold" />,
    },
    {
      id: 'bank_transfer' as PaymentOptionId,
      title: 'Direct Bank Transfer',
      description: 'Transfer directly to our GTBank business account. Order is confirmed once payment is received.',
      icon: <Landmark className="h-5 w-5 text-luxury-gold" />,
    },
  ];

  const paymentOptions = allPaymentOptions.filter((option) => enabledPaymentMethods[option.id]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h3 className="font-serif text-lg text-luxury-cream font-normal mb-1">
          Payment Method & Delivery Notes
        </h3>
        <p className="text-xs text-luxury-muted">
          All payments are safe, encrypted, and 100% secure.
        </p>
      </div>

      {/* Payment Options Grid */}
      <div className="space-y-3">
        {paymentOptions.map((opt) => {
          const isSelected = paymentMethod === opt.id;
          return (
            <label
              key={opt.id}
              onClick={() => setPaymentMethod(opt.id)}
              className={`flex items-start justify-between p-5 border cursor-pointer transition-all duration-200 rounded-sm shadow-xs ${
                isSelected
                  ? 'border-luxury-gold bg-luxury-gold/5 shadow-md shadow-luxury-gold/5'
                  : 'border-luxury-border bg-luxury-card hover:border-luxury-gold/40'
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="radio"
                  name="payment_gateway"
                  checked={isSelected}
                  onChange={() => setPaymentMethod(opt.id)}
                  className="mt-1 text-luxury-gold focus:ring-luxury-gold h-4 w-4 border-luxury-border bg-luxury-card cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-luxury-cream">{opt.title}</span>
                    {opt.badge && (
                      <span className="text-[9px] uppercase tracking-wider text-luxury-gold bg-luxury-gold/10 px-2 py-0.5 border border-luxury-gold/30 rounded-sm">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-luxury-muted mt-1 leading-relaxed max-w-xl">
                    {opt.description}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block pl-3">{opt.icon}</div>
            </label>
          );
        })}
      </div>

      {/* Bank Transfer Details Box (Conditional) */}
      {paymentMethod === 'bank_transfer' && (
        <BankTransferDetails config={bankDetails} />
      )}

      {/* Order Notes / Gift Message */}
      <div>
        <label className="block text-[11px] uppercase tracking-luxury-wide text-luxury-muted mb-1.5 font-medium">
          Delivery Notes or Gift Message (Optional)
        </label>
        <textarea
          rows={3}
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          placeholder="Special delivery instructions, estate gate code, or gift note..."
          className="w-full bg-luxury-card border border-luxury-border p-3 text-xs text-luxury-cream placeholder:text-luxury-muted focus:outline-none focus:border-luxury-gold transition-colors resize-none rounded-sm"
        />
      </div>

      {/* Security Assurance Banner */}
      <div className="flex items-center gap-2.5 p-3.5 bg-luxury-card border border-luxury-border text-xs text-luxury-muted rounded-sm shadow-xs">
        <ShieldCheck className="h-4 w-4 text-luxury-gold shrink-0" />
        <span>100% Original Luxury Perfume Guarantee. Handled and delivered with care.</span>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex items-center justify-between border-t border-luxury-border">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="min-h-[44px] inline-flex items-center gap-2 px-6 py-3 border border-luxury-border hover:border-luxury-gold text-luxury-muted hover:text-luxury-cream text-xs uppercase tracking-luxury-wide rounded-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Shipping</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="min-h-[44px] inline-flex items-center gap-2 px-10 py-3.5 bg-luxury-gold text-black hover:bg-luxury-gold-light text-xs font-semibold uppercase tracking-luxury-wide rounded-sm transition-all shadow-lg shadow-luxury-gold/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing Order...</span>
            </>
          ) : (
            <>
              <span>{paymentMethod === 'bank_transfer' ? 'Place Order' : 'Pay Now'} • {formatCurrency(totalAmount)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

