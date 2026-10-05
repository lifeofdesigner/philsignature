import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callAdminApi } from '@/lib/adminApiClient';

const QUERY_KEY = ['admin-settings', 'smtp'];

export interface SmtpSettingsForm {
  provider_name: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  has_password: boolean;
  smtp_from_name: string;
  smtp_from_email: string;
  smtp_secure: boolean;
  updated_at: string | null;
  updated_by: string | null;
}

export const DEFAULT_SMTP_FORM: SmtpSettingsForm = {
  provider_name: 'Custom',
  smtp_host: '',
  smtp_port: 465,
  smtp_username: '',
  smtp_password: '',
  has_password: false,
  smtp_from_name: '',
  smtp_from_email: '',
  smtp_secure: true,
  updated_at: null,
  updated_by: null,
};

export const useSmtpSettings = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => callAdminApi<Omit<SmtpSettingsForm, 'smtp_password'>>('/api/admin/smtp-settings', { method: 'GET' }),
  });

  const saveMutation = useMutation({
    mutationFn: (form: SmtpSettingsForm) =>
      callAdminApi('/api/admin/smtp-settings', {
        method: 'POST',
        body: {
          provider_name: form.provider_name,
          smtp_host: form.smtp_host,
          smtp_port: form.smtp_port,
          smtp_username: form.smtp_username,
          smtp_password: form.smtp_password,
          smtp_from_name: form.smtp_from_name,
          smtp_from_email: form.smtp_from_email,
          smtp_secure: form.smtp_secure,
        },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const testMutation = useMutation({
    mutationFn: () =>
      callAdminApi<{ success: boolean; sentTo: string }>('/api/admin/smtp-settings', {
        method: 'POST',
        body: { action: 'test' },
      }),
  });

  const settings: SmtpSettingsForm = {
    ...DEFAULT_SMTP_FORM,
    ...(settingsQuery.data || {}),
    smtp_password: '',
  };

  return {
    settings,
    isLoading: settingsQuery.isLoading,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    sendTestEmail: testMutation.mutateAsync,
    isSendingTest: testMutation.isPending,
  };
};
