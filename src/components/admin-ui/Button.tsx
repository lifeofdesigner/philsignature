import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-semibold rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

const variants: Record<NonNullable<AdminButtonProps['variant']>, string> = {
  primary: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] focus-visible:ring-[#DC2626]',
  secondary:
    'bg-white text-[#111111] border border-[#111111] hover:bg-[#F9FAFB] focus-visible:ring-[#DC2626]',
  danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] focus-visible:ring-[#DC2626]',
  success: 'bg-[#16A34A] text-white hover:bg-[#15803D] focus-visible:ring-[#16A34A]',
  ghost: 'bg-transparent text-[#374151] hover:bg-[#F9FAFB] focus-visible:ring-[#DC2626]',
};

const sizes: Record<NonNullable<AdminButtonProps['size']>, string> = {
  sm: 'h-9 px-3',
  md: 'h-10 px-4',
  lg: 'h-11 px-6 text-sm',
  icon: 'h-9 w-9 p-0',
};

export const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, style, ...props }, ref) => {
    const isDarkVariant = variant === 'primary' || variant === 'danger' || variant === 'success';
    return (
      <button
        ref={ref}
        data-admin-btn={variant}
        data-keep-white={isDarkVariant ? 'true' : undefined}
        style={{
          ...(isDarkVariant ? { color: '#FFFFFF' } : {}),
          ...style,
        }}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0 text-white" />}
        {children}
      </button>
    );
  }
);
AdminButton.displayName = 'AdminButton';
