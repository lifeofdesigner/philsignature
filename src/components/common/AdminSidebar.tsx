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
  Mail,
  Globe,
  Trash2,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useStoreAppearance } from '@/features/cms/hooks/useStoreAppearance';
import type { UserRole } from '@/types/database';
import { canAccessAdminPath, ROLE_LABELS } from '@/lib/permissions';

export interface AdminSidebarGroup {
  category: string;
  items: {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
  }[];
}

export const adminNavGroups: AdminSidebarGroup[] = [
  {
    category: 'Overview',
    items: [
      { title: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    category: 'Commerce & Catalog',
    items: [
      { title: 'Products', href: '/admin/products', icon: Package },
      { title: 'Collections', href: '/admin/collections', icon: Layers },
      { title: 'Categories', href: '/admin/categories', icon: Tags },
      { title: 'Orders', href: '/admin/orders', icon: ShoppingBag },
      { title: 'Customers', href: '/admin/customers', icon: Users },
      { title: 'Coupons', href: '/admin/coupons', icon: TicketPercent },
      { title: 'Reviews', href: '/admin/reviews', icon: Star },
    ],
  },
  {
    category: 'Content & Brand',
    items: [
      { title: 'CMS Content', href: '/admin/cms', icon: FileText },
      { title: 'Media Library', href: '/admin/media', icon: ImageIcon },
      { title: 'SEO Engine', href: '/admin/seo', icon: Globe },
    ],
  },
  {
    category: 'Operations & Finance',
    items: [
      { title: 'Payments', href: '/admin/payments', icon: CreditCard },
      { title: 'Shipping', href: '/admin/shipping', icon: Truck },
      { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    category: 'System & Security',
    items: [
      { title: 'Users & Roles', href: '/admin/users', icon: Shield },
      { title: 'Settings', href: '/admin/settings', icon: Settings },
      { title: 'Email Templates', href: '/admin/settings?tab=emails', icon: Mail },
      { title: 'Recycle Bin', href: '/admin/users?tab=trash', icon: Trash2 },
    ],
  },
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
  const { appearance } = useStoreAppearance();
  const navigate = useNavigate();
  const currentRole = (profile?.role || role || undefined) as UserRole | undefined;

  const logoUrl = appearance.logo_url || appearance.logo_dark_url;

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
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:translate-x-0 shadow-xs',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Store Logo"
                className="h-7 max-h-7 w-auto max-w-[100px] object-contain shrink-0"
              />
            ) : null}
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs tracking-wider text-black uppercase truncate">
                PHILZ SIGNATURE
              </span>
              <span className="text-[10px] text-black bg-slate-100 px-1.5 py-0.5 rounded font-bold tracking-wider uppercase truncate w-fit mt-0.5">
                {currentRole && currentRole in ROLE_LABELS ? ROLE_LABELS[currentRole] : 'ADMIN PORTAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Categorized Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {adminNavGroups.map((group) => {
            const filteredItems = group.items.filter((item) => canAccessAdminPath(currentRole, item.href));
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.category} className="space-y-1">
                <div className="px-3 text-[10px] font-bold text-black uppercase tracking-widest">
                  {group.category}
                </div>
                <div className="space-y-0.5 mt-1">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.exact}
                        onClick={onClose}
                        className={({ isActive }) =>
                          cn(
                            'group flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all',
                            isActive
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-black hover:text-black hover:bg-slate-100'
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon
                              className={cn(
                                'h-4 w-4 shrink-0 transition-colors',
                                isActive ? 'text-white' : 'text-black group-hover:text-black'
                              )}
                            />
                            <span>{item.title}</span>
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer Quick Actions */}
        <div className="p-3 border-t border-slate-200 bg-white space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-1.5 text-xs text-black hover:text-black transition-colors rounded-lg hover:bg-slate-200/60 font-semibold"
          >
            <span>Live Storefront</span>
            <ExternalLink className="h-3.5 w-3.5 text-black" />
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer font-semibold"
          >
            <span>Sign Out</span>
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
};
