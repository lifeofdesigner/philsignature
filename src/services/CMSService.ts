import { cmsRepository, type CMSRepository } from '@/repositories/CMSRepository';
import type { CmsContent } from '@/types/database';
import { broadcastStoreUpdate } from '@/lib/storeSync';

export type CmsPublishStatus = 'draft' | 'published' | 'archived';

export interface CmsHeroSlide {
  id: string;
  badge: string;
  headline: string;
  subtitle: string;
  primary_cta_text?: string;
  primary_cta_url?: string;
  secondary_cta_text?: string;
  secondary_cta_url?: string;
  desktop_image: string;
  mobile_image?: string;
  video_url?: string;
  overlay_color?: string;
  overlay_opacity?: number;
  animation_style?: 'crossfade' | 'slide' | 'zoom';
  // ÁRUM Framer Style: Floating Featured Product Spotlight
  featured_product_title?: string;
  featured_product_subtitle?: string;
  featured_product_price?: string;
  featured_product_image?: string;
  featured_product_url?: string;
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
  subtitle?: string;
  body_paragraphs?: string[];
  philosophy_title?: string;
  philosophy_points?: string[];
  story_title?: string;
  story_body?: string[];
  story_goal?: string;
  perfumer_title?: string;
  perfumer_subtitle?: string;
  perfumer_body?: string[];
  closing_brand?: string;
  closing_statement?: string;
  quote?: string;
  philosophy?: string;
  sourcing?: string;
  image1_url?: string;
  image2_url?: string;
  status?: CmsPublishStatus;
}

export interface CmsFooterLink {
  label: string;
  url: string;
  target?: '_self' | '_blank';
}

export interface CmsFooterContent {
  brand_name?: string;
  tagline?: string;
  brand_description: string;
  closing_line?: string;
  instagram: string;
  instagram_handle?: string;
  whatsapp: string;
  concierge_email: string;
  phone?: string;
  flagship_location: string;
  copyright_text?: string;
  shop_links?: CmsFooterLink[];
  services_links?: CmsFooterLink[];
  company_links?: CmsFooterLink[];
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
  | 'instagram'
  | 'newsletter'
  | 'banner'
  | 'custom_html';

export interface CmsInstagramPost {
  id: string;
  image_url: string;
  caption?: string;
  likes_count?: number;
  comments_count?: number;
  post_url?: string;
}

export interface CmsInstagramSection {
  enabled: boolean;
  title: string;
  subtitle?: string;
  handle: string;
  profile_url: string;
  layout: 'slider' | 'grid';
  post_count: number;
  posts: CmsInstagramPost[];
  status?: CmsPublishStatus;
}

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
  logo_height?: number; // Desktop logo height in pixels (40 - 160)
  logo_mobile_height?: number; // Mobile logo height in pixels (38 - 100)
  show_business_name?: boolean; // When true: Beside logo on mobile, Under logo on desktop
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

export interface CmsInquiryPillar {
  title: string;
  description: string;
  button_text: string;
  action_type?: 'contact' | 'project' | 'quote' | 'link';
  action_url?: string;
}

export interface CmsContactContent {
  title: string;
  subtitle: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  whatsapp: string;
  pillars?: CmsInquiryPillar[];
}

export class CMSService {
  constructor(private repo: CMSRepository = cmsRepository) {}

