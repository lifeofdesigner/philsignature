import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { StoreShell } from '@/components/layouts/StoreShell';
import { CustomerShell } from '@/components/layouts/CustomerShell';
import { AdminShell } from '@/components/layouts/AdminShell';

// Storefront Pages
import { HomePage } from '@/pages/storefront/HomePage';
import { ShopPage } from '@/pages/storefront/ShopPage';
import { CollectionsPage } from '@/pages/storefront/CollectionsPage';
import { ProductDetailPage } from '@/pages/storefront/ProductDetailPage';
import { AboutPage } from '@/pages/storefront/AboutPage';
import { ContactPage } from '@/pages/storefront/ContactPage';
import { FaqPage } from '@/pages/storefront/FaqPage';
import { CartPage } from '@/pages/storefront/CartPage';
import { CheckoutPage } from '@/pages/storefront/CheckoutPage';
import { WishlistPage } from '@/pages/storefront/WishlistPage';
import { TrackOrderPage } from '@/pages/storefront/TrackOrderPage';

// Customer Pages
import { CustomerLoginPage } from '@/pages/customer/CustomerLoginPage';
import { CustomerSignupPage } from '@/pages/customer/CustomerSignupPage';
import { ForgotPasswordPage } from '@/pages/customer/ForgotPasswordPage';
import { CustomerDashboardPage } from '@/pages/customer/CustomerDashboardPage';
import { CustomerOrdersPage } from '@/pages/customer/CustomerOrdersPage';
import { CustomerAddressesPage } from '@/pages/customer/CustomerAddressesPage';
import { CustomerProfilePage } from '@/pages/customer/CustomerProfilePage';

// Admin Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminCollectionsPage } from '@/pages/admin/AdminCollectionsPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from '@/pages/admin/AdminCustomersPage';
import { AdminCmsPage } from '@/pages/admin/AdminCmsPage';
import { AdminMediaPage } from '@/pages/admin/AdminMediaPage';
import { AdminCouponsPage } from '@/pages/admin/AdminCouponsPage';
import { AdminReviewsPage } from '@/pages/admin/AdminReviewsPage';
import { AdminPaymentsPage } from '@/pages/admin/AdminPaymentsPage';
import { AdminShippingPage } from '@/pages/admin/AdminShippingPage';
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { AdminSeoPage } from '@/pages/admin/AdminSeoPage';

// Developer & Fallback Pages
import { DeveloperBootstrapPage } from '@/pages/developer/DeveloperBootstrapPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { MaintenancePage } from '@/pages/MaintenancePage';

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
