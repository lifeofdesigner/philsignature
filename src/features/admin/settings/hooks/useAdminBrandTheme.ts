import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cmsService, type CmsAppearanceConfig } from '@/services/CMSService';
import { mediaService } from '@/services/MediaService';
import { useAuth } from '@/hooks/useAuth';

const QUERY_KEY = ['admin-brand-theme'];
const APPEARANCE_KEY = 'store_appearance';

export type BrandImageField =
  | 'logo_url'
  | 'logo_light_url'
  | 'logo_dark_url'
  | 'logo_mobile_url'
  | 'favicon_url'
  | 'apple_touch_icon_url'
  | 'email_logo_url'
  | 'social_share_image_url'
  | 'loading_logo_url';

export const useAdminBrandTheme = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const appearanceQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => cmsService.getAppearance(),
  });

  const saveMutation = useMutation({
    mutationFn: (config: CmsAppearanceConfig) =>
      cmsService.updateSectionContent(APPEARANCE_KEY, 'appearance', 'Brand & Theme', config as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['store-appearance'] });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ field, file }: { field: BrandImageField; file: File }) => {
      const uploaded = await mediaService.uploadFile('cms', file, user?.id);
      const publicUrl = mediaService.getPublicUrl(uploaded.bucket, uploaded.path);
      const current = appearanceQuery.data ?? (await cmsService.getAppearance());
      const updated: CmsAppearanceConfig = { ...current, [field]: publicUrl };
      await cmsService.updateSectionContent(APPEARANCE_KEY, 'appearance', 'Brand & Theme', updated as unknown as Record<string, unknown>);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['store-appearance'] });
    },
  });

  return {
    appearance: appearanceQuery.data,
    isLoading: appearanceQuery.isLoading,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    uploadImage: uploadMutation.mutateAsync,
    isUploadingField: uploadMutation.isPending ? uploadMutation.variables?.field : null,
  };
};