  public static DEFAULT_SLIDES: CmsHeroSlide[] = [
    {
      id: 'slide-1',
      badge: 'PHILZ SIGNATURE',
      headline: 'A Signature Is Something That Belongs To You',
      subtitle: 'Founded in 2018, Philz Signature offers perfumes, perfume oils, home fragrances, gifting solutions and private-label services crafted to leave a lasting impression.',
      primary_cta_text: 'Explore Fragrances',
      primary_cta_url: '/shop',
      secondary_cta_text: 'Our Story',
      secondary_cta_url: '/about',
      desktop_image: '/brand/hero-oud-luxury.jpg',
      mobile_image: '/brand/hero-oud-luxury.jpg',
      featured_product_title: 'Perfume Body Oils',
      featured_product_subtitle: 'Masculine • Feminine • Unisex',
      featured_product_price: '₦45,000',
      featured_product_image: '/media/products/perfume-oils/perfume-oil-1.jpg',
      featured_product_url: '/shop?category=perfume-body-oils',
      is_active: true,
      order: 1,
    },
    {
      id: 'slide-2',
      badge: 'PRIVATE LABEL & GIFTING',
      headline: 'Customized Fragrance Solutions For Brands',
      subtitle: 'Ready to create your own fragrance collection or corporate gifts? We provide private-label perfumes, candles, diffusers, and luxury hampers for businesses.',
      primary_cta_text: 'Start A Project',
      primary_cta_url: '/contact',
      secondary_cta_text: 'Request A Quote',
      secondary_cta_url: '/contact',
      desktop_image: '/brand/hero-private-reserve.jpg',
      mobile_image: '/brand/hero-private-reserve.jpg',
      featured_product_title: 'Reed Diffuser & Scented Candle',
      featured_product_subtitle: 'Artisanal Home & Lifestyle',
      featured_product_price: '₦95,000',
      featured_product_image: '/media/products/diffuser-candles/diffuser-candle-1.jpg',
      featured_product_url: '/shop?category=home-fragrance',
      is_active: true,
      order: 2,
    },
    {
      id: 'slide-3',
      badge: 'MEET PHILZ THE PERFUMER',
      headline: 'Behind Every Signature Is A Story',
      subtitle: 'Everyone deserves to have a scent that feels like their own. Guided by curiosity, creativity, and a commitment to creating memorable scent experiences.',
      primary_cta_text: 'Read Our Story',
      primary_cta_url: '/about',
      secondary_cta_text: 'Shop Fragrances',
      secondary_cta_url: '/shop',
      desktop_image: '/brand/hero-extrait-collection.jpg',
      mobile_image: '/brand/hero-extrait-collection.jpg',
      featured_product_title: 'Philz Extrait de Parfum',
      featured_product_subtitle: 'Signature Collection • 100ml',
      featured_product_price: '₦185,000',
      featured_product_image: '/media/products/perfume-oils/perfume-oil-2.jpg',
      featured_product_url: '/shop',
      is_active: true,
      order: 3,
    },
  ];

  public static DEFAULT_SLIDER_SETTINGS: CmsHeroSliderSettings = {
    autoplay: true,
    autoplay_interval_ms: 6500,
    transition_duration_ms: 800,
  };

  private static DEFAULT_HERO: CmsHeroContent = {
    badge: 'PHILZ SIGNATURE',
    headline: 'A Signature Is Something That Belongs To You',
    subtitle: 'Founded in 2018, Philz Signature offers perfumes, perfume oils, home fragrances, gifting solutions and private-label services crafted to leave a lasting impression.',
    primary_cta_text: 'Explore Fragrances',
    primary_cta_url: '/shop',
    secondary_cta_text: 'Our Story',
    secondary_cta_url: '/about',
    background_image: '/brand/hero-oud-luxury.jpg',
    slides: CMSService.DEFAULT_SLIDES,
    settings: CMSService.DEFAULT_SLIDER_SETTINGS,
  };

  private static DEFAULT_ANNOUNCEMENT: CmsAnnouncementContent = {
    enabled: true,
    text: 'PHILZ SIGNATURE — YOUR SCENT. YOUR SIGNATURE. • BASED IN LAGOS, NIGERIA',
    link_text: 'EXPLORE SCENTS',
    link_url: '/shop',
  };

  public static DEFAULT_STORY: CmsStoryContent = {
    title: 'ABOUT PHILZ SIGNATURE',
    subtitle: 'A SIGNATURE IS SOMETHING THAT BELONGS TO YOU.',
    body_paragraphs: [
      'Founded in 2018, Philz Signature was created from a passion for fragrance and the belief that scent is one of the most powerful ways to express individuality.',
      'What began with a focus on personal fragrance has evolved into a broader scent lifestyle brand offering perfumes, perfume oils, home fragrances, gifting solutions and private-label services.',
    ],
    philosophy_title: 'Our Philosophy',
    philosophy_points: [
      'Fragrance should be personal.',
      'Quality should be intentional.',
      'Every experience should be memorable.',
    ],
    story_title: 'OUR STORY',
    story_body: [
      'At the heart of Philz Signature is Philz the Perfumer, whose passion for fragrance inspired the creation of a brand focused on helping people discover scents that feel personal and distinctive.',
      'Over the years, Philz Signature has continued to evolve—expanding from personal fragrance into home fragrance, corporate gifting and customized fragrance solutions for businesses.',
    ],
    story_goal: 'To create fragrance experiences that leave a lasting impression.',
    perfumer_title: 'MEET PHILZ THE PERFUMER',
    perfumer_subtitle: 'BEHIND EVERY SIGNATURE IS A STORY.',
    perfumer_body: [
      'Philz the Perfumer is the founder and creative force behind Philz Signature.',
      'Driven by a passion for fragrance and entrepreneurship, he has built Philz Signature around a simple belief: Everyone deserves to have a scent that feels like their own.',
      'From fragrance creation to brand development, the journey continues to be guided by curiosity, creativity and a commitment to creating memorable scent experiences.',
    ],
    closing_brand: 'PHILZ SIGNATURE',
    closing_statement: 'Your scent. Your signature.',
    quote: 'A signature is something that belongs to you.',
    philosophy: 'Fragrance should be personal. Quality should be intentional. Every experience should be memorable.',
    sourcing: 'Handcrafted perfume oils, bespoke home fragrances, and master-crafted personal scents.',
    image1_url: '/media/banners/banner-4.jpg',
    image2_url: '/media/lifestyle/lifestyle-1.jpg',
    status: 'published',
  };

