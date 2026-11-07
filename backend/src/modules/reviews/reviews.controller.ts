import { Request, Response } from 'express';
import { ReviewsService } from './reviews.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { z } from 'zod';

const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5 stars'),
  comment: z.string().min(5, 'Review comment must be at least 5 characters'),
});

export class ReviewsController {
  static async createReview(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validated = createReviewSchema.parse(req.body);
      const result = await ReviewsService.createReview(req.user.id, validated);

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully. Trust score updated!',
        data: result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
        return;
      }
      const statusCode = error.message.includes('Forbidden') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to submit review',
      });
    }
  }

  static async getUserReviews(req: Request, res: Response) {
    try {
      const reviews = await ReviewsService.getUserReviews(req.params.userId);
      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch user reviews',
      });
    }
  }
}

