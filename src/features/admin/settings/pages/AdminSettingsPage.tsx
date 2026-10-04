import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, Loader2, Palette, Store, Flag, FileInput, Key, ShieldCheck, Hash, Eye, EyeOff, Percent } from 'lucide-react';
import { AdminButton, AdminInput, AdminSwitch } from '@/components/admin-ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminSettings, type GeneralSettingsForm } from '../hooks/useAdminSettings';
import { useAdminBrandTheme, type BrandImageField } from '../hooks/useAdminBrandTheme';
import { useTaxSettings } from '@/hooks/useTaxSettings';
import { BrandImageUploadField } from '../components/BrandImageUploadField';
import { LogoSizeControl } from '../components/LogoSizeControl';
import { FeatureFlagManager } from '../components/FeatureFlagManager';
import { FormBuilderManager } from '../components/FormBuilderManager';
import { Can } from '@/components/common/Can';
import type { CmsAppearanceConfig } from '@/services/CMSService';
import { auditLogService } from '@/services/AuditLogService';
import { useAuth } from '@/hooks/useAuth';
import { isSuperAdmin } from '@/lib/permissions';
import type { UserRole, TaxSettings } from '@/types/database';

const IMAGE_FIELDS: { field: BrandImageField; label: string; helpText: string }[] = [
  { field: 'logo_url', label: 'Main Logo', helpText: 'Shown at the top of storefront pages.' },
  { field: 'logo_light_url', label: 'Light Logo', helpText: 'Used on light background headers.' },
  { field: 'logo_dark_url', label: 'Dark Logo', helpText: 'Used on dark background headers.' },
  { field: 'favicon_url', label: 'Browser Favicon', helpText: 'Tab icon displayed in web browsers.' },
  { field: 'social_share_image_url', label: 'Social Share Card', helpText: 'Image rendered when sharing links.' },
];

