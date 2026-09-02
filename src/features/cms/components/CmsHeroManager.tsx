import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Copy, Save, Loader2, Video, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { CmsHeroContent, CmsHeroSlide } from '@/services/CMSService';

interface CmsHeroManagerProps {
  hero: CmsHeroContent;
  onChange: (updated: CmsHeroContent) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const CmsHeroManager: React.FC<CmsHeroManagerProps> = ({
  hero,
  onChange,
  onSave,
  isSaving,
}) => {
  const slides = hero.slides || [];

  const handleUpdateSlide = (id: string, updates: Partial<CmsHeroSlide>) => {
    const updatedSlides = slides.map((slide) =>
      slide.id === id ? { ...slide, ...updates } : slide
    );
    onChange({ ...hero, slides: updatedSlides });
  };

  const handleAddSlide = () => {
    const newSlide: CmsHeroSlide = {
      id: `slide-${Date.now()}`,
      badge: 'Private Reserve',
      headline: 'New Artisanal Fragrance',
      subtitle: 'Handcrafted luxury oils with exceptional longevity and sillage.',
      primary_cta_text: 'Discover Scent',
      primary_cta_url: '/shop',
      desktop_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=2000&q=90',
      mobile_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=90',
      overlay_color: '#000000',
      overlay_opacity: 0.6,
      is_active: true,
      order: slides.length + 1,
      status: 'published',
    };
    onChange({ ...hero, slides: [...slides, newSlide] });
  };

  const handleDuplicateSlide = (index: number) => {
    const target = slides[index];
    if (!target) return;
    const duplicated: CmsHeroSlide = {
      ...target,
      id: `slide-${Date.now()}`,
      headline: `${target.headline} (Copy)`,
      order: slides.length + 1,
    };
    onChange({ ...hero, slides: [...slides, duplicated] });
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const updatedSlides = slides.filter((_, idx) => idx !== index).map((s, idx) => ({ ...s, order: idx + 1 }));
    onChange({ ...hero, slides: updatedSlides });
  };

  const handleMoveSlide = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange({ ...hero, slides: updated.map((s, idx) => ({ ...s, order: idx + 1 })) });
  };

