import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cmsService } from '@/services/CMSService';

export const CMS_QUERY_KEY = ['admin-cms-content'];

export const useAdminCms = () => {
  const queryClient = useQueryClient();

  const heroQuery = useQuery({ queryKey: [...CMS_QUERY_KEY, 'hero'], queryFn: () => cmsService.getHeroSection() });
  const announcementQuery = useQuery({ queryKey: [...CMS_QUERY_KEY, 'announcement'], queryFn: () => cmsService.getAnnouncementSection() });
  const storyQuery = useQuery({ queryKey: [...CMS_QUERY_KEY, 'story'], queryFn: () => cmsService.getStorySection() });
  const footerQuery = useQuery({ queryKey: [...CMS_QUERY_KEY, 'footer'], queryFn: () => cmsService.getFooterSection() });
  const layoutQuery = useQuery({ queryKey: [...CMS_QUERY_KEY, 'layout'], queryFn: () => cmsService.getHomepageLayout() });
  const menuQuery = useQuery({ queryKey: [...CMS_QUERY_KEY, 'menu'], queryFn: () => cmsService.getNavigationMenu() });
  const appearanceQuery = useQuery({ queryKey: [...CMS_QUERY_KEY, 'appearance'], queryFn: () => cmsService.getAppearance() });
  const faqQuery = useQuery({ queryKey: [...CMS_QUERY_KEY, 'faq'], queryFn: () => cmsService.getFaqContent() });
  const contactQuery = useQuery({ queryKey: [...CMS_QUERY_KEY, 'contact'], queryFn: () => cmsService.getContactContent() });

  const saveMutation = useMutation({
    mutationFn: ({ key, section, title, content }: { key: string; section: string; title: string; content: Record<string, unknown> }) =>
      cmsService.updateSectionContent(key, section, title, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['home-page-data'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-modular-layout'] });
      queryClient.invalidateQueries({ queryKey: ['store-navigation-menu'] });
      queryClient.invalidateQueries({ queryKey: ['store-appearance'] });
      queryClient.invalidateQueries({ queryKey: ['announcement-bar'] });
      queryClient.invalidateQueries({ queryKey: ['footer-cms-config'] });
      queryClient.invalidateQueries({ queryKey: ['about-page-story'] });
      queryClient.invalidateQueries({ queryKey: ['contact-page-data'] });
      queryClient.invalidateQueries({ queryKey: ['faq-page-data'] });
      queryClient.invalidateQueries({ queryKey: ['cms-policy'] });
      queryClient.invalidateQueries({ queryKey: [variables.key] });
    },
  });

  return {
    hero: heroQuery.data,
    announcement: announcementQuery.data,
    story: storyQuery.data,
    footer: footerQuery.data,
    layout: layoutQuery.data,
    menu: menuQuery.data,
    appearance: appearanceQuery.data,
    faq: faqQuery.data,
    contact: contactQuery.data,
    isLoading:
      heroQuery.isLoading ||
      announcementQuery.isLoading ||
      storyQuery.isLoading ||
      footerQuery.isLoading ||
      layoutQuery.isLoading ||
      menuQuery.isLoading ||
      appearanceQuery.isLoading,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
};
