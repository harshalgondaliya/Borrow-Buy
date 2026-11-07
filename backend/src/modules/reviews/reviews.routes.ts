import { Router } from 'express';
import { ReviewsController } from './reviews.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/user/:userId', ReviewsController.getUserReviews);
router.post('/', requireAuth as any, ReviewsController.createReview as any);

export default router;

