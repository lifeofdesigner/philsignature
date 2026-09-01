import { BaseRepository } from './BaseRepository';
import type { Coupon } from '@/types/database';
import type { CouponInput } from '@/schemas/coupon.schema';

export class CouponRepository extends BaseRepository {
  async findAllAdmin(): Promise<Coupon[]> {
    try {
      const { data, error } = await this.client
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) this.handleError(error, 'Failed to fetch coupons');
      return (data as Coupon[]) || [];
    } catch (err) {
      this.handleError(err, 'Error fetching coupons');
    }
  }

  async create(input: CouponInput): Promise<Coupon> {
    try {
      const { data, error } = await this.client.from('coupons').insert(input).select().single();
      if (error) this.handleError(error, 'Failed to create coupon');
      return data as Coupon;
    } catch (err) {
      this.handleError(err, 'Error creating coupon');
    }
  }

  async update(id: string, input: Partial<CouponInput>): Promise<Coupon> {
    try {
      const { data, error } = await this.client
        .from('coupons')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) this.handleError(error, 'Failed to update coupon');
      return data as Coupon;
    } catch (err) {
      this.handleError(err, 'Error updating coupon');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client.from('coupons').delete().eq('id', id);
      if (error) this.handleError(error, 'Failed to delete coupon');
    } catch (err) {
      this.handleError(err, 'Error deleting coupon');
    }
  }

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

