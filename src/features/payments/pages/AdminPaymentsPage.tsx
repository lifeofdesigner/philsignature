import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreditCard, Save, Loader2, Landmark, Wallet, Eye, EyeOff, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import {
  useAdminPayments,
  type PaymentGatewaysConfig,
  type GatewayMode,
} from '../hooks/useAdminPayments';

type SecretFieldKey = keyof Pick<
  PaymentGatewaysConfig,
  | 'paystack_test_secret_key'
  | 'paystack_live_secret_key'
  | 'flutterwave_test_secret_key'
  | 'flutterwave_live_secret_key'
  | 'flutterwave_test_webhook_secret_hash'
  | 'flutterwave_live_webhook_secret_hash'
  | 'korapay_test_secret_key'
  | 'korapay_live_secret_key'
>;

export const AdminPaymentsPage: React.FC = () => {
  const { config, isLoading, save, isSaving } = useAdminPayments();
  const [form, setForm] = useState<PaymentGatewaysConfig | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

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

  const toggleReveal = (field: string) => setRevealed((p) => ({ ...p, [field]: !p[field] }));

  if (isLoading || !form) return <PageSkeleton />;

  const ModeToggle: React.FC<{ value: GatewayMode; onChange: (mode: GatewayMode) => void }> = ({
    value,
    onChange,
  }) => (
    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
      {(['test', 'live'] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`px-3 py-1 rounded-md capitalize transition-colors cursor-pointer ${
            value === m ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          {m === 'live' ? 'Live' : 'Test / Sandbox'}
        </button>
      ))}
    </div>
  );

  const SecretInput: React.FC<{
    label: string;
    field: SecretFieldKey;
    placeholder: string;
  }> = ({ label, field, placeholder }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">{label}</label>
        <button
          type="button"
          onClick={() => toggleReveal(field)}
          className="text-xs text-slate-700 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
        >
          {revealed[field] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{revealed[field] ? 'Hide' : 'Reveal'}</span>
        </button>
      </div>
      <Input
        type={revealed[field] ? 'text' : 'password'}
        placeholder={placeholder}
        value={form[field]}
        onChange={(e) => setForm((p) => (p ? { ...p, [field]: e.target.value } : p))}
        className="bg-white border-slate-300 text-slate-900 font-mono text-xs"
      />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payment Gateways &amp; Settlement</h1>
          <p className="text-xs text-slate-700 font-semibold mt-1">
            Configure automated card processing (Paystack, Flutterwave, Korapay) and offline settlement (Direct Bank Wire).
            Each gateway has separate Test and Live credentials — switch modes freely to test safely before going live.
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
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
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
            <div className="flex items-center gap-3">
              <ModeToggle
                value={form.paystack_mode}
                onChange={(mode) => setForm((p) => (p ? { ...p, paystack_mode: mode } : p))}
              />
              <Switch
                checked={form.paystack_enabled}
                onCheckedChange={(checked) => setForm((p) => (p ? { ...p, paystack_enabled: checked } : p))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                {form.paystack_mode === 'live' ? 'Live Public Key' : 'Test Public Key'}
              </label>
              <Input
                placeholder={form.paystack_mode === 'live' ? 'pk_live_...' : 'pk_test_...'}
                value={form.paystack_mode === 'live' ? form.paystack_live_public_key : form.paystack_test_public_key}
                onChange={(e) =>
                  setForm((p) =>
                    p
                      ? {
                          ...p,
                          [form.paystack_mode === 'live' ? 'paystack_live_public_key' : 'paystack_test_public_key']:
                            e.target.value,
                        }
                      : p
                  )
                }
                className="bg-white border-slate-300 text-slate-900 font-mono text-xs"
              />
            </div>

            <SecretInput
              label={form.paystack_mode === 'live' ? 'Live Secret Key' : 'Test Secret Key'}
              field={form.paystack_mode === 'live' ? 'paystack_live_secret_key' : 'paystack_test_secret_key'}
              placeholder={form.paystack_mode === 'live' ? 'sk_live_...' : 'sk_test_...'}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Callback URL</label>
              <Input
                placeholder="https://philzsignature.com/checkout/verify"
                value={form.paystack_callback_url}
                onChange={(e) => setForm((p) => (p ? { ...p, paystack_callback_url: e.target.value } : p))}
                className="bg-white border-slate-300 text-slate-900 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Webhook URL</label>
              <Input
                placeholder="https://philzsignature.com/api/payments/paystack/webhook"
                value={form.paystack_webhook_url}
                onChange={(e) => setForm((p) => (p ? { ...p, paystack_webhook_url: e.target.value } : p))}
                className="bg-white border-slate-300 text-slate-900 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Flutterwave Gateway Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
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
                  Pan-African &amp; global multi-currency payments with card, mobile money, and bank transfer support.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ModeToggle
                value={form.flutterwave_mode}
                onChange={(mode) => setForm((p) => (p ? { ...p, flutterwave_mode: mode } : p))}
              />
              <Switch
                checked={form.flutterwave_enabled}
                onCheckedChange={(checked) => setForm((p) => (p ? { ...p, flutterwave_enabled: checked } : p))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                {form.flutterwave_mode === 'live' ? 'Live Public Key' : 'Test Public Key'}
              </label>
              <Input
                placeholder={form.flutterwave_mode === 'live' ? 'FLWPUBK-...' : 'FLWPUBK_TEST-...'}
                value={
                  form.flutterwave_mode === 'live'
                    ? form.flutterwave_live_public_key
                    : form.flutterwave_test_public_key
                }
                onChange={(e) =>
                  setForm((p) =>
                    p
                      ? {
                          ...p,
                          [form.flutterwave_mode === 'live'
                            ? 'flutterwave_live_public_key'
                            : 'flutterwave_test_public_key']: e.target.value,
                        }
                      : p
                  )
                }
                className="bg-white border-slate-300 text-slate-900 font-mono text-xs"
              />
            </div>

            <SecretInput
              label={form.flutterwave_mode === 'live' ? 'Live Secret Key' : 'Test Secret Key'}
              field={form.flutterwave_mode === 'live' ? 'flutterwave_live_secret_key' : 'flutterwave_test_secret_key'}
              placeholder={form.flutterwave_mode === 'live' ? 'FLWSECK-...' : 'FLWSECK_TEST-...'}
            />

            <SecretInput
              label="Webhook Secret Hash"
              field={
                form.flutterwave_mode === 'live'
                  ? 'flutterwave_live_webhook_secret_hash'
                  : 'flutterwave_test_webhook_secret_hash'
              }
              placeholder="Set this string in Flutterwave Dashboard > Settings > Webhooks"
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Callback / Redirect URL
              </label>
              <Input
                placeholder="https://philzsignature.com/checkout/verify"
                value={form.flutterwave_callback_url}
                onChange={(e) => setForm((p) => (p ? { ...p, flutterwave_callback_url: e.target.value } : p))}
                className="bg-white border-slate-300 text-slate-900 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Webhook URL</label>
              <Input
                placeholder="https://philzsignature.com/api/payments/flutterwave/webhook"
                value={form.flutterwave_webhook_url}
                onChange={(e) => setForm((p) => (p ? { ...p, flutterwave_webhook_url: e.target.value } : p))}
                className="bg-white border-slate-300 text-slate-900 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Korapay Gateway Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Korapay Gateway</h3>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      form.korapay_enabled
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {form.korapay_enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-medium mt-0.5">
                  Cards, bank transfer, and mobile money with instant automated verification.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ModeToggle
                value={form.korapay_mode}
                onChange={(mode) => setForm((p) => (p ? { ...p, korapay_mode: mode } : p))}
              />
              <Switch
                checked={form.korapay_enabled}
                onCheckedChange={(checked) => setForm((p) => (p ? { ...p, korapay_enabled: checked } : p))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                {form.korapay_mode === 'live' ? 'Live Public Key' : 'Test Public Key'}
              </label>
              <Input
                placeholder={form.korapay_mode === 'live' ? 'pk_live_...' : 'pk_test_...'}
                value={form.korapay_mode === 'live' ? form.korapay_live_public_key : form.korapay_test_public_key}
                onChange={(e) =>
                  setForm((p) =>
                    p
                      ? {
                          ...p,
                          [form.korapay_mode === 'live' ? 'korapay_live_public_key' : 'korapay_test_public_key']:
                            e.target.value,
                        }
                      : p
                  )
                }
                className="bg-white border-slate-300 text-slate-900 font-mono text-xs"
              />
            </div>

            <SecretInput
              label={form.korapay_mode === 'live' ? 'Live Secret Key' : 'Test Secret Key'}
              field={form.korapay_mode === 'live' ? 'korapay_live_secret_key' : 'korapay_test_secret_key'}
              placeholder={form.korapay_mode === 'live' ? 'sk_live_...' : 'sk_test_...'}
            />

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Webhook URL</label>
              <Input
                placeholder="https://philzsignature.com/api/payments/korapay/webhook"
                value={form.korapay_webhook_url}
                onChange={(e) => setForm((p) => (p ? { ...p, korapay_webhook_url: e.target.value } : p))}
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
                  Display official boutique corporate bank account details during checkout. Orders remain Pending until
                  an admin manually confirms payment receipt in Orders.
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
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Bank Name</label>
              <Input
                placeholder="e.g. Zenith Bank / GTBank"
                value={form.bank_name}
                onChange={(e) => setForm((p) => (p ? { ...p, bank_name: e.target.value } : p))}
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Account Number</label>
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                SWIFT / Sort Code (optional)
              </label>
              <Input
                placeholder="e.g. ZEIBNGLA"
                value={form.bank_swift_code}
                onChange={(e) => setForm((p) => (p ? { ...p, bank_swift_code: e.target.value } : p))}
                className="bg-white border-slate-300 text-slate-900 font-mono"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Additional Instructions (optional)
              </label>
              <Input
                placeholder="e.g. Send payment receipt to orders@philzsignature.com to confirm"
                value={form.bank_transfer_instructions}
                onChange={(e) => setForm((p) => (p ? { ...p, bank_transfer_instructions: e.target.value } : p))}
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
