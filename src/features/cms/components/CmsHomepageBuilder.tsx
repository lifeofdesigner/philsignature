import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Copy, Save, Loader2, LayoutGrid, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { CmsHomepageLayout, CmsHomepageSection, CmsHomepageSectionType, CmsPublishStatus } from '@/services/CMSService';

interface CmsHomepageBuilderProps {
  layout: CmsHomepageLayout;
  onChange: (updated: CmsHomepageLayout) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const CmsHomepageBuilder: React.FC<CmsHomepageBuilderProps> = ({
  layout,
  onChange,
  onSave,
  isSaving,
}) => {
  const sections = layout.sections || [];

  const handleUpdateSection = (id: string, updates: Partial<CmsHomepageSection>) => {
    const updated = sections.map((sec) => (sec.id === id ? { ...sec, ...updates } : sec));
    onChange({ sections: updated });
  };

  const handleAddSection = () => {
    const newSec: CmsHomepageSection = {
      id: `sec-${Date.now()}`,
      type: 'custom_html',
      title: 'Custom Curated Spotlight',
      is_enabled: true,
      order: sections.length + 1,
      spacing: 'normal',
      background: 'charcoal',
      animation: 'fade_in',
      status: 'published',
      custom_content: '<div class="text-center py-8"><h2 class="font-serif text-2xl text-luxury-cream">Artisanal Craftsmanship</h2><p class="text-xs text-luxury-muted mt-2">Every drop is bottled with exacting precision in our Lagos atelier.</p></div>',
    };
    onChange({ sections: [...sections, newSec] });
  };

  const handleDuplicateSection = (index: number) => {
    const target = sections[index];
    if (!target) return;
    const duplicated: CmsHomepageSection = {
      ...target,
      id: `sec-${Date.now()}`,
      title: `${target.title} (Duplicate)`,
      order: sections.length + 1,
    };
    onChange({ sections: [...sections, duplicated] });
  };

  const handleDeleteSection = (index: number) => {
    if (sections.length <= 1) return;
    const updated = sections.filter((_, idx) => idx !== index).map((s, idx) => ({ ...s, order: idx + 1 }));
    onChange({ sections: updated });
  };

  const handleMoveSection = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange({ sections: updated.map((s, idx) => ({ ...s, order: idx + 1 })) });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-luxury-card border border-luxury-border rounded-sm p-6">
        <div>
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-luxury-gold" />
            <h3 className="font-serif text-lg text-luxury-cream font-normal">Modular Homepage Layout Engine</h3>
          </div>
          <p className="text-xs text-luxury-muted font-light mt-1">
            Drag, reorder, configure backgrounds, spacing, and animations for each section on the storefront homepage.
          </p>
        </div>
        <Button variant="luxury" size="sm" onClick={handleAddSection} className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Section</span>
        </Button>
      </div>

      <div className="space-y-5">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`bg-luxury-card border rounded-sm p-6 space-y-4 transition-all ${
              !section.is_enabled || section.status === 'draft' || section.status === 'archived'
                ? 'border-luxury-border/40 opacity-75'
                : 'border-luxury-border'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-luxury-border/60 pb-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-luxury-charcoal border border-luxury-gold/40 text-[11px] font-mono text-luxury-gold">
                  {index + 1}
                </span>
                <div>
                  <span className="font-serif text-sm text-luxury-cream font-medium block">
                    {section.title}
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-luxury-gold/80">
                    Type: {section.type} • Status: {section.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-2">
                  <span className="text-[11px] text-luxury-muted">Active</span>
                  <Switch
                    checked={section.is_enabled}
                    onCheckedChange={(checked) => handleUpdateSection(section.id, { is_enabled: checked })}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => handleMoveSection(index, -1)}
                  className="h-7 w-7 p-0"
                  title="Move Up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === sections.length - 1}
                  onClick={() => handleMoveSection(index, 1)}
                  className="h-7 w-7 p-0"
                  title="Move Down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicateSection(index)}
                  className="h-7 w-7 p-0"
                  title="Duplicate Section"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sections.length <= 1}
                  onClick={() => handleDeleteSection(index)}
                  className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                  title="Delete Section"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Section Display Title"
                value={section.title}
                onChange={(e) => handleUpdateSection(section.id, { title: e.target.value })}
              />

              <div className="space-y-1">
                <label className="text-xs text-luxury-sand font-medium">Section Type</label>
                <select
                  value={section.type}
                  onChange={(e) =>
                    handleUpdateSection(section.id, { type: e.target.value as CmsHomepageSectionType })
                  }
                  className="w-full h-9 bg-luxury-card border border-luxury-border text-xs text-luxury-cream px-3 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                >
                  <option value="hero">Hero Billboard Slider</option>
                  <option value="collections">Collections Showcase</option>
                  <option value="featured_products">Featured Perfumes Grid</option>
                  <option value="brand_story">Brand Heritage Story</option>
                  <option value="testimonials">Client Testimonials</option>
                  <option value="newsletter">VIP Newsletter Invitation</option>
                  <option value="custom_html">Custom HTML / Spotlight</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-luxury-sand font-medium">Publication Status</label>
                <select
                  value={section.status}
                  onChange={(e) =>
                    handleUpdateSection(section.id, { status: e.target.value as CmsPublishStatus })
                  }
                  className="w-full h-9 bg-luxury-card border border-luxury-border text-xs text-luxury-cream px-3 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                >
                  <option value="published">Published (Live)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-luxury-sand font-medium">Vertical Spacing</label>
                <select
                  value={section.spacing}
                  onChange={(e) =>
                    handleUpdateSection(section.id, { spacing: e.target.value as 'compact' | 'normal' | 'generous' })
                  }
                  className="w-full h-9 bg-luxury-card border border-luxury-border text-xs text-luxury-cream px-3 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                >
                  <option value="compact">Compact (py-8)</option>
                  <option value="normal">Normal (py-14)</option>
                  <option value="generous">Generous (py-24)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-luxury-sand font-medium">Surface Background</label>
                <select
                  value={section.background}
                  onChange={(e) =>
                    handleUpdateSection(section.id, { background: e.target.value as 'default' | 'black' | 'charcoal' | 'card' | 'radial_luxury' })
                  }
                  className="w-full h-9 bg-luxury-card border border-luxury-border text-xs text-luxury-cream px-3 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                >
                  <option value="default">Default Page Background</option>
                  <option value="black">Deep Obsidian Black</option>
                  <option value="charcoal">Charcoal Surface</option>
                  <option value="card">Card Luxury Elevated</option>
                  <option value="radial_luxury">Radial Luxury Vignette</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-luxury-sand font-medium">Entrance Motion</label>
                <select
                  value={section.animation}
                  onChange={(e) =>
                    handleUpdateSection(section.id, { animation: e.target.value as 'fade_in' | 'slide_up' | 'scale' | 'none' })
                  }
                  className="w-full h-9 bg-luxury-card border border-luxury-border text-xs text-luxury-cream px-3 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                >
                  <option value="fade_in">Smooth Fade In</option>
                  <option value="slide_up">Slide Up Entrance</option>
                  <option value="scale">Subtle Scale In</option>
                  <option value="none">No Animation</option>
                </select>
              </div>
            </div>

            {/* Visibility Scheduling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-luxury-border/40">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-luxury-sand">
                  <Calendar className="h-3.5 w-3.5 text-luxury-gold" />
                  <span>Scheduled Publish Date & Time (Optional)</span>
                </div>
                <Input
                  type="datetime-local"
                  value={section.scheduled_publish_at || ''}
                  onChange={(e) => handleUpdateSection(section.id, { scheduled_publish_at: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-luxury-sand">
                  <Calendar className="h-3.5 w-3.5 text-luxury-gold" />
                  <span>Scheduled Unpublish Date & Time (Optional)</span>
                </div>
                <Input
                  type="datetime-local"
                  value={section.scheduled_unpublish_at || ''}
                  onChange={(e) => handleUpdateSection(section.id, { scheduled_unpublish_at: e.target.value })}
                />
              </div>
            </div>

            {section.type === 'custom_html' && (
              <Textarea
                label="Custom HTML / Embed Code"
                rows={4}
                value={section.custom_content || ''}
                onChange={(e) => handleUpdateSection(section.id, { custom_content: e.target.value })}
                placeholder="<div class='...'>...</div>"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button variant="luxury" size="default" onClick={onSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Homepage Layout</span>
        </Button>
      </div>
    </div>
  );
};
