import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save, Loader2, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminCms } from '../hooks/useAdminCms';
import type { CmsHeroContent, CmsHeroSlide, CmsAnnouncementContent, CmsStoryContent, CmsFooterContent } from '@/services/CMSService';

export const AdminCmsPage: React.FC = () => {
  const { hero, announcement, story, footer, isLoading, save, isSaving } = useAdminCms();

  const [heroForm, setHeroForm] = useState<CmsHeroContent | null>(null);
  const [announcementForm, setAnnouncementForm] = useState<CmsAnnouncementContent | null>(null);
  const [storyForm, setStoryForm] = useState<CmsStoryContent | null>(null);
  const [footerForm, setFooterForm] = useState<CmsFooterContent | null>(null);

  useEffect(() => { if (hero) setHeroForm(hero); }, [hero]);
  useEffect(() => { if (announcement) setAnnouncementForm(announcement); }, [announcement]);
  useEffect(() => { if (story) setStoryForm(story); }, [story]);
  useEffect(() => { if (footer) setFooterForm(footer); }, [footer]);

  const handleSave = async (key: string, section: string, title: string, content: Record<string, unknown>) => {
    try {
      await save({ key, section, title, content });
      toast.success(`${title} updated successfully.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save section.');
    }
  };

  if (isLoading || !heroForm || !announcementForm || !storyForm || !footerForm) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
          Visual Storytelling
        </span>
        <h1 className="font-serif text-3xl text-white font-normal mt-1">
          Boutique CMS Manager
        </h1>
        <p className="text-xs text-luxury-muted font-light mt-1">
          Visual forms for all pages and sections. Zero raw JSON editing.
        </p>
      </div>

      <Tabs defaultValue="announcement" className="w-full">
        <TabsList className="overflow-x-auto max-w-full flex-wrap h-auto gap-2 border-b border-luxury-border/60 pb-2">
          <TabsTrigger value="announcement">Announcement Bar</TabsTrigger>
          <TabsTrigger value="hero">Homepage Hero</TabsTrigger>
          <TabsTrigger value="story">Brand Story</TabsTrigger>
          <TabsTrigger value="footer">Footer & Socials</TabsTrigger>
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
          {/* Slider Global Settings */}
          <div className="bg-luxury-card border border-luxury-border rounded-sm shadow-xs p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-luxury-border/60 pb-3">
              <div>
                <h3 className="font-serif text-lg text-luxury-cream font-normal">Hero Slider Configuration</h3>
                <p className="text-xs text-luxury-muted font-light">Control motion, autoplay timing, and transitions for the storefront hero billboard.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-luxury-muted font-medium">Autoplay Enabled</span>
                <Switch
                  checked={heroForm.settings?.autoplay ?? true}
                  onCheckedChange={(checked) =>
                    setHeroForm((p) =>
                      p
                        ? {
                            ...p,
                            settings: {
                              autoplay: checked,
                              autoplay_interval_ms: p.settings?.autoplay_interval_ms ?? 6000,
                              transition_duration_ms: p.settings?.transition_duration_ms ?? 700,
                            },
                          }
                        : p
                    )
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-luxury-sand dark:text-luxury-cream/80 font-semibold mb-1">
                  Slide Interval (Seconds)
                </label>
                <input
                  type="number"
                  min={3}
                  max={20}
                  step={1}
                  value={Math.round((heroForm.settings?.autoplay_interval_ms ?? 6000) / 1000)}
                  onChange={(e) => {
                    const secs = Number(e.target.value) || 6;
                    setHeroForm((p) =>
                      p
                        ? {
                            ...p,
                            settings: {
                              autoplay: p.settings?.autoplay ?? true,
                              autoplay_interval_ms: secs * 1000,
                              transition_duration_ms: p.settings?.transition_duration_ms ?? 700,
                            },
                          }
                        : p
                    );
                  }}
                  className="w-full h-11 min-h-[44px] bg-luxury-card border border-luxury-border px-3 text-xs text-luxury-cream rounded-sm focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-luxury-sand dark:text-luxury-cream/80 font-semibold mb-1">
                  Transition Duration (Milliseconds)
                </label>
                <input
                  type="number"
                  min={300}
                  max={2000}
                  step={100}
                  value={heroForm.settings?.transition_duration_ms ?? 700}
                  onChange={(e) => {
                    const ms = Number(e.target.value) || 700;
                    setHeroForm((p) =>
                      p
                        ? {
                            ...p,
                            settings: {
                              autoplay: p.settings?.autoplay ?? true,
                              autoplay_interval_ms: p.settings?.autoplay_interval_ms ?? 6000,
                              transition_duration_ms: ms,
                            },
                          }
                        : p
                    );
                  }}
                  className="w-full h-11 min-h-[44px] bg-luxury-card border border-luxury-border px-3 text-xs text-luxury-cream rounded-sm focus:border-luxury-gold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Slides List & Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl text-luxury-cream font-normal">Active Hero Slides</h3>
                <p className="text-xs text-luxury-muted font-light">Add, reorder, and configure individual editorial slides for the luxury hero carousel.</p>
              </div>
              <Button
                variant="luxury"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setHeroForm((p) => {
                    if (!p) return p;
                    const existing = p.slides || [];
                    const newSlide: CmsHeroSlide = {
                      id: `slide-${Date.now()}`,
                      badge: 'New Collection',
                      headline: 'Timeless Fragrance Creation',
                      subtitle: 'Crafted with master perfumers for an unmatched sensory statement.',
                      primary_cta_text: 'Explore Creation',
                      primary_cta_url: '/shop',
                      secondary_cta_text: 'View Collections',
                      secondary_cta_url: '/collections',
                      desktop_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=2000&q=90',
                      mobile_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=90',
                      is_active: true,
                      order: existing.length + 1,
                    };
                    return { ...p, slides: [...existing, newSlide] };
                  });
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Slide</span>
              </Button>
            </div>

            {(heroForm.slides || []).map((slide, index) => (
              <div
                key={slide.id}
                className="bg-luxury-card border border-luxury-border rounded-sm shadow-xs p-6 space-y-4 transition-all"
              >
                {/* Slide Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-luxury-border/60 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-luxury-gold px-2 py-0.5 border border-luxury-gold/30 bg-luxury-gold/5 rounded-sm">
                      #{index + 1}
                    </span>
                    <span className="font-serif text-sm text-luxury-cream font-medium truncate max-w-xs">
                      {slide.headline || 'Untitled Slide'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => {
                        setHeroForm((p) => {
                          if (!p || !p.slides) return p;
                          const list = [...p.slides];
                          const temp = list[index];
                          list[index] = list[index - 1];
                          list[index - 1] = temp;
                          list.forEach((s, idx) => (s.order = idx + 1));
                          return { ...p, slides: list };
                        });
                      }}
                      className="p-1.5 border border-luxury-border rounded-sm text-luxury-muted hover:text-luxury-cream disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === (heroForm.slides?.length ?? 1) - 1}
                      onClick={() => {
                        setHeroForm((p) => {
                          if (!p || !p.slides) return p;
                          const list = [...p.slides];
                          const temp = list[index];
                          list[index] = list[index + 1];
                          list[index + 1] = temp;
                          list.forEach((s, idx) => (s.order = idx + 1));
                          return { ...p, slides: list };
                        });
                      }}
                      className="p-1.5 border border-luxury-border rounded-sm text-luxury-muted hover:text-luxury-cream disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>

                    {/* Active toggle */}
                    <div className="flex items-center gap-2 pl-2 border-l border-luxury-border">
                      <span className="text-[11px] text-luxury-muted">{slide.is_active ? 'Active' : 'Disabled'}</span>
                      <Switch
                        checked={slide.is_active}
                        onCheckedChange={(checked) => {
                          setHeroForm((p) => {
                            if (!p || !p.slides) return p;
                            const list = p.slides.map((s) => (s.id === slide.id ? { ...s, is_active: checked } : s));
                            return { ...p, slides: list };
                          });
                        }}
                      />
                    </div>

                    {/* Delete button */}
                    {(heroForm.slides?.length ?? 0) > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setHeroForm((p) => {
                            if (!p || !p.slides) return p;
                            const list = p.slides.filter((s) => s.id !== slide.id);
                            list.forEach((s, idx) => (s.order = idx + 1));
                            return { ...p, slides: list };
                          });
                        }}
                        className="p-1.5 text-luxury-muted hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove Slide"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Slide Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Badge Sub-Label"
                    value={slide.badge}
                    placeholder="e.g. Private Reserve"
                    onChange={(e) => {
                      setHeroForm((p) => {
                        if (!p || !p.slides) return p;
                        const list = p.slides.map((s) => (s.id === slide.id ? { ...s, badge: e.target.value } : s));
                        return { ...p, slides: list };
                      });
                    }}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Main Headline"
                      value={slide.headline}
                      placeholder="e.g. Rare Cambodian Oud & Amber"
                      onChange={(e) => {
                        setHeroForm((p) => {
                          if (!p || !p.slides) return p;
                          const list = p.slides.map((s) => (s.id === slide.id ? { ...s, headline: e.target.value } : s));
                          return { ...p, slides: list };
                        });
                      }}
                    />
                  </div>
                </div>

                <Textarea
                  label="Editorial Subtitle"
                  value={slide.subtitle}
                  rows={2}
                  placeholder="Atmospheric fragrance narrative..."
                  onChange={(e) => {
                    setHeroForm((p) => {
                      if (!p || !p.slides) return p;
                      const list = p.slides.map((s) => (s.id === slide.id ? { ...s, subtitle: e.target.value } : s));
                      return { ...p, slides: list };
                    });
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Desktop Background Image URL"
                    value={slide.desktop_image}
                    placeholder="https://images.unsplash.com/..."
                    onChange={(e) => {
                      setHeroForm((p) => {
                        if (!p || !p.slides) return p;
                        const list = p.slides.map((s) => (s.id === slide.id ? { ...s, desktop_image: e.target.value } : s));
                        return { ...p, slides: list };
                      });
                    }}
                  />
                  <Input
                    label="Mobile Background Image URL (Optional)"
                    value={slide.mobile_image || ''}
                    placeholder="Optimized mobile flacon crop..."
                    onChange={(e) => {
                      setHeroForm((p) => {
                        if (!p || !p.slides) return p;
                        const list = p.slides.map((s) => (s.id === slide.id ? { ...s, mobile_image: e.target.value } : s));
                        return { ...p, slides: list };
                      });
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-3 p-3.5 bg-luxury-charcoal border border-luxury-border rounded-sm">
                    <span className="text-[10px] uppercase tracking-wider text-luxury-gold font-semibold block">
                      Primary Action Button
                    </span>
                    <Input
                      label="Button Label"
                      value={slide.primary_cta_text}
                      onChange={(e) => {
                        setHeroForm((p) => {
                          if (!p || !p.slides) return p;
                          const list = p.slides.map((s) => (s.id === slide.id ? { ...s, primary_cta_text: e.target.value } : s));
                          return { ...p, slides: list };
                        });
                      }}
                    />
                    <Input
                      label="Destination URL"
                      value={slide.primary_cta_url}
                      onChange={(e) => {
                        setHeroForm((p) => {
                          if (!p || !p.slides) return p;
                          const list = p.slides.map((s) => (s.id === slide.id ? { ...s, primary_cta_url: e.target.value } : s));
                          return { ...p, slides: list };
                        });
                      }}
                    />
                  </div>

                  <div className="space-y-3 p-3.5 bg-luxury-charcoal border border-luxury-border rounded-sm">
                    <span className="text-[10px] uppercase tracking-wider text-luxury-gold font-semibold block">
                      Secondary Action Button
                    </span>
                    <Input
                      label="Button Label"
                      value={slide.secondary_cta_text || ''}
                      onChange={(e) => {
                        setHeroForm((p) => {
                          if (!p || !p.slides) return p;
                          const list = p.slides.map((s) => (s.id === slide.id ? { ...s, secondary_cta_text: e.target.value } : s));
                          return { ...p, slides: list };
                        });
                      }}
                    />
                    <Input
                      label="Destination URL"
                      value={slide.secondary_cta_url || ''}
                      onChange={(e) => {
                        setHeroForm((p) => {
                          if (!p || !p.slides) return p;
                          const list = p.slides.map((s) => (s.id === slide.id ? { ...s, secondary_cta_url: e.target.value } : s));
                          return { ...p, slides: list };
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Save Hero Slider Button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="luxury"
              size="lg"
              className="gap-2 min-h-[44px]"
              disabled={isSaving}
              onClick={() => {
                // Keep top-level fields synchronized with slide 1 for any legacy consumers
                const slide1 = heroForm.slides?.[0];
                const payload: CmsHeroContent = {
                  ...heroForm,
                  badge: slide1?.badge || heroForm.badge || 'Haute Parfumerie',
                  headline: slide1?.headline || heroForm.headline || 'Luxury Perfumes That Last',
                  subtitle: slide1?.subtitle || heroForm.subtitle || '',
                  primary_cta_text: slide1?.primary_cta_text || heroForm.primary_cta_text || 'Shop Perfumes',
                  primary_cta_url: slide1?.primary_cta_url || heroForm.primary_cta_url || '/shop',
                  secondary_cta_text: slide1?.secondary_cta_text || heroForm.secondary_cta_text || 'View Collections',
                  secondary_cta_url: slide1?.secondary_cta_url || heroForm.secondary_cta_url || '/collections',
                  background_image: slide1?.desktop_image || heroForm.background_image || '',
                };
                handleSave('homepage_hero', 'home', 'Homepage Hero Slider', payload as unknown as Record<string, unknown>);
              }}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save Hero Slider Content</span>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="story" className="space-y-6 pt-4">
          <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
            <h3 className="font-serif text-lg text-white font-normal border-b border-luxury-border/60 pb-3">Brand Philosophy & Ethos</h3>
            <Input
              label="Philosophy Headline"
              value={storyForm.title}
              onChange={(e) => setStoryForm((p) => (p ? { ...p, title: e.target.value } : p))}
            />
            <Textarea
              label="Philosophy Text"
              rows={4}
              value={storyForm.philosophy}
              onChange={(e) => setStoryForm((p) => (p ? { ...p, philosophy: e.target.value } : p))}
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
            <h3 className="font-serif text-lg text-white font-normal border-b border-luxury-border/60 pb-3">Footer Configuration</h3>
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
