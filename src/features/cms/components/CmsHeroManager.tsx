import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowUp, ArrowDown, Copy, Save, Loader2, Video, Image as ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { mediaService } from '@/services/MediaService';
import { useAuth } from '@/hooks/useAuth';
import type { CmsHeroContent, CmsHeroSlide } from '@/services/CMSService';

interface CmsHeroManagerProps {
  hero: CmsHeroContent;
  onChange: (updated: CmsHeroContent) => void;
  onSave: () => void;
  isSaving: boolean;
}

type SlideUploadField = 'desktop_image' | 'mobile_image' | 'video_url';

export const CmsHeroManager: React.FC<CmsHeroManagerProps> = ({
  hero,
  onChange,
  onSave,
  isSaving,
}) => {
  const { user } = useAuth();
  const slides = hero.slides || [];
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  const handleUploadSlideFile = async (slideId: string, field: SlideUploadField, file: File) => {
    const key = `${slideId}-${field}`;
    setUploadingKey(key);
    try {
      const bucket = field === 'video_url' ? 'banners' : 'banners';
      const uploaded = await mediaService.uploadFile(bucket, file, user?.id);
      const publicUrl = mediaService.getPublicUrl(uploaded.bucket, uploaded.path);
      handleUpdateSlide(slideId, { [field]: publicUrl } as Partial<CmsHeroSlide>);
      toast.success('Upload complete.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploadingKey(null);
      const input = fileInputRefs.current[key];
      if (input) input.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Slider Global Motion Settings */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Hero Slider Configuration</h3>
            <p className="text-xs text-slate-500 font-medium">Control motion, autoplay timing, and transitions for the storefront hero billboard.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">Autoplay Enabled</span>
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
            className="bg-white border-slate-300 text-slate-900"
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
            className="bg-white border-slate-300 text-slate-900"
          />
        </div>
      </div>

      {/* Slide Deck */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Active Slide Sequences</h3>
          <p className="text-xs text-slate-500 font-medium">Add, order, and customize billboard slides with imagery or background video.</p>
        </div>
        <Button size="sm" onClick={handleAddSlide} className="bg-amber-700 hover:bg-amber-800 text-white font-medium gap-1.5 shadow-2xs">
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Slide</span>
        </Button>
      </div>

      <div className="space-y-6">
        {slides.map((slide, index) => (
          <div key={slide.id} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 border border-slate-300 text-xs font-mono font-bold text-slate-800">
                  {index + 1}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {slide.headline || `Slide ${index + 1}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-2">
                  <span className="text-xs font-semibold text-slate-600">Active</span>
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
                  className="h-7 w-7 p-0 border-slate-200"
                  title="Move Up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === slides.length - 1}
                  onClick={() => handleMoveSlide(index, 1)}
                  className="h-7 w-7 p-0 border-slate-200"
                  title="Move Down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicateSlide(index)}
                  className="h-7 w-7 p-0 border-slate-200"
                  title="Duplicate Slide"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={slides.length <= 1}
                  onClick={() => handleDeleteSlide(index)}
                  className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 border-slate-200"
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
                className="bg-white border-slate-300 text-slate-900"
              />
              <Input
                label="Headline / Title"
                value={slide.headline}
                onChange={(e) => handleUpdateSlide(slide.id, { headline: e.target.value })}
                placeholder="e.g. Luxury Perfumes That Last"
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            <Textarea
              label="Editorial Subtitle"
              rows={2}
              value={slide.subtitle}
              onChange={(e) => handleUpdateSlide(slide.id, { subtitle: e.target.value })}
              placeholder="Detailed description of the fragrance collection..."
              className="bg-white border-slate-300 text-slate-900"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary CTA Button Text"
                value={slide.primary_cta_text}
                onChange={(e) => handleUpdateSlide(slide.id, { primary_cta_text: e.target.value })}
                className="bg-white border-slate-300 text-slate-900"
              />
              <Input
                label="Primary CTA Destination URL"
                value={slide.primary_cta_url}
                onChange={(e) => handleUpdateSlide(slide.id, { primary_cta_url: e.target.value })}
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Secondary CTA Button Text (Optional)"
                value={slide.secondary_cta_text || ''}
                onChange={(e) => handleUpdateSlide(slide.id, { secondary_cta_text: e.target.value })}
                className="bg-white border-slate-300 text-slate-900"
              />
              <Input
                label="Secondary CTA Destination URL"
                value={slide.secondary_cta_url || ''}
                onChange={(e) => handleUpdateSlide(slide.id, { secondary_cta_url: e.target.value })}
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['desktop_image', 'mobile_image'] as const).map((field) => {
                const key = `${slide.id}-${field}`;
                const currentUrl = slide[field] as string | undefined;
                const isUploading = uploadingKey === key;
                return (
                  <div className="space-y-1.5" key={field}>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <ImageIcon className="h-3.5 w-3.5 text-amber-700" />
                      <span>{field === 'desktop_image' ? 'Desktop Image' : 'Mobile Image'}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-lg">
                      <div className="h-12 w-16 shrink-0 bg-white border border-slate-200 rounded overflow-hidden flex items-center justify-center">
                        {currentUrl ? (
                          <img src={currentUrl} alt={field} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                      <input
                        ref={(el) => { fileInputRefs.current[key] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id={`hero-upload-${key}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadSlideFile(slide.id, field, file);
                        }}
                      />
                      <label
                        htmlFor={`hero-upload-${key}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded border border-slate-300 cursor-pointer shadow-2xs"
                      >
                        {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                        <span>{isUploading ? 'Uploading...' : currentUrl ? 'Replace' : 'Upload'}</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Video className="h-3.5 w-3.5 text-amber-700" />
                <span>Background Video (Optional)</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-lg">
                <span className="text-xs font-mono text-slate-600 truncate flex-1">
                  {slide.video_url || 'No video uploaded'}
                </span>
                <input
                  ref={(el) => { fileInputRefs.current[`${slide.id}-video_url`] = el; }}
                  type="file"
                  accept="video/mp4,video/webm"
                  className="hidden"
                  id={`hero-upload-${slide.id}-video_url`}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadSlideFile(slide.id, 'video_url', file);
                  }}
                />
                <label
                  htmlFor={`hero-upload-${slide.id}-video_url`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded border border-slate-300 cursor-pointer shrink-0 shadow-2xs"
                >
                  {uploadingKey === `${slide.id}-video_url` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  <span>{uploadingKey === `${slide.id}-video_url` ? 'Uploading...' : slide.video_url ? 'Replace' : 'Upload'}</span>
                </label>
                {slide.video_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 shrink-0 text-slate-400 hover:text-red-600 hover:bg-red-50 border-slate-200"
                    onClick={() => handleUpdateSlide(slide.id, { video_url: undefined })}
                    title="Remove Video"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <Input
                label="Vignette Overlay Color (HEX)"
                value={slide.overlay_color || '#000000'}
                onChange={(e) => handleUpdateSlide(slide.id, { overlay_color: e.target.value })}
                placeholder="#000000"
                className="bg-white border-slate-300 text-slate-900"
              />
              <Input
                label="Overlay Opacity (0.0 to 1.0)"
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={slide.overlay_opacity ?? 0.6}
                onChange={(e) => handleUpdateSlide(slide.id, { overlay_opacity: parseFloat(e.target.value) || 0.6 })}
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button size="default" onClick={onSave} disabled={isSaving} className="bg-amber-700 hover:bg-amber-800 text-white font-medium gap-2 shadow-2xs">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Hero Configuration</span>
        </Button>
      </div>
    </div>
  );
};
