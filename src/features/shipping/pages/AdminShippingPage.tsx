import React, { useState } from 'react';
import { toast } from 'sonner';
import { Truck, Plus, Pencil, Trash2, X, Loader2, Copy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { EnterpriseDataTable, type Column } from '@/components/common/EnterpriseDataTable';
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
  estimated_days: '1-3 Business Days',
  is_active: true,
};

const formatCurrency = (val: number) => `₦${val.toLocaleString()}`;

export const AdminShippingPage: React.FC = () => {
  const {
    methods,
    isLoading,
    isError,
    createMethod,
    isCreating,
    updateMethod,
    isUpdating,
    deleteMethod,
  } = useAdminShipping();

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
      free_threshold: method.free_threshold !== null && method.free_threshold !== undefined ? String(method.free_threshold) : '',
      estimated_days: method.estimated_days || '1-3 Business Days',
      is_active: method.is_active,
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

  const handleDuplicate = async (method: ShippingMethod) => {
    try {
      const copyPayload = {
        name: `${method.name} (Copy)`,
        description: method.description,
        price: method.price,
        free_threshold: method.free_threshold,
        estimated_days: method.estimated_days,
        is_active: false,
      };
      await createMethod(copyPayload);
      toast.success(`Duplicated "${method.name}" as inactive draft.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to duplicate shipping method.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) {
      setFormError('Shipping method name is required.');
      return;
    }

    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('Rate must be 0 (Free) or a positive amount.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: priceNum,
      free_threshold: form.free_threshold ? parseFloat(form.free_threshold) : null,
      estimated_days: form.estimated_days.trim() || null,
      is_active: form.is_active,
    };

    try {
      if (editing) {
        await updateMethod({ id: editing.id, input: payload });
        toast.success(`Shipping method "${payload.name}" updated.`);
      } else {
        await createMethod(payload);
        toast.success(`Shipping method "${payload.name}" created.`);
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
      toast.success(`Shipping method "${deleteTarget.name}" removed.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete shipping method.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const columns: Column<ShippingMethod>[] = [
    {
      key: 'name',
      header: 'Method Name & Coverage',
      accessor: (method: ShippingMethod) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{method.name}</div>
            {method.description && (
              <p className="text-xs text-slate-800 line-clamp-1 max-w-sm">{method.description}</p>
            )}
          </div>
        </div>
      ),
      sortValue: (m: ShippingMethod) => m.name,
    },
    {
      key: 'price',
      header: 'Delivery Rate',
      accessor: (method: ShippingMethod) => (
        <div className="font-bold text-sm text-slate-900">
          {method.price === 0 ? <span className="text-emerald-700">FREE</span> : formatCurrency(method.price)}
        </div>
      ),
      sortValue: (m: ShippingMethod) => m.price,
    },
    {
      key: 'free_threshold',
      header: 'Free Shipping Threshold',
      accessor: (method: ShippingMethod) => (
        <span className="text-xs font-semibold text-slate-700">
          {method.free_threshold ? `Free over ${formatCurrency(method.free_threshold)}` : 'No free threshold'}
        </span>
      ),
      sortValue: (m: ShippingMethod) => m.free_threshold ?? 0,
    },
    {
      key: 'estimated_days',
      header: 'Estimated Transit',
      accessor: (method: ShippingMethod) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-700" />
          <span>{method.estimated_days || '1-3 Business Days'}</span>
        </div>
      ),
      sortValue: (m: ShippingMethod) => m.estimated_days || '',
    },
    {
      key: 'is_active',
      header: 'Status',
      accessor: (method: ShippingMethod) => (
        <span
          className={`inline-flex items-center text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold border ${
            method.is_active
              ? 'text-emerald-800 border-emerald-200 bg-emerald-50'
              : 'text-slate-800 border-slate-200 bg-slate-100'
          }`}
        >
          {method.is_active ? 'Active' : 'Disabled'}
        </span>
      ),
      sortValue: (m: ShippingMethod) => (m.is_active ? 1 : 0),
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (method: ShippingMethod) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => handleDuplicate(method)}
            className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer rounded"
            title="Duplicate Method"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => openEditForm(method)}
            className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer rounded"
            title="Edit Method"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(method)}
            className="p-1.5 text-slate-700 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer rounded"
            title="Delete Method"
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
        icon={<Truck className="h-5 w-5" />}
        title="Unable to Load Shipping Methods"
        description="Shipping methods could not be retrieved from the server. Please retry."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shipping Zones & Rates</h1>
          <p className="text-xs text-slate-700 font-semibold mt-1">
            Configure delivery zones, nationwide flat rates, express couriers, and free shipping triggers.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs cursor-pointer"
          onClick={openCreateForm}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Rate Zone</span>
        </Button>
      </div>

      <EnterpriseDataTable
        data={methods}
        columns={columns}
        keyExtractor={(m) => m.id}
        searchPlaceholder="Search shipping methods by name, coverage or transit days..."
        defaultSortKey="name"
        emptyMessage="No shipping methods found matching your query."
      />

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-lg p-6 space-y-5 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editing ? 'Edit Shipping Method' : 'New Shipping Method'}
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
                  Method Name / Zone <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Lagos Express Courier (Island & Mainland)"
                  className="bg-white border-slate-300 text-slate-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Description / Service Details
                </label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Handled by dedicated courier in climate-controlled transit"
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Delivery Rate (₦) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="3500"
                    className="bg-white border-slate-300 text-slate-900 font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Free Threshold (₦)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={form.free_threshold}
                    onChange={(e) => setForm((p) => ({ ...p, free_threshold: e.target.value }))}
                    placeholder="e.g. 75000"
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Estimated Transit Time <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. 24 - 48 Hours"
                  value={form.estimated_days}
                  onChange={(e) => setForm((p) => ({ ...p, estimated_days: e.target.value }))}
                  className="bg-white border-slate-300 text-slate-900"
                  required
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
                  <span>Active &amp; Selectable at Checkout</span>
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
                  <span>{editing ? 'Save Changes' : 'Create Shipping Method'}</span>
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
            <h3 className="text-lg font-bold text-slate-900">Remove Shipping Method?</h3>
            <p className="text-sm text-slate-800">
              This will permanently delete shipping method <span className="font-semibold text-slate-900">"{deleteTarget.name}"</span>. Customers in this zone will no longer see this option.
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
                <span>Delete Method</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
