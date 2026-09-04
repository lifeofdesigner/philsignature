import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Copy,
  Archive,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { EnterpriseDataTable, type Column, type BulkAction } from '@/components/common/EnterpriseDataTable';
import { useAdminProducts } from '../hooks/useAdminProducts';
import type { Product, ProductStatus, FragranceFamily } from '@/types/database';
import { auditLogService } from '@/services/AuditLogService';
import { useAuth } from '@/hooks/useAuth';

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
  image_url?: string;
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
  image_url: '',
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
  const { user } = useAuth();
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

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (familyFilter !== 'all' && p.fragrance_family !== familyFilter) return false;
      if (stockFilter === 'in_stock' && p.stock_quantity <= 0) return false;
      if (stockFilter === 'low_stock' && (p.stock_quantity <= 0 || p.stock_quantity > 5)) return false;
      if (stockFilter === 'out_of_stock' && p.stock_quantity > 0) return false;
      return true;
    });
  }, [products, statusFilter, familyFilter, stockFilter]);

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
      image_url: product.images?.[0]?.image_url || '',
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

    const priceNum = Number(form.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid price greater than 0.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      tagline: form.tagline.trim() || null,
      description: form.description.trim(),
      sku: form.sku.trim(),
      price: priceNum,
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      stock_quantity: Number(form.stock_quantity) || 0,
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
        await auditLogService.recordAction('UPDATE_PRODUCT', 'product', editingProduct.id, payload, user?.id);
        toast.success(`"${payload.name}" updated successfully.`);
      } else {
        await createProduct(payload);
        await auditLogService.recordAction('CREATE_PRODUCT', 'product', payload.slug, payload, user?.id);
        toast.success(`"${payload.name}" added to catalog.`);
      }
      closeForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save product.');
    }
  };

  const handleDuplicate = async (product: Product) => {
    setActionLoadingId(product.id);
    try {
      const copyPayload = {
        name: `${product.name} (Copy)`,
        slug: `${product.slug}-copy-${Date.now().toString().slice(-4)}`,
        tagline: product.tagline,
        description: product.description,
        sku: `${product.sku}-CP`,
        price: product.price,
        sale_price: product.sale_price,
        stock_quantity: product.stock_quantity,
        category_id: product.category_id,
        collection_id: product.collection_id,
        fragrance_family: product.fragrance_family,
        status: 'draft' as ProductStatus,
        is_featured: false,
        top_notes: product.top_notes,
        middle_notes: product.middle_notes,
        base_notes: product.base_notes,
        brand: product.brand || 'PHILZ SIGNATURE',
      };
      await createProduct(copyPayload);
      await auditLogService.recordAction('DUPLICATE_PRODUCT', 'product', product.id, copyPayload, user?.id);
      toast.success(`Duplicated "${product.name}" as draft.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to duplicate product.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleArchive = async (product: Product) => {
    setActionLoadingId(product.id);
    const newStatus: ProductStatus = product.status === 'archived' ? 'published' : 'archived';
    try {
      await updateProduct({ id: product.id, input: { status: newStatus } });
      await auditLogService.recordAction('TOGGLE_ARCHIVE_PRODUCT', 'product', product.id, { status: newStatus }, user?.id);
      toast.success(`"${product.name}" is now ${newStatus}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update product status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeletingId(deleteTarget.id);
    try {
      await deleteProduct(deleteTarget.id);
      await auditLogService.recordAction('DELETE_PRODUCT', 'product', deleteTarget.id, { name: deleteTarget.name }, user?.id);
      toast.success(`"${deleteTarget.name}" removed from catalog.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete product.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const bulkActions: BulkAction<Product>[] = [
    {
      label: 'Publish Selected',
      icon: CheckCircle,
      action: async (items) => {
        try {
          await Promise.all(items.map((item) => updateProduct({ id: item.id, input: { status: 'published' } })));
          toast.success(`Published ${items.length} products.`);
        } catch {
          toast.error('Failed to bulk publish.');
        }
      },
    },
    {
      label: 'Draft Selected',
      action: async (items) => {
        try {
          await Promise.all(items.map((item) => updateProduct({ id: item.id, input: { status: 'draft' } })));
          toast.success(`Moved ${items.length} products to draft.`);
        } catch {
          toast.error('Failed to update status.');
        }
      },
    },
    {
      label: 'Archive Selected',
      icon: Archive,
      action: async (items) => {
        try {
          await Promise.all(items.map((item) => updateProduct({ id: item.id, input: { status: 'archived' } })));
          toast.success(`Archived ${items.length} products.`);
        } catch {
          toast.error('Failed to bulk archive.');
        }
      },
    },
    {
      label: 'Delete Selected',
      icon: Trash2,
      variant: 'destructive',
      action: async (items) => {
        if (!confirm(`Are you sure you want to delete ${items.length} selected products?`)) return;
        try {
          await Promise.all(items.map((item) => deleteProduct(item.id)));
          toast.success(`Deleted ${items.length} products.`);
        } catch {
          toast.error('Failed to bulk delete products.');
        }
      },
    },
  ];

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Fragrance',
      accessor: (product) => (
        <div className="flex items-center gap-2.5">
          {product.images?.[0]?.image_url ? (
            <img
              src={product.images[0].image_url}
              alt={product.name}
              className="h-9 w-9 rounded-md object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="h-9 w-9 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <Package className="h-4 w-4 text-slate-400" />
            </div>
          )}
          <div className="min-w-0">
            <div className="text-slate-900 font-bold truncate">{product.name}</div>
            <div className="text-[11px] text-slate-600 font-medium truncate">
              {product.fragrance_family || 'Standard formulation'}
            </div>
          </div>
        </div>
      ),
      sortValue: (product) => product.name,
    },
    {
      key: 'sku',
      header: 'SKU',
      accessor: (product) => <span className="font-mono text-xs text-slate-700 font-medium">{product.sku}</span>,
      sortValue: (product) => product.sku,
    },
    {
      key: 'price',
      header: 'Price',
      accessor: (product) => (
        <div>
          <div className="text-slate-900 font-bold">{formatCurrency(product.price)}</div>
          {product.sale_price && (
            <div className="text-[11px] text-emerald-800 font-semibold">Sale: {formatCurrency(product.sale_price)}</div>
          )}
        </div>
      ),
      sortValue: (product) => product.price,
    },
    {
      key: 'category',
      header: 'Category / Line',
      accessor: (product) => (
        <span className="text-slate-700 text-xs font-medium">
          {product.category_id && categoryMap.has(product.category_id)
            ? categoryMap.get(product.category_id)
            : 'Unassigned'}
        </span>
      ),
      sortValue: (product) => (product.category_id ? categoryMap.get(product.category_id) || '' : ''),
    },
    {
      key: 'stock_quantity',
      header: 'Stock',
      accessor: (product) => (
        <div className="flex items-center gap-1.5">
          <span
            className={`font-semibold ${
              product.stock_quantity === 0
                ? 'text-red-700'
                : product.stock_quantity <= 5
                ? 'text-amber-800 font-bold'
                : 'text-slate-800'
            }`}
          >
            {product.stock_quantity}
          </span>
          {product.stock_quantity <= 5 && (
            <span
              className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                product.stock_quantity === 0
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              {product.stock_quantity === 0 ? 'Out' : 'Low'}
            </span>
          )}
        </div>
      ),
      sortValue: (product) => product.stock_quantity,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (product) => (
        <span
          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border ${
            product.status === 'published'
              ? 'text-emerald-900 border-emerald-300 bg-emerald-50'
              : product.status === 'draft'
              ? 'text-amber-900 border-amber-300 bg-amber-50'
              : 'text-slate-700 border-slate-300 bg-slate-100'
          }`}
        >
          {product.status}
        </span>
      ),
      sortValue: (product) => product.status,
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      accessor: (product) => {
        const isBusy = actionLoadingId === product.id;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => openEditForm(product)}
              className="p-1.5 text-slate-600 hover:text-amber-800 transition-colors cursor-pointer rounded hover:bg-slate-100"
              title="Edit Product"
              aria-label="Edit product"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleDuplicate(product)}
              className="p-1.5 text-slate-600 hover:text-blue-700 transition-colors cursor-pointer rounded hover:bg-blue-50"
              title="Duplicate Formulation"
              aria-label="Duplicate product"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleToggleArchive(product)}
              className="p-1.5 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer rounded hover:bg-slate-100"
              title={product.status === 'archived' ? 'Restore Product' : 'Archive Product'}
              aria-label="Archive toggle"
            >
              {product.status === 'archived' ? <RotateCcw className="h-3.5 w-3.5 text-emerald-700" /> : <Archive className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(product)}
              className="p-1.5 text-slate-600 hover:text-red-700 transition-colors cursor-pointer rounded hover:bg-red-50"
              title="Delete Product"
              aria-label="Delete product"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError) {
    return (
      <EmptyState
        icon={<Package className="h-5 w-5" />}
        title="Unable to Load Catalog"
        description="The product catalog could not be retrieved. Please retry."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Fragrance Products & Catalog
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Manage formulations, SKU codes, pricing, batch stock levels, and publication status.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs cursor-pointer"
          onClick={openCreateForm}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Formulation</span>
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center gap-3 shadow-2xs text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1 font-medium focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            <option value="all">All Statuses ({products.length})</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Family:</span>
          <select
            value={familyFilter}
            onChange={(e) => setFamilyFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1 font-medium focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            <option value="all">All Fragrance Families</option>
            {FRAGRANCE_FAMILIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Stock:</span>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1 font-medium focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            <option value="all">All Stock Levels</option>
            <option value="in_stock">In Stock (&gt; 0)</option>
            <option value="low_stock">Low Stock (≤5)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      <EnterpriseDataTable
        data={filteredProducts}
        columns={columns}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search fragrances by title, SKU, fragrance family..."
        bulkActions={bulkActions}
        exportFilename="philz_signature_products.csv"
        defaultSortKey="name"
        emptyMessage="No matching fragrance formulations found."
      />

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-2xl p-6 space-y-5 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingProduct ? 'Edit Fragrance Formulation' : 'Create New Formulation'}
                </h2>
                <p className="text-xs text-slate-500">Configure fragrance notes, inventory, and pricing.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-800">Fragrance Name *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Royal Oud Extrait"
                    required
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-800">URL Slug *</label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="royal-oud-extrait"
                    required
                    className="bg-white border-slate-300 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-800">Subtitle / Tagline</label>
                <Input
                  value={form.tagline}
                  onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
                  placeholder="e.g. Pure Artisanal Extrait de Parfum"
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-800">Fragrance Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  required
                  rows={3}
                  placeholder="Describe the olfactory composition and story..."
                  className="flex w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-800">SKU Code *</label>
                  <Input
                    value={form.sku}
                    onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                    placeholder="PS-OUD-01"
                    required
                    className="bg-white border-slate-300 text-slate-900 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-800">Price (₦) *</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="75000"
                    required
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-800">Sale Price (₦)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.sale_price}
                    onChange={(e) => setForm((p) => ({ ...p, sale_price: e.target.value }))}
                    placeholder="65000"
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-800">Stock Quantity *</label>
                  <Input
                    type="number"
                    min="0"
                    value={form.stock_quantity}
                    onChange={(e) => setForm((p) => ({ ...p, stock_quantity: e.target.value }))}
                    required
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-800">Fragrance Family</label>
                  <select
                    value={form.fragrance_family}
                    onChange={(e) => setForm((p) => ({ ...p, fragrance_family: e.target.value }))}
                    className="flex h-9 w-full bg-white border border-slate-300 rounded-lg px-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600"
                  >
                    <option value="">— Select Family —</option>
                    {FRAGRANCE_FAMILIES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-800">Publication Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ProductStatus }))}
                    className="flex h-9 w-full bg-white border border-slate-300 rounded-lg px-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-800">Category</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                    className="flex h-9 w-full bg-white border border-slate-300 rounded-lg px-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600"
                  >
                    <option value="">— None / General —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-800">Curated Collection</label>
                  <select
                    value={form.collection_id}
                    onChange={(e) => setForm((p) => ({ ...p, collection_id: e.target.value }))}
                    className="flex h-9 w-full bg-white border border-slate-300 rounded-lg px-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600"
                  >
                    <option value="">— None / General —</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">Feature on Storefront Homepage</div>
                  <div className="text-slate-500 text-[11px]">Pin this fragrance to the featured highlights section</div>
                </div>
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))}
                  className="rounded border-slate-400 text-slate-900 focus:ring-slate-900 h-4 w-4 cursor-pointer"
                />
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
                  <span>{editingProduct ? 'Save Changes' : 'Create Formulation'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md p-6 space-y-4 rounded-2xl shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Remove Formulation?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will permanently delete <span className="font-bold text-slate-900">"{deleteTarget.name}"</span> from the database. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeletingId === deleteTarget.id}
                className="border-slate-300 text-slate-700"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeletingId === deleteTarget.id}
                className="gap-2"
              >
                {isDeletingId === deleteTarget.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Delete Formulation</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
