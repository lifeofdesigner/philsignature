import { settingsRepository, type SettingsRepository } from '@/repositories/SettingsRepository';
import { ValidationError } from '@/errors/ValidationError';
import { broadcastStoreUpdate } from '@/lib/storeSync';
import type { TaxSettings } from '@/types/database';

export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  enabled: false,
  name: 'VAT',
  rate: 7.5,
};

export interface TaxCalculationResult {
  rate: number;
  amount: number;
  name: string;
  enabled: boolean;
}

export class TaxService {
  constructor(private repo: SettingsRepository = settingsRepository) {}

  /**
   * Retrieves the current boutique tax configuration from site_settings.
   */
  async getTaxSettings(): Promise<TaxSettings> {
    try {
      const allSettings = await this.repo.findAll();
      const settingsMap = new Map(allSettings.map((s) => [s.key, s.value]));

      // 1. Check composite tax_settings key
      const composite = settingsMap.get('tax_settings') as Partial<TaxSettings> | undefined;

      const enabled =
        composite?.enabled !== undefined
          ? Boolean(composite.enabled)
          : settingsMap.has('tax_enabled')
          ? Boolean(settingsMap.get('tax_enabled'))
          : DEFAULT_TAX_SETTINGS.enabled;

      const name =
        composite?.name !== undefined && String(composite.name).trim()
          ? String(composite.name).trim()
          : settingsMap.has('tax_name') && String(settingsMap.get('tax_name')).trim()
          ? String(settingsMap.get('tax_name')).trim()
          : DEFAULT_TAX_SETTINGS.name;

      const rawRate = composite?.rate !== undefined ? composite.rate : settingsMap.get('tax_rate');
      const parsedRate = rawRate !== undefined && rawRate !== null ? Number(rawRate) : DEFAULT_TAX_SETTINGS.rate;
      const rate = !isNaN(parsedRate) && parsedRate >= 0 ? parsedRate : DEFAULT_TAX_SETTINGS.rate;

      return {
        enabled,
        name,
        rate,
      };
    } catch (err) {
      console.warn('Failed to fetch tax settings, using defaults:', err);
      return { ...DEFAULT_TAX_SETTINGS };
    }
  }

  /**
   * Persists the tax configuration into the site_settings table.
   */
  async saveTaxSettings(settings: TaxSettings): Promise<TaxSettings> {
    const name = settings.name?.trim() || 'VAT';
    const rate = Number(settings.rate);

    if (isNaN(rate) || rate < 0 || rate > 100) {
      throw new ValidationError('Tax rate must be a valid percentage between 0 and 100');
    }

    const payload: TaxSettings = {
      enabled: Boolean(settings.enabled),
      name,
      rate,
    };

    // Save composite object and individual keys for maximum compatibility
    await Promise.all([
      this.repo.upsert('tax_settings', payload, 'Global boutique taxation configuration'),
      this.repo.upsert('tax_enabled', payload.enabled, 'Global boutique tax toggle (true/false)'),
      this.repo.upsert('tax_name', payload.name, 'Display name for tax levy (e.g. VAT, GST, Sales Tax)'),
      this.repo.upsert('tax_rate', payload.rate, 'Tax percentage rate (e.g. 7.5 for 7.5%)'),
    ]);

    try {
      broadcastStoreUpdate('SETTINGS_UPDATED', { key: 'tax_settings', value: payload });
    } catch (err) {
      console.debug('Failed to dispatch tax settings broadcast:', err);
    }

    return payload;
  }

  /**
   * Calculates the tax amount for a given subtotal.
   * Formula: subtotal × (tax rate / 100) = tax amount
   */
  calculateTax(subtotal: number, config?: Partial<TaxSettings> | null): TaxCalculationResult {
    const enabled = Boolean(config?.enabled);
    const name = config?.name?.trim() || DEFAULT_TAX_SETTINGS.name;
    const rate = Number(config?.rate ?? 0);

    if (!enabled || isNaN(rate) || rate <= 0 || subtotal <= 0) {
      return {
        rate: isNaN(rate) ? 0 : rate,
        amount: 0,
        name,
        enabled,
      };
    }

    // Mathematical formula: subtotal * (rate / 100) rounded to 2 decimal places
    const amount = Math.round(subtotal * (rate / 100) * 100) / 100;

    return {
      rate,
      amount,
      name,
      enabled: true,
    };
  }
}

export const taxService = new TaxService();
