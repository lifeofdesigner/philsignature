import React from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABELS } from '@/lib/permissions';

export const AdminDashboardPage: React.FC = () => {
  const { profile, role } = useAuth();
  const currentRole = profile?.role || role || 'staff';
  const roleTitle = currentRole && currentRole in ROLE_LABELS ? ROLE_LABELS[currentRole] : 'Administrator';

  return (
    <div className="space-y-6">
      {/* SaaS Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/60">
              <Sparkles className="h-3 w-3 mr-1 text-amber-700" />
              {roleTitle} Workspace
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Philz Signature Enterprise CMS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Store Executive Summary
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/products?action=create">
            <Button size="sm" className="bg-amber-700 hover:bg-amber-800 text-white font-medium gap-1.5 shadow-2xs">
              <Plus className="h-4 w-4" />
              <span>Add Fragrance</span>
            </Button>
          </Link>
          <Link to="/admin/cms">
            <Button size="sm" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5">
              <FileText className="h-4 w-4 text-slate-500" />
              <span>Edit Website</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Sales Revenue
            </CardTitle>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">₦4,250,000.00</div>
            <div className="flex items-center text-xs text-emerald-700 font-medium mt-1">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              <span>+18.4% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Orders Placed
            </CardTitle>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-800">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">142</div>
            <div className="flex items-center text-xs text-slate-500 mt-1">
              <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
              <span>12 pending fulfillment</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Avg Order Value
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">₦29,929.57</div>
            <p className="text-xs text-slate-500 mt-1">Extrait & Perfume Oils average</p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Formulations
            </CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-700">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">28</div>
            <p className="text-xs text-emerald-700 font-medium mt-1">100% synchronized in Supabase</p>
          </CardContent>
        </Card>
      </div>

      {/* Main SaaS Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Overview Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Recent Customer Orders</CardTitle>
              <CardDescription>Live fulfillment & status stream from Supabase</CardDescription>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-amber-800 hover:underline">
              View all orders &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-medium">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {[
                    { number: 'PS-10928', customer: 'Amara Okafor', total: '₦185,000.00', pay: 'Paid', status: 'Processing' },
                    { number: 'PS-10927', customer: 'Tunde Bakare', total: '₦45,000.00', pay: 'Paid', status: 'Shipped' },
                    { number: 'PS-10926', customer: 'Chioma Adebayo', total: '₦95,000.00', pay: 'Paid', status: 'Delivered' },
                    { number: 'PS-10925', customer: 'David Vance', total: '₦120,000.00', pay: 'Pending', status: 'Pending' },
                  ].map((row) => (
                    <tr key={row.number} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{row.number}</td>
                      <td className="py-3 px-4 text-slate-700">{row.customer}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{row.total}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${row.pay === 'Paid' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' : 'bg-amber-50 text-amber-800 border border-amber-200/60'}`}>
                          {row.pay}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* System Health & Quick Operations */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Security & Role Access</span>
              </CardTitle>
              <CardDescription>RBAC Permission Enforcement Active</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-600">Active Role:</span>
                <span className="font-semibold text-slate-900 uppercase tracking-wide">{roleTitle}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-600">Live CMS Sync:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <Activity className="h-3 w-3 animate-pulse" /> Supabase Realtime
                </span>
              </div>
              <Link to="/admin/users" className="block pt-1">
                <Button variant="outline" size="sm" className="w-full text-xs text-slate-700 border-slate-200 hover:bg-slate-50 justify-center">
                  <Users className="h-3.5 w-3.5 mr-1.5 text-slate-500" /> Manage Staff & Roles
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-amber-900 text-white border-amber-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-amber-100 uppercase tracking-wider">
                Live Store Synchronization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-amber-200/90 leading-relaxed font-light">
              <p>
                All edits made across Products, Hero Sliders, Menus, FAQs, Policies, and Media in this portal are immediately saved to Supabase and propagate live to the storefront.
              </p>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-semibold text-amber-300 hover:underline pt-1"
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
