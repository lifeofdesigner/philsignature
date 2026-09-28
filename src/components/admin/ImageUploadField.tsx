import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload, Loader2, ImageOff, X } from 'lucide-react';
import { mediaService } from '@/services/MediaService';
import { useAuth } from '@/hooks/useAuth';
import type { MediaBucket } from '@/types/database';

export interface ImageUploadFieldProps {
  label: string;
  helpText?: string;
  bucket: MediaBucket;
  currentUrl?: string;
  onUploaded: (url: string) => void;
  onRemove?: () => void;
}

/**
 * A single "click to upload" image field that uploads straight to Supabase
 * Storage and reports back the resulting public URL.
 */
export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  helpText,
  bucket,
  currentUrl,
  onUploaded,
  onRemove,
}) => {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploaded = await mediaService.uploadFile(bucket, file, user?.id);
      const url = mediaService.getPublicUrl(uploaded.bucket, uploaded.path);
      onUploaded(url);
      toast.success(`${label} uploaded.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to upload ${label}.`);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const inputId = `image-upload-${bucket}-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="space-y-1.5">
      <label className="block font-semibold text-slate-800">{label}</label>
      {helpText && <p className="text-[11px] text-slate-700 font-medium">{helpText}</p>}
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 shrink-0 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
          {currentUrl ? (
            <img src={currentUrl} alt={label} className="h-full w-full object-cover" />
          ) : (
            <ImageOff className="h-5 w-5 text-slate-300" />
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id={inputId}
        />
        <label
          htmlFor={inputId}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer shadow-2xs"
        >
          {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          <span>{isUploading ? 'Uploading...' : currentUrl ? 'Replace Image' : 'Upload Image'}</span>
        </label>

        {currentUrl && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-slate-700 hover:text-red-700 rounded hover:bg-red-50 transition-colors cursor-pointer"
            title={`Remove ${label}`}
            aria-label={`Remove ${label}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
