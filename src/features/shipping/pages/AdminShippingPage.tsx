import React, { useState } from 'react';
import { toast } from 'sonner';
import { Truck, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminShipping } from '../hooks/useAdminShipping';
import type { ShippingMethod } from '@/types/database';

interface MethodFormState {
  name: string;
  description: string;
  price: string;
  free_threshold: string;
  estimated_days: string;
  is_active: boolean;
}

const emptyForm: MethodFormState = {
  name: '',
  description: '',
  price: '',
  free_threshold: '',
  estimated_days: '',
  is_active: true,
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

export const AdminShippingPage: React.FC = () => {
  const { methods, isLoading, isError, createMethod, isCreating, updateMethod, isUpdating, deleteMethod } = useAdminShipping();

  const [editing, setEditing] = useState<ShippingMethod | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<MethodFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShippingMethod | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const openCreateForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (method: ShippingMethod) => {
    setEditing(method);
    setForm({
      name: method.name,
      description: method.description || '',
      price: String(method.price),
      free_threshold: method.free_threshold ? String(method.free_threshold) : '',
      estimated_days: method.estimated_days || '',
      is_active: method.is_active,
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
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      free_threshold: form.free_threshold ? Number(form.free_threshold) : null,
      estimated_days: form.estimated_days.trim(),
      is_active: form.is_active,
    };

    try {
      if (editing) {
        await updateMethod({ id: editing.id, input: payload });
        toast.success('Shipping method updated successfully.');
      } else {
        await createMethod(payload);
        toast.success('Shipping method created successfully.');
      }
      closeForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save shipping method.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeletingId(deleteTarget.id);
    try {
      await deleteMethod(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" was removed.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete shipping method.');
    } finally {
      setIsDeletingId(null);
    }
  };

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={<Truck className="h-5 w-5" />}
        title="Unable to Load Shipping Methods"
        description="Shipping methods could not be retrieved from Supabase. Please retry."
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Logistics & Delivery
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">Shipping Methods</h1>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5" onClick={openCreateForm}>
          <Plus className="h-3.5 w-3.5" />
          <span>Add Delivery Method</span>
        </Button>
      </div>

      {methods.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-5 w-5" />}
          title="No Shipping Methods Configured"
          description="Create delivery options with flat rates, free thresholds, and transit estimates."
          actionLabel="Create First Method"
          onAction={openCreateForm}
        />
      ) : (
        <div className="space-y-4">
          {methods.map((method) => (
            <div key={method.id} className="bg-luxury-card border border-luxury-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-luxury-gold" />
                  <div>
                    <h3 className="font-serif text-lg text-white font-normal">{method.name}</h3>
                    {method.description && <p className="text-xs text-luxury-muted">{method.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-medium border ${
                      method.is_active
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : 'text-luxury-muted border-luxury-border bg-luxury-charcoal'
                    }`}
                  >
                    {method.is_active ? 'active' : 'inactive'}
                  </span>
                  <button type="button" onClick={() => openEditForm(method)} className="p-1.5 text-luxury-muted hover:text-luxury-gold transition-colors cursor-pointer" aria-label="Edit shipping method">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(method)} className="p-1.5 text-luxury-muted hover:text-red-400 transition-colors cursor-pointer" aria-label="Delete shipping method">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Rate</span>
                  <span className="text-luxury-gold font-medium">{formatCurrency(method.price)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Free Threshold</span>
                  <span className="text-white">{method.free_threshold ? formatCurrency(method.free_threshold) : '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-luxury-muted uppercase tracking-wider block">Transit Estimate</span>
                  <span className="text-white">{method.estimated_days}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-luxury-card border border-luxury-border w-full max-w-lg p-6 space-y-5 rounded max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-luxury-border pb-4">
              <h2 className="font-serif text-xl text-white">{editing ? 'Edit Shipping Method' : 'New Shipping Method'}</h2>
              <button type="button" onClick={closeForm} className="text-luxury-muted hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && <div className="p-3 bg-red-950/40 border border-red-800/60 text-red-200 text-xs">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Method Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              <Input label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Rate (₦)"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  required
                />
                <Input
                  label="Free Threshold (₦)"
                  type="number"
                  min="0"
                  value={form.free_threshold}
                  onChange={(e) => setForm((p) => ({ ...p, free_threshold: e.target.value }))}
                />
              </div>

              <Input
                label="Transit Estimate"
                placeholder="2-4 Business Days"
                value={form.estimated_days}
                onChange={(e) => setForm((p) => ({ ...p, estimated_days: e.target.value }))}
                required
              />

              <label className="flex items-center gap-2 text-xs text-luxury-muted cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="accent-luxury-gold" />
                <span>Active</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-luxury-border">
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                <Button type="submit" variant="luxury" disabled={isCreating || isUpdating} className="gap-2">
                  {(isCreating || isUpdating) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editing ? 'Save Changes' : 'Create Method'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-luxury-card border border-luxury-border w-full max-w-md p-6 space-y-5 rounded">
            <h3 className="font-serif text-lg text-white">Remove Shipping Method?</h3>
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
