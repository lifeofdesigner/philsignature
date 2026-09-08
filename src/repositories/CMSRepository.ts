import { BaseRepository } from './BaseRepository';
import type { CmsContent } from '@/types/database';

export class CMSRepository extends BaseRepository {
  async getSection(key: string): Promise<CmsContent | null> {
    try {
      const { data, error } = await this.client
        .from('cms_content')
        .select('*')
        .eq('key', key)
        .maybeSingle();

      if (error) {
        this.handleError(error, `Failed to load CMS section: ${key}`);
      }
      return (data || null) as CmsContent | null;
    } catch (err) {
      this.handleError(err, `Error loading CMS section: ${key}`);
    }
  }

  async upsertSection(key: string, section: string, title: string, content: Record<string, unknown>): Promise<CmsContent> {
    try {
      const { data, error } = await this.client
        .from('cms_content')
        .upsert(
          { key, section, title, content, is_published: true, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
        .select()
        .single();

      if (error) this.handleError(error, `Failed to update CMS section: ${key}`);
      return data as CmsContent;
    } catch (err) {
      this.handleError(err, `Error upserting CMS section: ${key}`);
    }
  }
}

export const cmsRepository = new CMSRepository();

