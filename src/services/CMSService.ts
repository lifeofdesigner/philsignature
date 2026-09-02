import { cmsRepository, type CMSRepository } from '@/repositories/CMSRepository';
import type { CmsContent } from '@/types/database';

export interface CmsHeroSlide {
  id: string;
  badge: string;
  headline: string;
  subtitle: string;
  primary_cta_text: string;
  primary_cta_url: string;
  secondary_cta_text?: string;
  secondary_cta_url?: string;
  desktop_image: string;
  mobile_image?: string;
  is_active: boolean;
  order: number;
}

export interface CmsHeroSliderSettings {
  autoplay: boolean;
  autoplay_interval_ms: number;
  transition_duration_ms: number;
}

export interface CmsHeroContent {
  badge?: string;
  headline?: string;
  subtitle?: string;
  primary_cta_text?: string;
  primary_cta_url?: string;
  secondary_cta_text?: string;
  secondary_cta_url?: string;
  background_image?: string;
  slides?: CmsHeroSlide[];
  settings?: CmsHeroSliderSettings;
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

  public static DEFAULT_SLIDES: CmsHeroSlide[] = [
    {
      id: 'slide-1',
      badge: 'Haute Parfumerie',
      headline: 'Luxury Perfumes That Last',
      subtitle: 'Handcrafted long-lasting perfumes made with the finest fragrance oils. Rich, elegant scents designed to make a statement.',
      primary_cta_text: 'Shop Perfumes',
      primary_cta_url: '/shop',
      secondary_cta_text: 'View Collections',
      secondary_cta_url: '/collections',
      desktop_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=2000&q=90',
      mobile_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=90',
      is_active: true,
      order: 1,
    },
    {
      id: 'slide-2',
      badge: 'Private Reserve',
      headline: 'Rare Cambodian Oud & Amber',
      subtitle: 'Intense, smoky woods aged for decades and infused with royal Taif rose petals. An aura of pure prestige.',
      primary_cta_text: 'Discover Oud Line',
      primary_cta_url: '/shop?family=Woody',
      secondary_cta_text: 'Our Story',
      secondary_cta_url: '/about',
      desktop_image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=2000&q=90',
      mobile_image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=90',
      is_active: true,
      order: 2,
    },
    {
      id: 'slide-3',
      badge: 'The Extrait Collection',
      headline: 'Pure Elegance in Every Flacon',
      subtitle: 'Formulated at 35% extrait concentration. Exceptional sillage that lingers from morning to evening.',
      primary_cta_text: 'Shop Extraits',
      primary_cta_url: '/shop',
      secondary_cta_text: 'Client Favorites',
      secondary_cta_url: '/shop?sortBy=bestseller',
      desktop_image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=2000&q=90',
      mobile_image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=90',
      is_active: true,
      order: 3,
    },
  ];

  public static DEFAULT_SLIDER_SETTINGS: CmsHeroSliderSettings = {
    autoplay: true,
    autoplay_interval_ms: 6000,
    transition_duration_ms: 700,
  };

  private static DEFAULT_HERO: CmsHeroContent = {
    badge: 'Luxury Fragrance House',
    headline: 'Luxury Perfumes That Last',
    subtitle: 'Handcrafted long-lasting perfumes made with the finest fragrance oils. Rich, elegant scents designed to make a statement.',
    primary_cta_text: 'Shop Perfumes',
    primary_cta_url: '/shop',
    secondary_cta_text: 'View Collections',
    secondary_cta_url: '/collections',
    background_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=2000&q=90',
    slides: CMSService.DEFAULT_SLIDES,
    settings: CMSService.DEFAULT_SLIDER_SETTINGS,
  };

  private static DEFAULT_ANNOUNCEMENT: CmsAnnouncementContent = {
    enabled: true,
    text: 'FREE NATIONWIDE DELIVERY ON ALL ORDERS OVER ₦150,000',
    link_text: 'SHOP NOW',
    link_url: '/shop',
  };

  private static DEFAULT_STORY: CmsStoryContent = {
    title: 'The Art of Philz Signature',
    quote: 'Perfume is more than just a scent; it is a sign of confidence, presence, and personal style.',
    philosophy: 'PHILZ SIGNATURE was created to bring you authentic luxury perfumes. Every bottle is made with high-concentration perfume oils, ensuring your scent lasts all day and leaves a lasting impression.',
    sourcing: 'From rare Cambodian woods to the rose fields of Taif and fresh Mediterranean bergamot, our ingredients are carefully selected from the finest sources around the world.',
    image1_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=85',
  };

  private static DEFAULT_FOOTER: CmsFooterContent = {
    brand_description: 'Luxury perfumes and signature fragrances. Made with high-concentration oils for long-lasting performance.',
    instagram: 'https://instagram.com/philzsignature',
    whatsapp: '+2348000000000',
    concierge_email: 'support@philzsignature.com',
    flagship_location: 'Victoria Island, Lagos, Nigeria',
  };

  async getSectionContent(key: string): Promise<CmsContent | null> {
    return this.repo.getSection(key);
  }

  async getHeroSection(): Promise<CmsHeroContent> {
    try {
      const row = await this.repo.getSection('homepage_hero');
      if (!row || !row.content) return CMSService.DEFAULT_HERO;

      const content = row.content as Partial<CmsHeroContent>;
      const existingSlides = Array.isArray(content.slides) && content.slides.length > 0 ? content.slides : undefined;

      let slides = existingSlides;
      if (!slides) {
        // If content had single hero fields, migrate to slide-1
        if (content.headline || content.background_image) {
          slides = [
            {
              id: 'slide-1',
              badge: content.badge || 'Haute Parfumerie',
              headline: content.headline || 'Luxury Perfumes That Last',
              subtitle: content.subtitle || 'Handcrafted long-lasting perfumes made with the finest fragrance oils.',
              primary_cta_text: content.primary_cta_text || 'Shop Perfumes',
              primary_cta_url: content.primary_cta_url || '/shop',
              secondary_cta_text: content.secondary_cta_text || 'View Collections',
              secondary_cta_url: content.secondary_cta_url || '/collections',
              desktop_image: content.background_image || CMSService.DEFAULT_SLIDES[0].desktop_image,
              mobile_image: content.background_image || CMSService.DEFAULT_SLIDES[0].mobile_image,
              is_active: true,
              order: 1,
            },
            ...CMSService.DEFAULT_SLIDES.slice(1),
          ];
        } else {
          slides = CMSService.DEFAULT_SLIDES;
        }
      }

      return {
        ...CMSService.DEFAULT_HERO,
        ...content,
        slides,
        settings: {
          ...CMSService.DEFAULT_SLIDER_SETTINGS,
          ...(content.settings || {}),
        },
      };
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
