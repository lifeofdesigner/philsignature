import React, { useState } from 'react';
import { X, Smartphone, Monitor, Mail, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { renderEmailPreview, DEFAULT_EMAIL_TEMPLATES } from '../emailTemplateDefaults';

export interface EmailTemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateKey: string;
  templateName: string;
  subject: string;
  htmlBody: string;
}

export const EmailTemplatePreviewModal: React.FC<EmailTemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  templateKey,
  templateName,
  subject,
  htmlBody,
}) => {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const defaultConfig = DEFAULT_EMAIL_TEMPLATES.find((t) => t.template_key === templateKey);
  const sampleData = defaultConfig?.sampleData || {
    customer_name: 'Lord Alexander Vance',
    order_number: 'PS-88492',
    total_amount: '₦185,000',
    date: 'October 5, 2026',
    time: '02:45 AM',
    support_email: 'concierge@philzsignature.com',
  };

  const { renderedSubject, renderedHtml } = renderEmailPreview(htmlBody, subject, sampleData);

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(renderedHtml);
      setCopied(true);
      toast.success('Preview HTML copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy HTML');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-stone-100">{templateName}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-amber-300 border border-stone-700">
                  {templateKey}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 truncate max-w-md">
                Subject: <span className="text-stone-200 font-medium">{renderedSubject}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport Switcher */}
            <div className="hidden sm:flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700">
              <button
                type="button"
                onClick={() => setDeviceView('desktop')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                  deviceView === 'desktop'
                    ? 'bg-amber-500/20 text-amber-300 font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Desktop View"
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('mobile')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                  deviceView === 'mobile'
                    ? 'bg-amber-500/20 text-amber-300 font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Mobile View"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobile</span>
              </button>
            </div>

            {/* Copy rendered HTML */}
            <button
              type="button"
              onClick={handleCopyHtml}
              className="px-2.5 py-1 text-xs rounded-lg border border-stone-700 bg-stone-800 text-stone-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Rendered HTML"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">Copy HTML</span>
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Client Metadata Bar */}
        <div className="px-6 py-2.5 bg-stone-950/40 border-b border-stone-800 text-[11px] text-stone-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span>
              To: <strong className="text-stone-300 font-mono">patron@luxury-client.com</strong>
            </span>
            <span>
              From: <strong className="text-stone-300">Philz Signature &lt;orders@philzsignature.com&gt;</strong>
            </span>
          </div>
          <span className="text-[10px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Rendered with sample parameters
          </span>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0a0a0a] flex justify-center items-start min-h-[420px]">
          <div
            className={`w-full transition-all duration-200 bg-stone-900 rounded-lg shadow-xl overflow-hidden border border-stone-800 ${
              deviceView === 'mobile' ? 'max-w-[390px]' : 'max-w-[650px]'
            }`}
          >
            <iframe
              srcDoc={renderedHtml}
              title="Email Preview"
              className="w-full min-h-[580px] h-[65vh] border-0 bg-[#0c0a09]"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950 flex justify-between items-center text-xs text-stone-400">
          <span>Philz Signature Luxury Email Template Engine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
