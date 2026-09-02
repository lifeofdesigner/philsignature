import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Tags,
  ShoppingBag,
  Users,
  FileText,
  Image as ImageIcon,
  TicketPercent,
  Star,
  CreditCard,
  Truck,
  BarChart3,
  Shield,
  Settings,
  Globe,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/database';
import { canAccessAdminPath, ROLE_LABELS } from '@/lib/permissions';

export const adminNavItems = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { title: 'Products', href: '/admin/products', icon: Package },
  { title: 'Collections', href: '/admin/collections', icon: Layers },
  { title: 'Categories', href: '/admin/categories', icon: Tags },
  { title: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { title: 'Customers', href: '/admin/customers', icon: Users },
  { title: 'CMS Content', href: '/admin/cms', icon: FileText },
  { title: 'Media Library', href: '/admin/media', icon: ImageIcon },
  { title: 'Coupons', href: '/admin/coupons', icon: TicketPercent },
  { title: 'Reviews', href: '/admin/reviews', icon: Star },
  { title: 'Payments', href: '/admin/payments', icon: CreditCard },
  { title: 'Shipping', href: '/admin/shipping', icon: Truck },
  { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { title: 'Users & Roles', href: '/admin/users', icon: Shield },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
  { title: 'SEO Engine', href: '/admin/seo', icon: Globe },
];

export interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, role, logout } = useAuth();
  const navigate = useNavigate();
  const currentRole = (profile?.role || role || undefined) as UserRole | undefined;
  const visibleNavItems = adminNavItems.filter((item) => canAccessAdminPath(currentRole, item.href));

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully.');
      navigate('/login');
    } catch {
      toast.error('Failed to sign out.');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-luxury-charcoal border-r border-luxury-border flex flex-col transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-luxury-border/60">
          <div className="flex flex-col">
            <span className="font-serif text-lg tracking-widest text-white uppercase font-medium">
              PHILZ SIGNATURE
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] uppercase tracking-luxury text-luxury-gold font-medium">
                {currentRole && currentRole in ROLE_LABELS ? ROLE_LABELS[currentRole as UserRole] : 'ADMIN WORKSPACE'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.exact}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-luxury transition-all rounded-sm font-medium',
                    isActive
                      ? 'bg-luxury-gold/15 text-luxury-gold border-l-2 border-luxury-gold pl-2.5 font-semibold'
                      : 'text-luxury-muted hover:text-luxury-cream hover:bg-luxury-border/40'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* View Live Store & Sign Out Footer */}
        <div className="p-3 border-t border-luxury-border/60 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs text-luxury-muted hover:text-luxury-gold transition-colors rounded-sm"
          >
            <span className="uppercase tracking-luxury">Live Storefront</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/25 rounded-sm transition-colors cursor-pointer"
          >
            <span className="uppercase tracking-luxury font-medium">Sign Out</span>
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
};