  public static DEFAULT_INSTAGRAM: CmsInstagramSection = {
    enabled: true,
    title: 'Follow Our Olfactory Journey',
    subtitle: 'Behind the atelier with Philz the Perfumer, bespoke formulation, and olfactory art.',
    handle: '@philztheperfumer',
    profile_url: 'https://instagram.com/philztheperfumer',
    layout: 'slider',
    post_count: 6,
    posts: [
      {
        id: 'insta-1',
        image_url: '/media/products/perfume-oils/perfume-oil-1.jpg',
        caption: 'Pure botanical essence extracted in small batches. Our signature Perfume Body Oil on rough travertine. ✨ #PhilzSignature #PhilzThePerfumer',
        likes_count: 512,
        comments_count: 38,
        post_url: 'https://instagram.com/philztheperfumer',
      },
      {
        id: 'insta-2',
        image_url: '/media/products/diffuser-candles/diffuser-candle-1.jpg',
        caption: 'Elevate your sanctuary with our slow-burning scented candles and natural rattan reed diffusers. 🕯️ #HomeFragrance #PhilzSignature',
        likes_count: 684,
        comments_count: 49,
        post_url: 'https://instagram.com/philztheperfumer',
      },
      {
        id: 'insta-3',
        image_url: '/media/products/perfume-oils/perfume-oil-6.jpg',
        caption: 'Bespoke Private Label & Extrait formulations. Crafted to leave an indelible signature. 👑 #PhilzThePerfumer #LuxuryFragrance',
        likes_count: 920,
        comments_count: 73,
        post_url: 'https://instagram.com/philztheperfumer',
      },
      {
        id: 'insta-4',
        image_url: '/media/lifestyle/lifestyle-1.jpg',
        caption: 'Evening rituals: Warm vanilla, smoked amber, and quiet reflection. 🌙 #YourScentYourSignature #ScentLifestyle',
        likes_count: 410,
        comments_count: 27,
        post_url: 'https://instagram.com/philztheperfumer',
      },
      {
        id: 'insta-5',
        image_url: '/media/products/diffuser-candles/diffuser-candle-3.jpg',
        caption: 'Continuous diffusion of pure botanical oils. Effortless elegance for corporate & residential spaces. 🌿 #PhilzSignature',
        likes_count: 576,
        comments_count: 41,
        post_url: 'https://instagram.com/philztheperfumer',
      },
      {
        id: 'insta-6',
        image_url: '/media/banners/banner-4.jpg',
        caption: 'The Complete Wardrobe: Perfumes, perfume oils, reed diffusers, and luxury gifting hampers. #PhilzSignature #PhilzThePerfumer',
        likes_count: 1042,
        comments_count: 95,
        post_url: 'https://instagram.com/philztheperfumer',
      },
    ],
    status: 'published',
  };

