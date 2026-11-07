import { Request, Response } from 'express';
import { QRService } from './qr.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { z } from 'zod';

const verifyQrSchema = z.object({
  code: z.string().min(1, 'Verification token code is required'),
});

export class QRController {
  static async getBookingQRCodes(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await QRService.getBookingQRCodes(
        req.user.id,
        req.params.bookingId,
        req.user.role
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('Forbidden') ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to generate QR codes',
      });
    }
  }

  static async verifyPickup(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validated = verifyQrSchema.parse(req.body);
      const result = await QRService.verifyPickup(
        req.user.id,
        validated.code,
        req.user.role
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: 'Invalid token payload' });
        return;
      }
      const statusCode = error.message.includes('Forbidden') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Pickup verification failed',
      });
    }
  }

  static async verifyReturn(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validated = verifyQrSchema.parse(req.body);
      const result = await QRService.verifyReturn(
        req.user.id,
        validated.code,
        req.user.role
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: 'Invalid token payload' });
        return;
      }
      const statusCode = error.message.includes('Forbidden') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Return verification failed',
      });
    }
  }
}

