import { settingsRepository, type SettingsRepository } from '@/repositories/SettingsRepository';
import { ValidationError } from '@/errors/ValidationError';
import { broadcastStoreUpdate } from '@/lib/storeSync';
import type { SiteSetting } from '@/types/database';

export class SettingsService {
  constructor(private repo: SettingsRepository = settingsRepository) {}

  async getAllSettings(): Promise<SiteSetting[]> {
    return this.repo.findAll();
  }

  async getSetting<T = unknown>(key: string): Promise<T | null> {
    const setting = await this.repo.findByKey(key);
    return (setting?.value as T) ?? null;
  }

  async saveSetting(key: string, value: unknown, description?: string): Promise<SiteSetting> {
    if (!key) throw new ValidationError('Setting key is required');
    const result = await this.repo.upsert(key, value, description);
    try {
      broadcastStoreUpdate('SETTINGS_UPDATED', { key, value });
    } catch (err) {
      console.debug('Failed to dispatch settings update:', err);
    }
    return result;
  }
}

export const settingsService = new SettingsService();
