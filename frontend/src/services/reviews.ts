import { apiRequest } from './api';

export interface ReviewSubmission {
  bookingId: string;
  rating: number;
  comment: string;
}

export const reviewsService = {
  async createReview(data: ReviewSubmission): Promise<{ success: boolean; message: string; data: any }> {
    return apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getUserReviews(userId: string): Promise<{ success: boolean; data: any[] }> {
    return apiRequest(`/reviews/user/${userId}`);
  },
};

