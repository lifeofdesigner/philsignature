import { cmsRepository, type CMSRepository } from '@/repositories/CMSRepository';
import type { CmsContent } from '@/types/database';

export class CMSService {
  constructor(private repo: CMSRepository = cmsRepository) {}

  async getSectionContent(key: string): Promise<CmsContent | null> {
    return this.repo.getSection(key);
  }

  async updateSectionContent(key: string, section: string, title: string, content: Record<string, unknown>): Promise<CmsContent> {
    return this.repo.upsertSection(key, section, title, content);
  }
}

export const cmsService = new CMSService();

