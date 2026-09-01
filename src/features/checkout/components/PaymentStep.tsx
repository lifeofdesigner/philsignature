import React from 'react';
import { ArrowLeft, CreditCard, ShieldCheck, Landmark, Loader2, Sparkles } from 'lucide-react';
import { BankTransferDetails } from './BankTransferDetails';
import type { BankTransferConfig } from '@/services/PaymentService';

interface PaymentStepProps {
  paymentMethod: 'paystack' | 'flutterwave' | 'bank_transfer';
  setPaymentMethod: (method: 'paystack' | 'flutterwave' | 'bank_transfer') => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  bankDetails: BankTransferConfig;
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

  const paymentOptions: {
    id: 'paystack' | 'flutterwave' | 'bank_transfer';
    title: string;
    description: string;
    badge?: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'paystack',
      title: 'Paystack Luxury Gateway',
      description: 'Debit/Credit Cards (Mastercard, Visa, Verve), Apple Pay, USSD & Instant Bank Transfer.',
      badge: 'Recommended',
      icon: <CreditCard className="h-5 w-5 text-luxury-gold" />,
    },
    {
      id: 'flutterwave',
      title: 'Flutterwave Global Checkout',
      description: 'International Credit Cards, Mobile Money, and African Cross-Border Currencies.',
      icon: <Sparkles className="h-5 w-5 text-luxury-gold" />,
    },
    {
      id: 'bank_transfer',
      title: 'Direct Private Bank Wire',
      description: 'Direct corporate transfer to Guaranty Trust Bank. White-glove manual verification.',
      icon: <Landmark className="h-5 w-5 text-luxury-gold" />,
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h3 className="font-serif text-lg text-white font-normal mb-1">
          Settlement Channel & Atelier Notes
        </h3>
        <p className="text-xs text-luxury-muted">
          All transactions are encrypted with PCI-DSS Level 1 bank-grade security protocols.
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
              className={`flex items-start justify-between p-5 border cursor-pointer transition-all duration-200 rounded ${
                isSelected
                  ? 'border-luxury-gold bg-luxury-gold/5 shadow-md shadow-luxury-gold/5'
                  : 'border-luxury-border bg-luxury-card/40 hover:border-luxury-gold/40'
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="radio"
                  name="payment_gateway"
                  checked={isSelected}
                  onChange={() => setPaymentMethod(opt.id)}
                  className="mt-1 text-luxury-gold focus:ring-luxury-gold h-4 w-4 border-luxury-border bg-luxury-black cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{opt.title}</span>
                    {opt.badge && (
                      <span className="text-[9px] uppercase tracking-wider text-luxury-gold bg-luxury-gold/10 px-2 py-0.5 border border-luxury-gold/30">
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

      {/* Bespoke Order Notes / Gift Message */}
      <div>
        <label className="block text-[11px] uppercase tracking-luxury-wide text-luxury-muted mb-1.5 font-medium">
          Atelier Delivery Notes or Gift Memoir (Optional)
        </label>
        <textarea
          rows={3}
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          placeholder="Special concierge delivery instructions, gated community codes, or bespoke gift calligraphy..."
          className="w-full bg-luxury-black border border-luxury-border p-3 text-xs text-white placeholder:text-luxury-muted/40 focus:outline-none focus:border-luxury-gold transition-colors resize-none rounded"
        />
      </div>

      {/* Security Assurance Banner */}
      <div className="flex items-center gap-2.5 p-3.5 bg-luxury-card/50 border border-luxury-border text-xs text-luxury-muted rounded">
        <ShieldCheck className="h-4 w-4 text-luxury-gold shrink-0" />
        <span>Your acquisition is backed by Philz Signature Guarantee of Authenticity and Secure Handling.</span>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex items-center justify-between border-t border-luxury-border">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-3 border border-luxury-border hover:border-white text-luxury-muted hover:text-white text-xs uppercase tracking-luxury-wide transition-colors cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Shipping</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-10 py-4 bg-luxury-gold text-luxury-black hover:bg-luxury-gold-light text-xs font-medium uppercase tracking-luxury-wide transition-all shadow-lg shadow-luxury-gold/15 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Transmitting Consignment...</span>
            </>
          ) : (
            <>
              <span>Authorize & Acquire • {formatCurrency(totalAmount)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

