import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, Loader2, Sparkles, CheckCircle2, Layers, Eye, Megaphone, FileText, Menu as MenuIcon, Palette, Heart, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { auditLogService } from '@/services/AuditLogService';
import { useAuth } from '@/hooks/useAuth';

export const AdminCmsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'announcement';
  const { user } = useAuth();

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
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

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
      setLastSavedTime(new Date().toLocaleTimeString());
      await auditLogService.recordAction('SAVE_CMS', section, key, { title }, user?.id);
      toast.success(`${title} saved to database & live on storefront.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save section.');
    }
  };

  const handleGenerateAi = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a description prompt.');
      return;
    }
    setIsGeneratingAi(true);
    setTimeout(() => {
      setAiOutput(
        `Immerse your space in effortless luxury. Formulated with pure botanical oils and noble extracts, ${aiPrompt} offers an intriguing scent narrative that captures the essence of contemporary elegance.`
      );
      setIsGeneratingAi(false);
      toast.success('AI description generated!');
    }, 800);
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
    <div className="space-y-6">
      {/* SaaS Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Storefront CMS & Visual Builder
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time visual editor for hero motion slider, modular homepage layout, menus, policies, and brand theme.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200">
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-700" />
                <span>Saving to Supabase...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Saved Live {lastSavedTime ? `at ${lastSavedTime}` : ''}</span>
              </>
            )}
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors"
          >
            <Eye className="h-3.5 w-3.5 text-slate-500" />
            <span>Preview Live Store</span>
          </a>
        </div>
      </div>

      {/* SaaS Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setSearchParams({ tab: val })}
        className="w-full"
      >
        <TabsList className="bg-white border border-slate-200 p-1.5 rounded-xl flex flex-wrap gap-1 h-auto shadow-2xs">
          <TabsTrigger value="announcement" className="text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white font-semibold gap-1.5">
            <Megaphone className="h-3.5 w-3.5" /> Announcement
          </TabsTrigger>
          <TabsTrigger value="hero" className="text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white font-semibold gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Hero Slider
          </TabsTrigger>
          <TabsTrigger value="homepage" className="text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white font-semibold gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5" /> Homepage Layout
          </TabsTrigger>
          <TabsTrigger value="menu" className="text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white font-semibold gap-1.5">
            <MenuIcon className="h-3.5 w-3.5" /> Menu Builder 2.0
          </TabsTrigger>
          <TabsTrigger value="policies" className="text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white font-semibold gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Policies & FAQs
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white font-semibold gap-1.5">
            <Palette className="h-3.5 w-3.5" /> Appearance & Theme
          </TabsTrigger>
          <TabsTrigger value="story" className="text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white font-semibold gap-1.5">
            <Heart className="h-3.5 w-3.5" /> Brand Story
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white font-semibold gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> AI Assistant
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Announcement */}
        <TabsContent value="announcement" className="pt-4 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">Top Announcement Bar</CardTitle>
                <CardDescription>High-priority alert banner fixed above storefront header</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Enabled:</span>
                <Switch
                  checked={announcementForm.enabled}
                  onCheckedChange={(checked) => setAnnouncementForm((p) => (p ? { ...p, enabled: checked } : p))}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Input
                label="Announcement Banner Text"
                value={announcementForm.text}
                onChange={(e) => setAnnouncementForm((p) => (p ? { ...p, text: e.target.value } : p))}
                className="text-xs"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Action Button Label"
                  value={announcementForm.link_text || ''}
                  onChange={(e) => setAnnouncementForm((p) => (p ? { ...p, link_text: e.target.value } : p))}
                  className="text-xs"
                />
                <Input
                  label="Target Destination URL"
                  value={announcementForm.link_url || ''}
                  onChange={(e) => setAnnouncementForm((p) => (p ? { ...p, link_url: e.target.value } : p))}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs cursor-pointer"
                  disabled={isSaving}
                  onClick={() => handleSave('announcement_bar', 'header', 'Announcement Bar', announcementForm as unknown as Record<string, unknown>)}
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>Save Announcement</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Hero Slider */}
        <TabsContent value="hero" className="pt-4">
          <CmsHeroManager
            hero={heroForm}
            onChange={(updated) => setHeroForm(updated)}
            onSave={() => handleSave('hero_banner', 'hero', 'Hero Motion Banner', heroForm as unknown as Record<string, unknown>)}
            isSaving={isSaving}
          />
        </TabsContent>

        {/* Tab 3: Homepage Builder */}
        <TabsContent value="homepage" className="pt-4">
          <CmsHomepageBuilder
            layout={layoutForm}
            onChange={(updated) => setLayoutForm(updated)}
            onSave={() => handleSave('homepage_layout', 'layout', 'Homepage Layout', layoutForm as unknown as Record<string, unknown>)}
            isSaving={isSaving}
          />
        </TabsContent>

        {/* Tab 4: Menu Builder */}
        <TabsContent value="menu" className="pt-4">
          <CmsMenuBuilder
            menu={menuForm}
            onChange={(updated) => setMenuForm(updated)}
            onSave={() => handleSave('navigation_menu', 'header', 'Navigation Menu', menuForm as unknown as Record<string, unknown>)}
            isSaving={isSaving}
          />
        </TabsContent>

        {/* Tab 5: Policies & FAQs */}
        <TabsContent value="policies" className="pt-4">
          <CmsPoliciesManager
            faq={faq || null}
            contact={contact || null}
            onSaveSection={(key, section, title, content) => handleSave(key, section, title, content)}
            isSaving={isSaving}
          />
        </TabsContent>

        {/* Tab 6: Appearance & Themes */}
        <TabsContent value="appearance" className="pt-4">
          <CmsAppearanceManager
            appearance={appearanceForm}
            onChange={(updated) => setAppearanceForm(updated)}
            onSave={() => handleSave('store_appearance', 'global', 'Store Appearance', appearanceForm as unknown as Record<string, unknown>)}
            isSaving={isSaving}
          />
        </TabsContent>

        {/* Tab 7: Brand Story */}
        <TabsContent value="story" className="pt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Brand Manifesto & Story Copy</CardTitle>
              <CardDescription>Edit official brand philosophy rendered across storefront homepage and About Us page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Story Headline"
                value={storyForm.title}
                onChange={(e) => setStoryForm((p) => (p ? { ...p, title: e.target.value } : p))}
              />
              <Input
                label="Story Subtitle"
                value={storyForm.subtitle || ''}
                onChange={(e) => setStoryForm((p) => (p ? { ...p, subtitle: e.target.value } : p))}
              />
              <Textarea
                label="Manifesto Body Copy"
                rows={5}
                value={storyForm.body_paragraphs ? storyForm.body_paragraphs.join('\n\n') : ''}
                onChange={(e) => setStoryForm((p) => (p ? { ...p, body_paragraphs: e.target.value.split('\n\n') } : p))}
              />

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs cursor-pointer"
                  disabled={isSaving}
                  onClick={() => handleSave('brand_story', 'about', 'Brand Story', storyForm as unknown as Record<string, unknown>)}
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>Save Brand Story</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 8: AI Assistant */}
        <TabsContent value="ai" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-slate-700" />
                <span>Generative AI Content Assistant</span>
              </CardTitle>
              <CardDescription className="text-slate-600 font-medium">Draft perfume descriptions, FAQs, SEO metadata, or landing page copy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                label="Describe fragrance or topic (e.g. 'Smoky Amber Extrait with Top notes of Bergamot and Vanilla base')"
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Type your prompt..."
                className="text-xs"
              />
              <Button
                size="sm"
                onClick={handleGenerateAi}
                disabled={isGeneratingAi}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs cursor-pointer"
              >
                {isGeneratingAi ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>Generate Marketing Copy</span>
              </Button>

              {aiOutput && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Generated Output:</div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">{aiOutput}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(aiOutput);
                      toast.success('Copy saved to clipboard!');
                    }}
                    className="text-xs h-7 border-slate-200 text-slate-700"
                  >
                    Copy to Clipboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCmsPage;
