import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Video,
  Image as ImageIcon,
  TicketPercent,
  CreditCard,
  Truck,
  Settings,
  Mail,
  BookOpen,
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
    description: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
  }[];
}

export const adminNavGroups: AdminSidebarGroup[] = [
  {
    category: 'Overview',
    items: [
      { title: 'Dashboard', description: 'Sales, orders & store overview', href: '/admin', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    category: 'Store',
    items: [
      { title: 'Products', description: 'Add and manage your perfumes', href: '/admin/products', icon: Package },
      { title: 'Orders', description: 'View and process customer orders', href: '/admin/orders', icon: ShoppingBag },
      { title: 'Discount Codes', description: 'Create offers and promotions', href: '/admin/coupons', icon: TicketPercent },
    ],
  },
  {
    category: 'Content',
    items: [
      { title: 'Blog & Journal', description: 'Articles and Fragrance Reaction videos', href: '/admin/blog', icon: BookOpen },
      { title: 'Fragrance Reactions', description: 'Your video content series', href: '/admin/blog?category=Fragrance+Reactions', icon: Video },
      { title: 'Homepage Banners', description: 'Hero images and text', href: '/admin/cms', icon: ImageIcon },
    ],
  },
  {
    category: 'Customers',
    items: [
      { title: 'Customers', description: 'View customer accounts and history', href: '/admin/customers', icon: Users },
    ],
  },
  {
    category: 'Settings',
    items: [
      { title: 'Payment Gateways', description: 'Paystack and bank transfer settings', href: '/admin/payments', icon: CreditCard },
      { title: 'Delivery & Shipping', description: 'Delivery zones and fees', href: '/admin/shipping', icon: Truck },
      { title: 'Email Templates', description: 'Customize order confirmation emails', href: '/admin/settings?tab=emails', icon: Mail },
      { title: 'General Settings', description: 'Store name, logo, contact info', href: '/admin/settings', icon: Settings },
    ],
  },
];

export interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
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
              <img src={logoUrl} alt="Store Logo" className="h-7 max-h-7 w-auto max-w-[100px] object-contain shrink-0" />
            ) : null}
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs tracking-wider text-black uppercase truncate">PHILZ SIGNATURE</span>
              <span className="text-[10px] text-black bg-slate-100 px-1.5 py-0.5 rounded font-bold tracking-wider uppercase truncate w-fit mt-0.5">
                {currentRole && currentRole in ROLE_LABELS ? ROLE_LABELS[currentRole] : 'ADMIN PORTAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {adminNavGroups.map((group) => {
            const filteredItems = group.items.filter((item) => canAccessAdminPath(currentRole, item.href));
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.category} className="space-y-1">
                <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
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
                            'group flex items-start gap-2.5 px-3 py-2 rounded-lg transition-all border-l-2',
                            isActive
                              ? 'bg-[#FFF8E7] border-l-[#C5A880]'
                              : 'border-l-transparent text-slate-700 hover:text-black hover:bg-slate-100'
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon
                              className={cn(
                                'h-4 w-4 shrink-0 mt-0.5 transition-colors',
                                isActive ? 'text-[#C5A880]' : 'text-slate-500 group-hover:text-black'
                              )}
                            />
                            <div className="min-w-0">
                              <div className={cn('text-xs font-semibold leading-tight', isActive ? 'text-[#111111]' : 'text-black')}>
                                {item.title}
                              </div>
                              <div className={cn('text-[10px] leading-tight mt-0.5 truncate', isActive ? 'text-[#6B7280]' : 'text-slate-400')}>
                                {item.description}
                              </div>
                            </div>
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

        {/* Footer */}
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
