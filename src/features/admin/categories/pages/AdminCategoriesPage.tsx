import React, { useState } from 'react';
import { toast } from 'sonner';
import { Tags, Plus, Pencil, Trash2, X, Loader2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { EnterpriseDataTable, type Column } from '@/components/common/EnterpriseDataTable';
import { useAdminCategories } from '../hooks/useAdminCategories';
import type { Category } from '@/types/database';

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

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    setForm((prev) => ({ ...prev, name: value, slug: editing ? prev.slug : slugify(value) }));
  };

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
      display_order: String(category.display_order ?? 0),
      is_active: category.is_active,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const handleDuplicate = async (category: Category) => {
    try {
      const copyPayload = {
        name: `${category.name} (Copy)`,
        slug: `${category.slug}-copy-${Date.now().toString().slice(-4)}`,
        description: category.description,
        image_url: category.image_url,
        display_order: (category.display_order ?? 0) + 1,
        is_active: false,
      };
      await createCategory(copyPayload);
      toast.success(`Duplicated "${category.name}" as inactive draft.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to duplicate category.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug:
        form.slug.trim() ||
        form.name
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      display_order: Number.parseInt(form.display_order, 10) || 0,
      is_active: form.is_active,
    };

    try {
      if (editing) {
        await updateCategory({ id: editing.id, input: payload });
        toast.success(`"${payload.name}" updated successfully.`);
      } else {
        await createCategory(payload);
        toast.success(`"${payload.name}" category created.`);
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

  const columns: Column<Category>[] = [
    {
      key: 'name',
      header: 'Category',
      accessor: (category: Category) => (
        <div className="flex items-center gap-3">
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name}
              className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-slate-100 flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-700">
              <Tags className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-slate-900">{category.name}</div>
            <div className="text-xs font-mono text-slate-700">/{category.slug}</div>
            {category.description && (
              <p className="text-xs text-slate-800 line-clamp-1 mt-0.5 max-w-sm">{category.description}</p>
            )}
          </div>
        </div>
      ),
      sortValue: (c: Category) => c.name,
    },
    {
      key: 'display_order',
      header: 'Display Order',
      accessor: (category: Category) => (
        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
          {category.display_order ?? 0}
        </span>
      ),
      sortValue: (c: Category) => c.display_order ?? 0,
    },
    {
      key: 'is_active',
      header: 'Status',
      accessor: (category: Category) => (
        <span
          className={`inline-flex items-center text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold border ${
            category.is_active
              ? 'text-emerald-800 border-emerald-200 bg-emerald-50'
              : 'text-slate-800 border-slate-200 bg-slate-100'
          }`}
        >
          {category.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
      sortValue: (c: Category) => (c.is_active ? 1 : 0),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (category: Category) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => handleDuplicate(category)}
            className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer rounded"
            title="Duplicate Category"
            aria-label="Duplicate category"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => openEditForm(category)}
            className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer rounded"
            title="Edit Category"
            aria-label="Edit category"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(category)}
            className="p-1.5 text-slate-700 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer rounded"
            title="Delete Category"
            aria-label="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

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
          <p className="text-xs text-slate-800 font-medium mt-1">
            Organize catalog formulations into Extrait, Perfume Oils, Scented Candles, and Room Sprays.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs cursor-pointer"
          onClick={openCreateForm}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Category</span>
        </Button>
      </div>

      <EnterpriseDataTable
        data={categories}
        columns={columns}
        keyExtractor={(c) => c.id}
        searchPlaceholder="Search categories by name, slug or description..."
        defaultSortKey="name"
        emptyMessage="No categories found matching your query."
      />

      {/* High-contrast SaaS Create/Edit Category Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-lg p-6 space-y-5 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editing ? 'Edit Fragrance Category' : 'New Fragrance Category'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="text-slate-700 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Extrait de Parfum"
                  className="bg-white border-slate-300 text-slate-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="e.g. extrait-de-parfum"
                  className="bg-white border-slate-300 text-slate-900 font-mono text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Detailed category notes and luxury formulation highlights..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Image URL
                </label>
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
                  placeholder="https://... image asset path"
                  className="bg-white border-slate-300 text-slate-900"
                />
                {form.image_url && (
                  <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-md border border-slate-200 bg-white"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-xs text-slate-700">Image Preview</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Display Order
                </label>
                <Input
                  type="number"
                  min="0"
                  value={form.display_order}
                  onChange={(e) => setForm((p) => ({ ...p, display_order: e.target.value }))}
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 text-sm text-slate-900 font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                    className="w-4 h-4 text-slate-900 rounded border-slate-400 focus:ring-slate-900 cursor-pointer"
                  />
                  <span>Active &amp; Visible in Storefront Navigation</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <Button type="button" variant="outline" onClick={closeForm} className="border-slate-300 text-slate-700 font-medium">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="bg-slate-900 hover:bg-slate-800 text-white gap-2 font-semibold shadow-xs cursor-pointer"
                >
                  {(isCreating || isUpdating) && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{editing ? 'Save Changes' : 'Create Category'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* High-contrast Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-md p-6 space-y-4 rounded-xl shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Delete Category?</h3>
            <p className="text-sm text-slate-800">
              This will permanently delete <span className="font-semibold text-slate-900">"{deleteTarget.name}"</span> from the database. Any products assigned to this category may lose their categorization.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeletingId === deleteTarget.id}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeletingId === deleteTarget.id}
                className="gap-2"
              >
                {isDeletingId === deleteTarget.id && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Delete Category</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
