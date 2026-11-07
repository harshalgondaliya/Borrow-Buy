import { Response } from 'express';
import { PaymentsService } from './payments.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { z } from 'zod';

const payBookingSchema = z.object({
  bookingId: z.string().uuid(),
  simulateFailure: z.boolean().optional().default(false),
});

export class PaymentsController {
  static async payBooking(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validated = payBookingSchema.parse(req.body);
      const result = await PaymentsService.payBooking(
        req.user.id,
        validated.bookingId,
        validated.simulateFailure
      );

      res.status(200).json({
        success: true,
        message: 'Payment simulation successful! Booking confirmed and deposit held.',
        data: result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Invalid payment parameters',
          errors: error.errors,
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: error.message || 'Payment simulation failed',
      });
    }
  }

  static async getPaymentHistory(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const history = await PaymentsService.getPaymentHistory(req.user.id);
      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve payment history',
      });
    }
  }
}

