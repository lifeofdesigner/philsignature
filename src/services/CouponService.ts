import { couponRepository, type CouponRepository } from '@/repositories/CouponRepository';
import { ValidationError } from '@/errors/ValidationError';
import type { Coupon } from '@/types/database';

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message: string;
}

export class CouponService {
  constructor(private repo: CouponRepository = couponRepository) {}

  async validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      return { valid: false, discountAmount: 0, message: 'Please enter a privilege code' };
    }

    const coupon = await this.repo.findByCode(trimmed);
    if (!coupon) {
      return { valid: false, discountAmount: 0, message: 'Invalid or expired privilege voucher' };
    }

    // Expiry check
    if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
      return { valid: false, discountAmount: 0, message: 'This privilege coupon has expired' };
    }

    // Usage limit check
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { valid: false, discountAmount: 0, message: 'Privilege coupon allocation limit reached' };
    }

    // Minimum spend check
    if (coupon.min_spend && subtotal < coupon.min_spend) {
      const minSpendFormatted = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
      }).format(coupon.min_spend);
      return {
        valid: false,
        discountAmount: 0,
        message: `Requires a minimum acquisition of ${minSpendFormatted}`,
      };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else if (coupon.discount_type === 'fixed') {
      discount = Math.min(coupon.value, subtotal);
    }

    return {
      valid: true,
      coupon,
      discountAmount: Math.round(discount),
      message: `Privilege applied: ${coupon.code}`,
    };
  }

  async recordCouponUsage(couponId: string): Promise<void> {
    if (!couponId) throw new ValidationError('Coupon ID required to record usage');
    return this.repo.incrementUsage(couponId);
  }
}

export const couponService = new CouponService();

