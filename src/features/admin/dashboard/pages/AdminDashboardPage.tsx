import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  Clock,
  ArrowUpRight,
  Plus,
  FileText,
  Users,
  ShieldCheck,
  Activity,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdminButton } from '@/components/admin-ui';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABELS } from '@/lib/permissions';
import { analyticsService, type AnalyticsSnapshot } from '@/services/AnalyticsService';
import { orderService } from '@/services/OrderService';
import { productService } from '@/services/ProductService';
import type { Order } from '@/types/database';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

export const AdminDashboardPage: React.FC = () => {
  const { profile, role } = useAuth();
  const currentRole = profile?.role || role || 'staff';
  const roleTitle = currentRole && currentRole in ROLE_LABELS ? ROLE_LABELS[currentRole] : 'Administrator';

  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [snap, allOrders, products] = await Promise.all([
        analyticsService.getSnapshot(),
        orderService.getAllOrdersAdmin(),
        productService.getAllProductsAdmin(),
      ]);
      setSnapshot(snap);
      setRecentOrders(allOrders.slice(0, 5));
      setProductCount(products.length);
    } catch (err) {
      console.error('Failed to load dashboard metrics from Supabase:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  const pendingFulfillmentCount = snapshot?.fulfillmentBreakdown?.['pending'] ?? 0;
  const processingCount = snapshot?.fulfillmentBreakdown?.['processing'] ?? 0;

  return (
    <div className="space-y-6">
      {/* SaaS Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-black border border-slate-300">
              <Sparkles className="h-3 w-3 mr-1 text-black" />
              {roleTitle} Workspace
            </span>
            <span className="text-xs text-black">•</span>
            <span className="text-xs text-black font-semibold">Philz Signature Enterprise Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-black tracking-tight mt-1">
            Store Executive Summary
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <AdminButton
            size="sm"
            variant="secondary"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5 font-medium"
            title="Refresh metrics from Supabase"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </AdminButton>
          <Link to="/admin/products?action=create">
            <AdminButton size="sm" variant="primary" className="gap-1.5 shadow-xs">
              <Plus className="h-4 w-4" />
              <span>Add Fragrance</span>
            </AdminButton>
          </Link>
          <Link to="/admin/cms">
            <AdminButton size="sm" variant="secondary" className="gap-1.5 font-medium">
              <FileText className="h-4 w-4" />
              <span>Edit Website</span>
            </AdminButton>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-slate-300 transition-all bg-white border-slate-200 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-black">
              Total Sales Revenue
            </CardTitle>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 border border-emerald-200/60">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black tracking-tight">
              {formatCurrency(snapshot?.totalRevenue || 0)}
            </div>
            <div className="flex items-center text-xs text-emerald-800 font-semibold mt-1">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              <span>{snapshot?.paidOrders || 0} settled transactions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-all bg-white border-slate-200 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-black">
              Orders Placed
            </CardTitle>
            <div className="p-2 bg-slate-100 rounded-lg text-black border border-slate-300">
              <ShoppingBag className="h-4 w-4 text-black" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black tracking-tight">
              {snapshot?.totalOrders || 0}
            </div>
            <div className="flex items-center text-xs text-black font-semibold mt-1">
              <Clock className="h-3.5 w-3.5 mr-1 text-black" />
              <span>{pendingFulfillmentCount + processingCount} awaiting dispatch</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-all bg-white border-slate-200 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-black">
              Avg Order Value
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-800 border border-blue-200/60">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black tracking-tight">
              {formatCurrency(Math.round(snapshot?.averageOrderValue || 0))}
            </div>
            <p className="text-xs text-black mt-1 font-medium">Per completed customer order</p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-all bg-white border-slate-200 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-black">
              Active Formulations
            </CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-800 border border-purple-200/60">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black tracking-tight">
              {productCount}
            </div>
            <p className="text-xs text-emerald-800 font-semibold mt-1">Catalog synchronized in Supabase</p>
          </CardContent>
        </Card>
      </div>

      {/* Main SaaS Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Overview Table */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-base font-bold text-black">Recent Customer Orders</CardTitle>
              <CardDescription className="text-black font-medium">Live fulfillment & status stream from Supabase</CardDescription>
            </div>
            <Link to="/admin/orders" className="text-xs font-bold text-black hover:underline">
              View all orders &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white text-black uppercase tracking-wider border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer Email</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-black">
                        No customer orders recorded yet in Supabase.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-100 transition-colors">
                        <td className="py-3 px-4 font-bold text-black">
                          <Link to="/admin/orders" className="hover:text-black hover:underline">
                            #{order.order_number}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-black font-mono">{order.email}</td>
                        <td className="py-3 px-4 font-bold text-black">{formatCurrency(order.total_amount)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              order.financial_status === 'paid'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-black border border-slate-300'
                            }`}
                          >
                            {order.financial_status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-black border border-slate-200 capitalize">
                            {order.fulfillment_status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* System Health & Quick Operations */}
        <div className="space-y-6">
          <Card className="bg-white border-slate-200 shadow-2xs">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-bold text-black flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Security & Role Access</span>
              </CardTitle>
              <CardDescription className="text-black font-medium">RBAC Permission Enforcement Active</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs pt-4">
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="text-black font-medium">Active Role:</span>
                <span className="font-bold text-black uppercase tracking-wide">{roleTitle}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="text-black font-medium">Live Database Sync:</span>
                <span className="font-semibold text-emerald-800 flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 animate-pulse text-emerald-600" /> Supabase Realtime
                </span>
              </div>
              <Link to="/admin/users" className="block pt-1">
                <AdminButton variant="secondary" size="sm" className="w-full text-xs justify-center font-medium">
                  <Users className="h-3.5 w-3.5 mr-1.5" /> Manage Staff & Roles
                </AdminButton>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border border-[#DC2626] shadow-xs">
            <CardHeader className="pb-2 border-b border-[#E5E7EB]">
              <CardTitle className="text-sm font-bold text-black uppercase tracking-wider">
                Live Storefront Synchronization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-[#374151] leading-relaxed font-normal pt-3">
              <p>
                All edits made across Products, Hero Sliders, Menus, FAQs, Policies, and Media in this portal are immediately saved to Supabase and propagate live to the storefront.
              </p>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-semibold text-[#DC2626] hover:underline pt-1"
              >
                Inspect Live Website &rarr;
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
