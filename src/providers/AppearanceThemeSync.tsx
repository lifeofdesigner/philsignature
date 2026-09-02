import { useEffect } from 'react';
import { useStoreAppearance } from '@/features/cms/hooks/useStoreAppearance';
import { hexToRgbTriplet, hexToHslTriplet } from '@/lib/color';

/**
 * Reads the admin-managed Brand & Theme config and pushes it into the same
 * CSS custom properties src/index.css already defines, so the CMS becomes
 * the single source of truth without introducing a second color system.
 */
export const AppearanceThemeSync: React.FC = () => {
  const { appearance } = useStoreAppearance();

  // 1. Dynamic Favicon and App Icon Sync
  useEffect(() => {
    const faviconUrl = appearance.favicon_url || appearance.apple_touch_icon_url || appearance.logo_url;
    if (faviconUrl) {
      let iconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        document.head.appendChild(iconLink);
      }
      iconLink.href = faviconUrl;
      if (faviconUrl.endsWith('.png')) {
        iconLink.type = 'image/png';
      } else if (faviconUrl.endsWith('.svg')) {
        iconLink.type = 'image/svg+xml';
      } else if (faviconUrl.endsWith('.ico')) {
        iconLink.type = 'image/x-icon';
      }
    }

    const appleIconUrl = appearance.apple_touch_icon_url || appearance.favicon_url || appearance.logo_url;
    if (appleIconUrl) {
      let appleLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
      if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleLink);
      }
      appleLink.href = appleIconUrl;
    }
  }, [appearance.favicon_url, appearance.apple_touch_icon_url, appearance.logo_url]);

  // 2. CSS Custom Properties Sync (Palette & Border Radius)
  useEffect(() => {
    const root = document.documentElement.style;

    const rgbVars: [string | undefined, string][] = [
      [appearance.accent_gold_color, '--luxury-gold'],
      [appearance.surface_color, '--luxury-card'],
      [appearance.border_color, '--luxury-border'],
      [appearance.background_color, '--luxury-black'],
    ];
    for (const [hex, cssVar] of rgbVars) {
      if (!hex) continue;
      const rgb = hexToRgbTriplet(hex);
      if (rgb) root.setProperty(cssVar, rgb);
    }

    const hslVars: [string | undefined, string][] = [
      [appearance.primary_brand_color, '--primary'],
      [appearance.secondary_brand_color, '--secondary'],
      [appearance.danger_color, '--destructive'],
    ];
    for (const [hex, cssVar] of hslVars) {
      if (!hex) continue;
      const hsl = hexToHslTriplet(hex);
      if (hsl) root.setProperty(cssVar, hsl);
    }

    if (appearance.border_radius) {
      const radiusMap: Record<string, string> = {
        none: '0px',
        sm: '2px',
        md: '6px',
        full: '9999px',
      };
      const radius = radiusMap[appearance.border_radius];
      if (radius) root.setProperty('--radius', radius);
    }
  }, [appearance]);

  return null;
};
