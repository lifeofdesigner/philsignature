import { reviewRepository, type ReviewRepository } from '@/repositories/ReviewRepository';
import { ValidationError } from '@/errors/ValidationError';
import type { Review } from '@/types/database';

export class ReviewService {
  constructor(private repo: ReviewRepository = reviewRepository) {}

  async getAllReviewsAdmin(): Promise<Review[]> {
    return this.repo.findAllAdmin();
  }

  async updateStatus(id: string, status: Review['status']): Promise<Review> {
    if (!id) throw new ValidationError('Review ID is required');
    return this.repo.updateStatus(id, status);
  }

  async deleteReview(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}

export const reviewService = new ReviewService();
