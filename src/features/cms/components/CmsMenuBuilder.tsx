import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Loader2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { CmsNavigationMenu, CmsMenuItem } from '@/services/CMSService';

interface CmsMenuBuilderProps {
  menu: CmsNavigationMenu;
  onChange: (updated: CmsNavigationMenu) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const CmsMenuBuilder: React.FC<CmsMenuBuilderProps> = ({
  menu,
  onChange,
  onSave,
  isSaving,
}) => {
  const items = menu.items || [];

  const handleUpdateItem = (id: string, updates: Partial<CmsMenuItem>) => {
    const updated = items.map((item) => (item.id === id ? { ...item, ...updates } : item));
    onChange({ items: updated });
  };

  const handleAddItem = () => {
    const newItem: CmsMenuItem = {
      id: `nav-${Date.now()}`,
      label: 'New Link',
      url: '/shop',
      target: '_self',
      is_active: true,
      order: items.length + 1,
    };
    onChange({ items: [...items, newItem] });
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, idx) => idx !== index).map((it, idx) => ({ ...it, order: idx + 1 }));
    onChange({ items: updated });
  };

  const handleMoveItem = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange({ items: updated.map((it, idx) => ({ ...it, order: idx + 1 })) });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-luxury-card border border-luxury-border rounded-sm p-6">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-luxury-gold" />
            <h3 className="font-serif text-lg text-luxury-cream font-normal">Header & Navigation Menu Builder</h3>
          </div>
          <p className="text-xs text-luxury-muted font-light mt-1">
            Build and reorder top header navigation links, promotional badges, and mega-menu links.
          </p>
        </div>
        <Button variant="luxury" size="sm" onClick={handleAddItem} className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span>Add Menu Item</span>
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`bg-luxury-card border rounded-sm p-5 space-y-4 ${
              !item.is_active ? 'border-luxury-border/40 opacity-75' : 'border-luxury-border'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-luxury-border/60 pb-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-luxury-charcoal border border-luxury-gold/40 text-[11px] font-mono text-luxury-gold">
                  {index + 1}
                </span>
                <span className="font-serif text-sm text-luxury-cream font-medium">
                  {item.label}
                </span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-luxury-gold text-black rounded-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-2">
                  <span className="text-[11px] text-luxury-muted">Visible</span>
                  <Switch
                    checked={item.is_active}
                    onCheckedChange={(checked) => handleUpdateItem(item.id, { is_active: checked })}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => handleMoveItem(index, -1)}
                  className="h-7 w-7 p-0"
                  title="Move Up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === items.length - 1}
                  onClick={() => handleMoveItem(index, 1)}
                  className="h-7 w-7 p-0"
                  title="Move Down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={items.length <= 1}
                  onClick={() => handleDeleteItem(index)}
                  className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                  title="Delete Item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Menu Label"
                value={item.label}
                onChange={(e) => handleUpdateItem(item.id, { label: e.target.value })}
                placeholder="e.g. Exclusive Extraits"
              />
              <Input
                label="Destination URL"
                value={item.url}
                onChange={(e) => handleUpdateItem(item.id, { url: e.target.value })}
                placeholder="/shop, /collections, etc."
              />
              <Input
                label="Promotional Badge (Optional)"
                value={item.badge || ''}
                onChange={(e) => handleUpdateItem(item.id, { badge: e.target.value })}
                placeholder="e.g. NEW, 20% OFF, LIMITED"
              />
              <div className="space-y-1">
                <label className="text-xs text-luxury-sand font-medium">Link Target</label>
                <select
                  value={item.target || '_self'}
                  onChange={(e) =>
                    handleUpdateItem(item.id, { target: e.target.value as '_self' | '_blank' })
                  }
                  className="w-full h-9 bg-luxury-card border border-luxury-border text-xs text-luxury-cream px-3 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                >
                  <option value="_self">Current Tab (_self)</option>
                  <option value="_blank">New Tab (_blank)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2 border-t border-luxury-border/40">
              <label className="flex items-center gap-2 text-xs text-luxury-sand cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(item.is_mega)}
                  onChange={(e) => handleUpdateItem(item.id, { is_mega: e.target.checked })}
                  className="rounded-xs border-luxury-border bg-luxury-charcoal text-luxury-gold focus:ring-luxury-gold"
                />
                <span>Enable Mega Menu Dropdown Structure</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button variant="luxury" size="default" onClick={onSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Navigation Menu</span>
        </Button>
      </div>
    </div>
  );
};
