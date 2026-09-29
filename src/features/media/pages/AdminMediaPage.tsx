import React, { useRef, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Trash2, Loader2, Copy, Check, ExternalLink, X } from 'lucide-react';
import { AdminButton, AdminInput } from '@/components/admin-ui';
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
  const [selectedBucket, setSelectedBucket] = useState<MediaBucket | 'all'>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [previewTarget, setPreviewTarget] = useState<MediaItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMedia = useMemo(() => {
    let result = [...media];
    if (selectedBucket !== 'all') {
      result = result.filter((item) => item.bucket === selectedBucket);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (item) => item.file_name.toLowerCase().includes(q) || (item.alt_text && item.alt_text.toLowerCase().includes(q))
      );
    }
    return result;
  }, [media, selectedBucket, search]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const targetBucket = selectedBucket === 'all' ? 'products' : selectedBucket;
    try {
      await uploadFile({ bucket: targetBucket, file });
      toast.success(`"${file.name}" uploaded to the ${targetBucket} bucket.`);
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
    setCopiedId(item.id);
    toast.success('Public URL copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={<ImageIcon className="h-5 w-5" />}
        title="Unable to Load Media Library"
        description="Media assets could not be retrieved from Supabase Storage. Please retry."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Digital Asset Vault &amp; Media</h1>
          <p className="text-xs text-slate-700 font-semibold mt-1">
            Manage high-resolution photography, hero banners, campaign graphics, and avatars in Supabase Storage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept="image/*,.pdf,.svg" onChange={handleFileSelect} className="hidden" id="media-upload-input" />
          <AdminButton
            variant="primary"
            size="sm"
            className="gap-1.5 shadow-xs"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span>{isUploading ? 'Uploading...' : 'Upload Asset'}</span>
          </AdminButton>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-2xs">
        <AdminInput
          placeholder="Search assets by file name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md bg-white border-slate-300 text-slate-900 text-xs"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedBucket('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedBucket === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All Buckets ({media.length})
          </button>
          {BUCKETS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBucket(b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                selectedBucket === b
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {b} ({media.filter((m) => m.bucket === b).length})
            </button>
          ))}
        </div>
      </div>

      {filteredMedia.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="h-5 w-5" />}
          title={media.length === 0 ? 'No Media Assets Uploaded' : 'No Assets Found'}
          description={
            media.length === 0
              ? 'Select a bucket and upload campaign photography, banners, or brand assets.'
              : 'Try selecting a different storage bucket or clearing your search.'
          }
          actionLabel="Select Local File"
          onAction={() => fileInputRef.current?.click()}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMedia.map((item) => {
            const isImage = item.file_type?.startsWith('image/');
            const url = getPublicUrl(item.bucket, item.path);
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div
                  className="aspect-square bg-slate-50 border-b border-slate-100 flex items-center justify-center overflow-hidden cursor-pointer relative"
                  onClick={() => setPreviewTarget(item)}
                >
                  {isImage ? (
                    <img
                      src={url}
                      alt={item.alt_text || item.file_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-slate-300" />
                  )}
                  <span className="absolute top-2 left-2 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-white/90 backdrop-blur-xs text-slate-700 border border-slate-200">
                    {item.bucket}
                  </span>
                </div>

                <div className="p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-slate-900 truncate" title={item.file_name}>
                    {item.file_name}
                  </p>
                  <p className="text-[10px] text-slate-700 font-mono">
                    {formatSize(item.size_bytes)}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => copyUrl(item)}
                      className="p-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                      title="Copy Public URL"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                      title="Open full resolution in new tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="p-1 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      title="Delete Asset"
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

      {/* Asset Preview Modal */}
      {previewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-2xl p-6 space-y-4 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 truncate max-w-md">{previewTarget.file_name}</h3>
              <button
                type="button"
                onClick={() => setPreviewTarget(null)}
                className="text-slate-700 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-hidden flex items-center justify-center bg-slate-100 rounded-lg p-2">
              <img
                src={getPublicUrl(previewTarget.bucket, previewTarget.path)}
                alt={previewTarget.file_name}
                className="max-h-[55vh] max-w-full object-contain rounded"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-700 pt-2 border-t border-slate-100">
              <span>Bucket: <strong className="text-slate-800 uppercase">{previewTarget.bucket}</strong> • Size: {formatSize(previewTarget.size_bytes)}</span>
              <AdminButton
                size="sm"
                variant="secondary"
                className="gap-1.5 text-xs"
                onClick={() => copyUrl(previewTarget)}
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Asset URL</span>
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-md p-6 space-y-4 rounded-xl shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Remove Media Asset?</h3>
            <p className="text-sm text-slate-800">
              This will permanently delete file <span className="font-semibold text-slate-900">"{deleteTarget.file_name}"</span> from the <span className="uppercase font-mono font-bold">{deleteTarget.bucket}</span> storage bucket.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <AdminButton
                variant="secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeletingId === deleteTarget.id}
              >
                Cancel
              </AdminButton>
              <AdminButton
                variant="danger"
                onClick={confirmDelete}
                disabled={isDeletingId === deleteTarget.id}
                className="gap-2"
              >
                {isDeletingId === deleteTarget.id && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Delete Asset</span>
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