  public static DEFAULT_HOMEPAGE_SECTIONS: CmsHomepageSection[] = [
    { id: 'sec-hero', type: 'hero', title: 'Hero Billboard Slider', is_enabled: true, order: 1, spacing: 'normal', background: 'default', animation: 'fade_in', status: 'published' },
    { id: 'sec-collections', type: 'collections', title: 'Curated Collections', is_enabled: true, order: 2, spacing: 'normal', background: 'default', animation: 'slide_up', status: 'published' },
    { id: 'sec-featured', type: 'featured_products', title: 'Featured Signature Creations', is_enabled: true, order: 3, spacing: 'normal', background: 'charcoal', animation: 'fade_in', status: 'published' },
    { id: 'sec-story', type: 'brand_story', title: 'About Philz Signature & Our Story', is_enabled: true, order: 4, spacing: 'generous', background: 'default', animation: 'fade_in', status: 'published' },
    { id: 'sec-testimonials', type: 'testimonials', title: 'Client Acclaim & Reviews', is_enabled: true, order: 5, spacing: 'normal', background: 'black', animation: 'slide_up', status: 'published' },
    { id: 'sec-instagram', type: 'instagram', title: 'Instagram Feed Section', is_enabled: true, order: 6, spacing: 'normal', background: 'default', animation: 'fade_in', status: 'published' },
    { id: 'sec-newsletter', type: 'newsletter', title: 'VIP Scent Club Invitation', is_enabled: true, order: 7, spacing: 'compact', background: 'charcoal', animation: 'fade_in', status: 'published' },
  ];

  public static DEFAULT_NAVIGATION_MENU: CmsMenuItem[] = [
    { id: 'nav-1', label: 'Perfume Oils', url: '/shop?category=perfume-body-oils', is_active: true, order: 1, target: '_self' },
    { id: 'nav-2', label: 'All Perfumes', url: '/shop', is_active: true, order: 2, target: '_self', badge: 'Popular' },
    { id: 'nav-3', label: 'Home Fragrance', url: '/shop?category=home-fragrance', is_active: true, order: 3, target: '_self' },
    { id: 'nav-4', label: 'Our Story', url: '/about', is_active: true, order: 4, target: '_self' },
    { id: 'nav-5', label: 'Private Label & Gifting', url: '/contact', is_active: true, order: 5, target: '_self' },
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
    logo_height: 72,
    logo_mobile_height: 52,
    show_business_name: true,
  };

