import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Globe, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminSeo, type SeoDefaults } from '../hooks/useAdminSeo';

export const AdminSeoPage: React.FC = () => {
  const { seo, isLoading, save, isSaving } = useAdminSeo();
  const [form, setForm] = useState<SeoDefaults | null>(null);

  useEffect(() => { setForm(seo); }, [seo]);

  const handleSave = async () => {
    if (!form) return;
    try {
      await save(form);
      toast.success('SEO defaults saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save SEO defaults.');
    }
  };

  if (isLoading || !form) return <PageSkeleton />;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">Search Visibility</span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">SEO & Metadata Engine</h1>
        </div>
        <Button variant="luxury" size="sm" className="gap-1.5" disabled={isSaving} onClick={handleSave}>
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          <span>Save Metadata</span>
        </Button>
      </div>

      <div className="bg-luxury-card border border-luxury-border p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-luxury-border/60 pb-3">
          <Globe className="h-4 w-4 text-luxury-gold" />
          <h3 className="font-serif text-lg text-white font-normal">Global Search Engine Defaults</h3>
        </div>

        <Input
          label="Default Meta Title"
          value={form.meta_title}
          onChange={(e) => setForm((p) => (p ? { ...p, meta_title: e.target.value } : p))}
        />
        <Textarea
          label="Default Meta Description"
          rows={3}
          value={form.meta_description}
          onChange={(e) => setForm((p) => (p ? { ...p, meta_description: e.target.value } : p))}
        />
        <Input
          label="Keywords (comma separated)"
          value={form.keywords}
          onChange={(e) => setForm((p) => (p ? { ...p, keywords: e.target.value } : p))}
        />
      </div>
    </div>
  );
};
