import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminCms } from '../hooks/useAdminCms';
import { CmsHeroManager } from '../components/CmsHeroManager';
import { CmsHomepageBuilder } from '../components/CmsHomepageBuilder';
import { CmsMenuBuilder } from '../components/CmsMenuBuilder';
import { CmsAppearanceManager } from '../components/CmsAppearanceManager';
import { CmsPoliciesManager } from '../components/CmsPoliciesManager';
import type {
  CmsHeroContent,
  CmsAnnouncementContent,
  CmsStoryContent,
  CmsFooterContent,
  CmsHomepageLayout,
  CmsNavigationMenu,
  CmsAppearanceConfig,
} from '@/services/CMSService';

export const AdminCmsPage: React.FC = () => {
  const {
    hero,
    announcement,
    story,
    footer,
    layout,
    menu,
    appearance,
    faq,
    contact,
    isLoading,
    save,
    isSaving,
  } = useAdminCms();

  const [heroForm, setHeroForm] = useState<CmsHeroContent | null>(null);
  const [announcementForm, setAnnouncementForm] = useState<CmsAnnouncementContent | null>(null);
  const [storyForm, setStoryForm] = useState<CmsStoryContent | null>(null);
  const [footerForm, setFooterForm] = useState<CmsFooterContent | null>(null);
  const [layoutForm, setLayoutForm] = useState<CmsHomepageLayout | null>(null);
  const [menuForm, setMenuForm] = useState<CmsNavigationMenu | null>(null);
  const [appearanceForm, setAppearanceForm] = useState<CmsAppearanceConfig | null>(null);

  useEffect(() => { if (hero) setHeroForm(hero); }, [hero]);
  useEffect(() => { if (announcement) setAnnouncementForm(announcement); }, [announcement]);
  useEffect(() => { if (story) setStoryForm(story); }, [story]);
  useEffect(() => { if (footer) setFooterForm(footer); }, [footer]);
  useEffect(() => { if (layout) setLayoutForm(layout); }, [layout]);
  useEffect(() => { if (menu) setMenuForm(menu); }, [menu]);
  useEffect(() => { if (appearance) setAppearanceForm(appearance); }, [appearance]);

  const handleSave = async (key: string, section: string, title: string, content: Record<string, unknown>) => {
    try {
      await save({ key, section, title, content });
      toast.success(`${title} updated successfully.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save section.');
    }
  };

  if (
    isLoading ||
    !heroForm ||
    !announcementForm ||
    !storyForm ||
    !footerForm ||
    !layoutForm ||
    !menuForm ||
    !appearanceForm
  ) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
          Enterprise Content Management
        </span>
        <h1 className="font-serif text-3xl text-luxury-cream font-normal mt-1">
          Storefront CMS & Operations Suite
        </h1>
        <p className="text-xs text-luxury-muted font-light mt-1">
          Control 100% of the customer storefront: hero motion, modular homepage, navigation menus, appearance themes, and store policies.
        </p>
      </div>

      <Tabs defaultValue="announcement" className="w-full">
        <TabsList className="overflow-x-auto max-w-full flex-wrap h-auto gap-2 border-b border-luxury-border/60 pb-2">
          <TabsTrigger value="announcement">Announcement</TabsTrigger>
          <TabsTrigger value="hero">Hero Slider</TabsTrigger>
          <TabsTrigger value="homepage">Homepage Layout</TabsTrigger>
          <TabsTrigger value="menu">Menu Builder</TabsTrigger>
          <TabsTrigger value="policies">Policies & FAQs</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="story">Brand Story</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="announcement" className="space-y-6 pt-4">
          <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-luxury-border/60">
              <div>
                <h3 className="font-serif text-lg text-white font-normal">Announcement Bar Visibility</h3>
                <p className="text-xs text-luxury-muted font-light">Display high-priority message at the very top of the storefront.</p>
              </div>
              <Switch
                checked={announcementForm.enabled}
                onCheckedChange={(checked) => setAnnouncementForm((p) => (p ? { ...p, enabled: checked } : p))}
              />
            </div>

            <Input
              label="Announcement Banner Text"
              value={announcementForm.text}
              onChange={(e) => setAnnouncementForm((p) => (p ? { ...p, text: e.target.value } : p))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Action Link Text"
                value={announcementForm.link_text || ''}
                onChange={(e) => setAnnouncementForm((p) => (p ? { ...p, link_text: e.target.value } : p))}
              />
              <Input
                label="Destination URL"
                value={announcementForm.link_url || ''}
                onChange={(e) => setAnnouncementForm((p) => (p ? { ...p, link_url: e.target.value } : p))}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="luxury"
                size="sm"
                className="gap-1.5"
                disabled={isSaving}
                onClick={() => handleSave('announcement_bar', 'header', 'Announcement Bar', announcementForm as unknown as Record<string, unknown>)}
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Save Announcement</span>
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hero" className="space-y-6 pt-4">
          <CmsHeroManager
            hero={heroForm}
            onChange={setHeroForm}
            onSave={() => handleSave('homepage_hero', 'home', 'Homepage Hero Slider', heroForm as unknown as Record<string, unknown>)}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="homepage" className="space-y-6 pt-4">
          <CmsHomepageBuilder
            layout={layoutForm}
            onChange={setLayoutForm}
            onSave={() => handleSave('homepage_layout', 'home', 'Homepage Modular Layout', layoutForm as unknown as Record<string, unknown>)}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="menu" className="space-y-6 pt-4">
          <CmsMenuBuilder
            menu={menuForm}
            onChange={setMenuForm}
            onSave={() => handleSave('main_navigation_menu', 'header', 'Header Navigation Menu', menuForm as unknown as Record<string, unknown>)}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="policies" className="space-y-6 pt-4">
          <CmsPoliciesManager
            faq={faq || null}
            contact={contact || null}
            onSaveSection={handleSave}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 pt-4">
          <CmsAppearanceManager
            appearance={appearanceForm}
            onChange={setAppearanceForm}
            onSave={() => handleSave('store_appearance', 'appearance', 'Store Appearance Settings', appearanceForm as unknown as Record<string, unknown>)}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="story" className="space-y-6 pt-4">
          <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
            <h3 className="font-serif text-lg text-luxury-cream font-normal border-b border-luxury-border/60 pb-3">Brand Philosophy & Heritage</h3>
            <Input
              label="Story Title"
              value={storyForm.title}
              onChange={(e) => setStoryForm((p) => (p ? { ...p, title: e.target.value } : p))}
            />
            <Input
              label="Signature Quote"
              value={storyForm.quote}
              onChange={(e) => setStoryForm((p) => (p ? { ...p, quote: e.target.value } : p))}
            />
            <Textarea
              label="Brand Philosophy Text"
              rows={4}
              value={storyForm.philosophy}
              onChange={(e) => setStoryForm((p) => (p ? { ...p, philosophy: e.target.value } : p))}
            />
            <Textarea
              label="Fragrance Sourcing & Craftsmanship"
              rows={4}
              value={storyForm.sourcing}
              onChange={(e) => setStoryForm((p) => (p ? { ...p, sourcing: e.target.value } : p))}
            />
            <Input
              label="Heritage Feature Image URL"
              value={storyForm.image1_url || ''}
              onChange={(e) => setStoryForm((p) => (p ? { ...p, image1_url: e.target.value } : p))}
            />

            <div className="flex justify-end pt-2">
              <Button
                variant="luxury"
                size="sm"
                className="gap-1.5"
                disabled={isSaving}
                onClick={() => handleSave('brand_story', 'about', 'Brand Story', storyForm as unknown as Record<string, unknown>)}
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Save Story</span>
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6 pt-4">
          <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
            <h3 className="font-serif text-lg text-luxury-cream font-normal border-b border-luxury-border/60 pb-3">Footer Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Instagram Handle / Link"
                value={footerForm.instagram}
                onChange={(e) => setFooterForm((p) => (p ? { ...p, instagram: e.target.value } : p))}
              />
              <Input
                label="WhatsApp Concierge"
                value={footerForm.whatsapp}
                onChange={(e) => setFooterForm((p) => (p ? { ...p, whatsapp: e.target.value } : p))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Concierge Email"
                value={footerForm.concierge_email}
                onChange={(e) => setFooterForm((p) => (p ? { ...p, concierge_email: e.target.value } : p))}
              />
              <Input
                label="Flagship Atelier Location"
                value={footerForm.flagship_location}
                onChange={(e) => setFooterForm((p) => (p ? { ...p, flagship_location: e.target.value } : p))}
              />
            </div>
            <Input
              label="Brand Description"
              value={footerForm.brand_description}
              onChange={(e) => setFooterForm((p) => (p ? { ...p, brand_description: e.target.value } : p))}
            />

            <div className="flex justify-end pt-2">
              <Button
                variant="luxury"
                size="sm"
                className="gap-1.5"
                disabled={isSaving}
                onClick={() => handleSave('footer_config', 'footer', 'Footer Configuration', footerForm as unknown as Record<string, unknown>)}
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Save Footer</span>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