  return (
    <div className="space-y-6">
      {/* Slider Global Motion Settings */}
      <div className="bg-luxury-card border border-luxury-border rounded-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-luxury-border/60 pb-3">
          <div>
            <h3 className="font-serif text-lg text-luxury-cream font-normal">Hero Slider Configuration</h3>
            <p className="text-xs text-luxury-muted font-light">Control motion, autoplay timing, and transitions for the storefront hero billboard.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-luxury-sand font-medium">Autoplay Enabled</span>
            <Switch
              checked={hero.settings?.autoplay ?? true}
              onCheckedChange={(checked) =>
                onChange({
                  ...hero,
                  settings: {
                    ...(hero.settings || { autoplay: true, autoplay_interval_ms: 6000, transition_duration_ms: 700 }),
                    autoplay: checked,
                  },
                })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Autoplay Interval (Milliseconds)"
            type="number"
            min={3000}
            step={500}
            value={hero.settings?.autoplay_interval_ms ?? 6000}
            onChange={(e) =>
              onChange({
                ...hero,
                settings: {
                  ...(hero.settings || { autoplay: true, autoplay_interval_ms: 6000, transition_duration_ms: 700 }),
                  autoplay_interval_ms: parseInt(e.target.value, 10) || 6000,
                },
              })
            }
          />
          <Input
            label="Transition Duration (Milliseconds)"
            type="number"
            min={300}
            step={100}
            value={hero.settings?.transition_duration_ms ?? 700}
            onChange={(e) =>
              onChange({
                ...hero,
                settings: {
                  ...(hero.settings || { autoplay: true, autoplay_interval_ms: 6000, transition_duration_ms: 700 }),
                  transition_duration_ms: parseInt(e.target.value, 10) || 700,
                },
              })
            }
          />
        </div>
      </div>

      {/* Slide Deck */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl text-luxury-cream font-normal">Active Slide Sequences</h3>
          <p className="text-xs text-luxury-muted font-light">Add, order, and customize billboard slides with imagery or background video.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleAddSlide} className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5 text-luxury-gold" />
          <span>Add New Slide</span>
        </Button>
      </div>

      <div className="space-y-6">
        {slides.map((slide, index) => (
          <div key={slide.id} className="bg-luxury-card border border-luxury-border rounded-sm p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-luxury-border/60 pb-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-luxury-charcoal border border-luxury-gold/40 text-[11px] font-mono text-luxury-gold">
                  {index + 1}
                </span>
                <span className="font-serif text-sm text-luxury-cream font-medium">
                  {slide.headline || `Slide ${index + 1}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-2">
                  <span className="text-[11px] text-luxury-muted">Active</span>
                  <Switch
                    checked={slide.is_active}
                    onCheckedChange={(checked) => handleUpdateSlide(slide.id, { is_active: checked })}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => handleMoveSlide(index, -1)}
                  className="h-7 w-7 p-0"
                  title="Move Up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === slides.length - 1}
                  onClick={() => handleMoveSlide(index, 1)}
                  className="h-7 w-7 p-0"
                  title="Move Down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicateSlide(index)}
                  className="h-7 w-7 p-0"
                  title="Duplicate Slide"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={slides.length <= 1}
                  onClick={() => handleDeleteSlide(index)}
                  className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                  title="Delete Slide"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Badge / Tagline"
                value={slide.badge || ''}
                onChange={(e) => handleUpdateSlide(slide.id, { badge: e.target.value })}
                placeholder="e.g. Haute Parfumerie, Private Reserve"
              />
              <Input
                label="Headline / Title"
                value={slide.headline}
                onChange={(e) => handleUpdateSlide(slide.id, { headline: e.target.value })}
                placeholder="e.g. Luxury Perfumes That Last"
              />
            </div>

            <Textarea
              label="Editorial Subtitle"
              rows={2}
              value={slide.subtitle}
              onChange={(e) => handleUpdateSlide(slide.id, { subtitle: e.target.value })}
              placeholder="Detailed description of the fragrance collection..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary CTA Button Text"
                value={slide.primary_cta_text}
                onChange={(e) => handleUpdateSlide(slide.id, { primary_cta_text: e.target.value })}
              />
              <Input
                label="Primary CTA Destination URL"
                value={slide.primary_cta_url}
                onChange={(e) => handleUpdateSlide(slide.id, { primary_cta_url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Secondary CTA Button Text (Optional)"
                value={slide.secondary_cta_text || ''}
                onChange={(e) => handleUpdateSlide(slide.id, { secondary_cta_text: e.target.value })}
              />
              <Input
                label="Secondary CTA Destination URL"
                value={slide.secondary_cta_url || ''}
                onChange={(e) => handleUpdateSlide(slide.id, { secondary_cta_url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-luxury-sand">
                  <ImageIcon className="h-3.5 w-3.5 text-luxury-gold" />
                  <span>Desktop High-Res Image URL</span>
                </div>
                <Input
                  value={slide.desktop_image}
                  onChange={(e) => handleUpdateSlide(slide.id, { desktop_image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-luxury-sand">
                  <ImageIcon className="h-3.5 w-3.5 text-luxury-gold" />
                  <span>Mobile Cropped Image URL</span>
                </div>
                <Input
                  value={slide.mobile_image || ''}
                  onChange={(e) => handleUpdateSlide(slide.id, { mobile_image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-luxury-sand">
                <Video className="h-3.5 w-3.5 text-luxury-gold" />
                <span>Background Video MP4 / WebM URL (Optional)</span>
              </div>
              <Input
                value={slide.video_url || ''}
                onChange={(e) => handleUpdateSlide(slide.id, { video_url: e.target.value })}
                placeholder="https://domain.com/videos/luxury-campaign.mp4"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-luxury-border/40">
              <Input
                label="Vignette Overlay Color (HEX)"
                value={slide.overlay_color || '#000000'}
                onChange={(e) => handleUpdateSlide(slide.id, { overlay_color: e.target.value })}
                placeholder="#000000"
              />
              <Input
                label="Overlay Opacity (0.0 to 1.0)"
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={slide.overlay_opacity ?? 0.6}
                onChange={(e) => handleUpdateSlide(slide.id, { overlay_opacity: parseFloat(e.target.value) || 0.6 })}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button variant="luxury" size="default" onClick={onSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Hero Configuration</span>
        </Button>
      </div>
    </div>
  );
};
