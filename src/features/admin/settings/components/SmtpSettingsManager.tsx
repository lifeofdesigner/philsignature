import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Mail, Save, Loader2, Send, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdminButton, AdminInput, AdminSwitch } from '@/components/admin-ui';
import { useSmtpSettings, type SmtpSettingsForm } from '../hooks/useSmtpSettings';

export const SmtpSettingsManager: React.FC = () => {
  const { settings, isLoading, save, isSaving, sendTestEmail, isSendingTest } = useSmtpSettings();
  const [form, setForm] = useState<SmtpSettingsForm | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings.updated_at]);

  const handleSave = async () => {
    if (!form) return;
    try {
      await save(form);
      toast.success('SMTP settings saved.');
      setForm((prev) => (prev ? { ...prev, smtp_password: '' } : prev));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save SMTP settings.');
    }
  };

  const handleSendTest = async () => {
    try {
      const result = await sendTestEmail();
      toast.success(`Test email sent to ${result.sentTo}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send test email.');
    }
  };

  if (isLoading || !form) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-black" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-bold text-black flex items-center gap-2">
          <Mail className="h-4 w-4 text-slate-700" />
          SMTP / Email Settings
        </CardTitle>
        <CardDescription className="text-black font-medium">
          Configure how transactional and marketing emails are sent. Credentials are encrypted at rest and
          visible to super admins only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <AdminInput
            label="Provider Label"
            placeholder="e.g. Resend, Gmail, Custom"
            value={form.provider_name}
            onChange={(e) => setForm((p) => (p ? { ...p, provider_name: e.target.value } : p))}
            className="text-xs"
          />
          <AdminInput
            label="SMTP Host"
            placeholder="e.g. smtp.resend.com"
            value={form.smtp_host}
            onChange={(e) => setForm((p) => (p ? { ...p, smtp_host: e.target.value } : p))}
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <AdminInput
            label="SMTP Port"
            type="number"
            value={String(form.smtp_port)}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setForm((p) => (p ? { ...p, smtp_port: isNaN(val) ? 465 : val } : p));
            }}
            className="text-xs"
          />
          <AdminInput
            label="Username"
            value={form.smtp_username}
            onChange={(e) => setForm((p) => (p ? { ...p, smtp_username: e.target.value } : p))}
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div className="relative">
            <AdminInput
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder={form.has_password ? 'Leave blank to keep current password' : 'Enter password'}
              value={form.smtp_password}
              onChange={(e) => setForm((p) => (p ? { ...p, smtp_password: e.target.value } : p))}
              className="text-xs pr-9"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-[26px] text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            {form.has_password && (
              <p className="text-[11px] text-slate-500 mt-1">A password is currently stored and encrypted.</p>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-3 h-fit mt-5">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-black">TLS / SSL</div>
              <div className="text-[11px] text-slate-600">{form.smtp_secure ? 'Secure connection enabled' : 'Unencrypted connection'}</div>
            </div>
            <AdminSwitch
              checked={form.smtp_secure}
              onCheckedChange={(checked) => setForm((p) => (p ? { ...p, smtp_secure: checked } : p))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <AdminInput
            label="From Name"
            placeholder="e.g. Philz Signature"
            value={form.smtp_from_name}
            onChange={(e) => setForm((p) => (p ? { ...p, smtp_from_name: e.target.value } : p))}
            className="text-xs"
          />
          <AdminInput
            label="From Email"
            placeholder="e.g. orders@philzsignature.com"
            value={form.smtp_from_email}
            onChange={(e) => setForm((p) => (p ? { ...p, smtp_from_email: e.target.value } : p))}
            className="text-xs"
          />
        </div>

        {(form.updated_at || form.updated_by) && (
          <p className="text-[11px] text-slate-500">
            Last updated {form.updated_at ? new Date(form.updated_at).toLocaleString() : 'unknown'}
            {form.updated_by ? ` by ${form.updated_by}` : ''}.
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 max-w-xl">
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={handleSendTest}
            disabled={isSendingTest}
            className="gap-1.5"
          >
            {isSendingTest ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span>Send Test Email</span>
          </AdminButton>
          <AdminButton variant="primary" size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5 shadow-xs">
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save SMTP Settings</span>
          </AdminButton>
        </div>
      </CardContent>
    </Card>
  );
};
