import React from 'react';
import { BarChart3, ShoppingBag, Users, TrendingUp, DollarSign } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { useAdminAnalytics } from '../hooks/useAdminAnalytics';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

const formatShortCurrency = (amount: number) => {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}K`;
  return `₦${amount}`;
};

export const AdminAnalyticsPage: React.FC = () => {
  const { snapshot, isLoading, isError } = useAdminAnalytics();

  if (isLoading) return <PageSkeleton />;

  if (isError || !snapshot) {
    return (
      <div className="space-y-6">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">Intelligence & Reporting</span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">Sales Analytics</h1>
        </div>
        <EmptyState
          icon={<BarChart3 className="h-5 w-5" />}
          title="Unable to Load Analytics"
          description="Sales data could not be retrieved from Supabase. Please retry."
        />
      </div>
    );
  }

  const maxDailyRevenue = Math.max(...snapshot.revenueByDay.map((d) => d.revenue), 1);
  const maxTopProductRevenue = Math.max(...snapshot.topProducts.map((p) => p.revenue), 1);

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">Intelligence & Reporting</span>
        <h1 className="font-serif text-3xl text-white font-normal mt-1">Sales Analytics</h1>
      </div>

      {snapshot.totalOrders === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-5 w-5" />}
          title="No Orders Yet"
          description="Charts for sales volume, bestselling extraits, and conversion trends will populate once live orders arrive."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-luxury-card border border-luxury-border p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-luxury text-luxury-muted font-medium">Total Revenue</span>
                <DollarSign className="h-4 w-4 text-luxury-gold" />
              </div>
              <div className="font-serif text-2xl text-white">{formatCurrency(snapshot.totalRevenue)}</div>
            </div>
            <div className="bg-luxury-card border border-luxury-border p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-luxury text-luxury-muted font-medium">Orders</span>
                <ShoppingBag className="h-4 w-4 text-luxury-gold" />
              </div>
              <div className="font-serif text-2xl text-white">{snapshot.totalOrders}</div>
              <p className="text-[11px] text-luxury-muted">{snapshot.paidOrders} paid</p>
            </div>
            <div className="bg-luxury-card border border-luxury-border p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-luxury text-luxury-muted font-medium">Avg Order Value</span>
                <TrendingUp className="h-4 w-4 text-luxury-gold" />
              </div>
              <div className="font-serif text-2xl text-white">{formatCurrency(Math.round(snapshot.averageOrderValue))}</div>
            </div>
            <div className="bg-luxury-card border border-luxury-border p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-luxury text-luxury-muted font-medium">Customers</span>
                <Users className="h-4 w-4 text-luxury-gold" />
              </div>
              <div className="font-serif text-2xl text-white">{snapshot.totalCustomers}</div>
            </div>
          </div>

          <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
            <h3 className="font-serif text-lg text-white font-normal">Revenue — Last 14 Days</h3>
            <div className="flex items-end gap-1.5 h-40">
              {snapshot.revenueByDay.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="w-full flex items-end h-32">
                    <div
                      className="w-full bg-luxury-gold/70 group-hover:bg-luxury-gold transition-colors rounded-t-sm"
                      style={{ height: `${Math.max((d.revenue / maxDailyRevenue) * 100, d.revenue > 0 ? 4 : 0)}%` }}
                      title={`${d.date}: ${formatCurrency(d.revenue)}`}
                    />
                  </div>
                  <span className="text-[8px] text-luxury-muted rotate-0">{d.date.slice(8, 10)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
              <h3 className="font-serif text-lg text-white font-normal">Top Formulations</h3>
              {snapshot.topProducts.length === 0 ? (
                <p className="text-xs text-luxury-muted">No paid orders with items yet.</p>
              ) : (
                <div className="space-y-3">
                  {snapshot.topProducts.map((p) => (
                    <div key={p.productName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white">{p.productName}</span>
                        <span className="text-luxury-gold font-medium">{formatShortCurrency(p.revenue)}</span>
                      </div>
                      <div className="h-1.5 bg-luxury-charcoal rounded-full overflow-hidden">
                        <div
                          className="h-full bg-luxury-gold rounded-full"
                          style={{ width: `${(p.revenue / maxTopProductRevenue) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-luxury-muted">{p.unitsSold} units sold</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-luxury-card border border-luxury-border p-6 space-y-4">
              <h3 className="font-serif text-lg text-white font-normal">Fulfillment Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(snapshot.fulfillmentBreakdown).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-xs p-2.5 bg-luxury-charcoal/40 rounded">
                    <span className="capitalize text-luxury-muted">{status}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
