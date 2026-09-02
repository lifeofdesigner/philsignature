import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminSettings, type GeneralSettingsForm } from '../hooks/useAdminSettings';

export const AdminSettingsPage: React.FC = () => {
  const { values, isLoading, save, isSaving } = useAdminSettings();
  const [form, setForm] = useState<GeneralSettingsForm | null>(null);

  useEffect(() => { setForm(values); }, [values]);

  const handleSave = async () => {
    if (!form) return;
    try {
      await save(form);
      toast.success('Store settings saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings.');
    }
  };

  if (isLoading || !form) return <PageSkeleton />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Global Boutique Preferences
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">Store Settings</h1>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5" disabled={isSaving} onClick={handleSave}>
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          <span>Save Changes</span>
        </Button>
      </div>

      <div className="bg-luxury-card border border-luxury-border p-6 space-y-6">
        <h3 className="font-serif text-lg text-white font-normal border-b border-luxury-border/60 pb-3">
          Brand & Identity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Store Name"
            value={form.store_name}
            onChange={(e) => setForm((p) => (p ? { ...p, store_name: e.target.value } : p))}
          />
          <Input
            label="Official Slogan"
            value={form.store_slogan}
            onChange={(e) => setForm((p) => (p ? { ...p, store_slogan: e.target.value } : p))}
          />
          <Input
            label="Contact Email"
            value={form.concierge_email}
            onChange={(e) => setForm((p) => (p ? { ...p, concierge_email: e.target.value } : p))}
          />
          <Input
            label="Boutique Phone"
            value={form.concierge_phone}
            onChange={(e) => setForm((p) => (p ? { ...p, concierge_phone: e.target.value } : p))}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Primary Currency Code"
            value={form.currency_code}
            onChange={(e) => setForm((p) => (p ? { ...p, currency_code: e.target.value } : p))}
          />
          <Input
            label="Currency Symbol"
            value={form.currency_symbol}
            onChange={(e) => setForm((p) => (p ? { ...p, currency_symbol: e.target.value } : p))}
          />
        </div>
      </div>
    </div>
  );
};
