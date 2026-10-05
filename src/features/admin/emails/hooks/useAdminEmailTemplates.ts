import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { emailTemplateService } from '@/services/EmailTemplateService';
import { useAuth } from '@/hooks/useAuth';
import type { EmailTemplate } from '@/types/database';

const ADMIN_EMAIL_TEMPLATES_KEY = ['admin-email-templates'];

export const useAdminEmailTemplates = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userContext = { id: user?.id, email: user?.email };

  const templatesQuery = useQuery({
    queryKey: ADMIN_EMAIL_TEMPLATES_KEY,
    queryFn: () => emailTemplateService.getTemplates(),
    staleTime: 1000 * 30,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        subject?: string;
        html_body?: string;
        is_active?: boolean;
        variables?: string[];
      };
    }) => emailTemplateService.updateTemplate(id, updates, userContext),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_EMAIL_TEMPLATES_KEY });
    },
  });

  const resetMutation = useMutation({
    mutationFn: ({ id, templateKey }: { id: string; templateKey: string }) =>
      emailTemplateService.resetTemplate(id, templateKey, userContext),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_EMAIL_TEMPLATES_KEY });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive, templateKey }: { id: string; isActive: boolean; templateKey: string }) =>
      emailTemplateService.toggleActive(id, isActive, templateKey, userContext),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_EMAIL_TEMPLATES_KEY });
    },
  });

  return {
    templates: (templatesQuery.data ?? []) as EmailTemplate[],
    isLoading: templatesQuery.isLoading,
    isError: templatesQuery.isError,
    refetch: templatesQuery.refetch,
    updateTemplate: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    resetTemplate: resetMutation.mutateAsync,
    isResetting: resetMutation.isPending,
    toggleActive: toggleActiveMutation.mutateAsync,
    isToggling: toggleActiveMutation.isPending,
  };
};
