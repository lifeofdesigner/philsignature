import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 max-w-5xl">
      <div className="text-center space-y-2 mb-12">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Privileged Acquisition
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-white font-normal">
          Bespoke Checkout
        </h1>
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-luxury-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-luxury-gold" />
          <span>Encrypted 256-Bit SSL Luxury Transaction</span>
        </div>
      </div>

      <div className="bg-luxury-card border border-luxury-border p-8 text-center text-xs text-luxury-muted leading-relaxed font-light">
        <p>
          The multi-gateway checkout flow (Paystack, Flutterwave, Direct Bank Transfer, Cash on Delivery) is ready to connect with Supabase in Phase 5.
        </p>
      </div>
    </div>
  );
};
