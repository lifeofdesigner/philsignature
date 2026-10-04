import { BaseRepository } from './BaseRepository';
import type { MediaBucket, MediaItem } from '@/types/database';

export class MediaRepository extends BaseRepository {
  async findAll(): Promise<MediaItem[]> {
    try {
      const { data, error } = await this.client
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) this.handleError(error, 'Failed to fetch media library');
      return (data as MediaItem[]) || [];
    } catch (err) {
      this.handleError(err, 'Error fetching media library');
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async createSignedUrl(bucket: string, path: string, expiresInSeconds: number = 3600): Promise<string> {
    try {
      const { data, error } = await this.client.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
      if (error) this.handleError(error, `Failed to generate signed URL for ${path}`);
      return data?.signedUrl || '';
    } catch (err) {
      this.handleError(err, 'Error generating signed storage URL');
    }
  }

  async upload(bucket: MediaBucket, file: File, uploadedBy?: string): Promise<MediaItem> {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
      const path = `${Date.now()}-${sanitizedName}`;

      const { error: uploadError } = await this.client.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (uploadError) this.handleError(uploadError, 'Failed to upload file to storage');

      const { data, error } = await this.client
        .from('media')
        .insert({
          file_name: file.name,
          bucket,
          path,
          file_type: file.type,
          size_bytes: file.size,
          uploaded_by: uploadedBy || null,
        })
        .select()
        .single();

      if (error) {
        // The file already landed in Storage; without this it would be
        // orphaned (unreferenced, but still billed and undiscoverable)
        // every time the media table insert fails after a successful upload.
        await this.client.storage.from(bucket).remove([path]);
        this.handleError(error, 'Failed to record media asset');
      }
      return data as MediaItem;
    } catch (err) {
      this.handleError(err, 'Error uploading media asset');
    }
  }

  async delete(id: string, bucket: string, path: string): Promise<void> {
    try {
      const { error: storageError } = await this.client.storage.from(bucket).remove([path]);
      if (storageError) console.warn('Storage removal non-critical error:', storageError);

      const { error } = await this.client.from('media').delete().eq('id', id);
      if (error) this.handleError(error, 'Failed to delete media record');
    } catch (err) {
      this.handleError(err, 'Error deleting media asset');
    }
  }
}

export const mediaRepository = new MediaRepository();
