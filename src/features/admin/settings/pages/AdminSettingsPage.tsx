import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save, Loader2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminSettings, type GeneralSettingsForm } from '../hooks/useAdminSettings';
import { useAdminBrandTheme, type BrandImageField } from '../hooks/useAdminBrandTheme';
import { BrandImageUploadField } from '../components/BrandImageUploadField';
import { LogoSizeControl } from '../components/LogoSizeControl';
import type { CmsAppearanceConfig } from '@/services/CMSService';

const IMAGE_FIELDS: { field: BrandImageField; label: string; helpText: string }[] = [
  { field: 'logo_url', label: 'Main Logo', helpText: 'Shown at the top of every page.' },
  { field: 'logo_light_url', label: 'Light Logo', helpText: 'Used on light backgrounds.' },
  { field: 'logo_dark_url', label: 'Dark Logo', helpText: 'Used on dark backgrounds.' },
  { field: 'logo_mobile_url', label: 'Mobile Logo', helpText: 'Shown on phones and small screens.' },
  { field: 'favicon_url', label: 'Browser Icon (Favicon)', helpText: 'The small icon shown in browser tabs.' },
  { field: 'apple_touch_icon_url', label: 'Apple Touch Icon', helpText: 'Icon shown when saved to an iPhone home screen.' },
  { field: 'email_logo_url', label: 'Email Logo', helpText: 'Shown at the top of order and account emails.' },
  { field: 'social_share_image_url', label: 'Social Share Picture', helpText: 'Shown when your site is shared on social media.' },
  { field: 'loading_logo_url', label: 'Loading Screen Logo', helpText: 'Shown briefly while the site is loading.' },
];

const COLOR_FIELDS: { field: keyof CmsAppearanceConfig; label: string }[] = [
  { field: 'primary_brand_color', label: 'Primary Color' },
  { field: 'secondary_brand_color', label: 'Secondary Color' },
  { field: 'accent_gold_color', label: 'Accent Color' },
  { field: 'background_color', label: 'Background Color' },
  { field: 'surface_color', label: 'Surface Color' },
  { field: 'button_color', label: 'Button Color' },
  { field: 'text_color', label: 'Text Color' },
  { field: 'border_color', label: 'Border Color' },
  { field: 'success_color', label: 'Success Color' },
  { field: 'warning_color', label: 'Warning Color' },
  { field: 'danger_color', label: 'Danger Color' },
  { field: 'info_color', label: 'Information Color' },
];

