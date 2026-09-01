import { cmsRepository, type CMSRepository } from '@/repositories/CMSRepository';
import type { CmsContent } from '@/types/database';

export interface CmsHeroContent {
  badge: string;
  headline: string;
  subtitle: string;
  primary_cta_text: string;
  primary_cta_url: string;
  secondary_cta_text: string;
  secondary_cta_url: string;
  background_image: string;
}

export interface CmsAnnouncementContent {
  enabled: boolean;
  text: string;
  link_text?: string;
  link_url?: string;
}

export interface CmsStoryContent {
  title: string;
  quote: string;
  philosophy: string;
  sourcing: string;
  image1_url?: string;
}

export interface CmsFooterContent {
  brand_description: string;
  instagram: string;
  whatsapp: string;
  concierge_email: string;
  flagship_location: string;
}

export class CMSService {
  constructor(private repo: CMSRepository = cmsRepository) {}

  private static DEFAULT_HERO: CmsHeroContent = {
    badge: 'The Private Reserve Collection',
    headline: 'Transcendence in Every Note',
    subtitle: 'Handcrafted pure extraits de parfum, rare Cambodian oud, and timeless olfactory sanctuaries born from the rarest botanical harvest.',
    primary_cta_text: 'Explore Creations',
    primary_cta_url: '/shop',
    secondary_cta_text: 'View Collections',
    secondary_cta_url: '/collections',
    background_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=2000&q=90',
  };

  private static DEFAULT_ANNOUNCEMENT: CmsAnnouncementContent = {
    enabled: true,
    text: 'COMPLIMENTARY NATIONWIDE EXPRESS DELIVERY ON ALL ACQUISITIONS OVER ₦150,000',
    link_text: 'EXPLORE CREATIONS',
    link_url: '/shop',
  };

  private static DEFAULT_STORY: CmsStoryContent = {
    title: 'The Art of Philz Signature',
    quote: 'Perfume is not mere scent; it is an invisible crown of memory, presence, and individuality.',
    philosophy: 'PHILZ SIGNATURE was conceived to redefine the olfactory landscape through artisanal integrity. Every flacon is formulated using pure extraits, ensuring longevity, complexity, and undeniable presence.',
    sourcing: 'From the deep woods of Cambodia to the rose fields of Taif and Mediterranean bergamot groves, our distillations honor the natural spirit of each botanical harvest.',
    image1_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=85',
  };

  private static DEFAULT_FOOTER: CmsFooterContent = {
    brand_description: 'Haute Parfumerie & Artisanal Olfactory Creations. Handcrafted in limited private allocations.',
    instagram: 'https://instagram.com/philzsignature',
    whatsapp: '+2348000000000',
    concierge_email: 'concierge@philzsignature.com',
    flagship_location: 'Victoria Island, Lagos, Nigeria',
  };

  async getSectionContent(key: string): Promise<CmsContent | null> {
    return this.repo.getSection(key);
  }

  async getHeroSection(): Promise<CmsHeroContent> {
    try {
      const row = await this.repo.getSection('homepage_hero');
      if (!row || !row.content) return CMSService.DEFAULT_HERO;
      return { ...CMSService.DEFAULT_HERO, ...(row.content as Partial<CmsHeroContent>) };
    } catch {
      return CMSService.DEFAULT_HERO;
    }
  }

  async getAnnouncementSection(): Promise<CmsAnnouncementContent> {
    try {
      const row = await this.repo.getSection('announcement_bar');
      if (!row || !row.content) return CMSService.DEFAULT_ANNOUNCEMENT;
      return { ...CMSService.DEFAULT_ANNOUNCEMENT, ...(row.content as Partial<CmsAnnouncementContent>) };
    } catch {
      return CMSService.DEFAULT_ANNOUNCEMENT;
    }
  }

  async getStorySection(): Promise<CmsStoryContent> {
    try {
      const row = await this.repo.getSection('brand_story');
      if (!row || !row.content) return CMSService.DEFAULT_STORY;
      return { ...CMSService.DEFAULT_STORY, ...(row.content as Partial<CmsStoryContent>) };
    } catch {
      return CMSService.DEFAULT_STORY;
    }
  }

  async getFooterSection(): Promise<CmsFooterContent> {
    try {
      const row = await this.repo.getSection('footer_config');
      if (!row || !row.content) return CMSService.DEFAULT_FOOTER;
      return { ...CMSService.DEFAULT_FOOTER, ...(row.content as Partial<CmsFooterContent>) };
    } catch {
      return CMSService.DEFAULT_FOOTER;
    }
  }

  async updateSectionContent(key: string, section: string, title: string, content: Record<string, unknown>): Promise<CmsContent> {
    return this.repo.upsertSection(key, section, title, content);
  }
}

export const cmsService = new CMSService();
