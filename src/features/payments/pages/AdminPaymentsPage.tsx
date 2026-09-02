import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreditCard, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminPayments, type PaymentGatewaysConfig } from '../hooks/useAdminPayments';

export const AdminPaymentsPage: React.FC = () => {
  const { config, isLoading, save, isSaving } = useAdminPayments();
  const [form, setForm] = useState<PaymentGatewaysConfig | null>(null);

  useEffect(() => { setForm(config); }, [config]);

  const handleSave = async () => {
    if (!form) return;
    try {
      await save(form);
      toast.success('Payment gateway settings saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings.');
    }
  };

  if (isLoading || !form) return <PageSkeleton />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Financial Gateways
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">Payment Gateways</h1>
          <p className="text-xs text-luxury-muted font-light mt-1">
            Configure Paystack, Flutterwave, Direct Bank Transfer, and Cash on Delivery.
          </p>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5" disabled={isSaving} onClick={handleSave}>
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
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
            <Switch
              checked={form.paystack_enabled}
              onCheckedChange={(checked) => setForm((p) => (p ? { ...p, paystack_enabled: checked } : p))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Public Key"
              placeholder="pk_test_..."
              value={form.paystack_public_key}
              onChange={(e) => setForm((p) => (p ? { ...p, paystack_public_key: e.target.value } : p))}
            />
            <Input
              label="Secret Key"
              type="password"
              placeholder="sk_test_..."
              value={form.paystack_secret_key}
              onChange={(e) => setForm((p) => (p ? { ...p, paystack_secret_key: e.target.value } : p))}
            />
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
            <Switch
              checked={form.flutterwave_enabled}
              onCheckedChange={(checked) => setForm((p) => (p ? { ...p, flutterwave_enabled: checked } : p))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Public Key"
              placeholder="FLWPUBK_TEST-..."
              value={form.flutterwave_public_key}
              onChange={(e) => setForm((p) => (p ? { ...p, flutterwave_public_key: e.target.value } : p))}
            />
            <Input
              label="Secret Key"
              type="password"
              placeholder="FLWSECK_TEST-..."
              value={form.flutterwave_secret_key}
              onChange={(e) => setForm((p) => (p ? { ...p, flutterwave_secret_key: e.target.value } : p))}
            />
          </div>
        </div>

        <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-luxury-border/60">
            <div>
              <h3 className="font-serif text-lg text-white font-normal">Direct Bank Transfer (Manual)</h3>
              <p className="text-xs text-luxury-muted font-light">
                Display official boutique account details for offline payment.
              </p>
            </div>
            <Switch
              checked={form.bank_transfer_enabled}
              onCheckedChange={(checked) => setForm((p) => (p ? { ...p, bank_transfer_enabled: checked } : p))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Bank Name"
              value={form.bank_name}
              onChange={(e) => setForm((p) => (p ? { ...p, bank_name: e.target.value } : p))}
            />
            <Input
              label="Account Number"
              value={form.account_number}
              onChange={(e) => setForm((p) => (p ? { ...p, account_number: e.target.value } : p))}
            />
            <Input
              label="Account Name"
              value={form.account_name}
              onChange={(e) => setForm((p) => (p ? { ...p, account_name: e.target.value } : p))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
