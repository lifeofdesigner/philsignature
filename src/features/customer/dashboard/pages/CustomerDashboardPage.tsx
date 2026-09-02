import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, MapPin, ArrowRight, Package, Clock, Sparkles, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useCustomerOrders } from '@/features/checkout/hooks/useOrders';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { useQuery } from '@tanstack/react-query';
import { addressService } from '@/services/AddressService';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import type { CustomerAddress } from '@/types/database';

export const CustomerDashboardPage: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully.');
      navigate('/login');
    } catch {
      toast.error('Failed to sign out.');
    }
  };
  const { data: orders = [], isLoading: isLoadingOrders } = useCustomerOrders(user?.id);
  const { count: wishlistCount, isLoading: isLoadingWishlist } = useWishlist();

  const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery<CustomerAddress[]>({
    queryKey: ['customer-addresses', user?.id],
    queryFn: () => (user?.id ? addressService.getAddresses(user.id) : Promise.resolve([])),
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 10,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    return new Date(isoString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoadingOrders || isLoadingWishlist || isLoadingAddresses) {
    return <PageSkeleton />;
  }

  const defaultAddress = addresses.find((a) => a.is_default) || addresses[0] || null;
  const recentOrders = orders.slice(0, 3);
  const lifetimeSpend = orders
    .filter((o) => o.financial_status === 'paid')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const patronTier = lifetimeSpend >= 500000 ? 'VIP Customer' : 'Valued Customer';
  const memberSince = profile?.created_at || user?.created_at;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Patron Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-luxury-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
              My Account
            </span>
            <span className="text-luxury-border">•</span>
            <span className="text-[10px] uppercase tracking-luxury text-luxury-muted">
              {patronTier}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-luxury-cream font-normal mt-1">
            Welcome, {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Valued Customer'}
          </h1>
          <p className="text-xs text-luxury-muted mt-1.5 font-light">
            Manage your orders, saved addresses, and account details all in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {memberSince && (
            <div className="text-left md:text-right hidden sm:block">
              <span className="text-[10px] uppercase tracking-wider text-luxury-muted block">Customer Since</span>
              <span className="font-serif text-sm text-luxury-gold font-medium">{formatDate(memberSince)}</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-500/20 rounded-sm transition-colors cursor-pointer"
            title="Sign Out of Account"
            aria-label="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="text-[11px] uppercase tracking-luxury font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Orders Card */}
        <Link
          to="/account/orders"
          className="bg-luxury-card/60 border border-luxury-border p-5 rounded hover:border-luxury-gold/50 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-muted font-medium">
              My Orders
            </span>
            <div className="p-2 rounded bg-luxury-gold/10 text-luxury-gold group-hover:scale-110 transition-transform">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="font-serif text-2xl text-luxury-cream font-normal group-hover:text-luxury-gold transition-colors">
            {orders.length}
          </div>
          <p className="text-[11px] text-luxury-muted mt-1 truncate">
            {lifetimeSpend > 0 ? `Total Spent: ${formatCurrency(lifetimeSpend)}` : 'No completed orders yet'}
          </p>
        </Link>

        {/* Wishlist Card */}
        <Link
          to="/wishlist"
          className="bg-luxury-card/60 border border-luxury-border p-5 rounded hover:border-luxury-gold/50 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-muted font-medium">
              My Wishlist
            </span>
            <div className="p-2 rounded bg-luxury-gold/10 text-luxury-gold group-hover:scale-110 transition-transform">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          <div className="font-serif text-2xl text-luxury-cream font-normal group-hover:text-luxury-gold transition-colors">
            {wishlistCount}
          </div>
          <p className="text-[11px] text-luxury-muted mt-1 truncate">
            Perfumes you have saved
          </p>
        </Link>

        {/* Saved Addresses Card */}
        <Link
          to="/account/addresses"
          className="bg-luxury-card/60 border border-luxury-border p-5 rounded hover:border-luxury-gold/50 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-muted font-medium">
              Saved Addresses
            </span>
            <div className="p-2 rounded bg-luxury-gold/10 text-luxury-gold group-hover:scale-110 transition-transform">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          {defaultAddress ? (
            <div>
              <div className="text-xs text-luxury-cream font-medium truncate">
                {defaultAddress.first_name} {defaultAddress.last_name}
              </div>
              <p className="text-[11px] text-luxury-muted mt-0.5 truncate">
                {defaultAddress.address_line1}, {defaultAddress.city}
              </p>
            </div>
          ) : (
            <div>
              <div className="text-xs text-luxury-muted italic">No address saved</div>
              <p className="text-[11px] text-luxury-gold mt-0.5">Click to configure</p>
            </div>
          )}
        </Link>
      </div>

      {/* 3. Recent Acquisitions Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg text-luxury-cream font-normal">Recent Orders</h3>
            <p className="text-xs text-luxury-muted">Your latest orders and their status</p>
          </div>
          {orders.length > 0 && (
            <Link
              to="/account/orders"
              className="text-xs text-luxury-gold hover:text-luxury-gold-light inline-flex items-center gap-1 uppercase tracking-wider font-medium"
            >
              <span>View All ({orders.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-luxury-card border border-luxury-border/60 p-8 rounded text-center space-y-4">
            <div className="h-12 w-12 mx-auto rounded-full bg-luxury-gold/10 text-luxury-gold flex items-center justify-center">
              <Package className="h-6 w-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="font-serif text-base text-luxury-cream font-normal">No Orders Yet</h4>
              <p className="text-xs text-luxury-muted font-light">
                You have not placed any orders yet. Browse our collection of premium perfumes to get started.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-luxury-gold text-black hover:bg-luxury-gold-light text-xs uppercase tracking-luxury-wide font-semibold rounded transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Shop Now</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="bg-luxury-card border border-luxury-border p-4 sm:p-5 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-luxury-gold/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-luxury-cream tracking-wider">
                      {order.order_number}
                    </span>
                    <span
                      className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-medium ${
                        order.financial_status === 'paid'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40'
                          : 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40'
                      }`}
                    >
                      {order.financial_status}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-medium bg-luxury-border/40 text-luxury-muted">
                      {order.fulfillment_status}
                    </span>
                  </div>
                  <p className="text-xs text-luxury-muted flex items-center gap-2 pt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(order.created_at)}</span>
                    <span>•</span>
                    <span className="capitalize">{order.payment_method}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-luxury-border/40 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-luxury-muted block uppercase tracking-wider">Total</span>
                    <span className="font-serif text-sm font-semibold text-luxury-gold">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                  <Link
                    to={`/checkout/confirmation/${order.order_number}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-luxury-border/60 hover:bg-luxury-gold hover:text-black text-luxury-cream text-xs uppercase tracking-wider rounded transition-colors font-medium"
                  >
                    <span>View</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <Link
          to="/shop"
          className="p-4 bg-luxury-card border border-luxury-border rounded hover:border-luxury-gold/40 transition-colors flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-serif text-luxury-cream group-hover:text-luxury-gold transition-colors block">
              Shop Our Perfumes
            </span>
            <span className="text-[11px] text-luxury-muted">Browse our full collection</span>
          </div>
          <ArrowRight className="h-4 w-4 text-luxury-muted group-hover:text-luxury-gold group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/track-order"
          className="p-4 bg-luxury-card border border-luxury-border rounded hover:border-luxury-gold/40 transition-colors flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-serif text-luxury-cream group-hover:text-luxury-gold transition-colors block">
              Track My Order
            </span>
            <span className="text-[11px] text-luxury-muted">Check your delivery status</span>
          </div>
          <ArrowRight className="h-4 w-4 text-luxury-muted group-hover:text-luxury-gold group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/account/profile"
          className="p-4 bg-luxury-card border border-luxury-border rounded hover:border-luxury-gold/40 transition-colors flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-serif text-luxury-cream group-hover:text-luxury-gold transition-colors block">
              Profile & Password
            </span>
            <span className="text-[11px] text-luxury-muted">Update your details</span>
          </div>
          <ArrowRight className="h-4 w-4 text-luxury-muted group-hover:text-luxury-gold group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
};
