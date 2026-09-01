import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mediaService } from '@/services/MediaService';
import { useAuth } from '@/hooks/useAuth';
import type { MediaBucket, MediaItem } from '@/types/database';

const ADMIN_MEDIA_KEY = ['admin-media'];

export const useAdminMedia = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mediaQuery = useQuery({
    queryKey: ADMIN_MEDIA_KEY,
    queryFn: () => mediaService.getAllMedia(),
    staleTime: 1000 * 30,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ bucket, file }: { bucket: MediaBucket; file: File }) =>
      mediaService.uploadFile(bucket, file, user?.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_MEDIA_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (item: MediaItem) => mediaService.deleteMedia(item.id, item.bucket, item.path),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_MEDIA_KEY }),
  });

  return {
    media: mediaQuery.data ?? [],
    isLoading: mediaQuery.isLoading,
    isError: mediaQuery.isError,
    getPublicUrl: (bucket: string, path: string) => mediaService.getPublicUrl(bucket, path),
    uploadFile: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    deleteMedia: deleteMutation.mutateAsync,
  };
};
