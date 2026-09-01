import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { TicketPercent, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
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

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

export const AdminCouponsPage: React.FC = () => {
  const { coupons, isLoading, isError, createCoupon, isCreating, updateCoupon, isUpdating, deleteCoupon } = useAdminCoupons();

  const [editing, setEditing] = useState<Coupon | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<CouponFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const sortedCoupons = useMemo(
    () => [...coupons].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [coupons]
  );

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
      min_spend: coupon.min_spend ? String(coupon.min_spend) : '',
      max_discount: coupon.max_discount ? String(coupon.max_discount) : '',
      usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : '',
      is_active: coupon.is_active,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      code: form.code.trim(),
      discount_type: form.discount_type,
      value: Number(form.value),
      min_spend: form.min_spend ? Number(form.min_spend) : null,
      max_discount: form.max_discount ? Number(form.max_discount) : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: form.is_active,
    };

    try {
      if (editing) {
        await updateCoupon({ id: editing.id, input: payload });
        toast.success('Coupon updated successfully.');
      } else {
        await createCoupon(payload);
        toast.success('Coupon created successfully.');
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
      toast.success(`Coupon "${deleteTarget.code}" was removed.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete coupon.');
    } finally {
      setIsDeletingId(null);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">Promotions Engine</span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">Privilege Coupons</h1>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5" onClick={openCreateForm}>
          <Plus className="h-3.5 w-3.5" />
          <span>New Coupon</span>
        </Button>
      </div>

      {sortedCoupons.length === 0 ? (
        <EmptyState
          icon={<TicketPercent className="h-5 w-5" />}
          title="No Active Coupons"
          description="Create percentage or fixed price discount codes with expiry and minimum spend limits."
          actionLabel="Create First Coupon"
          onAction={openCreateForm}
        />
      ) : (
        <div className="bg-luxury-card border border-luxury-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-luxury-border text-left text-[10px] uppercase tracking-wider text-luxury-muted">
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Discount</th>
                <th className="p-4 font-medium">Min Spend</th>
                <th className="p-4 font-medium">Usage</th>
                <th className="p-4 font-medium">Expires</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCoupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-luxury-border/60 last:border-0 hover:bg-luxury-charcoal/40">
                  <td className="p-4">
                    <div className="font-mono text-white font-semibold">{coupon.code}</div>
                    {coupon.description && <div className="text-[11px] text-luxury-muted">{coupon.description}</div>}
                  </td>
                  <td className="p-4 text-luxury-gold font-medium">
                    {coupon.discount_type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                  </td>
                  <td className="p-4 text-luxury-muted">{coupon.min_spend ? formatCurrency(coupon.min_spend) : '—'}</td>
                  <td className="p-4 text-luxury-muted">
                    {coupon.used_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
                  </td>
                  <td className="p-4 text-luxury-muted text-xs">
                    {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('en-GB') : 'No expiry'}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-medium border ${
                        coupon.is_active
                          ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                          : 'text-luxury-muted border-luxury-border bg-luxury-charcoal'
                      }`}
                    >
                      {coupon.is_active ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => openEditForm(coupon)} className="p-1.5 text-luxury-muted hover:text-luxury-gold transition-colors cursor-pointer" aria-label="Edit coupon">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(coupon)} className="p-1.5 text-luxury-muted hover:text-red-400 transition-colors cursor-pointer" aria-label="Delete coupon">
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
              <h2 className="font-serif text-xl text-white">{editing ? 'Edit Coupon' : 'New Coupon'}</h2>
              <button type="button" onClick={closeForm} className="text-luxury-muted hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && <div className="p-3 bg-red-950/40 border border-red-800/60 text-red-200 text-xs">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Coupon Code"
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  required
                />
                <div className="w-full space-y-1.5">
                  <label className="block text-xs uppercase tracking-luxury text-luxury-cream/70 font-medium">Discount Type</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm((p) => ({ ...p, discount_type: e.target.value as 'percentage' | 'fixed' }))}
                    className="flex h-11 w-full bg-luxury-charcoal/80 border border-luxury-border px-3.5 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/70"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label={form.discount_type === 'percentage' ? 'Discount (%)' : 'Discount (₦)'}
                  type="number"
                  min="0"
                  value={form.value}
                  onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                  required
                />
                <Input
                  label="Min Spend (₦)"
                  type="number"
                  min="0"
                  value={form.min_spend}
                  onChange={(e) => setForm((p) => ({ ...p, min_spend: e.target.value }))}
                />
                <Input
                  label="Max Discount (₦)"
                  type="number"
                  min="0"
                  value={form.max_discount}
                  onChange={(e) => setForm((p) => ({ ...p, max_discount: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Usage Limit"
                  type="number"
                  min="0"
                  value={form.usage_limit}
                  onChange={(e) => setForm((p) => ({ ...p, usage_limit: e.target.value }))}
                />
                <Input
                  label="Expires On"
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm((p) => ({ ...p, expires_at: e.target.value }))}
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-luxury-muted cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="accent-luxury-gold" />
                <span>Active</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-luxury-border">
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                <Button type="submit" variant="luxury" disabled={isCreating || isUpdating} className="gap-2">
                  {(isCreating || isUpdating) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editing ? 'Save Changes' : 'Create Coupon'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-luxury-card border border-luxury-border w-full max-w-md p-6 space-y-5 rounded">
            <h3 className="font-serif text-lg text-white">Remove Coupon?</h3>
            <p className="text-sm text-luxury-muted">
              This will permanently delete <span className="text-white">"{deleteTarget.code}"</span>. This action cannot be undone.
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
