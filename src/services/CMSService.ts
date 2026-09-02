import { cmsRepository, type CMSRepository } from '@/repositories/CMSRepository';
import type { CmsContent } from '@/types/database';

export type CmsPublishStatus = 'draft' | 'published' | 'archived';

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
  video_url?: string;
  overlay_color?: string;
  overlay_opacity?: number;
  animation_style?: 'crossfade' | 'slide' | 'zoom';
  is_active: boolean;
  order: number;
  status?: CmsPublishStatus;
  scheduled_publish_at?: string;
  scheduled_unpublish_at?: string;
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
  status?: CmsPublishStatus;
}

export interface CmsStoryContent {
  title: string;
  quote: string;
  philosophy: string;
  sourcing: string;
  image1_url?: string;
  status?: CmsPublishStatus;
}

export interface CmsFooterContent {
  brand_description: string;
  instagram: string;
  whatsapp: string;
  concierge_email: string;
  flagship_location: string;
}

// Menu Builder Models
export interface CmsMenuItem {
  id: string;
  label: string;
  url: string;
  target?: '_self' | '_blank';
  badge?: string;
  icon?: string;
  is_mega?: boolean;
  is_active: boolean;
  order: number;
  children?: CmsMenuItem[];
}

export interface CmsNavigationMenu {
  items: CmsMenuItem[];
}

// Modular Homepage Builder Models
export type CmsHomepageSectionType =
  | 'hero'
  | 'collections'
  | 'featured_products'
  | 'brand_story'
  | 'testimonials'
  | 'newsletter'
  | 'banner'
  | 'custom_html';

export interface CmsHomepageSection {
  id: string;
  type: CmsHomepageSectionType;
  title: string;
  is_enabled: boolean;
  order: number;
  spacing: 'compact' | 'normal' | 'generous';
  background: 'default' | 'black' | 'charcoal' | 'card' | 'radial_luxury';
  animation: 'fade_in' | 'slide_up' | 'scale' | 'none';
  status: CmsPublishStatus;
  scheduled_publish_at?: string;
  scheduled_unpublish_at?: string;
  custom_content?: string;
}

export interface CmsHomepageLayout {
  sections: CmsHomepageSection[];
}

// Store Appearance Models
export interface CmsAppearanceConfig {
  default_theme: 'system' | 'light' | 'dark';
  primary_brand_color: string;
  secondary_brand_color: string;
  accent_gold_color: string;
  border_radius: 'none' | 'sm' | 'md' | 'full';
  button_style: 'luxury' | 'minimal' | 'bold';
  site_width: 'standard' | 'wide' | 'fluid';
  logo_url?: string;
  favicon_url?: string;
  // Logo Sizing Controls (Small to Biggest)
  logo_size?: 'small' | 'medium' | 'large' | 'xl' | 'huge';
  logo_height?: number; // Desktop logo height in pixels (30 - 120)
  logo_mobile_height?: number; // Mobile logo height in pixels (24 - 80)
  // Additional brand image variants (Website Builder: Brand Settings)
  logo_light_url?: string;
  logo_dark_url?: string;
  logo_mobile_url?: string;
  apple_touch_icon_url?: string;
  email_logo_url?: string;
  social_share_image_url?: string;
  loading_logo_url?: string;
  // Extended semantic color palette (Website Builder: Theme Settings)
  background_color?: string;
  surface_color?: string;
  button_color?: string;
  text_color?: string;
  border_color?: string;
  success_color?: string;
  warning_color?: string;
  danger_color?: string;
  info_color?: string;
}

// Policy & Static Pages Models
export interface CmsPolicyPageContent {
  title: string;
  subtitle?: string;
  last_updated: string;
  content: string;
  seo_title?: string;
  seo_description?: string;
  status: CmsPublishStatus;
}

export interface CmsFaqItem {
  question: string;
  answer: string;
  category?: string;
}

export interface CmsFaqContent {
  title: string;
  subtitle: string;
  items: CmsFaqItem[];
  status: CmsPublishStatus;
}

export interface CmsContactContent {
  title: string;
  subtitle: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  whatsapp: string;
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

