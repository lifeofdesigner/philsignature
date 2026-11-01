import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Eye,
  Loader2,
  Copy,
  Info,
  Check,
  Tag,
  AlertTriangle,
  Code2,
  PenLine,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Heading2,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import { AdminButton, AdminSwitch } from '@/components/admin-ui';
import type { EmailTemplate } from '@/types/database';
import { DEFAULT_EMAIL_TEMPLATES } from '../emailTemplateDefaults';
import { EmailTemplatePreviewModal } from './EmailTemplatePreviewModal';
import {
  validateTemplatePlaceholders,
  getRequiredVariables,
  UNIVERSAL_SYSTEM_VARIABLES,
} from '../placeholderValidation';

export interface EmailTemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate | null;
  isCreateMode?: boolean;
  onSave: (
    id: string,
    updates: { subject: string; html_body: string; is_active: boolean }
  ) => Promise<void>;
  onCreate?: (newTemplate: {
    template_key: string;
    name: string;
    subject: string;
    html_body: string;
    variables: string[];
    is_active: boolean;
  }) => Promise<void>;
  onReset: (id: string, templateKey: string) => Promise<void>;
  isSaving: boolean;
  isResetting: boolean;
}

type EditorTab = 'visual' | 'html';

const ToolbarButton: React.FC<{
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ active, onClick, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
      active ? 'bg-[#C5A880] text-[#111111]' : 'text-[#374151] hover:bg-[#F5F5F5]'
    }`}
  >
    {children}
  </button>
);

export const EmailTemplateEditorModal: React.FC<EmailTemplateEditorModalProps> = ({
  isOpen,
  onClose,
  template,
  isCreateMode = false,
  onSave,
  onCreate,
  onReset,
  isSaving,
  isResetting,
}) => {
  const [name, setName] = useState('');
  const [templateKey, setTemplateKey] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [customVariables, setCustomVariables] = useState<string[]>([]);
  const [newVariableInput, setNewVariableInput] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('visual');

  const skipNextEditorSync = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    content: htmlBody,
    onUpdate: ({ editor }) => {
      skipNextEditorSync.current = true;
      setHtmlBody(editor.getHTML());
    },
  });

  useEffect(() => {
    if (isCreateMode) {
      setName('');
      setTemplateKey('');
      setSubject('');
      setHtmlBody('<p>Dear {{customer_name}},</p><p>We are pleased to inform you about your order #{{order_number}}.</p>');
      setIsActive(true);
      setCustomVariables(['order_number', 'customer_name', 'total_amount']);
      setShowResetConfirm(false);
      setActiveTab('visual');
    } else if (template) {
      setName(template.name || '');
      setTemplateKey(template.template_key || '');
      setSubject(template.subject || '');
      setHtmlBody(template.html_body || '');
      setIsActive(template.is_active ?? true);
      setCustomVariables(Array.isArray(template.variables) ? template.variables : []);
      setShowResetConfirm(false);
      setActiveTab('visual');
    }
  }, [template, isCreateMode]);

  // Keep the visual editor in sync when html_body changes from outside tiptap
  useEffect(() => {
    if (!editor) return;
    if (skipNextEditorSync.current) {
      skipNextEditorSync.current = false;
      return;
    }
    if (editor.getHTML() !== htmlBody) {
      editor.commands.setContent(htmlBody);
    }
  }, [htmlBody, editor, activeTab]);

  const defaultConfig = useMemo(
    () => DEFAULT_EMAIL_TEMPLATES.find((t) => t.template_key === templateKey),
    [templateKey]
  );

  const availableVariables = useMemo(() => {
    if (isCreateMode) {
      return customVariables;
    }
    if (Array.isArray(template?.variables) && template.variables.length > 0) {
      return template.variables;
    }
    return defaultConfig?.variables || customVariables;
  }, [isCreateMode, template, defaultConfig, customVariables]);

  const requiredVariables = useMemo(() => {
    return getRequiredVariables(templateKey, availableVariables);
  }, [templateKey, availableVariables]);

  // Real-time placeholder validation
  const validation = useMemo(() => {
    return validateTemplatePlaceholders({
      subject,
      htmlBody,
      availableVariables,
      templateKey,
      explicitRequiredVariables: requiredVariables,
    });
  }, [subject, htmlBody, availableVariables, templateKey, requiredVariables]);

  if (!isOpen) return null;
  if (!isCreateMode && !template) return null;

  const handleInsertVariable = (variableName: string) => {
    const placeholder = `{{${variableName}}}`;

    if (activeTab === 'visual' && editor) {
      editor.chain().focus().insertContent(placeholder).run();
    } else {
      setHtmlBody((prev) => prev + placeholder);
    }

    navigator.clipboard.writeText(placeholder).catch(() => {});
    setCopiedVariable(variableName);
    toast.success(`Inserted & copied ${placeholder}`);
    setTimeout(() => setCopiedVariable(null), 1500);
  };

  const handleAddCustomVariable = () => {
    const cleaned = newVariableInput.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleaned) return;
    if (customVariables.includes(cleaned)) {
      toast.error(`Variable {{${cleaned}}} already exists.`);
      return;
    }
    setCustomVariables((prev) => [...prev, cleaned]);
    setNewVariableInput('');
    toast.success(`Added variable: {{${cleaned}}}`);
  };

  const handleSave = async () => {
    if (isCreateMode) {
      if (!name.trim()) {
        toast.error('Template name is required.');
        return;
      }
      if (!templateKey.trim()) {
        toast.error('Template key is required.');
        return;
      }
    }

    if (!subject.trim()) {
      toast.error('Subject line cannot be empty.');
      return;
    }
    if (!htmlBody.trim()) {
      toast.error('Email body cannot be empty.');
      return;
    }

    // Strict safety check 1: Accidental deletion of required variables
    if (validation.missingRequiredVariables.length > 0) {
      toast.error(
        `Cannot save: Required variable missing: ${validation.missingRequiredVariables
          .map((v) => `{{${v}}}`)
          .join(', ')}. Please restore them to prevent system errors.`
      );
      return;
    }

    // Strict safety check 2: Unknown or invalid placeholders
    if (validation.invalidPlaceholders.length > 0) {
      toast.error(
        `Cannot save: Invalid placeholder(s) detected: ${validation.invalidPlaceholders
          .map((v) => `{{${v}}}`)
          .join(', ')}. Please correct or remove them before saving.`
      );
      return;
    }

    try {
      if (isCreateMode && onCreate) {
        await onCreate({
          template_key: templateKey.trim().toLowerCase(),
          name: name.trim(),
          subject: subject.trim(),
          html_body: htmlBody.trim(),
          variables: availableVariables,
          is_active: isActive,
        });
        toast.success('New email template created successfully.');
        onClose();
      } else if (template) {
        await onSave(template.id, {
          subject: subject.trim(),
          html_body: htmlBody.trim(),
          is_active: isActive,
        });
        toast.success('Email template updated successfully.');
        onClose();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save template.');
    }
  };

  const handleReset = async () => {
    if (!template) return;
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs sm:p-5 overflow-y-auto">
        <div className="relative w-full h-full sm:h-auto sm:max-w-4xl bg-white border border-[#E5E7EB] sm:rounded-xl shadow-2xl flex flex-col sm:max-h-[94vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E5E7EB] bg-white shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] shrink-0">
                <PenLine className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-black truncate">
                    {isCreateMode ? 'Create New Email Template' : (template?.name || 'Edit Template')}
                  </h3>
                  {templateKey && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5F5F5] text-[#374151] border border-[#E5E7EB]">
                      {templateKey}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6B7280] mt-0.5 truncate">
                  {defaultConfig?.description || (isCreateMode ? 'Define a new transactional notification for the store' : 'Transactional notification template')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Active Toggle */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
                <span className="text-xs font-semibold text-[#374151]">
                  {isActive ? 'Active' : 'Disabled'}
                </span>
                <AdminSwitch checked={isActive} onCheckedChange={setIsActive} />
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[#6B7280] hover:text-black rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile-only Active Toggle Row */}
          <div className="sm:hidden flex items-center justify-between px-5 py-2.5 border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <span className="text-xs font-semibold text-[#374151]">
              {isActive ? 'Template Active' : 'Template Disabled'}
            </span>
            <AdminSwitch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-white">
            {/* Create Mode: Template Name & Key */}
            {isCreateMode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black tracking-wide">Template Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. VIP Concierge Order Follow-Up"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#D1D5DB] text-black text-xs focus:outline-hidden focus:border-[#DC2626] font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black tracking-wide">Template Key (Slug)</label>
                  <input
                    type="text"
                    value={templateKey}
                    onChange={(e) => setTemplateKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="e.g. vip_order_followup"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#D1D5DB] text-black text-xs font-mono focus:outline-hidden focus:border-[#DC2626]"
                  />
                </div>
              </div>
            )}

            {/* Subject Line Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-black tracking-wide flex items-center justify-between flex-wrap gap-1">
                <span>Subject Line</span>
                <span className="text-[10px] text-[#6B7280] font-normal">
                  Supports variable placeholders e.g. &#123;&#123;order_number&#125;&#125;
                </span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Order Received: #{{order_number}} — Philz Signature"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#D1D5DB] text-black text-xs focus:outline-hidden focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] font-medium placeholder:text-[#9CA3AF]"
              />
            </div>

            {/* Validation Feedback Banners */}
            {validation.missingRequiredVariables.length > 0 && (
              <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-3 text-xs text-[#991B1B]">
                <AlertTriangle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">Missing Required Placeholder</div>
                  <div className="text-[11px] leading-relaxed">
                    This template requires{' '}
                    <strong className="underline">
                      {validation.missingRequiredVariables.map((v) => `{{${v}}}`).join(', ')}
                    </strong>
                    . Deleting required variables will cause system issues. Please insert them in the subject or body before saving.
                  </div>
                </div>
              </div>
            )}

            {validation.invalidPlaceholders.length > 0 && (
              <div className="p-3.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-3 text-xs text-[#92400E]">
                <AlertTriangle className="h-4 w-4 text-[#D97706] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">Unknown Placeholder(s) Detected</div>
                  <div className="text-[11px] leading-relaxed">
                    The following placeholder(s) are unrecognized:{' '}
                    <span className="font-mono font-bold">
                      {validation.invalidPlaceholders.map((v) => `{{${v}}}`).join(', ')}
                    </span>
                    . These will not be replaced with customer data. Please correct typos or use the authorized placeholders below.
                  </div>
                </div>
              </div>
            )}

            {validation.isValid && (
              <div className="p-2.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-center gap-2 text-xs text-[#166534]">
                <ShieldCheck className="h-4 w-4 text-[#16A34A] shrink-0" />
                <span className="font-medium text-[11px]">
                  All placeholders validated &amp; required variables present.
                </span>
              </div>
            )}

            {/* Available Variables Chips */}
            <div className="space-y-2 p-3.5 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#374151] flex-wrap gap-1">
                <span className="flex items-center gap-1.5 text-black text-xs font-bold">
                  <Tag className="h-3.5 w-3.5 text-[#DC2626]" />
                  Available Placeholders
                </span>
                <span className="text-[10px] text-[#6B7280] font-normal">
                  Click any chip to copy and insert at cursor
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {availableVariables.map((v) => {
                  const isCopied = copiedVariable === v;
                  const isRequired = requiredVariables.includes(v);
                  const isUsed = validation.usedPlaceholders.includes(v);

                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleInsertVariable(v)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer border ${
                        isCopied
                          ? 'bg-[#C5A880] text-[#111111] border-[#C5A880] font-bold'
                          : isUsed
                          ? 'bg-white text-black border-[#A8A29E] font-semibold'
                          : 'bg-white text-[#374151] border-[#D1D5DB] hover:border-[#C5A880] hover:text-[#111111]'
                      }`}
                      title={isRequired ? 'Required placeholder — click to insert' : 'Click to insert'}
                    >
                      {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>&#123;&#123;{v}&#125;&#125;</span>
                      {isRequired && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] font-sans font-bold">
                          Required
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Universal Brand Tokens */}
                {UNIVERSAL_SYSTEM_VARIABLES.map((v) => {
                  const isCopied = copiedVariable === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleInsertVariable(v)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer border ${
                        isCopied
                          ? 'bg-[#C5A880] text-[#111111] border-[#C5A880] font-bold'
                          : 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB] hover:border-[#9CA3AF]'
                      }`}
                      title="Universal system token — click to copy"
                    >
                      {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>&#123;&#123;{v}&#125;&#125;</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Variable in Create Mode */}
              {isCreateMode && (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={newVariableInput}
                    onChange={(e) => setNewVariableInput(e.target.value)}
                    placeholder="Add custom placeholder (e.g. promo_code)"
                    className="px-2.5 py-1 text-xs rounded border border-[#D1D5DB] font-mono w-64 bg-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomVariable();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomVariable}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 text-white font-medium hover:bg-black transition-colors flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add</span>
                  </button>
                </div>
              )}
            </div>

            {/* Email Body Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="text-xs font-bold text-black tracking-wide">Email Body</label>
                <div className="text-[11px] text-[#6B7280] flex items-center gap-1">
                  <Info className="h-3 w-3 text-[#DC2626]" />
                  <span>The header, branding &amp; footer wrap automatically around this body</span>
                </div>
              </div>

              <div className="rounded-lg border border-[#D1D5DB] bg-white overflow-hidden focus-within:border-[#DC2626] focus-within:ring-1 focus-within:ring-[#DC2626]">
                {/* Tab Switcher */}
                <div className="flex items-center justify-between px-2 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-1 py-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab('visual')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        activeTab === 'visual'
                          ? 'bg-white text-black shadow-xs border border-[#E5E7EB]'
                          : 'text-[#6B7280] hover:text-black'
                      }`}
                    >
                      <PenLine className="h-3.5 w-3.5" />
                      Visual
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('html')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        activeTab === 'html'
                          ? 'bg-white text-black shadow-xs border border-[#E5E7EB]'
                          : 'text-[#6B7280] hover:text-black'
                      }`}
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      HTML
                    </button>
                  </div>
                  <span className="text-[10px] text-[#6B7280] pr-2">
                    {htmlBody.length.toLocaleString()} characters
                  </span>
                </div>

                {activeTab === 'visual' ? (
                  <div>
                    {/* Visual Toolbar */}
                    {editor && (
                      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[#E5E7EB] bg-white">
                        <ToolbarButton
                          title="Heading"
                          active={editor.isActive('heading', { level: 2 })}
                          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        >
                          <Heading2 className="h-3.5 w-3.5" />
                        </ToolbarButton>
                        <ToolbarButton
                          title="Bold"
                          active={editor.isActive('bold')}
                          onClick={() => editor.chain().focus().toggleBold().run()}
                        >
                          <Bold className="h-3.5 w-3.5" />
                        </ToolbarButton>
                        <ToolbarButton
                          title="Italic"
                          active={editor.isActive('italic')}
                          onClick={() => editor.chain().focus().toggleItalic().run()}
                        >
                          <Italic className="h-3.5 w-3.5" />
                        </ToolbarButton>
                        <ToolbarButton
                          title="Bullet List"
                          active={editor.isActive('bulletList')}
                          onClick={() => editor.chain().focus().toggleBulletList().run()}
                        >
                          <List className="h-3.5 w-3.5" />
                        </ToolbarButton>
                        <ToolbarButton
                          title="Numbered List"
                          active={editor.isActive('orderedList')}
                          onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        >
                          <ListOrdered className="h-3.5 w-3.5" />
                        </ToolbarButton>
                        <ToolbarButton
                          title="Link"
                          active={editor.isActive('link')}
                          onClick={() => {
                            const url = window.prompt('Link URL');
                            if (url) editor.chain().focus().setLink({ href: url }).run();
                          }}
                        >
                          <Link2 className="h-3.5 w-3.5" />
                        </ToolbarButton>
                      </div>
                    )}
                    <div
                      className="p-4 text-sm text-black min-h-[320px] max-h-[460px] overflow-y-auto prose prose-sm max-w-none focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px]"
                      onClick={() => editor?.chain().focus().run()}
                    >
                      <EditorContent editor={editor} />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs">
                    <CodeMirror
                      value={htmlBody}
                      height="320px"
                      extensions={[htmlLang()]}
                      onChange={(value) => setHtmlBody(value)}
                      basicSetup={{ lineNumbers: true, foldGutter: true }}
                      theme="light"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Reset Confirmation Alert (Edit Mode only) */}
            {!isCreateMode && showResetConfirm && (
              <div className="p-4 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#991B1B]">Reset template to factory defaults?</div>
                    <div className="text-[11px] text-[#991B1B]/80 mt-0.5">
                      This will reset ONLY this specific template ({templateKey}) to its default preset. All other email templates and customizations remain completely untouched.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 text-xs rounded-md bg-white border border-[#D1D5DB] hover:bg-[#F9FAFB] text-black cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isResetting}
                    className="px-3 py-1 text-xs rounded-md bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    {isResetting ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                    Confirm Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-[#E5E7EB] bg-white shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isCreateMode && (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  disabled={isResetting || isSaving}
                  className="px-3 py-2 text-xs rounded-lg border border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F9FAFB] hover:text-black flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset to Default</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-4 py-2 text-xs rounded-lg border border-[#111111] bg-white hover:bg-[#F9FAFB] text-black font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Live Preview</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-xs rounded-lg border border-[#D1D5DB] bg-white hover:bg-[#F9FAFB] text-[#374151] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <AdminButton
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || isResetting}
                className="gap-1.5 shadow-md px-5"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>{isCreateMode ? 'Create Template' : 'Save Changes'}</span>
              </AdminButton>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Live Preview Modal */}
      <EmailTemplatePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        templateKey={templateKey}
        templateName={name || template?.name || 'Email Preview'}
        subject={subject}
        htmlBody={htmlBody}
        availableVariables={availableVariables}
      />
    </>
  );
};
