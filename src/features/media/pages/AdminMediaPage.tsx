import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Trash2, Loader2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminMedia } from '../hooks/useAdminMedia';
import type { MediaBucket, MediaItem } from '@/types/database';

const BUCKETS: MediaBucket[] = ['products', 'banners', 'cms', 'avatars'];

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const AdminMediaPage: React.FC = () => {
  const { media, isLoading, isError, getPublicUrl, uploadFile, isUploading, deleteMedia } = useAdminMedia();
  const [selectedBucket, setSelectedBucket] = useState<MediaBucket>('products');
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadFile({ bucket: selectedBucket, file });
      toast.success(`"${file.name}" uploaded to the ${selectedBucket} bucket.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload file.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeletingId(deleteTarget.id);
    try {
      await deleteMedia(deleteTarget);
      toast.success(`"${deleteTarget.file_name}" was removed.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete asset.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const copyUrl = (item: MediaItem) => {
    const url = getPublicUrl(item.bucket, item.path);
    navigator.clipboard?.writeText(url);
    toast.success('Public URL copied to clipboard.');
  };

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={<ImageIcon className="h-5 w-5" />}
        title="Unable to Load Media Library"
        description="Media assets could not be retrieved from Supabase. Please retry."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Digital Asset Vault
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">Media Library</h1>
          <p className="text-xs text-luxury-muted font-light mt-1">
            Store high-resolution photography, campaign reels, and boutique assets in Supabase Storage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedBucket}
            onChange={(e) => setSelectedBucket(e.target.value as MediaBucket)}
            className="h-9 bg-luxury-charcoal/80 border border-luxury-border px-3 text-xs text-luxury-cream focus:outline-none focus:border-luxury-gold/70"
          >
            {BUCKETS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" id="media-upload-input" />
          <Button
            variant="luxury"
            size="sm"
            className="gap-1.5"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            <span>{isUploading ? 'Uploading...' : 'Upload Media'}</span>
          </Button>
        </div>
      </div>

      {media.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="h-5 w-5" />}
          title="No Media Assets Uploaded"
          description="Select a bucket and upload photography, banners, or branding assets to Supabase Storage."
          actionLabel="Select Local File"
          onAction={() => fileInputRef.current?.click()}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((item) => {
            const isImage = item.file_type?.startsWith('image/');
            const url = getPublicUrl(item.bucket, item.path);
            return (
              <div key={item.id} className="bg-luxury-card border border-luxury-border overflow-hidden group">
                <div className="aspect-square bg-luxury-charcoal flex items-center justify-center overflow-hidden">
                  {isImage ? (
                    <img src={url} alt={item.alt_text || item.file_name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-luxury-muted" />
                  )}
                </div>
                <div className="p-2.5 space-y-1">
                  <p className="text-[11px] text-white truncate" title={item.file_name}>{item.file_name}</p>
                  <p className="text-[9px] text-luxury-muted uppercase tracking-wider">
                    {item.bucket} • {formatSize(item.size_bytes)}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => copyUrl(item)}
                      className="text-luxury-muted hover:text-luxury-gold transition-colors cursor-pointer"
                      aria-label="Copy public URL"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="text-luxury-muted hover:text-red-400 transition-colors cursor-pointer"
                      aria-label="Delete asset"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-luxury-card border border-luxury-border w-full max-w-md p-6 space-y-5 rounded">
            <h3 className="font-serif text-lg text-white">Remove Asset?</h3>
            <p className="text-sm text-luxury-muted">
              This will permanently delete <span className="text-white">"{deleteTarget.file_name}"</span> from storage. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeletingId === deleteTarget.id}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isDeletingId === deleteTarget.id} className="gap-2">
                {isDeletingId === deleteTarget.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
