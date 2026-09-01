import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { StoreShell } from '@/components/layouts/StoreShell';
import { CustomerShell } from '@/components/layouts/CustomerShell';
import { AdminShell } from '@/components/layouts/AdminShell';

// Storefront Feature Pages
import { HomePage } from '@/features/storefront/home';
import { ShopPage } from '@/features/storefront/shop';
import { CollectionsPage } from '@/features/storefront/collections';
import { ProductDetailPage } from '@/features/storefront/product';
import { AboutPage } from '@/features/storefront/about';
import { ContactPage } from '@/features/storefront/contact';
import { FaqPage } from '@/features/storefront/faq';
import { CartPage } from '@/features/storefront/cart';
import { CheckoutPage } from '@/features/storefront/checkout';
import { WishlistPage } from '@/features/storefront/wishlist';
import { TrackOrderPage } from '@/features/storefront/tracking';
import { CustomerLoginPage, CustomerSignupPage, ForgotPasswordPage } from '@/features/storefront/auth';

// Customer Feature Pages
import { CustomerDashboardPage } from '@/features/customer/dashboard';
import { CustomerOrdersPage } from '@/features/customer/orders';
import { CustomerAddressesPage } from '@/features/customer/addresses';
import { CustomerProfilePage } from '@/features/customer/profile';

// Admin Feature Pages
import { AdminDashboardPage } from '@/features/admin/dashboard';
import { AdminProductsPage } from '@/features/admin/products';
import { AdminCollectionsPage } from '@/features/admin/collections';
import { AdminCategoriesPage } from '@/features/admin/categories';
import { AdminOrdersPage } from '@/features/admin/orders';
import { AdminCustomersPage } from '@/features/admin/customers';
import { AdminCmsPage } from '@/features/admin/cms';
import { AdminMediaPage } from '@/features/admin/media';
import { AdminCouponsPage } from '@/features/admin/coupons';
import { AdminReviewsPage } from '@/features/admin/reviews';
import { AdminPaymentsPage } from '@/features/admin/payments';
import { AdminShippingPage } from '@/features/admin/shipping';
import { AdminAnalyticsPage } from '@/features/admin/analytics';
import { AdminUsersPage } from '@/features/admin/users';
import { AdminSettingsPage } from '@/features/admin/settings';
import { AdminSeoPage } from '@/features/admin/seo';

// Developer & System Fallback Feature Pages
import { DeveloperBootstrapPage } from '@/features/developer/bootstrap';
import { NotFoundPage } from '@/features/system/not-found';
import { UnauthorizedPage } from '@/features/system/unauthorized';
import { MaintenancePage } from '@/features/system/maintenance';

export const router = createBrowserRouter([
  // Public Storefront Routes
  {
    path: '/',
    element: <StoreShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'collections', element: <CollectionsPage /> },
      { path: 'product/:slug', element: <ProductDetailPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'track-order', element: <TrackOrderPage /> },
      { path: 'login', element: <CustomerLoginPage /> },
      { path: 'signup', element: <CustomerSignupPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],
  },

  // Customer Account Shell Routes
  {
    path: '/account',
    element: <CustomerShell />,
    children: [
      { index: true, element: <CustomerDashboardPage /> },
      { path: 'orders', element: <CustomerOrdersPage /> },
      { path: 'addresses', element: <CustomerAddressesPage /> },
      { path: 'profile', element: <CustomerProfilePage /> },
    ],
  },

  // Admin CMS Shell Routes
  {
    path: '/admin',
    element: <AdminShell />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'collections', element: <AdminCollectionsPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'customers', element: <AdminCustomersPage /> },
      { path: 'cms', element: <AdminCmsPage /> },
      { path: 'media', element: <AdminMediaPage /> },
      { path: 'coupons', element: <AdminCouponsPage /> },
      { path: 'reviews', element: <AdminReviewsPage /> },
      { path: 'payments', element: <AdminPaymentsPage /> },
      { path: 'shipping', element: <AdminShippingPage /> },
      { path: 'analytics', element: <AdminAnalyticsPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
      { path: 'seo', element: <AdminSeoPage /> },
    ],
  },

  // Hidden Developer Backdoor
  {
    path: '/developer/bootstrap',
    element: <DeveloperBootstrapPage />,
  },

  // Fallbacks & Error Boundaries
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/maintenance',
    element: <MaintenancePage />,
  },
  {
    path: '/404',
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);
