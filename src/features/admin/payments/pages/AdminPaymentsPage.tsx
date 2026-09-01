import React from 'react';
import { CreditCard, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

export const AdminPaymentsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Financial Gateways
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">
            Payment Gateways
          </h1>
          <p className="text-xs text-luxury-muted font-light mt-1">
            Configure Paystack, Flutterwave, Direct Bank Transfer, and Cash on Delivery.
          </p>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5">
          <Save className="h-3.5 w-3.5" />
          <span>Save Settings</span>
        </Button>
      </div>

      <div className="space-y-6">
        <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-luxury-border/60">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-luxury-gold" />
              <div>
                <h3 className="font-serif text-lg text-white font-normal">Paystack</h3>
                <p className="text-xs text-luxury-muted font-light">
                  Accept Cards, USSD, Apple Pay, and Bank Transfers via Paystack.
                </p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Public Key" placeholder="pk_test_..." />
            <Input label="Secret Key" type="password" placeholder="sk_test_..." />
          </div>
        </div>

        <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-luxury-border/60">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-luxury-gold" />
              <div>
                <h3 className="font-serif text-lg text-white font-normal">Flutterwave</h3>
                <p className="text-xs text-luxury-muted font-light">
                  African and international card checkout with Flutterwave.
                </p>
              </div>
            </div>
            <Switch />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Public Key" placeholder="FLWPUBK_TEST-..." />
            <Input label="Secret Key" type="password" placeholder="FLWSECK_TEST-..." />
          </div>
        </div>

        <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-luxury-border/60">
            <div>
              <h3 className="font-serif text-lg text-white font-normal">
                Direct Bank Transfer (Manual)
              </h3>
              <p className="text-xs text-luxury-muted font-light">
                Display official boutique account details for offline payment.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Bank Name" defaultValue="Access Bank" />
            <Input label="Account Number" defaultValue="0123456789" />
            <Input label="Account Name" defaultValue="PHILZ SIGNATURE LTD" />
          </div>
        </div>
      </div>
    </div>
  );
};

