import { BaseRepository } from './BaseRepository';
import type { Coupon } from '@/types/database';

export class CouponRepository extends BaseRepository {
  async findByCode(code: string): Promise<Coupon | null> {
    try {
      const { data, error } = await this.client
        .from('coupons')
        .select('*')
        .ilike('code', code.trim())
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        this.handleError(error, `Failed to fetch coupon: ${code}`);
      }
      return data as Coupon;
    } catch (err) {
      this.handleError(err, `Error querying coupon: ${code}`);
    }
  }

  async incrementUsage(couponId: string): Promise<void> {
    try {
      const { error } = await this.client.rpc('increment_coupon_usage', {
        p_coupon_id: couponId,
      });

      // If RPC doesn't exist, fall back to update
      if (error) {
        const { data: coupon } = await this.client
          .from('coupons')
          .select('times_used')
          .eq('id', couponId)
          .single();

        if (coupon) {
          await this.client
            .from('coupons')
            .update({ times_used: (coupon.times_used || 0) + 1 })
            .eq('id', couponId);
        }
      }
    } catch (err) {
      // Non-blocking log
      console.warn('Coupon usage increment warning:', err);
    }
  }
}

export const couponRepository = new CouponRepository();

