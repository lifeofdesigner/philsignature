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
  Wand2,
  ImageOff,
} from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AdminButton, AdminInput } from '@/components/admin-ui';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { EnterpriseDataTable, type Column, type BulkAction } from '@/components/common/EnterpriseDataTable';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { useAdminProducts } from '../hooks/useAdminProducts';
import type { Product, ProductStatus, FragranceFamily } from '@/types/database';
import { auditLogService } from '@/services/AuditLogService';
import { useAuth } from '@/hooks/useAuth';

const FRAGRANCE_FAMILIES: FragranceFamily[] = ['Woody', 'Oriental', 'Floral', 'Fresh', 'Gourmand', 'Chypre', 'Aromatic'];
const STATUSES: ProductStatus[] = ['draft', 'published', 'archived'];

interface VariantRow {
  name: string;
  size_ml: string;
  price: string;
  sale_price: string;
  stock_quantity: string;
  sku: string;
  is_default: boolean;
}

interface ProductFormState {
  name: string;
  slug: string;
  tagline: string;
  short_description: string;
  description: string;
  scent_profile: string;
  best_for: string;
  sku: string;
  price: string;
  sale_price: string;
  stock_quantity: string;
  category_id: string;
  collection_id: string;
  fragrance_family: string;
  status: ProductStatus;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  is_trending: boolean;
  top_notes: string;
  middle_notes: string;
  base_notes: string;
  ingredients: string;
  how_to_use: string;
  barcode: string;
  weight_grams: string;
  volume_ml: string;
  concentration: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  images: string[];
  variants: VariantRow[];
}

const emptyVariantRow = (): VariantRow => ({
  name: '',
  size_ml: '',
  price: '',
  sale_price: '',
  stock_quantity: '0',
  sku: '',
  is_default: false,
});

const emptyForm: ProductFormState = {
  name: '',
  slug: '',
  tagline: '',
  short_description: '',
  description: '',
  scent_profile: '',
  best_for: 'Unisex',
  sku: '',
  price: '',
  sale_price: '',
  stock_quantity: '100',
  category_id: '',
  collection_id: '',
  fragrance_family: '',
  status: 'published',
  is_featured: false,
  is_bestseller: false,
  is_new_arrival: false,
  is_trending: false,
  top_notes: '',
  middle_notes: '',
  base_notes: '',
  ingredients: '',
  how_to_use: '',
  barcode: '',
  weight_grams: '',
  volume_ml: '',
  concentration: '',
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  images: [],
  variants: [],
};

const joinNotes = (notes?: string[] | null) => (notes || []).join(', ');
const splitNotes = (value: string) =>
  value
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const nextSkuSequence = (existingSkus: string[]) => {
  const max = existingSkus.reduce((highest, sku) => {
    const match = sku.match(/^PS-(\d+)-/);
    if (!match) return highest;
    return Math.max(highest, Number(match[1]));
  }, 0);
  return String(max + 1).padStart(2, '0');
};

