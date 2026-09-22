import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Layers, Plus, Pencil, Trash2, X, Loader2, Star, Copy, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { EnterpriseDataTable, type Column, type BulkAction } from '@/components/common/EnterpriseDataTable';
import { useAdminCollections } from '../hooks/useAdminCollections';
import type { Collection } from '@/types/database';
import { auditLogService } from '@/services/AuditLogService';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
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

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editing, setEditing] = useState<Collection | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<CollectionFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filteredCollections = useMemo(() => {
    return collections.filter((c) => {
      if (statusFilter === 'active' && !c.is_active) return false;
      if (statusFilter === 'inactive' && c.is_active) return false;
      return true;
    });
  }, [collections, statusFilter]);

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
        await auditLogService.recordAction('UPDATE_COLLECTION', 'collection', editing.id, payload, user?.id);
        toast.success(`"${payload.name}" updated successfully.`);
      } else {
        await createCollection(payload);
        await auditLogService.recordAction('CREATE_COLLECTION', 'collection', payload.slug, payload, user?.id);
        toast.success(`"${payload.name}" collection created.`);
      }
      closeForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save collection.');
    }
  };

  const handleDuplicate = async (collection: Collection) => {
    setActionLoadingId(collection.id);
    try {
      const copyPayload = {
        name: `${collection.name} (Copy)`,
        slug: `${collection.slug}-copy-${Date.now().toString().slice(-4)}`,
        tagline: collection.tagline,
        description: collection.description,
        image_url: collection.image_url,
        banner_url: collection.banner_url,
        display_order: collection.display_order + 1,
        is_featured: false,
        is_active: false,
      };
      await createCollection(copyPayload);
      await auditLogService.recordAction('DUPLICATE_COLLECTION', 'collection', collection.id, copyPayload, user?.id);
      toast.success(`Duplicated "${collection.name}" as inactive draft.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to duplicate collection.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleActive = async (collection: Collection) => {
    setActionLoadingId(collection.id);
    try {
      await updateCollection({ id: collection.id, input: { is_active: !collection.is_active } });
      await auditLogService.recordAction('TOGGLE_COLLECTION_ACTIVE', 'collection', collection.id, { is_active: !collection.is_active }, user?.id);
      toast.success(`"${collection.name}" is now ${!collection.is_active ? 'active' : 'inactive'}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeletingId(deleteTarget.id);
    try {
      await deleteCollection(deleteTarget.id);
      await auditLogService.recordAction('DELETE_COLLECTION', 'collection', deleteTarget.id, { name: deleteTarget.name }, user?.id);
      toast.success(`"${deleteTarget.name}" was removed.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete collection.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const bulkActions: BulkAction<Collection>[] = [
    {
      label: 'Set Active',
      icon: CheckCircle2,
      action: async (items) => {
        try {
          await Promise.all(items.map((item) => updateCollection({ id: item.id, input: { is_active: true } })));
          toast.success(`Activated ${items.length} collections.`);
        } catch {
          toast.error('Failed to update collections.');
        }
      },
    },
    {
      label: 'Set Inactive',
      action: async (items) => {
        try {
          await Promise.all(items.map((item) => updateCollection({ id: item.id, input: { is_active: false } })));
          toast.success(`Deactivated ${items.length} collections.`);
        } catch {
          toast.error('Failed to update collections.');
        }
      },
    },
    {
      label: 'Delete Selected',
      icon: Trash2,
      variant: 'destructive',
      action: async (items) => {
        if (!confirm(`Are you sure you want to delete ${items.length} selected collections?`)) return;
        try {
          await Promise.all(items.map((item) => deleteCollection(item.id)));
          toast.success(`Deleted ${items.length} collections.`);
        } catch {
          toast.error('Failed to bulk delete collections.');
        }
      },
    },
  ];

  const columns: Column<Collection>[] = [
    {
      key: 'name',
      header: 'Collection',
      accessor: (collection) => (
        <div className="flex items-center gap-3">
          {collection.image_url ? (
            <img
              src={collection.image_url}
              alt={collection.name}
              className="w-10 h-10 object-cover rounded-md border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <Layers className="h-4 w-4 text-slate-700" />
            </div>
          )}
          <div className="min-w-0">
            <div className="text-slate-900 font-bold truncate">{collection.name}</div>
            <div className="text-[11px] text-slate-700 font-mono truncate">{collection.slug}</div>
          </div>
        </div>
      ),
      sortValue: (collection) => collection.name,
    },
    {
      key: 'tagline',
      header: 'Tagline / Summary',
      accessor: (collection) => (
        <span className="text-slate-700 text-xs truncate max-w-xs block">
          {collection.tagline || collection.description || '—'}
        </span>
      ),
      sortValue: (collection) => collection.tagline || '',
    },
    {
      key: 'display_order',
      header: 'Order',
      accessor: (collection) => <span className="font-mono text-slate-700 font-semibold">{collection.display_order}</span>,
      sortValue: (collection) => collection.display_order,
    },
    {
      key: 'is_featured',
      header: 'Featured',
      accessor: (collection) => (
        collection.is_featured ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full">
            <Star className="h-3 w-3 fill-amber-600 text-slate-700" />
            Featured
          </span>
        ) : (
          <span className="text-slate-700 text-xs">—</span>
        )
      ),
      sortValue: (collection) => (collection.is_featured ? 1 : 0),
    },
    {
      key: 'is_active',
      header: 'Status',
      accessor: (collection) => (
        <button
          type="button"
          onClick={() => handleToggleActive(collection)}
          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border transition-colors cursor-pointer ${
            collection.is_active
              ? 'text-emerald-900 border-emerald-300 bg-emerald-50 hover:bg-emerald-100'
              : 'text-slate-700 border-slate-300 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          {collection.is_active ? 'Active' : 'Inactive'}
        </button>
      ),
      sortValue: (collection) => (collection.is_active ? 'active' : 'inactive'),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      accessor: (collection) => {
        const isBusy = actionLoadingId === collection.id;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => openEditForm(collection)}
              className="p-1.5 text-slate-800 hover:text-slate-900 transition-colors cursor-pointer rounded hover:bg-slate-100"
              title="Edit Collection"
              aria-label="Edit collection"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleDuplicate(collection)}
              className="p-1.5 text-slate-800 hover:text-blue-700 transition-colors cursor-pointer rounded hover:bg-blue-50"
              title="Duplicate Collection"
              aria-label="Duplicate collection"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(collection)}
              className="p-1.5 text-slate-800 hover:text-red-700 transition-colors cursor-pointer rounded hover:bg-red-50"
              title="Delete Collection"
              aria-label="Delete collection"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Curated Collections Engine
          </h1>
          <p className="text-xs text-slate-700 font-semibold mt-1">
            Curate thematic product suites like Private Reserve, Oud Edition, and Atelier Exclusives.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs cursor-pointer"
          onClick={openCreateForm}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Collection</span>
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Display Status:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(['all', 'active', 'inactive'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer capitalize ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-800 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? `All (${collections.length})` : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <EnterpriseDataTable
        data={filteredCollections}
        columns={columns}
        keyExtractor={(c) => c.id}
        searchPlaceholder="Search collections by name or slug..."
        bulkActions={bulkActions}
        exportFilename="collections_export.csv"
        defaultSortKey="display_order"
        emptyMessage="No collections found matching current filters."
      />

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-2xl p-6 space-y-5 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editing ? 'Edit Collection' : 'Create Curated Collection'}
                </h2>
                <p className="text-xs text-slate-700">Curate product themes and showcase banners.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="p-1 text-slate-700 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-800">Collection Name *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Private Reserve"
                    required
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-800">Slug *</label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="private-reserve"
                    required
                    className="bg-white border-slate-300 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-800">Tagline / Subtitle</label>
                <Input
                  value={form.tagline}
                  onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
                  placeholder="e.g. Rare botanical extraits and vintage resin oils"
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-800">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Detailed background regarding this collection..."
                  className="flex w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-800">Thumbnail Image URL</label>
                  <Input
                    value={form.image_url}
                    onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
                    placeholder="https://..."
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-800">Header Banner URL</label>
                  <Input
                    value={form.banner_url}
                    onChange={(e) => setForm((p) => ({ ...p, banner_url: e.target.value }))}
                    placeholder="https://..."
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-800">Display Order</label>
                <Input
                  type="number"
                  min="0"
                  value={form.display_order}
                  onChange={(e) => setForm((p) => ({ ...p, display_order: e.target.value }))}
                  className="bg-white border-slate-300 text-slate-900 w-32"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">Featured Collection</div>
                    <div className="text-slate-700 text-[11px]">Pin to storefront hero & homepage collections showcase</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))}
                    className="rounded border-slate-400 text-slate-900 focus:ring-slate-900 h-4 w-4 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <div className="font-semibold text-slate-900">Active Status</div>
                    <div className="text-slate-700 text-[11px]">Make this collection visible across storefront navigation</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                    className="rounded border-slate-400 text-slate-900 focus:ring-slate-900 h-4 w-4 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={closeForm} className="border-slate-300 text-slate-700 font-medium">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs cursor-pointer"
                >
                  {(isCreating || isUpdating) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editing ? 'Save Changes' : 'Create Collection'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md p-6 space-y-4 rounded-2xl shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Remove Collection?</h3>
            <p className="text-xs text-slate-800 leading-relaxed">
              This will permanently delete <span className="font-bold text-slate-900">"{deleteTarget.name}"</span>. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeletingId === deleteTarget.id} className="border-slate-300 text-slate-700">
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isDeletingId === deleteTarget.id} className="gap-2">
                {isDeletingId === deleteTarget.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Delete Collection</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCollectionsPage;
