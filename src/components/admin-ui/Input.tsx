import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
  ({ className, label, error, type, ...props }, ref) => (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-[#374151]">{label}</label>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full h-10 rounded-md border border-[#D1D5DB] bg-white px-3 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#DC2626] font-medium">{error}</p>}
    </div>
  )
);
AdminInput.displayName = 'AdminInput';

export interface AdminTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const AdminTextarea = React.forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-[#374151]">{label}</label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'w-full min-h-[100px] rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-y',
          error && 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#DC2626] font-medium">{error}</p>}
    </div>
  )
);
AdminTextarea.displayName = 'AdminTextarea';
