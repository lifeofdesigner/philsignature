export const ROUTES = {
  HOME: '/',
  SHOP: '/shop',
  COLLECTIONS: '/collections',
  PRODUCT_DETAIL: (slug: string = ':slug') => `/product/${slug}`,
  ABOUT: '/about',
  CONTACT: '/contact',
  FAQ: '/faq',
  CART: '/cart',
  CHECKOUT: '/checkout',
  WISHLIST: '/wishlist',
  TRACK_ORDER: '/track-order',

  // Auth & Account
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  ACCOUNT: {
    ROOT: '/account',
    DASHBOARD: '/account',
    ORDERS: '/account/orders',
    ADDRESSES: '/account/addresses',
    PROFILE: '/account/profile',
  },

  // Admin
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin',
    PRODUCTS: '/admin/products',
    COLLECTIONS: '/admin/collections',
    CATEGORIES: '/admin/categories',
    ORDERS: '/admin/orders',
    CUSTOMERS: '/admin/customers',
    CMS: '/admin/cms',
    MEDIA: '/admin/media',
    COUPONS: '/admin/coupons',
    REVIEWS: '/admin/reviews',
    PAYMENTS: '/admin/payments',
    SHIPPING: '/admin/shipping',
    ANALYTICS: '/admin/analytics',
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
    SEO: '/admin/seo',
  },

  // Backdoor & System
  DEVELOPER_BOOTSTRAP: '/developer/bootstrap',
  UNAUTHORIZED: '/unauthorized',
  MAINTENANCE: '/maintenance',
  NOT_FOUND: '/404',
} as const;

