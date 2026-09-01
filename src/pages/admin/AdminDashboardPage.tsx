import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
            Executive Summary
          </span>
          <h1 className="font-serif text-3xl text-white font-normal mt-1">
            Boutique Performance
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/products">
            <Button variant="luxury" size="sm" className="gap-1.5">
              <Package className="h-3.5 w-3.5" />
              <span>Manage Fragrances</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-luxury font-medium text-luxury-muted">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-luxury-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-white font-normal">₦0.00</div>
            <div className="flex items-center text-[10px] text-emerald-400 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
              <span>Ready for live transactions</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-luxury font-medium text-luxury-muted">
              Orders Placed
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-luxury-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-white font-normal">0</div>
            <div className="flex items-center text-[10px] text-luxury-muted mt-1">
              <Clock className="h-3 w-3 mr-1" />
              <span>0 pending fulfillment</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-luxury font-medium text-luxury-muted">
              Avg Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-luxury-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-white font-normal">₦0.00</div>
            <p className="text-[10px] text-luxury-muted mt-1">Per checkout acquisition</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-luxury font-medium text-luxury-muted">
              Active Formulations
            </CardTitle>
            <Package className="h-4 w-4 text-luxury-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-white font-normal">0</div>
            <p className="text-[10px] text-luxury-muted mt-1">In published catalog</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Status Notice */}
      <div className="bg-luxury-card border border-luxury-border p-6 text-xs text-luxury-muted leading-relaxed font-light">
        <span className="text-luxury-gold font-medium uppercase tracking-luxury">
          Database Readiness:
        </span>{' '}
        Database tables, full catalog seed, and real-time Supabase subscriptions will activate in Phase 2 & 7.
      </div>
    </div>
  );
};
