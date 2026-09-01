export type ReviewStatus = 'submitted' | 'approved' | 'rejected' | 'featured';

export class ReviewStateMachine {
  private static readonly transitions: Record<ReviewStatus, ReviewStatus[]> = {
    submitted: ['approved', 'rejected'],
    approved: ['featured', 'rejected'],
    featured: ['approved', 'rejected'],
    rejected: ['approved'],
  };

  static canTransition(current: ReviewStatus, next: ReviewStatus): boolean {
    const allowed = this.transitions[current] || [];
    return allowed.includes(next);
  }

  static transition(current: ReviewStatus, next: ReviewStatus): ReviewStatus {
    if (!this.canTransition(current, next)) {
      throw new Error(`Invalid review state transition: cannot change from "${current}" to "${next}"`);
    }
    return next;
  }
}