  public static DEFAULT_HOMEPAGE_SECTIONS: CmsHomepageSection[] = [
    { id: 'sec-hero', type: 'hero', title: 'Hero Billboard Slider', is_enabled: true, order: 1, spacing: 'normal', background: 'default', animation: 'fade_in', status: 'published' },
    { id: 'sec-collections', type: 'collections', title: 'Curated Collections', is_enabled: true, order: 2, spacing: 'normal', background: 'default', animation: 'slide_up', status: 'published' },
    { id: 'sec-featured', type: 'featured_products', title: 'Featured Extrait Creations', is_enabled: true, order: 3, spacing: 'normal', background: 'charcoal', animation: 'fade_in', status: 'published' },
    { id: 'sec-story', type: 'brand_story', title: 'Brand Heritage & Philosophy', is_enabled: true, order: 4, spacing: 'generous', background: 'default', animation: 'fade_in', status: 'published' },
    { id: 'sec-testimonials', type: 'testimonials', title: 'Client Acclaim & Reviews', is_enabled: true, order: 5, spacing: 'normal', background: 'black', animation: 'slide_up', status: 'published' },
    { id: 'sec-newsletter', type: 'newsletter', title: 'VIP Scent Club Invitation', is_enabled: true, order: 6, spacing: 'compact', background: 'charcoal', animation: 'fade_in', status: 'published' },
  ];

  public static DEFAULT_NAVIGATION_MENU: CmsMenuItem[] = [
    { id: 'nav-1', label: 'Collections', url: '/collections', is_active: true, order: 1, target: '_self' },
    { id: 'nav-2', label: 'All Perfumes', url: '/shop', is_active: true, order: 2, target: '_self', badge: 'Popular' },
    { id: 'nav-3', label: 'Woody & Oud', url: '/shop?family=Woody', is_active: true, order: 3, target: '_self' },
    { id: 'nav-4', label: 'Oriental & Amber', url: '/shop?family=Oriental', is_active: true, order: 4, target: '_self' },
    { id: 'nav-5', label: 'About Us', url: '/about', is_active: true, order: 5, target: '_self' },
  ];

  public static DEFAULT_APPEARANCE: CmsAppearanceConfig = {
    default_theme: 'system',
    primary_brand_color: '#A17836',
    secondary_brand_color: '#111827',
    accent_gold_color: '#C5A880',
    border_radius: 'sm',
    button_style: 'luxury',
    site_width: 'standard',
    logo_size: 'medium',
    logo_height: 48,
    logo_mobile_height: 36,
  };

  private static DEFAULT_FOOTER: CmsFooterContent = {
    brand_description: 'Luxury perfumes and signature fragrances. Made with high-concentration oils for long-lasting performance.',
    instagram: 'https://instagram.com/philzsignature',
    whatsapp: '+2348000000000',
    concierge_email: 'support@philzsignature.com',
    flagship_location: 'Victoria Island, Lagos, Nigeria',
  };

  /**
   * Evaluates if a CMS section is visible based on active flag, publish status, and schedule
   */
  public isSectionCurrentlyVisible(item: {
    is_enabled?: boolean;
    status?: CmsPublishStatus;
    scheduled_publish_at?: string;
    scheduled_unpublish_at?: string;
  }): boolean {
    if (item.is_enabled === false) return false;
    if (item.status === 'draft' || item.status === 'archived') return false;

    const now = new Date().getTime();
    if (item.scheduled_publish_at) {
      const pubTime = new Date(item.scheduled_publish_at).getTime();
      if (!isNaN(pubTime) && now < pubTime) return false;
    }
    if (item.scheduled_unpublish_at) {
      const unpubTime = new Date(item.scheduled_unpublish_at).getTime();
      if (!isNaN(unpubTime) && now > unpubTime) return false;
    }

    return true;
  }

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

  async getHomepageLayout(): Promise<CmsHomepageLayout> {
    try {
      const row = await this.repo.getSection('homepage_layout');
      if (!row || !row.content) {
        return { sections: CMSService.DEFAULT_HOMEPAGE_SECTIONS };
      }
      const data = row.content as Partial<CmsHomepageLayout>;
      return {
        sections: Array.isArray(data.sections) && data.sections.length > 0
          ? data.sections
          : CMSService.DEFAULT_HOMEPAGE_SECTIONS,
      };
    } catch {
      return { sections: CMSService.DEFAULT_HOMEPAGE_SECTIONS };
    }
  }