export const AdminSettingsPage: React.FC = () => {
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

  const handleSave = async () => {
    if (!form) return;
    try {
      await save(form);
      toast.success('Store settings saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings.');
    }
  };

  const handleUploadImage = async (field: BrandImageField, file: File) => {
    await uploadImage({ field, file });
  };

  const handleColorChange = (field: keyof CmsAppearanceConfig, value: string) => {
    setThemeForm((p) => (p ? { ...p, [field]: value } : p));
  };

  const handleColorCommit = async (field: keyof CmsAppearanceConfig, value: string) => {
    if (!themeForm) return;
    const updated = { ...themeForm, [field]: value };
    try {
      await saveAppearance(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save color. Please try again.');
    }
  };

  const handleThemeModeChange = async (mode: CmsAppearanceConfig['default_theme']) => {
    if (!themeForm) return;
    const updated = { ...themeForm, default_theme: mode };
    setThemeForm(updated);
    try {
      await saveAppearance(updated);
      toast.success(`Website theme set to ${mode === 'system' ? 'Auto' : mode === 'light' ? 'Light' : 'Dark'}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save theme.');
    }
  };

  if (isLoading || !form) return <PageSkeleton />;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Global Boutique Preferences
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">Store Settings</h1>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5" disabled={isSaving} onClick={handleSave}>
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          <span>Save Changes</span>
        </Button>
      </div>

      {/* Brand & Identity */}
      <div className="bg-luxury-card border border-luxury-border p-6 space-y-6">
        <h3 className="font-serif text-lg text-white font-normal border-b border-luxury-border/60 pb-3">
          Brand & Identity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Business Name"
            value={form.store_name}
            onChange={(e) => setForm((p) => (p ? { ...p, store_name: e.target.value } : p))}
          />
          <Input
            label="Tagline"
            value={form.store_slogan}
            onChange={(e) => setForm((p) => (p ? { ...p, store_slogan: e.target.value } : p))}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Footer Text"
            value={form.footer_text}
            onChange={(e) => setForm((p) => (p ? { ...p, footer_text: e.target.value } : p))}
          />
          <Input
            label="Copyright Text"
            placeholder="© 2026 Your Business Name"
            value={form.copyright_text}
            onChange={(e) => setForm((p) => (p ? { ...p, copyright_text: e.target.value } : p))}
          />
        </div>
      </div>

      {/* Contact Details */}
      <div className="bg-luxury-card border border-luxury-border p-6 space-y-6">
        <h3 className="font-serif text-lg text-white font-normal border-b border-luxury-border/60 pb-3">
          Contact Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Support Email"
            value={form.concierge_email}
            onChange={(e) => setForm((p) => (p ? { ...p, concierge_email: e.target.value } : p))}
          />
          <Input
            label="Support Phone"
            value={form.concierge_phone}
            onChange={(e) => setForm((p) => (p ? { ...p, concierge_phone: e.target.value } : p))}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="WhatsApp Number"
            value={form.concierge_whatsapp}
            onChange={(e) => setForm((p) => (p ? { ...p, concierge_whatsapp: e.target.value } : p))}
          />
          <Input
            label="Address"
            value={form.store_address}
            onChange={(e) => setForm((p) => (p ? { ...p, store_address: e.target.value } : p))}
          />
        </div>
        <Input
          label="Google Maps Link"
          placeholder="https://maps.google.com/..."
          value={form.google_maps_url}
          onChange={(e) => setForm((p) => (p ? { ...p, google_maps_url: e.target.value } : p))}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Primary Currency Code"
            value={form.currency_code}
            onChange={(e) => setForm((p) => (p ? { ...p, currency_code: e.target.value } : p))}
          />
          <Input
            label="Currency Symbol"
            value={form.currency_symbol}
            onChange={(e) => setForm((p) => (p ? { ...p, currency_symbol: e.target.value } : p))}
          />
        </div>
      </div>

      {/* Website Images */}
      <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
        <div>
          <h3 className="font-serif text-lg text-white font-normal">Website Images</h3>
          <p className="text-xs text-luxury-muted mt-1">
            Pick a picture to upload it — it saves right away, no extra step needed.
          </p>
        </div>
        {isAppearanceLoading || !themeForm ? (
          <div className="text-xs text-luxury-muted py-4">Loading images...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {IMAGE_FIELDS.map(({ field, label, helpText }) => (
              <BrandImageUploadField
                key={field}
                field={field}
                label={label}
                helpText={helpText}
                currentUrl={themeForm[field] as string | undefined}
                isUploading={isUploadingField === field}
                onUpload={handleUploadImage}
              />
            ))}
          </div>
        )}
      </div>

      {/* Logo Sizing & Scale */}
      {themeForm && (
        <LogoSizeControl
          appearance={themeForm}
          onChange={(updated) => setThemeForm(updated)}
          onCommit={async (updated) => {
            try {
              await saveAppearance(updated);
              toast.success('Logo scale updated successfully.');
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Failed to save logo size.');
            }
          }}
        />
      )}

      {/* Website Colors */}
      <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-luxury-gold" />
          <div>
            <h3 className="font-serif text-lg text-white font-normal">Website Colors</h3>
            <p className="text-xs text-luxury-muted mt-1">
              Pick a color and your website updates right away.
            </p>
          </div>
        </div>

        {isAppearanceLoading || !themeForm ? (
          <div className="text-xs text-luxury-muted py-4">Loading colors...</div>
        ) : (
          <>
            <div className="flex items-center gap-1.5 p-1 bg-luxury-black border border-luxury-border rounded text-xs w-fit">
              {(['light', 'dark', 'system'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleThemeModeChange(mode)}
                  className={`px-3 py-1.5 rounded uppercase tracking-wider text-[10px] font-medium transition-colors cursor-pointer ${
                    themeForm.default_theme === mode
                      ? 'bg-luxury-gold text-luxury-black font-semibold'
                      : 'text-luxury-muted hover:text-white'
                  }`}
                >
                  {mode === 'system' ? 'Auto' : mode === 'light' ? 'Light Theme' : 'Dark Theme'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
              {COLOR_FIELDS.map(({ field, label }) => {
                const value = (themeForm[field] as string) || '#000000';
                return (
                  <div key={field} className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-luxury-muted">{label}</label>
                    <div className="flex items-center gap-2 bg-luxury-charcoal/40 border border-luxury-border p-1.5">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => handleColorChange(field, e.target.value)}
                        onBlur={(e) => handleColorCommit(field, e.target.value)}
                        className="h-7 w-9 shrink-0 cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-[11px] font-mono text-luxury-cream truncate">{value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
