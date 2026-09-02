import { mediaRepository, type MediaRepository } from '@/repositories/MediaRepository';
import { ValidationError } from '@/errors/ValidationError';
import type { MediaBucket, MediaItem } from '@/types/database';

const BUCKET_RULES: Record<MediaBucket, { maxSizeMb: number; allowedTypes: string[] }> = {
  products: { maxSizeMb: 15, allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'] },
  banners: { maxSizeMb: 40, allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'] },
  cms: {
    maxSizeMb: 20,
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/svg+xml',
      'image/gif',
    ],
  },
  avatars: { maxSizeMb: 5, allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] },
};

export class MediaService {
  constructor(private repo: MediaRepository = mediaRepository) {}

  async getAllMedia(): Promise<MediaItem[]> {
    return this.repo.findAll();
  }

  getPublicUrl(bucket: string, path: string): string {
    return this.repo.getPublicUrl(bucket, path);
  }

  async uploadFile(bucket: MediaBucket, file: File, uploadedBy?: string): Promise<MediaItem> {
    const rules = BUCKET_RULES[bucket];
    if (!rules) {
      throw new ValidationError(`Unknown storage bucket: ${bucket}`);
    }
    if (!rules.allowedTypes.includes(file.type)) {
      throw new ValidationError(`File type "${file.type}" is not permitted in the "${bucket}" bucket.`);
    }
    if (file.size > rules.maxSizeMb * 1024 * 1024) {
      throw new ValidationError(`File exceeds the ${rules.maxSizeMb}MB limit for the "${bucket}" bucket.`);
    }
    return this.repo.upload(bucket, file, uploadedBy);
  }

  async deleteMedia(id: string, bucket: string, path: string): Promise<void> {
    return this.repo.delete(id, bucket, path);
  }
}

export const mediaService = new MediaService();
