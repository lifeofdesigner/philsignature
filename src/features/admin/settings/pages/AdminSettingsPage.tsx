import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, Loader2, Palette, Store, Flag, FileInput, Key, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminSettings, type GeneralSettingsForm } from '../hooks/useAdminSettings';
import { useAdminBrandTheme, type BrandImageField } from '../hooks/useAdminBrandTheme';
import { BrandImageUploadField } from '../components/BrandImageUploadField';
import { LogoSizeControl } from '../components/LogoSizeControl';
import { FeatureFlagManager } from '../components/FeatureFlagManager';
import { FormBuilderManager } from '../components/FormBuilderManager';
import { Can } from '@/components/common/Can';
import type { CmsAppearanceConfig } from '@/services/CMSService';
import { auditLogService } from '@/services/AuditLogService';
import { useAuth } from '@/hooks/useAuth';
import { isSuperAdmin } from '@/lib/permissions';
import type { UserRole } from '@/types/database';

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

  useEffect(() => { setForm(values); }, [values]);
  useEffect(() => { if (appearance) setThemeForm(appearance); }, [appearance]);

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

  const handleUploadImage = async (field: BrandImageField, file: File) => {
    try {
      await uploadImage({ field, file });
      toast.success('Brand image updated across storefront.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload image.');
    }
  };

  if (isLoading || isAppearanceLoading || !form || !themeForm) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* SaaS Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            System & Enterprise Settings Hub
          </h1>
          <p className="text-xs text-slate-700 font-semibold mt-1">
            Store identity, brand theme asset manager, feature flags engine, form builder, and API security keys.
          </p>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'general', label: 'Store Information', icon: Store },
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
                  ? 'border-slate-900 text-slate-900 bg-slate-100/70'
                  : 'border-transparent text-slate-800 hover:text-slate-900 hover:border-slate-300'
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">General Store Identity</CardTitle>
            <CardDescription className="text-slate-800 font-medium">Boutique title, contact emails, currency formatting, and physical location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Boutique Name"
                value={form.store_name}
                onChange={(e) => setForm((p) => (p ? { ...p, store_name: e.target.value } : p))}
                className="text-xs"
              />
              <Input
                label="Primary Concierge Email"
                value={form.concierge_email}
                onChange={(e) => setForm((p) => (p ? { ...p, concierge_email: e.target.value } : p))}
                className="text-xs"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Customer Service Phone"
                value={form.concierge_phone || ''}
                onChange={(e) => setForm((p) => (p ? { ...p, concierge_phone: e.target.value } : p))}
                className="text-xs"
              />
              <Input
                label="Store Currency Symbol"
                value={form.currency_symbol}
                onChange={(e) => setForm((p) => (p ? { ...p, currency_symbol: e.target.value } : p))}
                className="text-xs"
              />
            </div>
            <Input
              label="Boutique Address & Atelier Location"
              value={form.store_address || ''}
              onChange={(e) => setForm((p) => (p ? { ...p, store_address: e.target.value } : p))}
              className="text-xs"
            />

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={handleSaveGeneral} disabled={isSaving} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs cursor-pointer">
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Save General Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Brand & Logos */}
      {activeTab === 'brand' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Brand Identity Assets</CardTitle>
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
        <Can role="super_admin" fallback={<div className="p-8 text-center text-xs text-slate-700">Super Admin permission required to manage Feature Flags.</div>}>
          <FeatureFlagManager />
        </Can>
      )}

      {/* Tab 4: Forms Builder */}
      {activeTab === 'forms' && <FormBuilderManager />}

      {/* Tab 5: API & Integrations */}
      {activeTab === 'api' && (
        <Can role="super_admin" fallback={<div className="p-8 text-center text-xs text-slate-700">Super Admin permission required to manage API keys.</div>}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">API Credentials & Payment Webhooks</CardTitle>
              <CardDescription>Payment gateway public keys, Google Analytics ID, and webhook secrets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Paystack Public Key" value="pk_live_********************" readOnly className="text-xs font-mono bg-slate-50" />
              <Input label="Flutterwave Encryption Key" value="FLWSECK_LIVE_********************" readOnly className="text-xs font-mono bg-slate-50" />
              <Input label="Google Analytics Tracking ID (GA4)" value="G-PH71829302" readOnly className="text-xs font-mono bg-slate-50" />
            </CardContent>
          </Card>
        </Can>
      )}

      {/* Tab 6: Security & Maintenance */}
      {activeTab === 'security' && (
        <Can role="super_admin" fallback={<div className="p-8 text-center text-xs text-slate-700">Super Admin permission required to view Security Settings.</div>}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Enterprise Security Protocols</CardTitle>
              <CardDescription>Session timeouts, 2FA policy enforcement, and database maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">Enforce Staff 2FA Authentication</div>
                  <div className="text-slate-700 text-[11px]">Require staff roles to present OTP authenticator challenge on login</div>
                </div>
                <Button size="sm" variant="outline" className="text-xs border-slate-200">Configured</Button>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">Admin Session Timeout</div>
                  <div className="text-slate-700 text-[11px]">Automatically terminate idle admin sessions after 30 minutes</div>
                </div>
                <Button size="sm" variant="outline" className="text-xs border-slate-200">30 Min</Button>
              </div>
            </CardContent>
          </Card>
        </Can>
      )}
    </div>
  );
};

export default AdminSettingsPage;
