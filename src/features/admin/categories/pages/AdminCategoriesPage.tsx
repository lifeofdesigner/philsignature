import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Tags, Plus, Pencil, Trash2, X, Loader2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminCategories } from '../hooks/useAdminCategories';
import type { Category } from '@/types/database';

type SortKey = 'name' | 'display_order';

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: string;
  is_active: boolean;
}

const emptyForm: CategoryFormState = {
  name: '',
  slug: '',
  description: '',
  image_url: '',
  display_order: '0',
  is_active: true,
};

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const AdminCategoriesPage: React.FC = () => {
  const {
    categories,
    isLoading,
    isError,
    createCategory,
    isCreating,
    updateCategory,
    isUpdating,
    deleteCategory,
  } = useAdminCategories();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('display_order');
  const [sortAsc, setSortAsc] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<CategoryFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const filteredCategories = useMemo(() => {
    const query = search.toLowerCase().trim();
    const filtered = query
      ? categories.filter((c) => c.name.toLowerCase().includes(query) || c.slug.toLowerCase().includes(query))
      : categories;

    return [...filtered].sort((a, b) => {
      let result = 0;
      if (sortKey === 'name') result = a.name.localeCompare(b.name);
      else result = a.display_order - b.display_order;
      return sortAsc ? result : -result;
    });
  }, [categories, search, sortKey, sortAsc]);

  const openCreateForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      display_order: String(category.display_order),
      is_active: category.is_active,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
    setFormError(null);
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({ ...prev, name: value, slug: editing ? prev.slug : slugify(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      display_order: Number(form.display_order) || 0,
      is_active: form.is_active,
    };

    try {
      if (editing) {
        await updateCategory({ id: editing.id, input: payload });
        toast.success('Category updated successfully.');
      } else {
        await createCategory(payload);
        toast.success('Category created successfully.');
      }
      closeForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save category.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeletingId(deleteTarget.id);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" was removed.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete category.');
    } finally {
      setIsDeletingId(null);
    }
  };

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={<Tags className="h-5 w-5" />}
        title="Unable to Load Categories"
        description="Categories could not be retrieved from Supabase. Please retry."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fragrance Categories</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Organize catalog formulations into Extrait, Perfume Oils, Body Care, Diffusers, and Candles.</p>
        </div>
        <Button size="sm" className="bg-amber-700 hover:bg-amber-800 text-white font-medium gap-1.5 shadow-2xs" onClick={openCreateForm}>
          <Plus className="h-3.5 w-3.5" />
          <span>Add Category</span>
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 shadow-2xs">
        <Input
          placeholder="Search categories by name or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md bg-white border-slate-200 text-xs"
        />
      </div>

      {filteredCategories.length === 0 ? (
        <EmptyState
          icon={<Tags className="h-5 w-5" />}
          title={categories.length === 0 ? 'No Categories Staged' : 'No Matching Categories'}
          description={
            categories.length === 0
              ? 'Categories such as Extrait de Parfum, Eau de Parfum, and Home Fragrance will appear here.'
              : 'Try adjusting your search query.'
          }
          actionLabel={categories.length === 0 ? 'Create First Category' : undefined}
          onAction={categories.length === 0 ? openCreateForm : undefined}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="p-3.5">
                    <button type="button" onClick={() => toggleSort('name')} className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-900">
                      <span>Category</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="p-3.5">
                    <button type="button" onClick={() => toggleSort('display_order')} className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-900">
                      <span>Order</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        {category.image_url && (
                          <img src={category.image_url} alt={category.name} className="w-9 h-9 object-cover rounded-lg bg-slate-100" />
                        )}
                        <div>
                          <div className="text-slate-900 font-semibold">{category.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{category.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">{category.display_order}</td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold border ${
                          category.is_active
                            ? 'text-emerald-800 border-emerald-200 bg-emerald-50'
                            : 'text-slate-600 border-slate-200 bg-slate-100'
                        }`}
                      >
                        {category.is_active ? 'active' : 'inactive'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => openEditForm(category)} className="p-1.5 text-slate-500 hover:text-amber-800 transition-colors cursor-pointer rounded hover:bg-slate-100" aria-label="Edit category">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(category)} className="p-1.5 text-slate-500 hover:text-red-600 transition-colors cursor-pointer rounded hover:bg-red-50" aria-label="Delete category">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-luxury-card border border-luxury-border w-full max-w-lg p-6 space-y-5 rounded max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-luxury-border pb-4">
              <h2 className="font-serif text-xl text-white">{editing ? 'Edit Category' : 'New Category'}</h2>
              <button type="button" onClick={closeForm} className="text-luxury-muted hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && <div className="p-3 bg-red-950/40 border border-red-800/60 text-red-200 text-xs">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Name" value={form.name} onChange={(e) => handleNameChange(e.target.value)} required />
              <Input label="Slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} required />

              <div className="w-full space-y-1.5">
                <label className="block text-xs uppercase tracking-luxury text-luxury-cream/70 font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="flex w-full bg-luxury-charcoal/80 border border-luxury-border px-3.5 py-2 text-sm text-luxury-cream placeholder:text-luxury-muted focus:outline-none focus:border-luxury-gold/70 transition-colors"
                />
              </div>

              <Input label="Image URL" value={form.image_url} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))} />

              <Input
                label="Display Order"
                type="number"
                min="0"
                value={form.display_order}
                onChange={(e) => setForm((p) => ({ ...p, display_order: e.target.value }))}
              />

              <label className="flex items-center gap-2 text-xs text-luxury-muted cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="accent-luxury-gold" />
                <span>Active</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-luxury-border">
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                <Button type="submit" variant="luxury" disabled={isCreating || isUpdating} className="gap-2">
                  {(isCreating || isUpdating) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editing ? 'Save Changes' : 'Create Category'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-luxury-card border border-luxury-border w-full max-w-md p-6 space-y-5 rounded">
            <h3 className="font-serif text-lg text-white">Remove Category?</h3>
            <p className="text-sm text-luxury-muted">
              This will permanently delete <span className="text-white">"{deleteTarget.name}"</span>. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeletingId === deleteTarget.id}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isDeletingId === deleteTarget.id} className="gap-2">
                {isDeletingId === deleteTarget.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
