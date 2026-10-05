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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-[#E5E7EB] rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626]">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-black">{templateName}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5F5F5] text-[#374151] border border-[#E5E7EB]">
                  {templateKey}
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] truncate max-w-md">
                Subject: <span className="text-black font-medium">{renderedSubject}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport Switcher */}
            <div className="hidden sm:flex items-center bg-[#F5F5F5] rounded-lg p-0.5 border border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setDeviceView('desktop')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                  deviceView === 'desktop'
                    ? 'bg-[#DC2626] text-white font-medium'
                    : 'text-[#6B7280] hover:text-black'
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
                    ? 'bg-[#DC2626] text-white font-medium'
                    : 'text-[#6B7280] hover:text-black'
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
              className="px-2.5 py-1 text-xs rounded-lg border border-[#111111] bg-white text-black hover:bg-[#F9FAFB] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Rendered HTML"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#16A34A]" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">Copy HTML</span>
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#6B7280] hover:text-black rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Client Metadata Bar */}
        <div className="px-6 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] text-[#6B7280] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span>
              To: <strong className="text-black font-mono">patron@luxury-client.com</strong>
            </span>
            <span>
              From: <strong className="text-black">Philz Signature &lt;orders@philzsignature.com&gt;</strong>
            </span>
          </div>
          <span className="text-[10px] text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA]">
            Rendered with sample parameters
          </span>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F5F5F5] flex justify-center items-start min-h-[420px]">
          <div
            className={`w-full transition-all duration-200 bg-white rounded-lg shadow-xl overflow-hidden border border-[#E5E7EB] ${
              deviceView === 'mobile' ? 'max-w-[390px]' : 'max-w-[650px]'
            }`}
          >
            <iframe
              srcDoc={renderedHtml}
              title="Email Preview"
              className="w-full min-h-[580px] h-[65vh] border-0 bg-white"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E5E7EB] bg-white flex justify-between items-center text-xs text-[#6B7280]">
          <span>Philz Signature Email Template Engine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#111111] bg-white hover:bg-[#F9FAFB] text-black font-medium transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
