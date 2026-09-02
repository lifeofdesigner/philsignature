import { orderService } from './OrderService';
import { userService } from './UserService';
import type { Order } from '@/types/database';

export interface TopProductStat {
  productName: string;
  unitsSold: number;
  revenue: number;
}

export interface RevenueByDay {
  date: string;
  revenue: number;
}

export interface AnalyticsSnapshot {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  fulfillmentBreakdown: Record<string, number>;
  topProducts: TopProductStat[];
  revenueByDay: RevenueByDay[];
}

export class AnalyticsService {
  async getSnapshot(): Promise<AnalyticsSnapshot> {
    const [orders, customers] = await Promise.all([
      orderService.getAllOrdersAdmin(),
      userService.getAllCustomers(),
    ]);

    const paidOrders = orders.filter((o) => o.financial_status === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const averageOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    const fulfillmentBreakdown: Record<string, number> = {};
    for (const order of orders) {
      fulfillmentBreakdown[order.fulfillment_status] = (fulfillmentBreakdown[order.fulfillment_status] || 0) + 1;
    }

    const productStats = new Map<string, TopProductStat>();
    for (const order of paidOrders) {
      for (const item of order.items || []) {
        const existing = productStats.get(item.product_name) || {
          productName: item.product_name,
          unitsSold: 0,
          revenue: 0,
        };
        existing.unitsSold += item.quantity;
        existing.revenue += item.subtotal;
        productStats.set(item.product_name, existing);
      }
    }
    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const revenueByDay = this.buildRevenueByDay(paidOrders, 14);

    return {
      totalRevenue,
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
      averageOrderValue,
      totalCustomers: customers.length,
      fulfillmentBreakdown,
      topProducts,
      revenueByDay,
    };
  }

  private buildRevenueByDay(orders: Order[], days: number): RevenueByDay[] {
    const buckets = new Map<string, number>();
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }

    for (const order of orders) {
      const key = order.created_at.slice(0, 10);
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) || 0) + order.total_amount);
      }
    }

    return Array.from(buckets.entries()).map(([date, revenue]) => ({ date, revenue }));
  }
}

export const analyticsService = new AnalyticsService();
