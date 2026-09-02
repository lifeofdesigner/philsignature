import React, { useState } from 'react';
import { Sliders, Check, Type } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { CmsAppearanceConfig } from '@/services/CMSService';

interface LogoSizeControlProps {
  appearance: CmsAppearanceConfig;
  onChange: (updated: CmsAppearanceConfig) => void;
  onCommit: (updated: CmsAppearanceConfig) => Promise<void>;
}

const PRESETS = [
  { id: 'small', label: 'Small', height: 48, mobile: 38, description: 'Compact (48px)' },
  { id: 'medium', label: 'Medium', height: 72, mobile: 52, description: 'Standard (72px)' },
  { id: 'large', label: 'Large', height: 96, mobile: 68, description: 'Prominent & Bold (96px)' },
  { id: 'xl', label: 'Extra Large', height: 120, mobile: 82, description: 'High-Impact Statement (120px)' },
  { id: 'huge', label: 'Biggest', height: 150, mobile: 98, description: 'Grand Luxury Presence (150px)' },
] as const;

export const LogoSizeControl: React.FC<LogoSizeControlProps> = ({
  appearance,
  onChange,
  onCommit,
}) => {
  const currentHeight = appearance.logo_height || 72;
  const currentMobileHeight = appearance.logo_mobile_height || 52;
  const currentPreset = appearance.logo_size || 'medium';
  const logoUrl = appearance.logo_dark_url || appearance.logo_url;

  const [isSaving, setIsSaving] = useState(false);

  const handleSelectPreset = async (preset: typeof PRESETS[number]) => {
    const updated: CmsAppearanceConfig = {
      ...appearance,
      logo_size: preset.id as 'small' | 'medium' | 'large' | 'xl' | 'huge',
      logo_height: preset.height,
      logo_mobile_height: preset.mobile,
    };
    onChange(updated);
    setIsSaving(true);
    try {
      await onCommit(updated);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSliderChange = (height: number) => {
    let matchedPreset: 'small' | 'medium' | 'large' | 'xl' | 'huge' = 'medium';
    if (height <= 55) matchedPreset = 'small';
    else if (height <= 80) matchedPreset = 'medium';
    else if (height <= 105) matchedPreset = 'large';
    else if (height <= 130) matchedPreset = 'xl';
    else matchedPreset = 'huge';

    const updated: CmsAppearanceConfig = {
      ...appearance,
      logo_height: height,
      logo_size: matchedPreset,
      logo_mobile_height: Math.max(38, Math.round(height * 0.7)),
    };
    onChange(updated);
  };

  const handleSliderCommit = async (height: number) => {
    let matchedPreset: 'small' | 'medium' | 'large' | 'xl' | 'huge' = 'medium';
    if (height <= 55) matchedPreset = 'small';
    else if (height <= 80) matchedPreset = 'medium';
    else if (height <= 105) matchedPreset = 'large';
    else if (height <= 130) matchedPreset = 'xl';
    else matchedPreset = 'huge';

    const updated: CmsAppearanceConfig = {
      ...appearance,
      logo_height: height,
      logo_size: matchedPreset,
      logo_mobile_height: Math.max(38, Math.round(height * 0.7)),
    };
    setIsSaving(true);
    try {
      await onCommit(updated);
    } finally {
      setIsSaving(false);
    }
  };

  const showBusinessName = appearance.show_business_name !== false;

  const handleToggleBusinessName = async (show: boolean) => {
    const updated: CmsAppearanceConfig = {
      ...appearance,
      show_business_name: show,
    };
    onChange(updated);
    setIsSaving(true);
    try {
      await onCommit(updated);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-luxury-card border border-luxury-border p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-luxury-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-luxury-gold" />
            <h3 className="font-serif text-lg text-white font-normal">Logo & Header Branding</h3>
          </div>
          <p className="text-xs text-luxury-muted mt-0.5">
            Scale your brand logo and manage business name layout across desktop and mobile views.
          </p>
        </div>
        {isSaving && (
          <span className="text-[11px] text-luxury-gold animate-pulse font-mono">
            Applying changes...
          </span>
        )}
      </div>

      {/* Business Name Visibility & Layout */}
      <div className="flex items-center justify-between p-4 bg-luxury-charcoal/40 border border-luxury-border rounded-sm">
        <div className="space-y-0.5 pr-4">
          <label className="text-xs font-medium text-white flex items-center gap-2">
            <Type className="h-3.5 w-3.5 text-luxury-gold" />
            <span>Show Business Name in Header</span>
            {showBusinessName && (
              <span className="text-[9px] px-1.5 py-0.5 bg-luxury-gold/20 text-luxury-gold rounded font-medium uppercase tracking-wider">
                Visible
              </span>
            )}
          </label>
          <p className="text-[11px] text-luxury-muted">
            Shows business name <strong className="text-luxury-sand">beside</strong> the logo on mobile and <strong className="text-luxury-sand">under</strong> the logo on desktop. Toggle off to display only the logo emblem.
          </p>
        </div>
        <Switch
          checked={showBusinessName}
          onCheckedChange={handleToggleBusinessName}
          disabled={isSaving}
        />
      </div>

      {/* Preset Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-luxury-sand">Logo Size Presets</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PRESETS.map((preset) => {
            const isSelected = currentPreset === preset.id || currentHeight === preset.height;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`flex flex-col items-center justify-center p-3 rounded-sm border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-luxury-gold bg-luxury-gold/15 text-luxury-gold shadow-sm'
                    : 'border-luxury-border bg-luxury-charcoal/40 text-luxury-cream/80 hover:border-luxury-gold/50 hover:bg-luxury-charcoal/70'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium uppercase tracking-luxury">
                    {preset.label}
                  </span>
                  {isSelected && <Check className="h-3 w-3 text-luxury-gold" />}
                </div>
                <span className="text-[10px] text-luxury-muted mt-1 font-mono">
                  {preset.height}px
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Precision Height Slider */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-luxury-sand">
            Fine-Tune Desktop Height
          </label>
          <span className="text-xs font-mono px-2 py-0.5 bg-luxury-charcoal border border-luxury-border rounded text-luxury-gold font-semibold">
            {currentHeight} px
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-luxury-muted font-mono">40px (Small)</span>
          <input
            type="range"
            min={40}
            max={160}
            step={2}
            value={currentHeight}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            onMouseUp={(e) => handleSliderCommit(Number((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => handleSliderCommit(Number((e.target as HTMLInputElement).value))}
            className="flex-1 accent-[#C5A880] h-1.5 bg-luxury-charcoal rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-luxury-muted font-mono">160px (Biggest)</span>
        </div>
      </div>

      {/* Live Visual Preview */}
      <div className="space-y-2 pt-2 border-t border-luxury-border/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-luxury-sand">Live Header Preview</span>
          <span className="text-[10px] text-luxury-muted">
            Height: {currentHeight}px (Desktop) • {currentMobileHeight}px (Mobile)
          </span>
        </div>

        <div className="bg-luxury-black/95 border border-luxury-border p-6 rounded-sm flex flex-col items-center justify-center overflow-hidden min-h-[160px] gap-2 transition-all">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo Preview"
              style={{ height: `${currentHeight}px`, maxHeight: '160px' }}
              className="w-auto max-w-full object-contain transition-all duration-300"
            />
          ) : null}

          {showBusinessName && (
            <div className="flex flex-col items-center select-none text-center leading-none mt-1">
              <span className="font-serif text-sm sm:text-base tracking-[0.2em] text-luxury-cream uppercase font-normal">
                PHILZ SIGNATURE
              </span>
              <span className="text-[8px] tracking-[0.28em] text-luxury-gold font-medium uppercase mt-0.5">
                HAUTE PARFUMERIE
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
