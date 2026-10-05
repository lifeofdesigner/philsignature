import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Eye,
  Loader2,
  Copy,
  Info,
  Check,
  Code,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminButton, AdminSwitch } from '@/components/admin-ui';
import type { EmailTemplate } from '@/types/database';
import { DEFAULT_EMAIL_TEMPLATES } from '../emailTemplateDefaults';
import { EmailTemplatePreviewModal } from './EmailTemplatePreviewModal';

export interface EmailTemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate | null;
  onSave: (
    id: string,
    updates: { subject: string; html_body: string; is_active: boolean }
  ) => Promise<void>;
  onReset: (id: string, templateKey: string) => Promise<void>;
  isSaving: boolean;
  isResetting: boolean;
}

export const EmailTemplateEditorModal: React.FC<EmailTemplateEditorModalProps> = ({
  isOpen,
  onClose,
  template,
  onSave,
  onReset,
  isSaving,
  isResetting,
}) => {
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (template) {
      setSubject(template.subject || '');
      setHtmlBody(template.html_body || '');
      setIsActive(template.is_active ?? true);
      setShowResetConfirm(false);
    }
  }, [template]);

  if (!isOpen || !template) return null;

  const defaultConfig = DEFAULT_EMAIL_TEMPLATES.find((t) => t.template_key === template.template_key);
  const availableVariables = Array.isArray(template.variables) && template.variables.length > 0
    ? template.variables
    : defaultConfig?.variables || [];

  const handleInsertVariable = (variableName: string) => {
    const placeholder = `{{${variableName}}}`;
    const textarea = textareaRef.current;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + placeholder + text.substring(end);
      setHtmlBody(newText);

      // Restore focus and move cursor
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    } else {
      setHtmlBody((prev) => prev + placeholder);
    }

    navigator.clipboard.writeText(placeholder).catch(() => {});
    setCopiedVariable(variableName);
    toast.success(`Inserted & copied ${placeholder}`);
    setTimeout(() => setCopiedVariable(null), 1500);
  };

  const handleSave = async () => {
    if (!subject.trim()) {
      toast.error('Subject line cannot be empty.');
      return;
    }
    if (!htmlBody.trim()) {
      toast.error('Email HTML body cannot be empty.');
      return;
    }

    try {
      await onSave(template.id, {
        subject: subject.trim(),
        html_body: htmlBody.trim(),
        is_active: isActive,
      });
      toast.success('Email template updated successfully.');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save template.');
    }
  };

  const handleReset = async () => {
    try {
      await onReset(template.id, template.template_key);
      const restored = DEFAULT_EMAIL_TEMPLATES.find((t) => t.template_key === template.template_key);
      if (restored) {
        setSubject(restored.subject);
        setHtmlBody(restored.html_body);
        setIsActive(true);
      }
      setShowResetConfirm(false);
      toast.success('Template restored to default preset.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset template.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
        <div className="relative w-full max-w-5xl bg-stone-900 border border-stone-800 rounded-xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/90">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Code className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-stone-100">{template.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-amber-400 border border-stone-700">
                    {template.template_key}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {defaultConfig?.description || 'Transactional notification template'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Active Toggle */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800/80 border border-stone-700/80">
                <span className="text-xs font-semibold text-stone-300">
                  {isActive ? 'Active' : 'Disabled'}
                </span>
                <AdminSwitch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-stone-900">
            {/* Subject Line Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-200 tracking-wide flex items-center justify-between">
                <span>Subject Line</span>
                <span className="text-[10px] text-stone-400 font-normal">
                  Supports variable placeholders e.g. &#123;&#123;order_number&#125;&#125;
                </span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Order Received: #{{order_number}} — Philz Signature"
                className="w-full px-3.5 py-2.5 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-medium placeholder:text-stone-600"
              />
            </div>

            {/* Available Variables Chips */}
            <div className="space-y-2 p-3.5 rounded-lg bg-stone-950/60 border border-stone-800">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-300">
                <span className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                  <Tag className="h-3.5 w-3.5" />
                  Available Placeholders
                </span>
                <span className="text-[10px] text-stone-400 font-normal">
                  Click any chip to copy and insert at cursor
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {availableVariables.map((v) => {
                  const isCopied = copiedVariable === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleInsertVariable(v)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer border ${
                        isCopied
                          ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                          : 'bg-stone-800/90 text-amber-300 border-stone-700 hover:border-amber-500/60 hover:bg-stone-800'
                      }`}
                      title={`Click to insert {{${v}}}`}
                    >
                      {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 text-stone-400" />}
                      <span>&#123;&#123;{v}&#125;&#125;</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rich HTML Body Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-200 tracking-wide flex items-center gap-2">
                  <span>HTML Email Body</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-400 font-normal">
                    Dark theme HTML editor
                  </span>
                </label>
                <div className="text-[11px] text-stone-400 flex items-center gap-1">
                  <Info className="h-3 w-3 text-amber-400" />
                  <span>The luxury header, branding &amp; footer are automatically wrapped around this body</span>
                </div>
              </div>

              {/* Editor Container */}
              <div className="rounded-lg border border-stone-700 bg-stone-950 overflow-hidden focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500">
                <div className="flex items-center justify-between px-3 py-1.5 bg-stone-900 border-b border-stone-800 text-[11px] text-stone-400">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-amber-400 uppercase">HTML &bull; UTF-8</span>
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {htmlBody.length.toLocaleString()} characters
                  </span>
                </div>
                <textarea
                  ref={textareaRef}
                  value={htmlBody}
                  onChange={(e) => setHtmlBody(e.target.value)}
                  rows={15}
                  spellCheck={false}
                  placeholder="Enter semantic HTML for the email body..."
                  className="w-full p-4 bg-stone-950 text-stone-200 font-mono text-xs leading-relaxed resize-y focus:outline-hidden selection:bg-amber-500 selection:text-stone-950"
                  style={{ minHeight: '320px', tabSize: 2 }}
                />
              </div>
            </div>

            {/* Reset Confirmation Alert */}
            {showResetConfirm && (
              <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/80 text-xs text-red-200 flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-red-300">Reset template to factory defaults?</div>
                    <div className="text-[11px] text-red-300/80 mt-0.5">
                      This will discard all your customized edits and restore the official Philz Signature default content.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 text-xs rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isResetting}
                    className="px-3 py-1 text-xs rounded-md bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    {isResetting ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                    Confirm Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-stone-800 bg-stone-950">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Reset to Default */}
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                disabled={isResetting || isSaving}
                className="px-3 py-2 text-xs rounded-lg border border-stone-700 bg-stone-900 text-stone-300 hover:bg-stone-800 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 text-stone-400" />
                <span>Reset to Default</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* Preview Button */}
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-4 py-2 text-xs rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Live Preview</span>
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-xs rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {/* Save Button */}
              <AdminButton
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || isResetting}
                className="gap-1.5 shadow-md px-5"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Save Changes</span>
              </AdminButton>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Live Preview Modal */}
      <EmailTemplatePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        templateKey={template.template_key}
        templateName={template.name}
        subject={subject}
        htmlBody={htmlBody}
      />
    </>
  );
};