  public static DEFAULT_FOOTER: CmsFooterContent = {
    brand_name: 'PHILZ SIGNATURE',
    tagline: 'YOUR SCENT. YOUR SIGNATURE.',
    brand_description: 'Luxury fragrances and scent experiences crafted for those who want to leave a lasting impression.',
    closing_line: 'PHILZ SIGNATURE — Signature by nature, crafted for you.',
    instagram: 'https://instagram.com/philztheperfumer',
    instagram_handle: '@philztheperfumer',
    whatsapp: 'https://wa.me/message/OJXETPKJE7L4M1',
    concierge_email: 'Philzsignature1@gmail.com',
    phone: '+2347038399764',
    flagship_location: 'Lagos, Nigeria',
    copyright_text: '© 2026 PHILZ SIGNATURE. ALL RIGHTS RESERVED.',
    shop_links: [
      { label: 'Perfume Oils', url: '/shop?category=perfume-body-oils' },
      { label: 'Niche Collection', url: '/collections/niche-collection' },
      { label: 'Signature Collection', url: '/collections/signature-classics' },
      { label: 'Home Fragrance', url: '/shop?category=home-fragrance' },
      { label: 'Gifts', url: '/shop?category=gifts-and-hampers' },
    ],
    services_links: [
      { label: 'Private Label', url: '/contact?subject=private-label' },
      { label: 'Corporate Gifting', url: '/contact?subject=corporate-gifting' },
      { label: 'Bulk Orders', url: '/contact?subject=bulk-orders' },
      { label: 'Perfume Bar & Luxury Gifts', url: '/contact?subject=perfume-bar' },
    ],
    company_links: [
      { label: 'About Us', url: '/about' },
      { label: 'Our Story', url: '/about#our-story' },
      { label: 'Contact', url: '/contact' },
      { label: 'FAQs', url: '/faq' },
    ],
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

  async getInstagramSection(): Promise<CmsInstagramSection> {
    try {
      const row = await this.repo.getSection('instagram_feed');
      if (!row || !row.content) return CMSService.DEFAULT_INSTAGRAM;
      return { ...CMSService.DEFAULT_INSTAGRAM, ...(row.content as Partial<CmsInstagramSection>) };
    } catch {
      return CMSService.DEFAULT_INSTAGRAM;
    }
  }

  async updateInstagramSection(content: Partial<CmsInstagramSection>): Promise<CmsInstagramSection> {
    const current = await this.getInstagramSection();
    const updated = { ...current, ...content };
    await this.updateSectionContent('instagram_feed', 'marketing', 'Instagram Social Sanctuary', updated as unknown as Record<string, unknown>);
    return updated;
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

  public static DEFAULT_FAQ: CmsFaqContent = {
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about our fragrance collections, bespoke solutions, orders and delivery.',
    status: 'published',
    items: [
      {
        question: 'What type of fragrances does Philz Signature offer?',
        answer: 'We offer perfume oils, Eau de Parfum and a variety of home and lifestyle fragrances, including scented candles, reed diffusers, room sprays and car fragrances.',
      },
      {
        question: 'Are Philz Signature fragrances for men or women?',
        answer: 'Our collections are designed for fragrance lovers of different preferences. Many of our fragrances can be enjoyed by anyone, regardless of gender.',
      },
      {
        question: 'How do I choose a fragrance?',
        answer: "You can explore fragrances by collection, fragrance family, mood and occasion. If you're still unsure, contact us and we'll help you find a suitable option.",
      },
      {
        question: 'Do you offer private labeling?',
        answer: 'Yes. We offer private-label and white-label fragrance solutions for businesses and entrepreneurs.',
      },
      {
        question: 'What products can be private labeled?',
        answer: 'Depending on your requirements, we can provide perfumes, perfume oils, candles, reed diffusers, room sprays and other fragrance products.',
      },
      {
        question: 'Do you offer corporate gifting?',
        answer: 'Yes. We create customized corporate fragrance gifts, hampers and branded products for businesses and organizations.',
      },
      {
        question: 'Can products be customized with my company\'s branding?',
        answer: 'Yes. Branding and packaging customization can be incorporated into qualifying corporate and private-label projects.',
      },
      {
        question: 'Where is Philz Signature located?',
        answer: 'Philz Signature is based in Lagos, Nigeria.',
      },
      {
        question: 'How can I place an order?',
        answer: 'Browse our online collection, select your preferred products and follow the checkout process. For bulk, corporate or private-label orders, contact our team directly.',
      },
      {
        question: 'Do you deliver?',
        answer: 'Yes. Delivery options are available for customers and business clients. Delivery timelines depend on the order and destination.',
      },
    ],
  };

  public static DEFAULT_CONTACT: CmsContactContent = {
    title: "LET'S CREATE YOUR SIGNATURE",
    subtitle: "Whether you're looking for your next fragrance, planning a corporate gift project or interested in creating your own fragrance brand, we'd love to hear from you.",
    email: 'Philzsignature1@gmail.com',
    phone: '+2347038399764',
    whatsapp: 'https://wa.me/message/OJXETPKJE7L4M1',
    address: 'Lagos, Nigeria',
    hours: 'Monday – Saturday: 9:00 AM – 7:00 PM WAT',
    pillars: [
      {
        title: 'Customer Enquiries',
        description: 'Questions about our products, orders or fragrances?',
        button_text: 'CONTACT US',
        action_type: 'contact',
        action_url: '#inquiry-form',
      },
      {
        title: 'Private Label',
        description: 'Ready to create your own fragrance collection?',
        button_text: 'START A PROJECT',
        action_type: 'project',
        action_url: 'https://wa.me/message/OJXETPKJE7L4M1',
      },
      {
        title: 'Corporate Gifting',
        description: 'Planning gifts for your company, clients or team?',
        button_text: 'REQUEST A QUOTE',
        action_type: 'quote',
        action_url: 'https://wa.me/message/OJXETPKJE7L4M1',
      },
    ],
  };

  async getFaqContent(): Promise<CmsFaqContent> {
    try {
      const row = await this.repo.getSection('faq_data');
      if (row && row.content) return { ...CMSService.DEFAULT_FAQ, ...(row.content as Partial<CmsFaqContent>) };
    } catch {
      // Fallback
    }
    return CMSService.DEFAULT_FAQ;
  }

  async getContactContent(): Promise<CmsContactContent> {
    try {
      const row = await this.repo.getSection('contact_data');
      if (row && row.content) return { ...CMSService.DEFAULT_CONTACT, ...(row.content as Partial<CmsContactContent>) };
    } catch {
      // Fallback
    }
    return CMSService.DEFAULT_CONTACT;
  }

  async updateSectionContent(key: string, section: string, title: string, content: Record<string, unknown>): Promise<CmsContent> {
    const result = await this.repo.upsertSection(key, section, title, content);
    try {
      broadcastStoreUpdate('CMS_UPDATED', { key, section });
    } catch (err) {
      console.debug('Failed to dispatch store update:', err);
    }
    return result;
  }
}

export const cmsService = new CMSService();
