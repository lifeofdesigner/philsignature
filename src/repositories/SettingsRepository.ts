import { BaseRepository } from './BaseRepository';
import type { SiteSetting } from '@/types/database';

export class SettingsRepository extends BaseRepository {
  async findAll(): Promise<SiteSetting[]> {
    try {
      const { data, error } = await this.client.from('site_settings').select('*').order('key', { ascending: true });
      if (error) this.handleError(error, 'Failed to fetch site settings');
      return (data as SiteSetting[]) || [];
    } catch (err) {
      this.handleError(err, 'Error fetching site settings');
    }
  }

  async findByKey(key: string): Promise<SiteSetting | null> {
    try {
      const { data, error } = await this.client.from('site_settings').select('*').eq('key', key).maybeSingle();
      if (error) this.handleError(error, `Failed to fetch setting: ${key}`);
      return (data as SiteSetting) || null;
    } catch (err) {
      this.handleError(err, `Error fetching setting: ${key}`);
    }
  }

  async upsert(key: string, value: unknown, description?: string): Promise<SiteSetting> {
    try {
      const { data, error } = await this.client
        .from('site_settings')
        .upsert(
          { key, value, description, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
        .select()
        .single();
      if (error) this.handleError(error, `Failed to save setting: ${key}`);
      return data as SiteSetting;
    } catch (err) {
      this.handleError(err, `Error saving setting: ${key}`);
    }
  }
}

export const settingsRepository = new SettingsRepository();
