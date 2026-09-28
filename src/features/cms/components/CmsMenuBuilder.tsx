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
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">Header & Navigation Menu Builder</h3>
          </div>
          <p className="text-xs text-slate-700 font-semibold mt-1">
            Build and reorder top header navigation links, promotional badges, and mega-menu links.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleAddItem}
          className="gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Menu Item</span>
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`bg-white border rounded-xl p-5 space-y-4 shadow-2xs ${
              !item.is_active ? 'border-slate-200/80 bg-slate-50/50 opacity-80' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono font-semibold text-slate-700">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {item.label}
                </span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-slate-100 text-slate-800 border border-slate-200 rounded-md">
                    {item.badge}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-2">
                  <span className="text-xs font-medium text-slate-800">Visible</span>
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
                  className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-slate-50"
                  title="Move Up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === items.length - 1}
                  onClick={() => handleMoveItem(index, 1)}
                  className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-slate-50"
                  title="Move Down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={items.length <= 1}
                  onClick={() => handleDeleteItem(index)}
                  className="h-8 w-8 p-0 border-slate-200 text-red-600 hover:text-red-700 hover:bg-red-50"
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
                <label className="text-xs font-medium text-slate-700">Link Target</label>
                <select
                  value={item.target || '_self'}
                  onChange={(e) =>
                    handleUpdateItem(item.id, { target: e.target.value as '_self' | '_blank' })
                  }
                  className="w-full h-9 bg-white border border-slate-200 text-xs text-slate-800 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600 shadow-2xs"
                >
                  <option value="_self">Current Tab (_self)</option>
                  <option value="_blank">New Tab (_blank)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(item.is_mega)}
                  onChange={(e) => handleUpdateItem(item.id, { is_mega: e.target.checked })}
                  className="rounded border-slate-300 text-slate-700 focus:ring-slate-600"
                />
                <span>Enable Mega Menu Dropdown Structure</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          size="default"
          onClick={onSave}
          disabled={isSaving}
          className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs cursor-pointer"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save Navigation Menu</span>
        </Button>
      </div>
    </div>
  );
};
