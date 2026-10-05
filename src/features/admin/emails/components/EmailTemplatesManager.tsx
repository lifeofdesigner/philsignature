import React, { useState, useMemo } from 'react';
import {
  Mail,
  Search,
  Eye,
  Edit3,
  Users,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdminSwitch } from '@/components/admin-ui';
import { toast } from 'sonner';
import type { EmailTemplate } from '@/types/database';
import { useAdminEmailTemplates } from '../hooks/useAdminEmailTemplates';
import { DEFAULT_EMAIL_TEMPLATES } from '../emailTemplateDefaults';
import { EmailTemplateEditorModal } from './EmailTemplateEditorModal';
import { EmailTemplatePreviewModal } from './EmailTemplatePreviewModal';

export const EmailTemplatesManager: React.FC = () => {
  const {
    templates,
    isLoading,
    isError,
    refetch,
    updateTemplate,
    isUpdating,
    resetTemplate,
    isResetting,
    toggleActive,
  } = useAdminEmailTemplates();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'customer' | 'admin'>('all');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<EmailTemplate | null>(null);

  // Group and merge with defaults to ensure complete list and metadata
  const enrichedTemplates = useMemo(() => {
    return templates.map((template) => {
      const defaultConfig = DEFAULT_EMAIL_TEMPLATES.find((t) => t.template_key === template.template_key);
      return {
        ...template,
        category: defaultConfig?.category || (template.template_key.startsWith('admin_') ? 'admin' : 'customer'),
        description: defaultConfig?.description || 'Transactional notification template',
      };
    });
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return enrichedTemplates.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.template_key.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' || t.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [enrichedTemplates, searchQuery, categoryFilter]);

  const customerCount = enrichedTemplates.filter((t) => t.category === 'customer').length;
  const adminCount = enrichedTemplates.filter((t) => t.category === 'admin').length;

  const handleToggleActive = async (template: EmailTemplate, currentActive: boolean) => {
    try {
      await toggleActive({
        id: template.id,
        isActive: !currentActive,
        templateKey: template.template_key,
      });
      toast.success(
        `Template "${template.name}" is now ${!currentActive ? 'Active' : 'Disabled'}.`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle status.');
    }
  };

  const handleSaveTemplate = async (
    id: string,
    updates: { subject: string; html_body: string; is_active: boolean }
  ) => {
    await updateTemplate({ id, updates });
  };

  const handleResetTemplate = async (id: string, templateKey: string) => {
    await resetTemplate({ id, templateKey });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-black flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-700" />
                <span>Transactional Email Template Engine</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  {enrichedTemplates.length} Templates
                </span>
              </CardTitle>
              <CardDescription className="text-black font-medium mt-1">
                Customize client receipts, dispatch dispatches, authentication challenges, and administrative notifications directly without modifying codebase.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => refetch()}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Refresh templates from database"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Controls: Search & Category Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
            {/* Category tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-fit text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-white text-black shadow-xs font-bold'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                All ({enrichedTemplates.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('customer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  categoryFilter === 'customer'
                    ? 'bg-white text-black shadow-xs font-bold'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                <Users className="h-3.5 w-3.5 text-slate-500" />
                <span>Customer ({customerCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  categoryFilter === 'admin'
                    ? 'bg-white text-black shadow-xs font-bold'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
                <span>Admin Alerts ({adminCount})</span>
              </button>
            </div>

            {/* Search input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates or subjects..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-black focus:outline-hidden focus:border-slate-400 focus:bg-white placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Loading / Error States */}
          {isLoading && (
            <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
              <span>Loading email templates...</span>
            </div>
          )}

          {isError && (
            <div className="p-6 rounded-lg bg-red-50 border border-red-200 text-center text-xs text-red-700">
              Failed to load email templates from database. Please check your Supabase connection.
            </div>
          )}

          {/* Templates Grid / List */}
          {!isLoading && !isError && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => {
                const isActive = template.is_active ?? true;
                const isCustomer = template.category === 'customer';

                return (
                  <div
                    key={template.id}
                    className="group rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all p-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar: Category Pill & Status Toggle */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                              isCustomer
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-purple-50 text-purple-800 border-purple-200'
                            }`}
                          >
                            {isCustomer ? 'Customer' : 'Admin Alert'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {template.template_key}
                          </span>
                        </div>

                        {/* Active Switch */}
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[11px] font-semibold ${
                              isActive ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                          >
                            {isActive ? 'Active' : 'Disabled'}
                          </span>
                          <AdminSwitch
                            checked={isActive}
                            onCheckedChange={() => handleToggleActive(template, isActive)}
                          />
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h4 className="text-sm font-bold text-black group-hover:text-[#DC2626] transition-colors">
                        {template.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {template.description}
                      </p>

                      {/* Subject Preview Card */}
                      <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                        <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                          Subject Line
                        </div>
                        <div className="text-xs text-black font-semibold truncate font-mono">
                          {template.subject}
                        </div>
                      </div>

                      {/* Variables count & Last updated */}
                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-[#DC2626]" />
                          <span>
                            {Array.isArray(template.variables) ? template.variables.length : 0} variables
                          </span>
                        </span>
                        {template.updated_at && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-600">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Updated {new Date(template.updated_at).toLocaleDateString()}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewingTemplate(template)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingTemplate(template)}
                        className="px-3.5 py-1.5 text-xs rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-white" />
                        <span>Edit Template</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && filteredTemplates.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-500">
              No email templates match "{searchQuery}".
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor Modal */}
      {editingTemplate && (
        <EmailTemplateEditorModal
          isOpen={Boolean(editingTemplate)}
          onClose={() => setEditingTemplate(null)}
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onReset={handleResetTemplate}
          isSaving={isUpdating}
          isResetting={isResetting}
        />
      )}

      {/* Standalone Preview Modal */}
      {previewingTemplate && (
        <EmailTemplatePreviewModal
          isOpen={Boolean(previewingTemplate)}
          onClose={() => setPreviewingTemplate(null)}
          templateKey={previewingTemplate.template_key}
          templateName={previewingTemplate.name}
          subject={previewingTemplate.subject}
          htmlBody={previewingTemplate.html_body}
        />
      )}
    </div>
  );
};