  async getNavigationMenu(): Promise<CmsNavigationMenu> {
    try {
      const row = await this.repo.getSection('main_navigation_menu');
      if (!row || !row.content) {
        return { items: CMSService.DEFAULT_NAVIGATION_MENU };
      }
      const data = row.content as Partial<CmsNavigationMenu>;
      return {
        items: Array.isArray(data.items) && data.items.length > 0
          ? data.items
          : CMSService.DEFAULT_NAVIGATION_MENU,
      };
    } catch {
      return { items: CMSService.DEFAULT_NAVIGATION_MENU };
    }
  }

  async getAppearance(): Promise<CmsAppearanceConfig> {
    try {
      const row = await this.repo.getSection('store_appearance');
      if (!row || !row.content) return CMSService.DEFAULT_APPEARANCE;
      return { ...CMSService.DEFAULT_APPEARANCE, ...(row.content as Partial<CmsAppearanceConfig>) };
    } catch {
      return CMSService.DEFAULT_APPEARANCE;
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

  async getPolicyPage(slug: string): Promise<CmsPolicyPageContent> {
    const key = `policy_${slug.replace(/-/g, '_')}`;
    const titles: Record<string, string> = {
      privacy_policy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      shipping_policy: 'Shipping & Delivery Policy',
      returns_policy: 'Returns & Exchange Policy',
    };

    try {
      const row = await this.repo.getSection(key);
      if (row && row.content) {
        return row.content as unknown as CmsPolicyPageContent;
      }
    } catch {
      // Fallback below
    }

    return {
      title: titles[slug.replace(/-/g, '_')] || 'Store Policy',
      subtitle: 'Philz Signature Haute Parfumerie Client Commitments',
      last_updated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      content: `Welcome to Philz Signature. We ensure the highest standard of fragrance authenticity, express nationwide delivery, and client satisfaction. Please review our terms and contact our concierge for any bespoke requests.`,
      status: 'published',
    };
  }

  async getFaqContent(): Promise<CmsFaqContent> {
    try {
      const row = await this.repo.getSection('faq_data');
      if (row && row.content) return row.content as unknown as CmsFaqContent;
    } catch {
      // Fallback
    }
    return {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about our formulations, sillage, orders, and delivery.',
      status: 'published',
      items: [
        { question: 'How long do Philz Signature perfumes last on the skin?', answer: 'Our perfumes are formulated at high extrait concentrations (30% to 35% pure oil), lasting 12 to 24+ hours on skin and multiple days on apparel.' },
        { question: 'Do you offer nationwide express delivery in Nigeria?', answer: 'Yes! We deliver across Lagos within 24 to 48 hours, and nationwide via priority dispatch within 2 to 4 business days.' },
        { question: 'Can I exchange a fragrance if I want a different scent?', answer: 'Due to hygiene and luxury quality standards, bottles whose security seal has been broken cannot be returned. We include sample testers with qualifying acquisitions so you can trial before unsealing.' },
      ],
    };
  }

  async getContactContent(): Promise<CmsContactContent> {
    try {
      const row = await this.repo.getSection('contact_data');
      if (row && row.content) return row.content as unknown as CmsContactContent;
    } catch {
      // Fallback
    }
    return {
      title: 'Concierge & Client Relations',
      subtitle: 'Our fragrance advisors are at your service for personal curation, bespoke gifts, and order inquiries.',
      email: 'concierge@philzsignature.com',
      phone: '+234 800 000 0000',
      whatsapp: '+234 800 000 0000',
      address: 'Victoria Island, Lagos, Nigeria',
      hours: 'Monday – Saturday: 9:00 AM – 7:00 PM WAT',
    };
  }

  async updateSectionContent(key: string, section: string, title: string, content: Record<string, unknown>): Promise<CmsContent> {
    return this.repo.upsertSection(key, section, title, content);
  }
}

export const cmsService = new CMSService();
