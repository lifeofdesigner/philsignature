import React from 'react';
import { Palette, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  return (
    <div className="space-y-6">
      <div className="bg-luxury-card border border-luxury-border rounded-sm p-6 space-y-2">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-luxury-gold" />
          <h3 className="font-serif text-lg text-luxury-cream font-normal">Store Appearance & Theme Settings</h3>
        </div>
        <p className="text-xs text-luxury-muted font-light">
          Configure default storefront theme mode, brand accent palette, border radiuses, and brand logos without code modifications.
        </p>
      </div>

      <div className="bg-luxury-card border border-luxury-border rounded-sm p-6 space-y-6">
        <h4 className="font-serif text-sm text-luxury-cream font-medium border-b border-luxury-border/60 pb-2">
          Default Theme Preference
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-luxury-sand font-medium">Default Store Theme Mode</label>
            <select
              value={appearance.default_theme}
              onChange={(e) =>
                onChange({ ...appearance, default_theme: e.target.value as 'system' | 'light' | 'dark' })
              }
              className="w-full h-9 bg-luxury-card border border-luxury-border text-xs text-luxury-cream px-3 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
            >
              <option value="system">Automatic System Preference (Light/Dark)</option>
              <option value="light">Fixed Light Theme</option>
              <option value="dark">Fixed Dark Theme</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-luxury-sand font-medium">Border Radius Preset</label>
            <select
              value={appearance.border_radius}
              onChange={(e) =>
                onChange({ ...appearance, border_radius: e.target.value as 'none' | 'sm' | 'md' | 'full' })
              }
              className="w-full h-9 bg-luxury-card border border-luxury-border text-xs text-luxury-cream px-3 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
            >
              <option value="none">Sharp Architectural (0px)</option>
              <option value="sm">Subtle Luxury (2px - 4px)</option>
              <option value="md">Rounded Elegant (8px)</option>
              <option value="full">Soft Organic Pill</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-luxury-sand font-medium">Button Typography & Style</label>
            <select
              value={appearance.button_style}
              onChange={(e) =>
                onChange({ ...appearance, button_style: e.target.value as 'luxury' | 'minimal' | 'bold' })
              }
              className="w-full h-9 bg-luxury-card border border-luxury-border text-xs text-luxury-cream px-3 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
            >
              <option value="luxury">Luxury Gold Gradient & Border</option>
              <option value="minimal">Minimalist Monochrome</option>
              <option value="bold">High-Impact High-Contrast</option>
            </select>
          </div>
        </div>

        <h4 className="font-serif text-sm text-luxury-cream font-medium border-b border-luxury-border/60 pb-2 pt-2">
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

        <h4 className="font-serif text-sm text-luxury-cream font-medium border-b border-luxury-border/60 pb-2 pt-2">
          Brand Assets & Icons
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-luxury-sand">
              <ImageIcon className="h-3.5 w-3.5 text-luxury-gold" />
              <span>Custom Logo Image URL (Optional)</span>
            </div>
            <Input
              value={appearance.logo_url || ''}
              onChange={(e) => onChange({ ...appearance, logo_url: e.target.value })}
              placeholder="https://.../logo.png (leave blank for typography logo)"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-luxury-sand">
              <ImageIcon className="h-3.5 w-3.5 text-luxury-gold" />
              <span>Favicon Image URL (Optional)</span>
            </div>
            <Input
              value={appearance.favicon_url || ''}
              onChange={(e) => onChange({ ...appearance, favicon_url: e.target.value })}
              placeholder="https://.../favicon.ico"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button variant="luxury" size="default" onClick={onSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Appearance Settings</span>
        </Button>
      </div>
    </div>
  );
};
