import React from 'react';
import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
}) => {
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
            <span className="text-[9px] uppercase tracking-luxury text-luxury-gold">
              ADMIN WORKSPACE
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {adminNavItems.map((item) => {
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

        {/* View Live Store Footer */}
        <div className="p-3 border-t border-luxury-border/60">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs text-luxury-muted hover:text-luxury-gold transition-colors"
          >
            <span className="uppercase tracking-luxury">Live Storefront</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </aside>
    </>
  );
};

