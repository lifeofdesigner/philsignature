import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreditCard, Save, Loader2, Landmark, Wallet, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminPayments, type PaymentGatewaysConfig } from '../hooks/useAdminPayments';

export const AdminPaymentsPage: React.FC = () => {
  const { config, isLoading, save, isSaving } = useAdminPayments();
  const [form, setForm] = useState<PaymentGatewaysConfig | null>(null);
  const [showPaystackSecret, setShowPaystackSecret] = useState(false);
  const [showFlutterwaveSecret, setShowFlutterwaveSecret] = useState(false);

  useEffect(() => {
    setForm(config);
  }, [config]);

  const handleSave = async () => {
    if (!form) return;
    try {
      await save(form);
      toast.success('Payment gateway configurations saved to database.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings.');
    }
  };

  if (isLoading || !form) return <PageSkeleton />;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payment Gateways &amp; Settlement</h1>
          <p className="text-xs text-slate-700 font-semibold mt-1">
            Configure automated card processing (Paystack, Flutterwave) and offline settlement (Direct Bank Wire, Cash on Delivery).
          </p>
        </div>
        <Button
          size="sm"
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs cursor-pointer"
          disabled={isSaving}
          onClick={handleSave}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Gateway Settings</span>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Paystack Gateway Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Paystack Gateway</h3>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      form.paystack_enabled
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {form.paystack_enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-medium mt-0.5">
                  Accept Visa, Mastercard, Verve, Apple Pay, USSD, and Bank Transfer with instant automated verification.
                </p>
              </div>
            </div>
            <Switch
              checked={form.paystack_enabled}
              onCheckedChange={(checked) => setForm((p) => (p ? { ...p, paystack_enabled: checked } : p))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Paystack Public Key
              </label>
              <Input
                placeholder="pk_live_... or pk_test_..."
                value={form.paystack_public_key}
                onChange={(e) => setForm((p) => (p ? { ...p, paystack_public_key: e.target.value } : p))}
                className="bg-white border-slate-300 text-slate-900 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Paystack Secret Key
                </label>
                <button
                  type="button"
                  onClick={() => setShowPaystackSecret(!showPaystackSecret)}
                  className="text-xs text-slate-700 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  {showPaystackSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPaystackSecret ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>
              <Input
                type={showPaystackSecret ? 'text' : 'password'}
                placeholder="sk_live_... or sk_test_..."
                value={form.paystack_secret_key}
                onChange={(e) => setForm((p) => (p ? { ...p, paystack_secret_key: e.target.value } : p))}
                className="bg-white border-slate-300 text-slate-900 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Flutterwave Gateway Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-800">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Flutterwave Gateway</h3>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      form.flutterwave_enabled
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {form.flutterwave_enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-medium mt-0.5">
                  Pan-African &amp; global multi-currency payments with baraza checkout support.
                </p>
              </div>
            </div>
            <Switch
              checked={form.flutterwave_enabled}
              onCheckedChange={(checked) => setForm((p) => (p ? { ...p, flutterwave_enabled: checked } : p))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Flutterwave Public Key
              </label>
              <Input
                placeholder="FLWPUBK_TEST-... or FLWPUBK-..."
                value={form.flutterwave_public_key}
                onChange={(e) => setForm((p) => (p ? { ...p, flutterwave_public_key: e.target.value } : p))}
                className="bg-white border-slate-300 text-slate-900 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Flutterwave Secret Key
                </label>
                <button
                  type="button"
                  onClick={() => setShowFlutterwaveSecret(!showFlutterwaveSecret)}
                  className="text-xs text-slate-700 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  {showFlutterwaveSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showFlutterwaveSecret ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>
              <Input
                type={showFlutterwaveSecret ? 'text' : 'password'}
                placeholder="FLWSECK_TEST-... or FLWSECK-..."
                value={form.flutterwave_secret_key}
                onChange={(e) => setForm((p) => (p ? { ...p, flutterwave_secret_key: e.target.value } : p))}
                className="bg-white border-slate-300 text-slate-900 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Direct Bank Transfer (Manual Settlement) Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Direct Bank Transfer (Manual Settlement)</h3>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      form.bank_transfer_enabled
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {form.bank_transfer_enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-0.5">
                  Display official boutique corporate bank account details during checkout. Orders remain Pending until payment receipt verification.
                </p>
              </div>
            </div>
            <Switch
              checked={form.bank_transfer_enabled}
              onCheckedChange={(checked) => setForm((p) => (p ? { ...p, bank_transfer_enabled: checked } : p))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Bank Name
              </label>
              <Input
                placeholder="e.g. Zenith Bank / GTBank"
                value={form.bank_name}
                onChange={(e) => setForm((p) => (p ? { ...p, bank_name: e.target.value } : p))}
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Account Number
              </label>
              <Input
                placeholder="10-digit NUBAN"
                value={form.account_number}
                onChange={(e) => setForm((p) => (p ? { ...p, account_number: e.target.value } : p))}
                className="bg-white border-slate-300 text-slate-900 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Account Beneficiary Name
              </label>
              <Input
                placeholder="PHILZ SIGNATURE LTD"
                value={form.account_name}
                onChange={(e) => setForm((p) => (p ? { ...p, account_name: e.target.value } : p))}
                className="bg-white border-slate-300 text-slate-900 uppercase"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
