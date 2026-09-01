import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cmsService } from '@/services/CMSService';

const CMS_QUERY_KEY = ['admin-cms-content'];

export const useAdminCms = () => {
  const queryClient = useQueryClient();

  const heroQuery = useQuery({ queryKey: [...CMS_QUERY_KEY, 'hero'], queryFn: () => cmsService.getHeroSection() });
  const announcementQuery = useQuery({ queryKey: [...CMS_QUERY_KEY, 'announcement'], queryFn: () => cmsService.getAnnouncementSection() });
  const storyQuery = useQuery({ queryKey: [...CMS_QUERY_KEY, 'story'], queryFn: () => cmsService.getStorySection() });
  const footerQuery = useQuery({ queryKey: [...CMS_QUERY_KEY, 'footer'], queryFn: () => cmsService.getFooterSection() });

  const saveMutation = useMutation({
    mutationFn: ({ key, section, title, content }: { key: string; section: string; title: string; content: Record<string, unknown> }) =>
      cmsService.updateSectionContent(key, section, title, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['home-page-data'] });
      queryClient.invalidateQueries({ queryKey: [variables.key] });
    },
  });

  return {
    hero: heroQuery.data,
    announcement: announcementQuery.data,
    story: storyQuery.data,
    footer: footerQuery.data,
    isLoading: heroQuery.isLoading || announcementQuery.isLoading || storyQuery.isLoading || footerQuery.isLoading,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
};