export const AdminSettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'general';
  const { user, profile, role } = useAuth();
  const currentRole = (profile?.role || role || undefined) as UserRole | undefined;
  const userIsSuperAdmin = isSuperAdmin(currentRole);

  const { values, isLoading, save, isSaving } = useAdminSettings();
  const [form, setForm] = useState<GeneralSettingsForm | null>(null);

  const {
    appearance,
    isLoading: isAppearanceLoading,
    save: saveAppearance,
    uploadImage,
    isUploadingField,
  } = useAdminBrandTheme();
  const [themeForm, setThemeForm] = useState<CmsAppearanceConfig | null>(null);

  const {
    taxSettings,
    isLoading: isTaxLoading,
    saveTaxSettings,
    isSaving: isSavingTax,
  } = useTaxSettings();
  const [taxForm, setTaxForm] = useState<TaxSettings | null>(null);

  useEffect(() => { setForm(values); }, [values]);
  useEffect(() => { if (appearance) setThemeForm(appearance); }, [appearance]);
  useEffect(() => { if (taxSettings) setTaxForm(taxSettings); }, [taxSettings]);

  const SUPER_ADMIN_ONLY_TABS = ['flags', 'api', 'security'];
  useEffect(() => {
    if (SUPER_ADMIN_ONLY_TABS.includes(activeTab) && !userIsSuperAdmin) {
      setSearchParams({ tab: 'general' });
    }
  }, [activeTab, userIsSuperAdmin, setSearchParams]);

  const handleSaveGeneral = async () => {
    if (!form) return;
    try {
      await save(form);
      await auditLogService.recordAction('SAVE_STORE_SETTINGS', 'settings', 'general', { form }, user?.id);
      toast.success('Store general settings saved to database.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings.');
    }
  };

  const handleSaveTax = async () => {
    if (!taxForm) return;
    try {
      await saveTaxSettings(taxForm);
      await auditLogService.recordAction('SAVE_STORE_SETTINGS', 'settings', 'tax', { taxForm }, user?.id);
      toast.success('Tax configuration saved to database.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save tax settings.');
    }
  };

  const handleUploadImage = async (field: BrandImageField, file: File) => {
    try {
      await uploadImage({ field, file });
      toast.success('Brand image updated across storefront.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload image.');
    }
  };

  if (isLoading || isAppearanceLoading || isTaxLoading || !form || !themeForm || !taxForm) {
    return <PageSkeleton />;
  }

  const renderTaxCard = () => {
    if (!taxForm) return null;
    const sampleSubtotal = 100000;
    const sampleRate = Number(taxForm.rate || 0);
    const sampleTax = taxForm.enabled && sampleRate > 0
      ? Math.round((sampleSubtotal * (sampleRate / 100)) * 100) / 100
      : 0;
    const sampleTotal = sampleSubtotal + sampleTax;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-black flex items-center gap-2">
            <Percent className="h-4 w-4 text-slate-700" />
            Tax Configuration
          </CardTitle>
          <CardDescription className="text-black font-medium">
            Configure boutique checkout taxation (e.g. VAT, GST, Sales Tax). When enabled, tax is automatically calculated at checkout and stored directly on order records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable / Disable Tax Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4 max-w-xl">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-black flex items-center gap-2">
                <span>Enable Storefront Tax</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    taxForm.enabled
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-200 text-slate-700 border border-slate-300'
                  }`}
                >
                  {taxForm.enabled ? 'Active at Checkout' : 'Disabled'}
                </span>
              </div>
              <div className="text-[11px] text-slate-600">
                {taxForm.enabled
                  ? `Storefront checkout will automatically calculate ${taxForm.rate}% ${taxForm.name || 'tax'}.`
                  : 'No tax will be charged or displayed at checkout.'}
              </div>
            </div>
            <AdminSwitch
              checked={taxForm.enabled}
              onCheckedChange={(checked) => setTaxForm((p) => (p ? { ...p, enabled: checked } : p))}
            />
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div>
              <AdminInput
                label="Tax Name"
                placeholder="e.g. VAT, GST, Sales Tax"
                value={taxForm.name}
                onChange={(e) => setTaxForm((p) => (p ? { ...p, name: e.target.value } : p))}
                className="text-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">Line item label shown at checkout, order confirmation, and order emails.</p>
            </div>
            <div>
              <AdminInput
                label="Tax Percentage (%)"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="e.g. 7.5"
                value={String(taxForm.rate)}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setTaxForm((p) => (p ? { ...p, rate: isNaN(val) ? 0 : val } : p));
                }}
                className="text-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">Percentage rate calculated on subtotal (e.g. 7.5 for 7.5% VAT).</p>
            </div>
          </div>

          {/* Live Calculation Preview Banner */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white max-w-xl space-y-2">
            <div className="text-[11px] font-bold text-black flex items-center justify-between">
              <span>Live Checkout Breakdown Preview</span>
              <span className="text-[10px] text-slate-500 font-normal">Based on ₦100,000 cart subtotal</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-500 block">Subtotal</span>
                <span className="font-semibold text-black">₦100,000</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">
                  {taxForm.enabled ? `${taxForm.name || 'Tax'} (${taxForm.rate}%)` : 'Tax (Disabled)'}
                </span>
                <span className={`font-semibold ${taxForm.enabled ? 'text-amber-800' : 'text-slate-400'}`}>
                  {taxForm.enabled ? `+₦${sampleTax.toLocaleString()}` : '₦0'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Final Total</span>
                <span className="font-bold text-black">₦{sampleTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2 max-w-xl">
            <AdminButton
              variant="primary"
              size="sm"
              onClick={handleSaveTax}
              disabled={isSavingTax}
              className="gap-1.5 shadow-xs"
            >
              {isSavingTax ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Save Tax Settings</span>
            </AdminButton>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* SaaS Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">
            System & Enterprise Settings Hub
          </h1>
          <p className="text-xs text-black font-semibold mt-1">
            Store identity, brand theme asset manager, feature flags engine, form builder, and API security keys.
          </p>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'general', label: 'Store Information', icon: Store },
          { id: 'tax', label: 'Tax Configuration', icon: Percent },
          { id: 'brand', label: 'Brand & Logos', icon: Palette },
          { id: 'flags', label: 'Feature Flags', icon: Flag, superAdminOnly: true },
          { id: 'forms', label: 'Forms Builder', icon: FileInput },
          { id: 'api', label: 'API Keys & Integrations', icon: Key, superAdminOnly: true },
          { id: 'security', label: 'Security & Maintenance', icon: ShieldCheck, superAdminOnly: true },
        ].filter((tab) => !tab.superAdminOnly || userIsSuperAdmin).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap font-semibold text-xs ${
                isActive
                  ? 'border-slate-900 text-black bg-slate-100/70'
                  : 'border-transparent text-black hover:text-black hover:border-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: General Store Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-black">General Store Identity</CardTitle>
              <CardDescription className="text-black font-medium">Boutique title, contact emails, currency formatting, and physical location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminInput
                  label="Boutique Name"
                  value={form.store_name}
                  onChange={(e) => setForm((p) => (p ? { ...p, store_name: e.target.value } : p))}
                  className="text-xs"
                />
                <AdminInput
                  label="Primary Concierge Email"
                  value={form.concierge_email}
                  onChange={(e) => setForm((p) => (p ? { ...p, concierge_email: e.target.value } : p))}
                  className="text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminInput
                  label="Customer Service Phone"
                  value={form.concierge_phone || ''}
                  onChange={(e) => setForm((p) => (p ? { ...p, concierge_phone: e.target.value } : p))}
                  className="text-xs"
                />
                <AdminInput
                  label="Store Currency Symbol"
                  value={form.currency_symbol}
                  onChange={(e) => setForm((p) => (p ? { ...p, currency_symbol: e.target.value } : p))}
                  className="text-xs"
                />
              </div>
              <AdminInput
                label="Boutique Address & Atelier Location"
                value={form.store_address || ''}
                onChange={(e) => setForm((p) => (p ? { ...p, store_address: e.target.value } : p))}
                className="text-xs"
              />

              <div className="flex justify-end pt-2">
                <AdminButton variant="primary" size="sm" onClick={handleSaveGeneral} disabled={isSaving} className="gap-1.5 shadow-xs">
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>Save General Settings</span>
                </AdminButton>
              </div>
            </CardContent>
          </Card>

          {/* Company Registration Number */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-black flex items-center gap-2">
                <Hash className="h-4 w-4 text-slate-500" />
                Company Registration Number
              </CardTitle>
              <CardDescription className="text-black font-medium">
                Display your business registration number beside the storefront logo. Admin can show or hide it at any time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AdminInput
                label="Registration Number"
                placeholder="e.g. BN 2671550"
                value={form.company_registration_number || ''}
                onChange={(e) => setForm((p) => (p ? { ...p, company_registration_number: e.target.value } : p))}
                className="text-xs max-w-xs"
              />

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 max-w-xs">
                <div className="flex items-center gap-2">
                  {themeForm.show_company_registration_number !== false
                    ? <Eye className="h-4 w-4 text-slate-500" />
                    : <EyeOff className="h-4 w-4 text-slate-400" />}
                  <div>
                    <div className="text-xs font-semibold text-black">
                      {themeForm.show_company_registration_number !== false ? 'Visible on Storefront' : 'Hidden from Storefront'}
                    </div>
                    <div className="text-[10px] text-slate-500">Toggle display beside the logo</div>
                  </div>
                </div>
                <AdminSwitch
                  checked={themeForm.show_company_registration_number !== false}
                  onCheckedChange={(checked) =>
                    setThemeForm((prev) => prev ? { ...prev, show_company_registration_number: checked } : prev)
                  }
                />
              </div>

              <div className="flex justify-end pt-1">
                <AdminButton
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                  onClick={async () => {
                    try {
                      await save(form);
                      await saveAppearance(themeForm);
                      toast.success('Company registration number saved.');
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Failed to save.');
                    }
                  }}
                  className="gap-1.5 shadow-xs"
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>Save Registration Number</span>
                </AdminButton>
              </div>
            </CardContent>
          </Card>

          {/* Tax Configuration Section */}
          {renderTaxCard()}
        </div>
      )}

      {/* Tab: Tax Configuration */}
      {activeTab === 'tax' && (
        <div className="space-y-6">
          {renderTaxCard()}
        </div>
      )}



      {/* Tab 2: Brand & Logos */}
      {activeTab === 'brand' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-black">Brand Identity Assets</CardTitle>
              <CardDescription>Upload vector & high-res PNG logos for storefront, mobile navigation, and emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {IMAGE_FIELDS.map((item) => (
                  <BrandImageUploadField
                    key={item.field}
                    label={item.label}
                    helpText={item.helpText}
                    field={item.field}
                    currentUrl={themeForm[item.field] as string | undefined}
                    isUploading={isUploadingField === item.field}
                    onUpload={(field, file) => handleUploadImage(field, file)}
                  />
                ))}
              </div>
              <LogoSizeControl
                appearance={themeForm}
                onChange={(updated) => setThemeForm(updated)}
                onCommit={async (updated) => {
                  await saveAppearance(updated);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Feature Flags (Super Admin) */}
      {activeTab === 'flags' && (
        <Can role="super_admin" fallback={<div className="p-8 text-center text-xs text-black">Super Admin permission required to manage Feature Flags.</div>}>
          <FeatureFlagManager />
        </Can>
      )}

      {/* Tab 4: Forms Builder */}
      {activeTab === 'forms' && <FormBuilderManager />}

      {/* Tab 5: API & Integrations */}
      {activeTab === 'api' && (
        <Can role="super_admin" fallback={<div className="p-8 text-center text-xs text-black">Super Admin permission required to manage API keys.</div>}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-black">Payment Gateway API Keys & Webhooks</CardTitle>
              <CardDescription>Paystack, Flutterwave, and Korapay credentials, webhook URLs, and manual bank transfer details are managed on the dedicated Payments page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/admin/payments">
                <AdminButton variant="primary" size="sm" className="gap-1.5">
                  <Key className="h-3.5 w-3.5" />
                  <span>Open Payment Gateways & Settlement</span>
                </AdminButton>
              </Link>
            </CardContent>
          </Card>
        </Can>
      )}

      {/* Tab 6: Security & Maintenance */}
      {activeTab === 'security' && (
        <Can role="super_admin" fallback={<div className="p-8 text-center text-xs text-black">Super Admin permission required to view Security Settings.</div>}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-black">Enterprise Security Protocols</CardTitle>
              <CardDescription>Session timeouts, 2FA policy enforcement, and database maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-4 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-black">Enforce Staff 2FA Authentication</div>
                  <div className="text-black text-[11px]">Require staff roles to present OTP authenticator challenge on login</div>
                </div>
                <AdminButton size="sm" variant="secondary" className="text-xs">Configured</AdminButton>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-black">Admin Session Timeout</div>
                  <div className="text-black text-[11px]">Automatically terminate idle admin sessions after 30 minutes</div>
                </div>
                <AdminButton size="sm" variant="secondary" className="text-xs">30 Min</AdminButton>
              </div>
            </CardContent>
          </Card>
        </Can>
      )}
    </div>
  );
};

export default AdminSettingsPage;
