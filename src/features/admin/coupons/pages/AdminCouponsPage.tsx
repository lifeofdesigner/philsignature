import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { TicketPercent, Plus, Pencil, Trash2, X, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { EnterpriseDataTable, type Column } from '@/components/common/EnterpriseDataTable';
import { useAdminCoupons } from '../hooks/useAdminCoupons';
import type { Coupon } from '@/types/database';

interface CouponFormState {
  code: string;
  discount_type: 'percentage' | 'fixed';
  value: string;
  min_spend: string;
  max_discount: string;
  usage_limit: string;
  expires_at: string;
  is_active: boolean;
}

const emptyForm: CouponFormState = {
  code: '',
  discount_type: 'percentage',
  value: '',
  min_spend: '',
  max_discount: '',
  usage_limit: '',
  expires_at: '',
  is_active: true,
};

const formatCurrency = (val: number) => `₦${val.toLocaleString()}`;

export const AdminCouponsPage: React.FC = () => {
  const {
    coupons,
    isLoading,
    isError,
    createCoupon,
    isCreating,
    updateCoupon,
    isUpdating,
    deleteCoupon,
  } = useAdminCoupons();

  const [search, setSearch] = useState('');
  const [discountTypeFilter, setDiscountTypeFilter] = useState<'all' | 'percentage' | 'fixed'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<CouponFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase().trim());
      const matchesType = discountTypeFilter === 'all' || c.discount_type === discountTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [coupons, search, discountTypeFilter]);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openCreateForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (coupon: Coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      value: String(coupon.value),
      min_spend: coupon.min_spend !== null && coupon.min_spend !== undefined ? String(coupon.min_spend) : '',
      max_discount: coupon.max_discount !== null && coupon.max_discount !== undefined ? String(coupon.max_discount) : '',
      usage_limit: coupon.usage_limit !== null && coupon.usage_limit !== undefined ? String(coupon.usage_limit) : '',
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : '',
      is_active: coupon.is_active,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.code.trim()) {
      setFormError('Coupon code is required.');
      return;
    }

    const numericVal = parseFloat(form.value);
    if (isNaN(numericVal) || numericVal <= 0) {
      setFormError('Discount value must be greater than 0.');
      return;
    }

    if (form.discount_type === 'percentage' && numericVal > 100) {
      setFormError('Percentage discount cannot exceed 100%.');
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      value: numericVal,
      min_spend: form.min_spend ? parseFloat(form.min_spend) : null,
      max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit, 10) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: form.is_active,
    };

    try {
      if (editing) {
        await updateCoupon({ id: editing.id, input: payload });
        toast.success(`Coupon "${payload.code}" updated successfully.`);
      } else {
        await createCoupon(payload);
        toast.success(`Coupon "${payload.code}" created.`);
      }
      closeForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save coupon.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeletingId(deleteTarget.id);
    try {
      await deleteCoupon(deleteTarget.id);
      toast.success(`Coupon "${deleteTarget.code}" removed.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete coupon.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const columns: Column<Coupon>[] = [
    {
      key: 'code',
      header: 'Coupon Code',
      accessor: (coupon: Coupon) => (
        <div className="flex items-center gap-2">
          <div className="font-mono text-sm font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
            {coupon.code}
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(coupon.code)}
            className="p-1 text-slate-700 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
            title="Copy Code"
          >
            {copiedCode === coupon.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      ),
      sortValue: (c: Coupon) => c.code,
    },
    {
      key: 'value',
      header: 'Discount Benefit',
      accessor: (coupon: Coupon) => (
        <div>
          <span className="font-bold text-amber-900 text-sm">
            {coupon.discount_type === 'percentage' ? `${coupon.value}% OFF` : `${formatCurrency(coupon.value)} OFF`}
          </span>
          {coupon.max_discount && (
            <p className="text-[11px] text-slate-700">Max cap: {formatCurrency(coupon.max_discount)}</p>
          )}
        </div>
      ),
      sortValue: (c: Coupon) => c.value,
    },
    {
      key: 'min_spend',
      header: 'Min Spend',
      accessor: (coupon: Coupon) => (
        <span className="text-slate-700 text-xs font-medium">
          {coupon.min_spend ? formatCurrency(coupon.min_spend) : 'No minimum'}
        </span>
      ),
      sortValue: (c: Coupon) => c.min_spend ?? 0,
    },
    {
      key: 'used_count',
      header: 'Usage & Limit',
      accessor: (coupon: Coupon) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-900">{coupon.used_count || 0}</span>
          <span className="text-slate-700"> {coupon.usage_limit ? `/ ${coupon.usage_limit} redeemed` : 'redeemed (unlimited)'}</span>
        </div>
      ),
      sortValue: (c: Coupon) => c.used_count ?? 0,
    },
    {
      key: 'expires_at',
      header: 'Expiration',
      accessor: (coupon: Coupon) => {
        if (!coupon.expires_at) {
          return <span className="text-xs text-slate-700 font-medium">Never expires</span>;
        }
        const isExpired = new Date(coupon.expires_at).getTime() < Date.now();
        return (
          <span className={`text-xs font-medium ${isExpired ? 'text-red-600 font-semibold' : 'text-slate-700'}`}>
            {new Date(coupon.expires_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
            {isExpired && ' (Expired)'}
          </span>
        );
      },
      sortValue: (c: Coupon) => c.expires_at ? new Date(c.expires_at).getTime() : 0,
    },
    {
      key: 'is_active',
      header: 'Status',
      accessor: (coupon: Coupon) => (
        <span
          className={`inline-flex items-center text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold border ${
            coupon.is_active
              ? 'text-emerald-800 border-emerald-200 bg-emerald-50'
              : 'text-slate-800 border-slate-200 bg-slate-100'
          }`}
        >
          {coupon.is_active ? 'Active' : 'Disabled'}
        </span>
      ),
      sortValue: (c: Coupon) => (c.is_active ? 1 : 0),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (coupon: Coupon) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => openEditForm(coupon)}
            className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer rounded"
            title="Edit Coupon"
            aria-label="Edit coupon"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(coupon)}
            className="p-1.5 text-slate-700 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer rounded"
            title="Delete Coupon"
            aria-label="Delete coupon"
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
        icon={<TicketPercent className="h-5 w-5" />}
        title="Unable to Load Coupons"
        description="Coupons could not be retrieved from Supabase. Please retry."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Privilege Coupons &amp; Discounts</h1>
          <p className="text-xs text-slate-700 font-semibold mt-1">
            Configure promotional percentage discounts, fixed reductions, minimum order thresholds, and expiry limits.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs cursor-pointer"
          onClick={openCreateForm}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Coupon</span>
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-2xs">
        <Input
          placeholder="Search by coupon code (e.g. LUXURY10)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md bg-white border-slate-300 text-slate-900 text-xs"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-700 font-medium">Type:</span>
          <select
            value={discountTypeFilter}
            onChange={(e) => setDiscountTypeFilter(e.target.value as 'all' | 'percentage' | 'fixed')}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600"
          >
            <option value="all">All Discount Types</option>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (₦)</option>
          </select>
        </div>
      </div>

      <EnterpriseDataTable
        data={filteredCoupons}
        columns={columns}
        keyExtractor={(c) => c.id}
        searchPlaceholder="Search coupons by code..."
        defaultSortKey="code"
        emptyMessage="No promotional coupons found matching your query."
      />

      {/* High-contrast SaaS Create/Edit Coupon Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-2xl p-6 space-y-5 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editing ? 'Edit Privilege Coupon' : 'Create New Coupon'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Coupon Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. EXCLUSIVE15"
                    className="bg-white border-slate-300 text-slate-900 font-mono font-bold uppercase"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.discount_type}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, discount_type: e.target.value as 'percentage' | 'fixed' }))
                    }
                    className="flex h-10 w-full rounded-lg bg-white border border-slate-300 px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 font-medium"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed Amount (₦)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    {form.discount_type === 'percentage' ? 'Discount Rate (%)' : 'Discount Amount (₦)'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={form.value}
                    onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                    placeholder={form.discount_type === 'percentage' ? '15' : '5000'}
                    className="bg-white border-slate-300 text-slate-900 font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Min Spend (₦)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={form.min_spend}
                    onChange={(e) => setForm((p) => ({ ...p, min_spend: e.target.value }))}
                    placeholder="e.g. 50000"
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Max Discount Cap (₦)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={form.max_discount}
                    onChange={(e) => setForm((p) => ({ ...p, max_discount: e.target.value }))}
                    placeholder="e.g. 20000"
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Usage Limit (Redemptions)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={form.usage_limit}
                    onChange={(e) => setForm((p) => ({ ...p, usage_limit: e.target.value }))}
                    placeholder="Leave empty for unlimited"
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Expiration Date
                  </label>
                  <Input
                    type="date"
                    value={form.expires_at}
                    onChange={(e) => setForm((p) => ({ ...p, expires_at: e.target.value }))}
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 text-sm text-slate-900 font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                    className="w-4 h-4 text-slate-900 rounded border-slate-400 focus:ring-slate-900 cursor-pointer"
                  />
                  <span>Active &amp; Eligible for Checkout Application</span>
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
                  <span>{editing ? 'Save Changes' : 'Create Coupon'}</span>
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
            <h3 className="text-lg font-bold text-slate-900">Remove Privilege Coupon?</h3>
            <p className="text-sm text-slate-800">
              This will permanently delete coupon code <span className="font-semibold text-slate-900 font-mono">"{deleteTarget.code}"</span>. Customers will no longer be able to claim this discount.
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
                <span>Delete Coupon</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
