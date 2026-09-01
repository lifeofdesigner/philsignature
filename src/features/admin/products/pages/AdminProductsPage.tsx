import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Package, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminProducts } from '../hooks/useAdminProducts';
import type { Product, ProductStatus, FragranceFamily } from '@/types/database';

const FRAGRANCE_FAMILIES: FragranceFamily[] = ['Woody', 'Oriental', 'Floral', 'Fresh', 'Gourmand', 'Chypre', 'Aromatic'];
const STATUSES: ProductStatus[] = ['draft', 'published', 'archived'];

interface ProductFormState {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  sku: string;
  price: string;
  sale_price: string;
  stock_quantity: string;
  category_id: string;
  collection_id: string;
  fragrance_family: string;
  status: ProductStatus;
  is_featured: boolean;
}

const emptyForm: ProductFormState = {
  name: '',
  slug: '',
  tagline: '',
  description: '',
  sku: '',
  price: '',
  sale_price: '',
  stock_quantity: '0',
  category_id: '',
  collection_id: '',
  fragrance_family: '',
  status: 'draft',
  is_featured: false,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

export const AdminProductsPage: React.FC = () => {
  const {
    products,
    isLoading,
    isError,
    categories,
    collections,
    createProduct,
    isCreating,
    updateProduct,
    isUpdating,
    deleteProduct,
  } = useAdminProducts();

  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        (p.fragrance_family || '').toLowerCase().includes(query)
    );
  }, [products, search]);

  const openCreateForm = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      tagline: product.tagline || '',
      description: product.description,
      sku: product.sku,
      price: String(product.price),
      sale_price: product.sale_price ? String(product.sale_price) : '',
      stock_quantity: String(product.stock_quantity),
      category_id: product.category_id || '',
      collection_id: product.collection_id || '',
      fragrance_family: product.fragrance_family || '',
      status: product.status,
      is_featured: product.is_featured,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setFormError(null);
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: editingProduct ? prev.slug : slugify(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      tagline: form.tagline.trim() || null,
      description: form.description.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      stock_quantity: Number(form.stock_quantity),
      category_id: form.category_id || null,
      collection_id: form.collection_id || null,
      fragrance_family: form.fragrance_family || null,
      status: form.status,
      is_featured: form.is_featured,
      top_notes: editingProduct?.top_notes ?? [],
      middle_notes: editingProduct?.middle_notes ?? [],
      base_notes: editingProduct?.base_notes ?? [],
      brand: 'PHILZ SIGNATURE',
    };

    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, input: payload });
        toast.success('Formulation updated successfully.');
      } else {
        await createProduct(payload);
        toast.success('Formulation created successfully.');
      }
      closeForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save product.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeletingId(deleteTarget.id);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" was removed from the catalog.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete product.');
    } finally {
      setIsDeletingId(null);
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError) {
    return (
      <EmptyState
        icon={<Package className="h-5 w-5" />}
        title="Unable to Load Catalog"
        description="The product catalog could not be retrieved from Supabase. Please retry."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Catalog Management
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">
            Fragrance Products
          </h1>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5" onClick={openCreateForm}>
          <Plus className="h-3.5 w-3.5" />
          <span>Add Formulation</span>
        </Button>
      </div>

      <div className="bg-luxury-card border border-luxury-border p-4 flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search fragrances by title, notes, SKU, or family..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md bg-luxury-charcoal"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="h-5 w-5" />}
          title={products.length === 0 ? 'No Products Staged' : 'No Matching Products'}
          description={
            products.length === 0
              ? 'Create the first formulation to begin building the PHILZ SIGNATURE catalog.'
              : 'Try adjusting your search query.'
          }
          actionLabel={products.length === 0 ? 'Create First Product' : undefined}
          onAction={products.length === 0 ? openCreateForm : undefined}
        />
      ) : (
        <div className="bg-luxury-card border border-luxury-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-luxury-border text-left text-[10px] uppercase tracking-wider text-luxury-muted">
                <th className="p-4 font-medium">Fragrance</th>
                <th className="p-4 font-medium">SKU</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-luxury-border/60 last:border-0 hover:bg-luxury-charcoal/40">
                  <td className="p-4">
                    <div className="text-white font-medium">{product.name}</div>
                    <div className="text-[11px] text-luxury-muted">{product.fragrance_family || '—'}</div>
                  </td>
                  <td className="p-4 font-mono text-xs text-luxury-muted">{product.sku}</td>
                  <td className="p-4 text-luxury-gold font-medium">{formatCurrency(product.price)}</td>
                  <td className="p-4">
                    <span className={product.stock_quantity === 0 ? 'text-red-400' : 'text-white'}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-medium border ${
                        product.status === 'published'
                          ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                          : product.status === 'draft'
                          ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                          : 'text-luxury-muted border-luxury-border bg-luxury-charcoal'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(product)}
                        className="p-1.5 text-luxury-muted hover:text-luxury-gold transition-colors cursor-pointer"
                        aria-label="Edit product"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(product)}
                        className="p-1.5 text-luxury-muted hover:text-red-400 transition-colors cursor-pointer"
                        aria-label="Delete product"
                      >
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
              <h2 className="font-serif text-xl text-white">
                {editingProduct ? 'Edit Formulation' : 'New Formulation'}
              </h2>
              <button type="button" onClick={closeForm} className="text-luxury-muted hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 text-red-200 text-xs">{formError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
                <Input
                  label="Slug"
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  required
                />
              </div>

              <Input
                label="Tagline"
                value={form.tagline}
                onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
              />

              <div className="w-full space-y-1.5">
                <label className="block text-xs uppercase tracking-luxury text-luxury-cream/70 font-medium">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  required
                  rows={3}
                  className="flex w-full bg-luxury-charcoal/80 border border-luxury-border px-3.5 py-2 text-sm text-luxury-cream placeholder:text-luxury-muted focus:outline-none focus:border-luxury-gold/70 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="SKU"
                  value={form.sku}
                  onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                  required
                />
                <Input
                  label="Price (₦)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  required
                />
                <Input
                  label="Sale Price (₦)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.sale_price}
                  onChange={(e) => setForm((p) => ({ ...p, sale_price: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Stock Quantity"
                  type="number"
                  min="0"
                  value={form.stock_quantity}
                  onChange={(e) => setForm((p) => ({ ...p, stock_quantity: e.target.value }))}
                  required
                />

                <div className="w-full space-y-1.5">
                  <label className="block text-xs uppercase tracking-luxury text-luxury-cream/70 font-medium">
                    Fragrance Family
                  </label>
                  <select
                    value={form.fragrance_family}
                    onChange={(e) => setForm((p) => ({ ...p, fragrance_family: e.target.value }))}
                    className="flex h-11 w-full bg-luxury-charcoal/80 border border-luxury-border px-3.5 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/70"
                  >
                    <option value="">—</option>
                    {FRAGRANCE_FAMILIES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="w-full space-y-1.5">
                  <label className="block text-xs uppercase tracking-luxury text-luxury-cream/70 font-medium">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ProductStatus }))}
                    className="flex h-11 w-full bg-luxury-charcoal/80 border border-luxury-border px-3.5 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/70"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full space-y-1.5">
                  <label className="block text-xs uppercase tracking-luxury text-luxury-cream/70 font-medium">
                    Category
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                    className="flex h-11 w-full bg-luxury-charcoal/80 border border-luxury-border px-3.5 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/70"
                  >
                    <option value="">—</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="w-full space-y-1.5">
                  <label className="block text-xs uppercase tracking-luxury text-luxury-cream/70 font-medium">
                    Collection
                  </label>
                  <select
                    value={form.collection_id}
                    onChange={(e) => setForm((p) => ({ ...p, collection_id: e.target.value }))}
                    className="flex h-11 w-full bg-luxury-charcoal/80 border border-luxury-border px-3.5 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/70"
                  >
                    <option value="">—</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-luxury-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))}
                  className="accent-luxury-gold"
                />
                <span>Feature on homepage</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-luxury-border">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
                <Button type="submit" variant="luxury" disabled={isCreating || isUpdating} className="gap-2">
                  {(isCreating || isUpdating) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingProduct ? 'Save Changes' : 'Create Formulation'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-luxury-card border border-luxury-border w-full max-w-md p-6 space-y-5 rounded">
            <h3 className="font-serif text-lg text-white">Remove Formulation?</h3>
            <p className="text-sm text-luxury-muted">
              This will permanently delete <span className="text-white">"{deleteTarget.name}"</span> from the catalog. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeletingId === deleteTarget.id}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeletingId === deleteTarget.id}
                className="gap-2"
              >
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
