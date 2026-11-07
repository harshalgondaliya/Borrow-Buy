import { Router } from 'express';
import { PaymentsController } from './payments.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.post('/pay-booking', requireAuth as any, PaymentsController.payBooking as any);
router.get('/history', requireAuth as any, PaymentsController.getPaymentHistory as any);

export default router;

