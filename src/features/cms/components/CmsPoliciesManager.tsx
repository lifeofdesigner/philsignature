import React, { useState } from 'react';
import { toast } from 'sonner';
import { FileText, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { CmsFaqContent, CmsContactContent, CmsPolicyPageContent } from '@/services/CMSService';

interface CmsPoliciesManagerProps {
  faq: CmsFaqContent | null;
  contact: CmsContactContent | null;
  onSaveSection: (key: string, section: string, title: string, content: Record<string, unknown>) => Promise<void>;
  isSaving: boolean;
}

export const CmsPoliciesManager: React.FC<CmsPoliciesManagerProps> = ({
  faq,
  contact,
  onSaveSection,
  isSaving,
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'shipping' | 'returns' | 'faq' | 'contact'>('privacy');

  // Local states
  const [privacyPolicy, setPrivacyPolicy] = useState<CmsPolicyPageContent>({
    title: 'Privacy Policy',
    subtitle: 'Client Confidentiality & Data Protection Protocol',
    last_updated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    content: `PHILZ SIGNATURE respects your privacy and is dedicated to safeguarding client information. We do not sell or rent personal information to third parties. All transactional and acquisition details are processed over encrypted channels.`,
    status: 'published',
  });

  const [termsPolicy, setTermsPolicy] = useState<CmsPolicyPageContent>({
    title: 'Terms of Service',
    subtitle: 'Boutique Conditions of Sale & Acquisition',
    last_updated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    content: `All fragrance creations acquired through Philz Signature are guaranteed genuine and crafted with high extrait concentrations. Orders are confirmed upon payment settlement. Delivery timescales are estimates and may vary slightly during holiday seasons.`,
    status: 'published',
  });

  const [shippingPolicy, setShippingPolicy] = useState<CmsPolicyPageContent>({
    title: 'Shipping & Delivery Policy',
    subtitle: 'Nationwide Priority Dispatch Guidelines',
    last_updated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    content: `Complimentary nationwide express delivery applies to orders above ₦150,000. Lagos orders arrive in 24–48 hours; other Nigerian states arrive in 2–4 business days via verified priority courier dispatch.`,
    status: 'published',
  });

  const [returnsPolicy, setReturnsPolicy] = useState<CmsPolicyPageContent>({
    title: 'Returns & Exchange Policy',
    subtitle: 'Hygiene & Quality Assurance Standards',
    last_updated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    content: `Due to haute fragrance hygiene standards, opened bottles cannot be returned or refunded once unsealed. If your flacon arrives damaged in transit, notify concierge within 48 hours of receipt with unboxing photos for an immediate replacement.`,
    status: 'published',
  });

  const [faqForm, setFaqForm] = useState<CmsFaqContent>(
    faq || {
      title: 'Frequently Asked Questions',
      subtitle: 'Answers to common client inquiries regarding formulation, delivery, and longevity.',
      items: [],
      status: 'published',
    }
  );

  const [contactForm, setContactForm] = useState<CmsContactContent>(
    contact || {
      title: 'Concierge & Client Relations',
      subtitle: 'Our fragrance advisors are available for personal scent profiling and custom gifting.',
      email: 'concierge@philzsignature.com',
      phone: '+234 800 000 0000',
      whatsapp: '+234 800 000 0000',
      address: 'Victoria Island, Lagos, Nigeria',
      hours: 'Monday – Saturday: 9:00 AM – 7:00 PM WAT',
    }
  );

  const handleSavePolicy = async (slug: string, policy: CmsPolicyPageContent) => {
    try {
      await onSaveSection(`policy_${slug}`, 'policy', policy.title, policy as unknown as Record<string, unknown>);
      toast.success(`${policy.title} saved successfully.`);
    } catch {
      toast.error(`Failed to save ${policy.title}.`);
    }
  };

  const handleSaveFaq = async () => {
    try {
      await onSaveSection('faq_data', 'support', 'Frequently Asked Questions', faqForm as unknown as Record<string, unknown>);
      toast.success('FAQ database updated successfully.');
    } catch {
      toast.error('Failed to save FAQs.');
    }
  };

  const handleSaveContact = async () => {
    try {
      await onSaveSection('contact_data', 'contact', 'Concierge & Contact Info', contactForm as unknown as Record<string, unknown>);
      toast.success('Contact info updated successfully.');
    } catch {
      toast.error('Failed to save Contact info.');
    }
  };

  const handleAddFaqItem = () => {
    setFaqForm((prev) => ({
      ...prev,
      items: [...prev.items, { question: 'New Question?', answer: 'Answer details here...' }],
    }));
  };

  const handleDeleteFaqItem = (index: number) => {
    setFaqForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-700" />
            <h3 className="text-base font-bold text-slate-900">Policy Pages &amp; Client Information</h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage terms of service, return protocols, delivery policies, FAQs, and contact details without code edits.
          </p>
        </div>

        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'privacy' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Privacy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'terms' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Terms
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'shipping' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Shipping
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('returns')}
            className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'returns' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Returns
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'faq' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            FAQs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'contact' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Contact
          </button>
        </div>
      </div>

      {/* Privacy Policy Tab */}
      {activeTab === 'privacy' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Policy Page Title"
              value={privacyPolicy.title}
              onChange={(e) => setPrivacyPolicy({ ...privacyPolicy, title: e.target.value })}
              className="bg-white border-slate-300 text-slate-900"
            />
            <Input
              label="Effective Date"
              value={privacyPolicy.last_updated}
              onChange={(e) => setPrivacyPolicy({ ...privacyPolicy, last_updated: e.target.value })}
              className="bg-white border-slate-300 text-slate-900"
            />
          </div>
          <Input
            label="Editorial Subtitle"
            value={privacyPolicy.subtitle || ''}
            onChange={(e) => setPrivacyPolicy({ ...privacyPolicy, subtitle: e.target.value })}
            className="bg-white border-slate-300 text-slate-900"
          />
          <Textarea
            label="Policy Body Content"
            rows={8}
            value={privacyPolicy.content}
            onChange={(e) => setPrivacyPolicy({ ...privacyPolicy, content: e.target.value })}
            className="bg-white border-slate-300 text-slate-900"
          />
          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              disabled={isSaving}
              onClick={() => handleSavePolicy('privacy_policy', privacyPolicy)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs cursor-pointer"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Save Privacy Policy</span>
            </Button>
          </div>
        </div>
      )}

      {/* Terms of Service Tab */}
      {activeTab === 'terms' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Policy Page Title"
              value={termsPolicy.title}
              onChange={(e) => setTermsPolicy({ ...termsPolicy, title: e.target.value })}
              className="bg-white border-slate-300 text-slate-900"
            />
            <Input
              label="Effective Date"
              value={termsPolicy.last_updated}
              onChange={(e) => setTermsPolicy({ ...termsPolicy, last_updated: e.target.value })}
              className="bg-white border-slate-300 text-slate-900"
            />
          </div>
          <Input
            label="Editorial Subtitle"
            value={termsPolicy.subtitle || ''}
            onChange={(e) => setTermsPolicy({ ...termsPolicy, subtitle: e.target.value })}
            className="bg-white border-slate-300 text-slate-900"
          />
          <Textarea
            label="Terms &amp; Conditions Content"
            rows={8}
            value={termsPolicy.content}
            onChange={(e) => setTermsPolicy({ ...termsPolicy, content: e.target.value })}
            className="bg-white border-slate-300 text-slate-900"
          />
          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              disabled={isSaving}
              onClick={() => handleSavePolicy('terms', termsPolicy)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs cursor-pointer"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Save Terms of Service</span>
            </Button>
          </div>
        </div>
      )}

      {/* Shipping Policy Tab */}
      {activeTab === 'shipping' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Policy Page Title"
              value={shippingPolicy.title}
              onChange={(e) => setShippingPolicy({ ...shippingPolicy, title: e.target.value })}
              className="bg-white border-slate-300 text-slate-900"
            />
            <Input
              label="Effective Date"
              value={shippingPolicy.last_updated}
              onChange={(e) => setShippingPolicy({ ...shippingPolicy, last_updated: e.target.value })}
              className="bg-white border-slate-300 text-slate-900"
            />
          </div>
          <Input
            label="Editorial Subtitle"
            value={shippingPolicy.subtitle || ''}
            onChange={(e) => setShippingPolicy({ ...shippingPolicy, subtitle: e.target.value })}
            className="bg-white border-slate-300 text-slate-900"
          />
          <Textarea
            label="Shipping &amp; Dispatch Content"
            rows={8}
            value={shippingPolicy.content}
            onChange={(e) => setShippingPolicy({ ...shippingPolicy, content: e.target.value })}
            className="bg-white border-slate-300 text-slate-900"
          />
          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              disabled={isSaving}
              onClick={() => handleSavePolicy('shipping_policy', shippingPolicy)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs cursor-pointer"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Save Shipping Policy</span>
            </Button>
          </div>
        </div>
      )}

      {/* Returns Policy Tab */}
      {activeTab === 'returns' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Policy Page Title"
              value={returnsPolicy.title}
              onChange={(e) => setReturnsPolicy({ ...returnsPolicy, title: e.target.value })}
              className="bg-white border-slate-300 text-slate-900"
            />
            <Input
              label="Effective Date"
              value={returnsPolicy.last_updated}
              onChange={(e) => setReturnsPolicy({ ...returnsPolicy, last_updated: e.target.value })}
              className="bg-white border-slate-300 text-slate-900"
            />
          </div>
          <Input
            label="Editorial Subtitle"
            value={returnsPolicy.subtitle || ''}
            onChange={(e) => setReturnsPolicy({ ...returnsPolicy, subtitle: e.target.value })}
            className="bg-white border-slate-300 text-slate-900"
          />
          <Textarea
            label="Returns &amp; Replacements Content"
            rows={8}
            value={returnsPolicy.content}
            onChange={(e) => setReturnsPolicy({ ...returnsPolicy, content: e.target.value })}
            className="bg-white border-slate-300 text-slate-900"
          />
          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              disabled={isSaving}
              onClick={() => handleSavePolicy('returns_policy', returnsPolicy)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs cursor-pointer"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Save Returns Policy</span>
            </Button>
          </div>
        </div>
      )}

      {/* FAQ Manager Tab */}
      {activeTab === 'faq' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h4 className="text-base font-bold text-slate-900">Storefront FAQ Entries</h4>
              <p className="text-xs text-slate-500 font-medium">Manage question &amp; answer accordions shown on the FAQ page.</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleAddFaqItem} className="gap-1.5 text-xs border-slate-300">
              <Plus className="h-3.5 w-3.5 text-amber-700" />
              <span>Add Question</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="FAQ Section Title"
              value={faqForm.title}
              onChange={(e) => setFaqForm({ ...faqForm, title: e.target.value })}
              className="bg-white border-slate-300 text-slate-900"
            />
            <Input
              label="Section Subtitle"
              value={faqForm.subtitle}
              onChange={(e) => setFaqForm({ ...faqForm, subtitle: e.target.value })}
              className="bg-white border-slate-300 text-slate-900"
            />
          </div>

          <div className="space-y-4 pt-2">
            {faqForm.items.map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-900">Question {idx + 1}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteFaqItem(idx)}
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 border-slate-200"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  label="Question"
                  value={item.question}
                  onChange={(e) => {
                    const updated = [...faqForm.items];
                    updated[idx].question = e.target.value;
                    setFaqForm({ ...faqForm, items: updated });
                  }}
                  className="bg-white border-slate-300 text-slate-900"
                />
                <Textarea
                  label="Answer"
                  rows={2}
                  value={item.answer}
                  onChange={(e) => {
                    const updated = [...faqForm.items];
                    updated[idx].answer = e.target.value;
                    setFaqForm({ ...faqForm, items: updated });
                  }}
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={handleSaveFaq} disabled={isSaving} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs cursor-pointer">
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Save FAQ Database</span>
            </Button>
          </div>
        </div>
      )}

      {/* Contact Concierge Tab */}
      {activeTab === 'contact' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Page Title"
              value={contactForm.title}
              onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
              className="bg-white border-slate-300 text-slate-900"
            />
            <Input
              label="Subtitle"
              value={contactForm.subtitle}
              onChange={(e) => setContactForm({ ...contactForm, subtitle: e.target.value })}
              className="bg-white border-slate-300 text-slate-900"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Concierge Email"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              className="bg-white border-slate-300 text-slate-900"
            />
            <Input
              label="Phone Number"
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              className="bg-white border-slate-300 text-slate-900"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="WhatsApp Link / Number"
              value={contactForm.whatsapp}
              onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
              className="bg-white border-slate-300 text-slate-900"
            />
            <Input
              label="Concierge Hours"
              value={contactForm.hours}
              onChange={(e) => setContactForm({ ...contactForm, hours: e.target.value })}
              className="bg-white border-slate-300 text-slate-900"
            />
          </div>
          <Input
            label="Boutique Atelier Address"
            value={contactForm.address}
            onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
            className="bg-white border-slate-300 text-slate-900"
          />
          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={handleSaveContact} disabled={isSaving} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-xs cursor-pointer">
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Save Contact Info</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
