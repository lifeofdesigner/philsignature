import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService } from '@/services/CMSService';
import type { CmsContent } from '@/types/database';

export const useCMSSection = (key: string) => {
  return useQuery<CmsContent | null>({
    queryKey: ['cms', key],
    queryFn: () => cmsService.getSectionContent(key),
    staleTime: 1000 * 60 * 15,
  });
};

export const useUpdateCMSSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, section, title, content }: { key: string; section: string; title: string; content: Record<string, unknown> }) =>
      cmsService.updateSectionContent(key, section, title, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cms', variables.key] });
    },
  });
};

