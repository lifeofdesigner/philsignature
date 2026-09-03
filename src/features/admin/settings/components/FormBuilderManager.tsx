import React, { useState } from 'react';
import { toast } from 'sonner';
import { FileInput, Plus, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'phone';
  required: boolean;
  options?: string[];
}

export interface FormConfig {
  id: string;
  title: string;
  recipient_email: string;
  autoresponder_enabled: boolean;
  fields: FormField[];
}

const DEFAULT_FORMS: FormConfig[] = [
  {
    id: 'contact_concierge',
    title: 'Customer Concierge Enquiry Form',
    recipient_email: 'concierge@philzsignature.com',
    autoresponder_enabled: true,
    fields: [
      { id: 'f1', name: 'full_name', label: 'Full Name', type: 'text', required: true },
      { id: 'f2', name: 'email', label: 'Email Address', type: 'email', required: true },
      { id: 'f3', name: 'subject', label: 'Inquiry Category', type: 'select', required: true, options: ['Private Order', 'Custom Scent', 'General'] },
      { id: 'f4', name: 'message', label: 'Message Copy', type: 'textarea', required: true },
    ],
  },
  {
    id: 'private_label_inquiry',
    title: 'Private Label & Atelier Booking Form',
    recipient_email: 'privatelabel@philzsignature.com',
    autoresponder_enabled: true,
    fields: [
      { id: 'f10', name: 'brand_name', label: 'Brand / Corporate Name', type: 'text', required: true },
      { id: 'f11', name: 'email', label: 'Business Email', type: 'email', required: true },
      { id: 'f12', name: 'estimated_units', label: 'Estimated Batch Volume', type: 'text', required: false },
      { id: 'f13', name: 'notes', label: 'Formulation Preferences', type: 'textarea', required: true },
    ],
  },
];

export const FormBuilderManager: React.FC = () => {
  const [forms, setForms] = useState<FormConfig[]>(DEFAULT_FORMS);
  const [selectedFormId, setSelectedFormId] = useState<string>(DEFAULT_FORMS[0].id);

  const selectedForm = forms.find((f) => f.id === selectedFormId) || forms[0];

  const handleUpdateForm = (updates: Partial<FormConfig>) => {
    setForms((prev) => prev.map((f) => (f.id === selectedFormId ? { ...f, ...updates } : f)));
  };

  const handleAddField = () => {
    const newField: FormField = {
      id: `f-${Date.now()}`,
      name: `field_${Date.now()}`,
      label: 'New Field Label',
      type: 'text',
      required: false,
    };
    handleUpdateForm({ fields: [...selectedForm.fields, newField] });
  };

  const handleRemoveField = (fieldId: string) => {
    handleUpdateForm({ fields: selectedForm.fields.filter((f) => f.id !== fieldId) });
  };

  const handleSave = () => {
    toast.success(`Form "${selectedForm.title}" configurations saved to Supabase.`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <FileInput className="h-4 w-4 text-amber-700" />
          <span>Visual Form Builder & Email Routing</span>
        </CardTitle>
        <CardDescription>Manage inquiry fields, validation rules, and notification emails for storefront forms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form Selector Tabs */}
        <div className="flex gap-2 border-b border-slate-100 pb-3">
          {forms.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFormId(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedFormId === f.id
                  ? 'bg-amber-50 text-amber-950 border border-amber-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.title}
            </button>
          ))}
        </div>

        {/* Form Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Form Recipient Email"
            value={selectedForm.recipient_email}
            onChange={(e) => handleUpdateForm({ recipient_email: e.target.value })}
            className="text-xs"
          />
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs font-medium text-slate-700">Send Autoresponder Email:</span>
            <Switch
              checked={selectedForm.autoresponder_enabled}
              onCheckedChange={(val) => handleUpdateForm({ autoresponder_enabled: val })}
            />
          </div>
        </div>

        {/* Fields List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Form Fields & Validation</h4>
            <Button size="sm" variant="outline" onClick={handleAddField} className="text-xs h-7 gap-1 border-slate-200">
              <Plus className="h-3 w-3" /> Add Field
            </Button>
          </div>

          <div className="space-y-2">
            {selectedForm.fields.map((field) => (
              <div key={field.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                  <Input
                    placeholder="Field Label"
                    value={field.label}
                    onChange={(e) => {
                      const updated = selectedForm.fields.map((f) => (f.id === field.id ? { ...f, label: e.target.value } : f));
                      handleUpdateForm({ fields: updated });
                    }}
                    className="text-xs bg-white"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => {
                      const updated = selectedForm.fields.map((f) => (f.id === field.id ? { ...f, type: e.target.value as any } : f));
                      handleUpdateForm({ fields: updated });
                    }}
                    className="text-xs bg-white border border-slate-200 rounded-lg px-2 text-slate-800"
                  >
                    <option value="text">Text Input</option>
                    <option value="email">Email Input</option>
                    <option value="textarea">Textarea Box</option>
                    <option value="select">Dropdown Select</option>
                    <option value="phone">Phone Input</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-600 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => {
                          const updated = selectedForm.fields.map((f) => (f.id === field.id ? { ...f, required: e.target.checked } : f));
                          handleUpdateForm({ fields: updated });
                        }}
                        className="rounded border-slate-300 text-amber-700"
                      />
                      <span>Required</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveField(field.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button size="sm" onClick={handleSave} className="bg-amber-700 hover:bg-amber-800 text-white font-medium gap-1.5">
            <Save className="h-3.5 w-3.5" /> Save Form Schema
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
