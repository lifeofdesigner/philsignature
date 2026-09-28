import React, { useRef } from 'react';
import { toast } from 'sonner';
import { Upload, Loader2, ImageOff } from 'lucide-react';
import type { BrandImageField } from '../hooks/useAdminBrandTheme';

export interface BrandImageUploadFieldProps {
  label: string;
  helpText?: string;
  field: BrandImageField;
  currentUrl?: string;
  isUploading: boolean;
  onUpload: (field: BrandImageField, file: File) => Promise<void>;
}

/**
 * A single "click to upload" image field. Uploads immediately on file
 * selection and saves straight to Supabase.
 */
export const BrandImageUploadField: React.FC<BrandImageUploadFieldProps> = ({
  label,
  helpText,
  field,
  currentUrl,
  isUploading,
  onUpload,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await onUpload(field, file);
      toast.success(`${label} updated.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to upload ${label}.`);
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
      <div>
        <p className="text-xs font-bold text-black uppercase tracking-wider">{label}</p>
        {helpText && <p className="text-[11px] text-black mt-0.5 font-medium">{helpText}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden p-1">
          {currentUrl ? (
            <img src={currentUrl} alt={label} className="h-full w-full object-contain" />
          ) : (
            <ImageOff className="h-5 w-5 text-slate-300" />
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*,.ico,.svg"
          onChange={handleFileChange}
          className="hidden"
          id={`brand-upload-${field}`}
        />
        <label
          htmlFor={`brand-upload-${field}`}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-black text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer shadow-2xs"
        >
          {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          <span>{isUploading ? 'Uploading...' : currentUrl ? 'Replace Asset' : 'Upload Asset'}</span>
        </label>
      </div>
    </div>
  );
};
