import { BaseRepository } from './BaseRepository';
import type { Review } from '@/types/database';

export class ReviewRepository extends BaseRepository {
  async findAllAdmin(): Promise<Review[]> {
    try {
      const { data, error } = await this.client
        .from('reviews')
        .select('*, customer:profiles(first_name, last_name, email), product:products(name, slug)')
        .order('created_at', { ascending: false });

      if (error) this.handleError(error, 'Failed to fetch reviews');
      return (data as Review[]) || [];
    } catch (err) {
      this.handleError(err, 'Error fetching reviews');
    }
  }

  async updateStatus(id: string, status: Review['status']): Promise<Review> {
    try {
      const { data, error } = await this.client
        .from('reviews')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) this.handleError(error, `Failed to update review status: ${id}`);
      return data as Review;
    } catch (err) {
      this.handleError(err, `Error updating review status: ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client.from('reviews').delete().eq('id', id);
      if (error) this.handleError(error, 'Failed to delete review');
    } catch (err) {
      this.handleError(err, 'Error deleting review');
    }
  }
}

export const reviewRepository = new ReviewRepository();
