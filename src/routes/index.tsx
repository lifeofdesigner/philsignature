import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { StoreShell } from '@/components/layouts/StoreShell';
import { CustomerShell } from '@/components/layouts/CustomerShell';
import { AdminShell } from '@/components/layouts/AdminShell';

// Feedback Skeletons
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';

// Helper for route lazy loading with Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageSkeleton />}>
    <Component />
  </Suspense>
);

// Storefront Features (Lazy Loaded)
const HomePage = lazy(() => import('@/features/home').then((m) => ({ default: m.HomePage })));
const ShopPage = lazy(() => import('@/features/shop').then((m) => ({ default: m.ShopPage })));
const CollectionsPage = lazy(() => import('@/features/collections').then((m) => ({ default: m.CollectionsPage })));
const ProductDetailPage = lazy(() => import('@/features/product').then((m) => ({ default: m.ProductDetailPage })));
const AboutPage = lazy(() => import('@/features/about').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('@/features/contact').then((m) => ({ default: m.ContactPage })));
const FaqPage = lazy(() => import('@/features/faq').then((m) => ({ default: m.FaqPage })));
const CartPage = lazy(() => import('@/features/cart').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('@/features/checkout').then((m) => ({ default: m.CheckoutPage })));
const WishlistPage = lazy(() => import('@/features/wishlist').then((m) => ({ default: m.WishlistPage })));
const TrackOrderPage = lazy(() => import('@/features/tracking').then((m) => ({ default: m.TrackOrderPage })));
const CustomerLoginPage = lazy(() => import('@/features/auth').then((m) => ({ default: m.CustomerLoginPage })));
const CustomerSignupPage = lazy(() => import('@/features/auth').then((m) => ({ default: m.CustomerSignupPage })));
const ForgotPasswordPage = lazy(() => import('@/features/auth').then((m) => ({ default: m.ForgotPasswordPage })));

// Customer Features (Lazy Loaded)
const CustomerDashboardPage = lazy(() => import('@/features/customer').then((m) => ({ default: m.CustomerDashboardPage })));
const CustomerOrdersPage = lazy(() => import('@/features/customer').then((m) => ({ default: m.CustomerOrdersPage })));
const CustomerAddressesPage = lazy(() => import('@/features/customer').then((m) => ({ default: m.CustomerAddressesPage })));
const CustomerProfilePage = lazy(() => import('@/features/customer').then((m) => ({ default: m.CustomerProfilePage })));

// Admin Features (Lazy Loaded)
const AdminDashboardPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminDashboardPage })));
const AdminProductsPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminProductsPage })));
const AdminCollectionsPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminCollectionsPage })));
const AdminCategoriesPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminCategoriesPage })));
const AdminOrdersPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminOrdersPage })));
const AdminCustomersPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminCustomersPage })));
const AdminCouponsPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminCouponsPage })));
const AdminReviewsPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminReviewsPage })));
const AdminUsersPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminUsersPage })));
const AdminSettingsPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminSettingsPage })));
const AdminSeoPage = lazy(() => import('@/features/admin').then((m) => ({ default: m.AdminSeoPage })));

// Independent Admin Modules (Lazy Loaded)
const AdminCmsPage = lazy(() => import('@/features/cms').then((m) => ({ default: m.AdminCmsPage })));
const AdminMediaPage = lazy(() => import('@/features/media').then((m) => ({ default: m.AdminMediaPage })));
const AdminPaymentsPage = lazy(() => import('@/features/payments').then((m) => ({ default: m.AdminPaymentsPage })));
const AdminShippingPage = lazy(() => import('@/features/shipping').then((m) => ({ default: m.AdminShippingPage })));
const AdminAnalyticsPage = lazy(() => import('@/features/analytics').then((m) => ({ default: m.AdminAnalyticsPage })));

// Developer & System Fallback Features (Lazy Loaded)
const DeveloperBootstrapPage = lazy(() => import('@/features/developer/bootstrap').then((m) => ({ default: m.DeveloperBootstrapPage })));
const NotFoundPage = lazy(() => import('@/features/system/not-found').then((m) => ({ default: m.NotFoundPage })));
const UnauthorizedPage = lazy(() => import('@/features/system/unauthorized').then((m) => ({ default: m.UnauthorizedPage })));
const MaintenancePage = lazy(() => import('@/features/system/maintenance').then((m) => ({ default: m.MaintenancePage })));

export const router = createBrowserRouter([
  // Public Storefront Routes
  {
    path: '/',
    element: <StoreShell />,
    children: [
      { index: true, element: withSuspense(HomePage) },
      { path: 'shop', element: withSuspense(ShopPage) },
      { path: 'collections', element: withSuspense(CollectionsPage) },
      { path: 'product/:slug', element: withSuspense(ProductDetailPage) },
      { path: 'about', element: withSuspense(AboutPage) },
      { path: 'contact', element: withSuspense(ContactPage) },
      { path: 'faq', element: withSuspense(FaqPage) },
      { path: 'cart', element: withSuspense(CartPage) },
      { path: 'checkout', element: withSuspense(CheckoutPage) },
      { path: 'wishlist', element: withSuspense(WishlistPage) },
      { path: 'track-order', element: withSuspense(TrackOrderPage) },
      { path: 'login', element: withSuspense(CustomerLoginPage) },
      { path: 'signup', element: withSuspense(CustomerSignupPage) },
      { path: 'forgot-password', element: withSuspense(ForgotPasswordPage) },
    ],
  },

  // Customer Account Shell Routes
  {
    path: '/account',
    element: <CustomerShell />,
    children: [
      { index: true, element: withSuspense(CustomerDashboardPage) },
      { path: 'orders', element: withSuspense(CustomerOrdersPage) },
      { path: 'addresses', element: withSuspense(CustomerAddressesPage) },
      { path: 'profile', element: withSuspense(CustomerProfilePage) },
    ],
  },

  // Admin CMS Shell Routes
  {
    path: '/admin',
    element: <AdminShell />,
    children: [
      { index: true, element: withSuspense(AdminDashboardPage) },
      { path: 'products', element: withSuspense(AdminProductsPage) },
      { path: 'collections', element: withSuspense(AdminCollectionsPage) },
      { path: 'categories', element: withSuspense(AdminCategoriesPage) },
      { path: 'orders', element: withSuspense(AdminOrdersPage) },
      { path: 'customers', element: withSuspense(AdminCustomersPage) },
      { path: 'cms', element: withSuspense(AdminCmsPage) },
      { path: 'media', element: withSuspense(AdminMediaPage) },
      { path: 'coupons', element: withSuspense(AdminCouponsPage) },
      { path: 'reviews', element: withSuspense(AdminReviewsPage) },
      { path: 'payments', element: withSuspense(AdminPaymentsPage) },
      { path: 'shipping', element: withSuspense(AdminShippingPage) },
      { path: 'analytics', element: withSuspense(AdminAnalyticsPage) },
      { path: 'users', element: withSuspense(AdminUsersPage) },
      { path: 'settings', element: withSuspense(AdminSettingsPage) },
      { path: 'seo', element: withSuspense(AdminSeoPage) },
    ],
  },

  // Hidden Developer Backdoor
  {
    path: '/developer/bootstrap',
    element: withSuspense(DeveloperBootstrapPage),
  },

  // Fallbacks & Error Boundaries
  {
    path: '/unauthorized',
    element: withSuspense(UnauthorizedPage),
  },
  {
    path: '/maintenance',
    element: withSuspense(MaintenancePage),
  },
  {
    path: '/404',
    element: withSuspense(NotFoundPage),
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);
