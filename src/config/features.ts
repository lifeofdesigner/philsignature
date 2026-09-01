export interface FeatureFlags {
  enableCoupons: boolean;
  enableWishlist: boolean;
  enableReviews: boolean;
  enableGiftWrap: boolean;
  enableAnalytics: boolean;
  enablePaystack: boolean;
  enableFlutterwave: boolean;
  enableDirectBankTransfer: boolean;
  enableCashOnDelivery: boolean;
  enableDevBootstrap: boolean;
}

export const FEATURES: FeatureFlags = {
  enableCoupons: true,
  enableWishlist: true,
  enableReviews: true,
  enableGiftWrap: true,
  enableAnalytics: true,
  enablePaystack: true,
  enableFlutterwave: false, // Staged for international rollout
  enableDirectBankTransfer: true,
  enableCashOnDelivery: true,
  enableDevBootstrap: import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_BOOTSTRAP === 'true',
};

export type FeatureKey = keyof FeatureFlags;

export const isFeatureEnabled = (key: FeatureKey): boolean => {
  return Boolean(FEATURES[key]);
};
