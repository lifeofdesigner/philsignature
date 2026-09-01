import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Layers, Plus, Pencil, Trash2, X, Loader2, ArrowUpDown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminCollections } from '../hooks/useAdminCollections';
import type { Collection } from '@/types/database';

type SortKey = 'name' | 'display_order';

interface CollectionFormState {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image_url: string;
  banner_url: string;
  display_order: string;
  is_featured: boolean;
  is_active: boolean;
}

const emptyForm: CollectionFormState = {
  name: '',
  slug: '',
  tagline: '',
  description: '',
  image_url: '',
  banner_url: '',
  display_order: '0',
  is_featured: false,
  is_active: true,
};

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const AdminCollectionsPage: React.FC = () => {
  const {
    collections,
    isLoading,
    isError,
    createCollection,
    isCreating,
    updateCollection,
    isUpdating,
    deleteCollection,
  } = useAdminCollections();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('display_order');
  const [sortAsc, setSortAsc] = useState(true);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<CollectionFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const filteredCollections = useMemo(() => {
    const query = search.toLowerCase().trim();
    const filtered = query
      ? collections.filter((c) => c.name.toLowerCase().includes(query) || c.slug.toLowerCase().includes(query))
      : collections;

    const sorted = [...filtered].sort((a, b) => {
      let result = 0;
      if (sortKey === 'name') result = a.name.localeCompare(b.name);
      else result = a.display_order - b.display_order;
      return sortAsc ? result : -result;
    });
    return sorted;
  }, [collections, search, sortKey, sortAsc]);

  const openCreateForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (collection: Collection) => {
    setEditing(collection);
    setForm({
      name: collection.name,
      slug: collection.slug,
      tagline: collection.tagline || '',
      description: collection.description || '',
      image_url: collection.image_url || '',
      banner_url: collection.banner_url || '',
      display_order: String(collection.display_order),
      is_featured: collection.is_featured,
      is_active: collection.is_active,
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
      tagline: form.tagline.trim() || null,
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      banner_url: form.banner_url.trim() || null,
      display_order: Number(form.display_order) || 0,
      is_featured: form.is_featured,
      is_active: form.is_active,
    };

    try {
      if (editing) {
        await updateCollection({ id: editing.id, input: payload });
        toast.success('Collection updated successfully.');
      } else {
        await createCollection(payload);
        toast.success('Collection created successfully.');
      }
      closeForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save collection.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeletingId(deleteTarget.id);
    try {
      await deleteCollection(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" was removed.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete collection.');
    } finally {
      setIsDeletingId(null);
    }
  };

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={<Layers className="h-5 w-5" />}
        title="Unable to Load Collections"
        description="Collections could not be retrieved from Supabase. Please retry."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">Curated Lines</span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">Collections</h1>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5" onClick={openCreateForm}>
          <Plus className="h-3.5 w-3.5" />
          <span>New Collection</span>
        </Button>
      </div>

      <div className="bg-luxury-card border border-luxury-border p-4 flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search collections by name or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md bg-luxury-charcoal"
        />
      </div>

      {filteredCollections.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-5 w-5" />}
          title={collections.length === 0 ? 'No Collections Established' : 'No Matching Collections'}
          description={
            collections.length === 0
              ? 'Manage curated groupings like Private Reserve and The Oud Edition.'
              : 'Try adjusting your search query.'
          }
          actionLabel={collections.length === 0 ? 'Create First Collection' : undefined}
          onAction={collections.length === 0 ? openCreateForm : undefined}
        />
      ) : (
        <div className="bg-luxury-card border border-luxury-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-luxury-border text-left text-[10px] uppercase tracking-wider text-luxury-muted">
                <th className="p-4 font-medium">
                  <button type="button" onClick={() => toggleSort('name')} className="inline-flex items-center gap-1 cursor-pointer hover:text-white">
                    <span>Collection</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="p-4 font-medium">
                  <button type="button" onClick={() => toggleSort('display_order')} className="inline-flex items-center gap-1 cursor-pointer hover:text-white">
                    <span>Order</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="p-4 font-medium">Featured</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollections.map((collection) => (
                <tr key={collection.id} className="border-b border-luxury-border/60 last:border-0 hover:bg-luxury-charcoal/40">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {collection.image_url && (
                        <img src={collection.image_url} alt={collection.name} className="w-10 h-10 object-cover rounded bg-luxury-charcoal" />
                      )}
                      <div>
                        <div className="text-white font-medium">{collection.name}</div>
                        <div className="text-[11px] text-luxury-muted font-mono">{collection.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-luxury-muted">{collection.display_order}</td>
                  <td className="p-4">
                    {collection.is_featured && <Star className="h-4 w-4 text-luxury-gold fill-luxury-gold" />}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-medium border ${
                        collection.is_active
                          ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                          : 'text-luxury-muted border-luxury-border bg-luxury-charcoal'
                      }`}
                    >
                      {collection.is_active ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => openEditForm(collection)} className="p-1.5 text-luxury-muted hover:text-luxury-gold transition-colors cursor-pointer" aria-label="Edit collection">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(collection)} className="p-1.5 text-luxury-muted hover:text-red-400 transition-colors cursor-pointer" aria-label="Delete collection">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-luxury-card border border-luxury-border w-full max-w-2xl p-6 space-y-5 rounded max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-luxury-border pb-4">
              <h2 className="font-serif text-xl text-white">{editing ? 'Edit Collection' : 'New Collection'}</h2>
              <button type="button" onClick={closeForm} className="text-luxury-muted hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && <div className="p-3 bg-red-950/40 border border-red-800/60 text-red-200 text-xs">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Name" value={form.name} onChange={(e) => handleNameChange(e.target.value)} required />
                <Input label="Slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} required />
              </div>

              <Input label="Tagline" value={form.tagline} onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))} />

              <div className="w-full space-y-1.5">
                <label className="block text-xs uppercase tracking-luxury text-luxury-cream/70 font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="flex w-full bg-luxury-charcoal/80 border border-luxury-border px-3.5 py-2 text-sm text-luxury-cream placeholder:text-luxury-muted focus:outline-none focus:border-luxury-gold/70 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Image URL" value={form.image_url} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))} />
                <Input label="Banner URL" value={form.banner_url} onChange={(e) => setForm((p) => ({ ...p, banner_url: e.target.value }))} />
              </div>

              <Input
                label="Display Order"
                type="number"
                min="0"
                value={form.display_order}
                onChange={(e) => setForm((p) => ({ ...p, display_order: e.target.value }))}
              />

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs text-luxury-muted cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))} className="accent-luxury-gold" />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-luxury-muted cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="accent-luxury-gold" />
                  <span>Active</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-luxury-border">
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                <Button type="submit" variant="luxury" disabled={isCreating || isUpdating} className="gap-2">
                  {(isCreating || isUpdating) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editing ? 'Save Changes' : 'Create Collection'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-luxury-card border border-luxury-border w-full max-w-md p-6 space-y-5 rounded">
            <h3 className="font-serif text-lg text-white">Remove Collection?</h3>
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
