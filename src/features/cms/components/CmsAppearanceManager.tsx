import React, { useState } from 'react';
import { Palette, Save, Loader2, Upload, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mediaService } from '@/services/MediaService';
import { useAuth } from '@/hooks/useAuth';
import { LogoSizeControl } from '@/features/admin/settings/components/LogoSizeControl';
import type { CmsAppearanceConfig } from '@/services/CMSService';

interface CmsAppearanceManagerProps {
  appearance: CmsAppearanceConfig;
  onChange: (updated: CmsAppearanceConfig) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const CmsAppearanceManager: React.FC<CmsAppearanceManagerProps> = ({
  appearance,
  onChange,
  onSave,
  isSaving,
}) => {
  const { user } = useAuth();
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleUpload = async (field: keyof CmsAppearanceConfig, file: File) => {
    setUploadingField(field as string);
    try {
      const uploaded = await mediaService.uploadFile('cms', file, user?.id);
      const publicUrl = mediaService.getPublicUrl(uploaded.bucket, uploaded.path);
      onChange({ ...appearance, [field]: publicUrl });
      toast.success('Picture uploaded. Click "Save Appearance Settings" to save changes.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload picture.');
    } finally {
      setUploadingField(null);
    }
  };
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-slate-700" />
          <h3 className="text-base font-semibold text-slate-900">Store Appearance & Theme Settings</h3>
        </div>
        <p className="text-xs text-slate-500 font-normal">
          Configure default storefront theme mode, brand accent palette, border radiuses, and brand logos without code modifications.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-2xs">
        <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
          Default Theme Preference
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Default Store Theme Mode</label>
            <select
              value={appearance.default_theme}
              onChange={(e) =>
                onChange({ ...appearance, default_theme: e.target.value as 'system' | 'light' | 'dark' })
              }
              className="w-full h-9 bg-white border border-slate-200 text-xs text-slate-800 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600 shadow-2xs"
            >
              <option value="system">Automatic System Preference (Light/Dark)</option>
              <option value="light">Fixed Light Theme</option>
              <option value="dark">Fixed Dark Theme</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Border Radius Preset</label>
            <select
              value={appearance.border_radius}
              onChange={(e) =>
                onChange({ ...appearance, border_radius: e.target.value as 'none' | 'sm' | 'md' | 'full' })
              }
              className="w-full h-9 bg-white border border-slate-200 text-xs text-slate-800 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600 shadow-2xs"
            >
              <option value="none">Sharp Architectural (0px)</option>
              <option value="sm">Subtle Luxury (2px - 4px)</option>
              <option value="md">Rounded Elegant (8px)</option>
              <option value="full">Soft Organic Pill</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Button Typography & Style</label>
            <select
              value={appearance.button_style}
              onChange={(e) =>
                onChange({ ...appearance, button_style: e.target.value as 'luxury' | 'minimal' | 'bold' })
              }
              className="w-full h-9 bg-white border border-slate-200 text-xs text-slate-800 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600 shadow-2xs"
            >
              <option value="luxury">Luxury Gold Gradient & Border</option>
              <option value="minimal">Minimalist Monochrome</option>
              <option value="bold">High-Impact High-Contrast</option>
            </select>
          </div>
        </div>

        <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 pt-2">
          Brand Colors & Accents
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Primary Brand Color"
            value={appearance.primary_brand_color}
            onChange={(e) => onChange({ ...appearance, primary_brand_color: e.target.value })}
            placeholder="#A17836"
          />
          <Input
            label="Secondary Brand Charcoal"
            value={appearance.secondary_brand_color}
            onChange={(e) => onChange({ ...appearance, secondary_brand_color: e.target.value })}
            placeholder="#111827"
          />
          <Input
            label="Accent Gold Accent"
            value={appearance.accent_gold_color}
            onChange={(e) => onChange({ ...appearance, accent_gold_color: e.target.value })}
            placeholder="#C5A880"
          />
        </div>

        <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 pt-2">
          Brand Assets & Icons
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { field: 'logo_url' as const, label: 'Main Logo', current: appearance.logo_url, help: 'Primary logo for store headers' },
            { field: 'logo_light_url' as const, label: 'Light Theme Logo', current: appearance.logo_light_url, help: 'Used on light background mode' },
            { field: 'logo_dark_url' as const, label: 'Dark Theme Logo', current: appearance.logo_dark_url, help: 'Used on dark background mode' },
            { field: 'logo_mobile_url' as const, label: 'Mobile Screen Logo', current: appearance.logo_mobile_url, help: 'Optimized for mobile headers' },
            { field: 'favicon_url' as const, label: 'Browser Icon (Favicon)', current: appearance.favicon_url, help: 'Icon displayed in browser tabs' },
            { field: 'apple_touch_icon_url' as const, label: 'Apple Touch Icon', current: appearance.apple_touch_icon_url, help: 'Saved shortcut icon on mobile devices' },
          ].map((item) => (
            <div key={item.field} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">{item.label}</span>
                {item.current && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono font-medium">Active</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">{item.help}</p>
              
              <div className="flex items-center gap-3 pt-1">
                <div className="h-12 w-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                  {item.current ? (
                    <img src={item.current} alt={item.label} className="h-full w-full object-contain p-1" />
                  ) : (
                    <ImageOff className="h-4 w-4 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <input
                    type="file"
                    accept="image/*,.ico,.svg"
                    id={`cms-asset-${item.field}`}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(item.field, file);
                    }}
                  />
                  <label
                    htmlFor={`cms-asset-${item.field}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 text-[10px] uppercase tracking-wider font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
                  >
                    {uploadingField === item.field ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Upload className="h-3 w-3" />
                    )}
                    <span>{uploadingField === item.field ? 'Uploading...' : item.current ? 'Change' : 'Upload'}</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logo Sizing & Dimensions */}
      <LogoSizeControl
        appearance={appearance}
        onChange={onChange}
        onCommit={async (updated) => {
          onChange(updated);
          onSave();
        }}
      />

      <div className="flex justify-end pt-4">
        <Button
          size="default"
          onClick={onSave}
          disabled={isSaving}
          className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs cursor-pointer"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Appearance Settings</span>
        </Button>
      </div>
    </div>
  );
};