const generateSku = (name: string, existingSkus: string[]) => {
  const namePart = slugify(name).toUpperCase();
  if (!namePart) return '';
  return `PS-${nextSkuSequence(existingSkus)}-${namePart}`;
};

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
    setProductImages,
    setProductVariants,
  } = useAdminProducts();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
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
      if (categoryFilter !== 'all' && p.category_id !== categoryFilter) return false;
      if (familyFilter !== 'all' && p.fragrance_family !== familyFilter) return false;
      if (stockFilter === 'in_stock' && p.stock_quantity <= 0) return false;
      if (stockFilter === 'low_stock' && (p.stock_quantity <= 0 || p.stock_quantity > 5)) return false;
      if (stockFilter === 'out_of_stock' && p.stock_quantity > 0) return false;
      return true;
    });
  }, [products, statusFilter, categoryFilter, familyFilter, stockFilter]);

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
      short_description: product.short_description || '',
      description: product.description,
      scent_profile: product.scent_profile || '',
      best_for: product.best_for || 'Unisex',
      sku: product.sku,
      price: String(product.price),
      sale_price: product.sale_price ? String(product.sale_price) : '',
      stock_quantity: String(product.stock_quantity),
      category_id: product.category_id || '',
      collection_id: product.collection_id || '',
      fragrance_family: product.fragrance_family || '',
      status: product.status,
      is_featured: product.is_featured,
      is_bestseller: product.is_bestseller,
      is_new_arrival: product.is_new_arrival,
      is_trending: product.is_trending,
      top_notes: joinNotes(product.top_notes),
      middle_notes: joinNotes(product.middle_notes),
      base_notes: joinNotes(product.base_notes),
      ingredients: product.ingredients || '',
      how_to_use: product.how_to_use || '',
      barcode: product.barcode || '',
      weight_grams: product.weight_grams ? String(product.weight_grams) : '',
      volume_ml: product.volume_ml ? String(product.volume_ml) : '',
      concentration: product.concentration || '',
      meta_title: product.meta_title || '',
      meta_description: product.meta_description || '',
      meta_keywords: product.meta_keywords || '',
      images: (product.images || [])
        .slice()
        .sort((a, b) => a.display_order - b.display_order)
        .map((img) => img.image_url),
      variants: (product.variants || [])
        .slice()
        .sort((a, b) => a.display_order - b.display_order)
        .map((v) => ({
          name: v.name,
          size_ml: String(v.size_ml),
          price: String(v.price),
          sale_price: v.sale_price ? String(v.sale_price) : '',
          stock_quantity: String(v.stock_quantity),
          sku: v.sku,
          is_default: v.is_default,
        })),
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
      sku: editingProduct ? prev.sku : generateSku(value, products.map((p) => p.sku)),
    }));
  };

  const handleGenerateSku = () => {
    if (!form.name.trim()) {
      toast.error('Enter a fragrance name first.');
      return;
    }
    setForm((prev) => ({ ...prev, sku: generateSku(prev.name, products.map((p) => p.sku)) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const priceNum = Number(form.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid price greater than 0.');
      return;
    }

    const validVariants = form.variants.filter((v) => v.name.trim() && v.price.trim());
    for (const v of validVariants) {
      if (isNaN(Number(v.price)) || Number(v.price) <= 0) {
        setFormError(`Size "${v.name}" needs a valid price greater than 0.`);
        return;
      }
    }
    if (validVariants.length > 0 && !validVariants.some((v) => v.is_default)) {
      validVariants[0].is_default = true;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      tagline: form.tagline.trim() || null,
      short_description: form.short_description.trim() || null,
      description: form.description.trim(),
      scent_profile: form.scent_profile.trim() || null,
      best_for: form.best_for.trim() || 'Unisex',
      sku: form.sku.trim(),
      price: priceNum,
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      stock_quantity: Number(form.stock_quantity) || 0,
      category_id: form.category_id || null,
      collection_id: form.collection_id || null,
      fragrance_family: form.fragrance_family || null,
      status: form.status,
      is_featured: form.is_featured,
      is_bestseller: form.is_bestseller,
      is_new_arrival: form.is_new_arrival,
      is_trending: form.is_trending,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
      meta_keywords: form.meta_keywords.trim() || null,
      top_notes: splitNotes(form.top_notes),
      middle_notes: splitNotes(form.middle_notes),
      base_notes: splitNotes(form.base_notes),
      ingredients: form.ingredients.trim() || null,
      how_to_use: form.how_to_use.trim() || null,
      barcode: form.barcode.trim() || null,
      weight_grams: form.weight_grams ? Number(form.weight_grams) : null,
      volume_ml: form.volume_ml ? Number(form.volume_ml) : null,
      concentration: form.concentration.trim() || null,
      brand: 'Philz Signature',
    };

    const variantPayload = validVariants.map((v) => ({
      name: v.name.trim(),
      size_ml: Number(v.size_ml) || 0,
      price: Number(v.price),
      sale_price: v.sale_price ? Number(v.sale_price) : null,
      stock_quantity: Number(v.stock_quantity) || 0,
      sku: v.sku.trim(),
      is_default: v.is_default,
    }));

    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, input: payload });
        await setProductImages({ id: editingProduct.id, images: form.images });
        await setProductVariants({ id: editingProduct.id, variants: variantPayload });
        await auditLogService.recordAction('UPDATE_PRODUCT', 'product', editingProduct.id, payload, user?.id);
        toast.success(`"${payload.name}" updated successfully.`);
      } else {
        const created = await createProduct(payload);
        if (form.images.length > 0) {
          await setProductImages({ id: created.id, images: form.images });
        }
        if (variantPayload.length > 0) {
          await setProductVariants({ id: created.id, variants: variantPayload });
        }
        await auditLogService.recordAction('CREATE_PRODUCT', 'product', payload.slug, payload, user?.id);
        toast.success(`"${payload.name}" added to catalog.`);
      }
      closeForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save product.');
    }
  };

  const handleVariantChange = (index: number, updates: Partial<VariantRow>) => {
    setForm((p) => ({
      ...p,
      variants: p.variants.map((v, i) => (i === index ? { ...v, ...updates } : v)),
    }));
  };

  const handleAddVariant = () => {
    setForm((p) => ({ ...p, variants: [...p.variants, emptyVariantRow()] }));
  };

  const handleRemoveVariant = (index: number) => {
    setForm((p) => ({ ...p, variants: p.variants.filter((_, i) => i !== index) }));
  };

  const handleSetDefaultVariant = (index: number) => {
    setForm((p) => ({
      ...p,
      variants: p.variants.map((v, i) => ({ ...v, is_default: i === index })),
    }));
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
        short_description: product.short_description,
        ingredients: product.ingredients,
        how_to_use: product.how_to_use,
        barcode: null,
        weight_grams: product.weight_grams,
        volume_ml: product.volume_ml,
        concentration: product.concentration,
        is_bestseller: product.is_bestseller,
        is_new_arrival: product.is_new_arrival,
        is_trending: product.is_trending,
        brand: product.brand || 'PHILZ SIGNATURE',
      };
      const created = await createProduct(copyPayload);
      const imageUrls = (product.images || []).map((img) => img.image_url);
      if (imageUrls.length > 0) {
        await setProductImages({ id: created.id, images: imageUrls });
      }
      const variants = (product.variants || []).map((v) => ({
        name: v.name,
        size_ml: v.size_ml,
        price: v.price,
        sale_price: v.sale_price,
        stock_quantity: v.stock_quantity,
        sku: `${v.sku}-CP`,
        is_default: v.is_default,
      }));
      if (variants.length > 0) {
        await setProductVariants({ id: created.id, variants });
      }
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
              className="h-10 w-10 rounded-md object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <Package className="h-4 w-4 text-black" />
            </div>
          )}
          <div className="min-w-0 max-w-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-black font-bold truncate">{product.name}</span>
              {product.best_for && (
                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 border border-slate-300 text-black">
                  {product.best_for}
                </span>
              )}
            </div>
            <div className="text-[11px] text-black font-medium truncate">
              {product.scent_profile || product.fragrance_family || 'Standard formulation'}
            </div>
          </div>
        </div>
      ),
      sortValue: (product) => product.name,
    },
    {
      key: 'sku',
      header: 'SKU',
      accessor: (product) => <span className="font-mono text-xs text-black font-medium">{product.sku}</span>,
      sortValue: (product) => product.sku,
    },
    {
      key: 'price',
      header: 'Pricing & Variants',
      accessor: (product) => {
        const hasVariants = Boolean(product.variants && product.variants.length > 0);
        const isMissingSize = !hasVariants && !product.volume_ml && !product.weight_grams;

        const variantText = hasVariants
          ? `${product.variants!.length} Size${product.variants!.length === 1 ? '' : 's'}`
          : product.weight_grams
          ? `${product.weight_grams}g Vessel`
          : product.volume_ml
          ? `${product.volume_ml}ml`
          : null;

        return (
          <div>
            <div className="text-black font-bold">{formatCurrency(product.price)}</div>
            {isMissingSize ? (
              <div className="text-[10px] text-amber-600 font-semibold">⚠ No size/weight set</div>
            ) : (
              <div className="text-[10px] text-black font-medium">{variantText}</div>
            )}
          </div>
        );
      },
      sortValue: (product) => product.price,
    },
    {
      key: 'category',
      header: 'Category / Line',
      accessor: (product) => (
        <span className="text-black text-xs font-medium">
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
                : 'text-black'
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
              : 'text-black border-slate-300 bg-slate-100'
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
              className="p-1.5 text-black hover:text-black transition-colors cursor-pointer rounded hover:bg-slate-100"
              title="Edit Product"
              aria-label="Edit product"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleDuplicate(product)}
              className="p-1.5 text-black hover:text-blue-700 transition-colors cursor-pointer rounded hover:bg-blue-50"
              title="Duplicate Formulation"
              aria-label="Duplicate product"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleToggleArchive(product)}
              className="p-1.5 text-black hover:text-black transition-colors cursor-pointer rounded hover:bg-slate-100"
              title={product.status === 'archived' ? 'Restore Product' : 'Archive Product'}
              aria-label="Archive toggle"
            >
              {product.status === 'archived' ? <RotateCcw className="h-3.5 w-3.5 text-emerald-700" /> : <Archive className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(product)}
              className="p-1.5 text-black hover:text-red-700 transition-colors cursor-pointer rounded hover:bg-red-50"
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
          <h1 className="text-2xl font-bold text-black tracking-tight">
            Products & Catalog
          </h1>
          <p className="text-xs text-black font-semibold mt-1">
            Manage perfumes, scented candles, luxury room sprays, pricing, batch stock levels, and publication status.
          </p>
        </div>
        <AdminButton
          variant="primary"
          size="sm"
          className="gap-1.5 shadow-xs"
          onClick={openCreateForm}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Product</span>
        </AdminButton>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center gap-3 shadow-2xs text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-black">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 text-black rounded-lg px-2.5 py-1 font-medium focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            <option value="all">All Statuses ({products.length})</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-black">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-300 text-black rounded-lg px-2.5 py-1 font-medium focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-black">Family:</span>
          <select
            value={familyFilter}
            onChange={(e) => setFamilyFilter(e.target.value)}
            className="bg-white border border-slate-300 text-black rounded-lg px-2.5 py-1 font-medium focus:ring-1 focus:ring-slate-900 cursor-pointer"
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
          <span className="font-bold text-black">Stock:</span>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="bg-white border border-slate-300 text-black rounded-lg px-2.5 py-1 font-medium focus:ring-1 focus:ring-slate-900 cursor-pointer"
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
                <h2 className="text-lg font-bold text-black">
                  {editingProduct ? 'Edit Fragrance Formulation' : 'Create New Formulation'}
                </h2>
                <p className="text-xs text-black">Configure fragrance notes, inventory, and pricing.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="p-1 text-black hover:text-black rounded-lg hover:bg-slate-100 cursor-pointer"
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
                  <label className="block font-semibold text-black">Fragrance Name *</label>
                  <AdminInput
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Royal Oud Extrait"
                    required
                    className="bg-white border-slate-300 text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-black">URL Slug *</label>
                  <AdminInput
                    value={form.slug}
                    onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="royal-oud-extrait"
                    required
                    className="bg-white border-slate-300 text-black font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-black">Subtitle / Tagline</label>
                <AdminInput
                  value={form.tagline}
                  onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
                  placeholder="e.g. Pure Artisanal Extrait de Parfum"
                  className="bg-white border-slate-300 text-black"
                />
              </div>

              <div className="space-y-2 p-3.5 bg-white border border-slate-200 rounded-xl">
                <label className="block font-semibold text-black">Product Images</label>
                <p className="text-[11px] text-black font-medium">
                  The first image is used as the primary thumbnail across the storefront.
                </p>
                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {form.images.map((url, index) => (
                      <div key={url + index} className="relative">
                        <img
                          src={url}
                          alt={`Product image ${index + 1}`}
                          className="h-16 w-16 object-cover rounded-lg border border-slate-300"
                        />
                        {index === 0 && (
                          <span className="absolute -top-1.5 -left-1.5 text-[8px] font-bold uppercase bg-[#DC2626] text-white px-1.5 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }))
                          }
                          className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {form.images.length === 0 && (
                  <div className="flex items-center gap-2 text-black text-[11px]">
                    <ImageOff className="h-4 w-4" />
                    <span>No images uploaded yet.</span>
                  </div>
                )}
                <ImageUploadField
                  label="Add Image"
                  bucket="products"
                  onUploaded={(url) => setForm((p) => ({ ...p, images: [...p.images, url] }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-black">Fragrance Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  required
                  rows={3}
                  placeholder="Describe the olfactory composition and story..."
                  className="flex w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-black placeholder:text-black focus:outline-hidden focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-black">SKU Code *</label>
                  <div className="flex items-center gap-1.5">
                    <AdminInput
                      value={form.sku}
                      onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                      placeholder="PS-OUD-01"
                      required
                      className="bg-white border-slate-300 text-black font-mono"
                    />
                    <AdminButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleGenerateSku}
                      title="Auto-generate SKU from fragrance name"
                      className="h-9 px-2.5 shrink-0"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                    </AdminButton>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-black">Price (₦) *</label>
                  <AdminInput
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="75000"
                    required
                    className="bg-white border-slate-300 text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-black">Sale Price (₦)</label>
                  <AdminInput
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.sale_price}
                    onChange={(e) => setForm((p) => ({ ...p, sale_price: e.target.value }))}
                    placeholder="65000"
                    className="bg-white border-slate-300 text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-black">Stock Quantity *</label>
                  <AdminInput
                    type="number"
                    min="0"
                    value={form.stock_quantity}
                    onChange={(e) => setForm((p) => ({ ...p, stock_quantity: e.target.value }))}
                    required
                    className="bg-white border-slate-300 text-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-black">Fragrance Family</label>
                  <select
                    value={form.fragrance_family}
                    onChange={(e) => setForm((p) => ({ ...p, fragrance_family: e.target.value }))}
                    className="flex h-9 w-full bg-white border border-slate-300 rounded-lg px-3 text-xs text-black focus:outline-hidden focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600"
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
                  <label className="block font-semibold text-black">Publication Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ProductStatus }))}
                    className="flex h-9 w-full bg-white border border-slate-300 rounded-lg px-3 text-xs text-black focus:outline-hidden focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600"
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
                  <label className="block font-semibold text-black">Category</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                    className="flex h-9 w-full bg-white border border-slate-300 rounded-lg px-3 text-xs text-black focus:outline-hidden focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600"
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
                  <label className="block font-semibold text-black">Curated Collection</label>
                  <select
                    value={form.collection_id}
                    onChange={(e) => setForm((p) => ({ ...p, collection_id: e.target.value }))}
                    className="flex h-9 w-full bg-white border border-slate-300 rounded-lg px-3 text-xs text-black focus:outline-hidden focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600"
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

              {/* Scent Profile & Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3.5 bg-white border border-slate-200 rounded-xl">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block font-semibold text-black">Scent Profile Notes</label>
                  <AdminInput
                    value={form.scent_profile}
                    onChange={(e) => setForm((p) => ({ ...p, scent_profile: e.target.value }))}
                    placeholder="e.g. Exotic Fruits • Oud • Spices • Florals • Amber"
                    className="bg-white border-slate-300 text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-black">Best For</label>
                  <select
                    value={form.best_for}
                    onChange={(e) => setForm((p) => ({ ...p, best_for: e.target.value }))}
                    className="flex h-9 w-full bg-white border border-slate-300 rounded-lg px-3 text-xs text-black focus:outline-hidden focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Women • Unisex">Women • Unisex</option>
                  </select>
                </div>
              </div>

              {/* Sizes & Pricing Variants */}
              <div className="space-y-3 p-3.5 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-black">Sizes / Variants</div>
                    <p className="text-[11px] text-black font-medium">
                      Offer this fragrance in multiple sizes with independent pricing and stock. Leave empty to sell
                      only at the base price/quantity above.
                    </p>
                  </div>
                  <AdminButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddVariant}
                    className="gap-1.5 shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Size</span>
                  </AdminButton>
                </div>

                {form.variants.length === 0 ? (
                  <div className="text-black text-[11px]">No size variants added yet.</div>
                ) : (
                  <div className="space-y-3">
                    {form.variants.map((variant, index) => (
                      <div key={index} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2.5">
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                          <div className="space-y-1 sm:col-span-1">
                            <label className="block text-[10px] font-semibold text-black">Label *</label>
                            <AdminInput
                              value={variant.name}
                              onChange={(e) => handleVariantChange(index, { name: e.target.value })}
                              placeholder="30ml"
                              className="bg-white border-slate-300 text-black h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-1">
                            <label className="block text-[10px] font-semibold text-black">Size (ml)</label>
                            <AdminInput
                              type="number"
                              min="0"
                              value={variant.size_ml}
                              onChange={(e) => handleVariantChange(index, { size_ml: e.target.value })}
                              placeholder="30"
                              className="bg-white border-slate-300 text-black h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-1">
                            <label className="block text-[10px] font-semibold text-black">Price (₦) *</label>
                            <AdminInput
                              type="number"
                              min="0"
                              step="0.01"
                              value={variant.price}
                              onChange={(e) => handleVariantChange(index, { price: e.target.value })}
                              placeholder="45000"
                              className="bg-white border-slate-300 text-black h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-1">
                            <label className="block text-[10px] font-semibold text-black">Sale Price (₦)</label>
                            <AdminInput
                              type="number"
                              min="0"
                              step="0.01"
                              value={variant.sale_price}
                              onChange={(e) => handleVariantChange(index, { sale_price: e.target.value })}
                              placeholder="Optional"
                              className="bg-white border-slate-300 text-black h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-1">
                            <label className="block text-[10px] font-semibold text-black">Stock</label>
                            <AdminInput
                              type="number"
                              min="0"
                              value={variant.stock_quantity}
                              onChange={(e) => handleVariantChange(index, { stock_quantity: e.target.value })}
                              className="bg-white border-slate-300 text-black h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-1">
                            <label className="block text-[10px] font-semibold text-black">SKU</label>
                            <AdminInput
                              value={variant.sku}
                              onChange={(e) => handleVariantChange(index, { sku: e.target.value })}
                              placeholder="PS-OUD-01-30ML"
                              className="bg-white border-slate-300 text-black h-8 text-xs font-mono"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                          <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-black cursor-pointer">
                            <input
                              type="radio"
                              name="default-variant"
                              checked={variant.is_default}
                              onChange={() => handleSetDefaultVariant(index)}
                              className="h-3.5 w-3.5 cursor-pointer"
                            />
                            <span>Default size (pre-selected on storefront)</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(index)}
                            className="p-1 text-black hover:text-red-700 rounded hover:bg-red-50 transition-colors cursor-pointer"
                            aria-label={`Remove size ${index + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fragrance Notes & Composition */}
              <div className="space-y-3 p-3.5 bg-white border border-slate-200 rounded-xl">
                <div className="font-semibold text-black text-xs">Fragrance Notes & Composition</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-black font-medium text-[11px]">Top Notes</label>
                    <AdminInput
                      value={form.top_notes}
                      onChange={(e) => setForm((p) => ({ ...p, top_notes: e.target.value }))}
                      placeholder="Bergamot, Pink Pepper"
                      className="bg-white border-slate-300 text-black text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-black font-medium text-[11px]">Middle Notes</label>
                    <AdminInput
                      value={form.middle_notes}
                      onChange={(e) => setForm((p) => ({ ...p, middle_notes: e.target.value }))}
                      placeholder="Jasmine, Rose"
                      className="bg-white border-slate-300 text-black text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-black font-medium text-[11px]">Base Notes</label>
                    <AdminInput
                      value={form.base_notes}
                      onChange={(e) => setForm((p) => ({ ...p, base_notes: e.target.value }))}
                      placeholder="Oud, Amber, Musk"
                      className="bg-white border-slate-300 text-black text-xs"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-black font-normal">Separate multiple notes with commas.</p>

                <div className="space-y-1.5">
                  <label className="block text-black font-medium text-[11px]">Short Description</label>
                  <AdminInput
                    value={form.short_description}
                    onChange={(e) => setForm((p) => ({ ...p, short_description: e.target.value }))}
                    placeholder="One-line summary shown in product listings"
                    className="bg-white border-slate-300 text-black text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-black font-medium text-[11px]">Ingredients</label>
                  <textarea
                    value={form.ingredients}
                    onChange={(e) => setForm((p) => ({ ...p, ingredients: e.target.value }))}
                    rows={2}
                    placeholder="Alcohol Denat., Parfum, Aqua..."
                    className="flex w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-black placeholder:text-black focus:outline-hidden focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-black font-medium text-[11px]">How to Use</label>
                  <textarea
                    value={form.how_to_use}
                    onChange={(e) => setForm((p) => ({ ...p, how_to_use: e.target.value }))}
                    rows={2}
                    placeholder="Apply to pulse points after showering..."
                    className="flex w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-black placeholder:text-black focus:outline-hidden focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600"
                  />
                </div>
              </div>

              {/* Additional Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 bg-white border border-slate-200 rounded-xl">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-black">Concentration</label>
                  <AdminInput
                    value={form.concentration}
                    onChange={(e) => setForm((p) => ({ ...p, concentration: e.target.value }))}
                    placeholder="Extrait de Parfum"
                    className="bg-white border-slate-300 text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-black">Volume (ml)</label>
                  <AdminInput
                    type="number"
                    min="0"
                    value={form.volume_ml}
                    onChange={(e) => setForm((p) => ({ ...p, volume_ml: e.target.value }))}
                    placeholder="30"
                    className="bg-white border-slate-300 text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-black">Weight (g)</label>
                  <AdminInput
                    type="number"
                    min="0"
                    value={form.weight_grams}
                    onChange={(e) => setForm((p) => ({ ...p, weight_grams: e.target.value }))}
                    placeholder="120"
                    className="bg-white border-slate-300 text-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-semibold text-black">Barcode</label>
                  <AdminInput
                    value={form.barcode}
                    onChange={(e) => setForm((p) => ({ ...p, barcode: e.target.value }))}
                    placeholder="EAN/UPC"
                    className="bg-white border-slate-300 text-black font-mono"
                  />
                </div>
              </div>

              {/* SEO Engine & Search Metadata */}
              <div className="space-y-3 p-3.5 bg-white border border-slate-200 rounded-xl">
                <div className="font-semibold text-black text-xs flex items-center justify-between">
                  <span>SEO Engine & Search Metadata</span>
                  <span className="text-[10px] text-black font-normal">Search engine indexing</span>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-black font-medium text-[11px]">Meta Title</label>
                  <AdminInput
                    value={form.meta_title}
                    onChange={(e) => setForm((p) => ({ ...p, meta_title: e.target.value }))}
                    placeholder="e.g. Oud Maracuja | Philz Signature Luxury Perfume Oil"
                    className="bg-white border-slate-300 text-black text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-black font-medium text-[11px]">Meta Description</label>
                  <textarea
                    value={form.meta_description}
                    onChange={(e) => setForm((p) => ({ ...p, meta_description: e.target.value }))}
                    rows={2}
                    placeholder="Discover Oud Maracuja by Philz Signature..."
                    className="flex w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-black placeholder:text-black focus:outline-hidden focus:ring-2 focus:ring-slate-600/20 focus:border-slate-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-black font-medium text-[11px]">Search Keywords</label>
                  <AdminInput
                    value={form.meta_keywords}
                    onChange={(e) => setForm((p) => ({ ...p, meta_keywords: e.target.value }))}
                    placeholder="Oud Maracuja, Fruity, Oud, Philz Signature, Luxury perfume"
                    className="bg-white border-slate-300 text-black text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-black">Feature on Storefront Homepage</div>
                    <div className="text-black text-[11px]">Pin this fragrance to the featured highlights section</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))}
                    className="rounded border-slate-400 text-black focus:ring-slate-900 h-4 w-4 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <div className="font-semibold text-black">Bestseller</div>
                    <div className="text-black text-[11px]">Show a "Bestseller" badge on this fragrance</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.is_bestseller}
                    onChange={(e) => setForm((p) => ({ ...p, is_bestseller: e.target.checked }))}
                    className="rounded border-slate-400 text-black focus:ring-slate-900 h-4 w-4 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <div className="font-semibold text-black">New Arrival</div>
                    <div className="text-black text-[11px]">Show a "New" badge on this fragrance</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.is_new_arrival}
                    onChange={(e) => setForm((p) => ({ ...p, is_new_arrival: e.target.checked }))}
                    className="rounded border-slate-400 text-black focus:ring-slate-900 h-4 w-4 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <div className="font-semibold text-black">Trending</div>
                    <div className="text-black text-[11px]">Show a "Trending" badge on this fragrance</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.is_trending}
                    onChange={(e) => setForm((p) => ({ ...p, is_trending: e.target.checked }))}
                    className="rounded border-slate-400 text-black focus:ring-slate-900 h-4 w-4 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <AdminButton type="button" variant="secondary" onClick={closeForm} className="font-medium">
                  Cancel
                </AdminButton>
                <AdminButton
                  type="submit"
                  variant="primary"
                  disabled={isCreating || isUpdating}
                  className="gap-1.5 shadow-xs"
                >
                  {(isCreating || isUpdating) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingProduct ? 'Save Changes' : 'Create Formulation'}</span>
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-md p-6 space-y-4 rounded-2xl shadow-2xl">
            <h3 className="text-lg font-bold text-black">Remove Formulation?</h3>
            <p className="text-xs text-black leading-relaxed">
              This will permanently delete <span className="font-bold text-black">"{deleteTarget.name}"</span> from the database. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <AdminButton
                variant="secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeletingId === deleteTarget.id}
              >
                Cancel
              </AdminButton>
              <AdminButton
                variant="danger"
                onClick={confirmDelete}
                disabled={isDeletingId === deleteTarget.id}
                className="gap-2"
              >
                {isDeletingId === deleteTarget.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Delete Formulation</span>
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
