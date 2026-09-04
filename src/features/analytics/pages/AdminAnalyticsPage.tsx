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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Analytics &amp; Intelligence</h1>
          <p className="text-xs text-slate-600 font-medium mt-1">Live order metrics and fragrance sales revenue</p>
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
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Analytics &amp; Revenue Intelligence</h1>
        <p className="text-xs text-slate-600 font-medium mt-1">
          Real-time financial performance, 14-day sales trends, bestselling formulations, and fulfillment distribution.
        </p>
      </div>

      {snapshot.totalOrders === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-5 w-5" />}
          title="No Orders Logged Yet"
          description="Charts for sales volume, bestselling extraits, and fulfillment trends will populate once live orders arrive."
        />
      ) : (
        <>
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Sales</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(snapshot.totalRevenue)}</div>
              <p className="text-[11px] text-emerald-700 font-medium">100% verified settlement</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Orders</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{snapshot.totalOrders}</div>
              <p className="text-[11px] text-slate-600">{snapshot.paidOrders} paid orders fulfilled</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Order Value</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(Math.round(snapshot.averageOrderValue))}
              </div>
              <p className="text-[11px] text-slate-600">Per paying client</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Unique Clients</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{snapshot.totalCustomers}</div>
              <p className="text-[11px] text-slate-600">Registered profiles</p>
            </div>
          </div>

          {/* 14-Day Sales Trend Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Revenue Trend — Past 14 Days</h3>
              <span className="text-xs font-medium text-slate-500 font-mono">Daily volume (₦)</span>
            </div>

            <div className="flex items-end gap-2 h-44 pt-4 border-b border-slate-100">
              {snapshot.revenueByDay.map((d) => {
                const heightPct = Math.max((d.revenue / maxDailyRevenue) * 100, d.revenue > 0 ? 6 : 0);
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="w-full flex items-end h-36">
                      <div
                        className="w-full bg-amber-600 hover:bg-amber-700 transition-all rounded-t-md cursor-pointer relative group"
                        style={{ height: `${heightPct}%` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono py-1 px-2 rounded pointer-events-none whitespace-nowrap transition-opacity z-10 shadow-md">
                          {formatCurrency(d.revenue)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono font-medium">{d.date.slice(8, 10)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Grid: Top Products & Fulfillment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Formulations Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900">Bestselling Formulations</h3>
              {snapshot.topProducts.length === 0 ? (
                <p className="text-xs text-slate-500">No product sales recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {snapshot.topProducts.map((p) => (
                    <div key={p.productName} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900">{p.productName}</span>
                        <span className="font-bold text-amber-900 font-mono">{formatShortCurrency(p.revenue)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-700 rounded-full transition-all duration-500"
                          style={{ width: `${(p.revenue / maxTopProductRevenue) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>{p.unitsSold} units dispatched</span>
                        <span>{Math.round((p.revenue / (snapshot.totalRevenue || 1)) * 100)}% of total</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fulfillment Breakdown Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900">Fulfillment Pipeline Distribution</h3>
              <div className="space-y-2.5">
                {Object.entries(snapshot.fulfillmentBreakdown).map(([status, count]) => {
                  const getStatusBadge = (st: string) => {
                    switch (st) {
                      case 'delivered':
                        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
                      case 'shipped':
                        return 'bg-blue-50 text-blue-800 border-blue-200';
                      case 'processing':
                        return 'bg-amber-50 text-amber-800 border-amber-200';
                      default:
                        return 'bg-slate-100 text-slate-700 border-slate-200';
                    }
                  };

                  return (
                    <div
                      key={status}
                      className="flex items-center justify-between text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{count} Orders</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
