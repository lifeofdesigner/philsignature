import { supabase } from '@/lib/supabase';

export interface SearchResultItem {
  id: string;
  type: 'product' | 'order' | 'customer' | 'cms' | 'media' | 'coupon' | 'user' | 'action';
  title: string;
  subtitle?: string;
  href: string;
  badge?: string;
}

export class GlobalSearchService {
  async search(query: string): Promise<SearchResultItem[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResultItem[] = [];

    // Quick Command Actions
    if ('create product'.includes(q) || 'add fragrance'.includes(q)) {
      results.push({ id: 'cmd-1', type: 'action', title: 'Create Product', subtitle: 'Add a new luxury fragrance formulation', href: '/admin/products?action=create', badge: 'Action' });
    }
    if ('edit hero'.includes(q) || 'hero slider'.includes(q)) {
      results.push({ id: 'cmd-2', type: 'action', title: 'Edit Hero Slider', subtitle: 'Customize storefront hero banner & video', href: '/admin/cms?tab=hero', badge: 'Action' });
    }
    if ('invite staff'.includes(q) || 'manage roles'.includes(q)) {
      results.push({ id: 'cmd-3', type: 'action', title: 'Manage Staff & Roles', subtitle: 'Configure user RBAC permissions', href: '/admin/users', badge: 'Action' });
    }

    try {
      // 1. Search Products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, sku, concentration, slug')
        .or(`name.ilike.%${q}%,sku.ilike.%${q}%,concentration.ilike.%${q}%`)
        .limit(5);

      if (products) {
        products.forEach((p) => {
          results.push({
            id: `prod-${p.id}`,
            type: 'product',
            title: p.name,
            subtitle: `SKU: ${p.sku} • ${p.concentration}`,
            href: `/admin/products?search=${encodeURIComponent(p.sku)}`,
            badge: 'Product',
          });
        });
      }

      // 2. Search Orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, email, total_amount, fulfillment_status')
        .or(`order_number.ilike.%${q}%,email.ilike.%${q}%`)
        .limit(5);

      if (orders) {
        orders.forEach((o) => {
          results.push({
            id: `ord-${o.id}`,
            type: 'order',
            title: `Order #${o.order_number}`,
            subtitle: `${o.email} • ₦${Number(o.total_amount).toLocaleString()} • ${o.fulfillment_status}`,
            href: `/admin/orders?search=${encodeURIComponent(o.order_number)}`,
            badge: 'Order',
          });
        });
      }

      // 3. Search Profiles/Customers
      const { data: users } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role')
        .or(`email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
        .limit(5);

      if (users) {
        users.forEach((u) => {
          results.push({
            id: `usr-${u.id}`,
            type: 'user',
            title: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
            subtitle: `${u.email} • Role: ${u.role}`,
            href: `/admin/users?search=${encodeURIComponent(u.email)}`,
            badge: 'User',
          });
        });
      }

      // 4. Search CMS Content
      const { data: cms } = await supabase
        .from('cms_content')
        .select('id, key, title, section')
        .or(`key.ilike.%${q}%,title.ilike.%${q}%,section.ilike.%${q}%`)
        .limit(5);

      if (cms) {
        cms.forEach((c) => {
          results.push({
            id: `cms-${c.id}`,
            type: 'cms',
            title: c.title,
            subtitle: `Section: ${c.section} (Key: ${c.key})`,
            href: `/admin/cms?tab=${c.section}`,
            badge: 'CMS',
          });
        });
      }
    } catch (err) {
      console.warn('Global search query error:', err);
    }

    return results;
  }
}

export const globalSearchService = new GlobalSearchService();

