import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AdminSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const AdminSelect = React.forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ className, label, children, ...props }, ref) => (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-[#374151]">{label}</label>
      )}
      <select
        ref={ref}
        style={{ colorScheme: 'light', ...props.style }}
        className={cn(
          'w-full h-10 rounded-md border border-[#D1D5DB] bg-white px-3 text-sm text-[#111111] focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  )
);
AdminSelect.displayName = 'AdminSelect';
