import { Router } from 'express';
import { QRController } from './qr.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.get('/booking/:bookingId', requireAuth as any, QRController.getBookingQRCodes as any);

router.post(
  '/verify-pickup',
  requireAuth as any,
  requireRole(UserRole.OWNER, UserRole.ADMIN) as any,
  QRController.verifyPickup as any
);

router.post(
  '/verify-return',
  requireAuth as any,
  requireRole(UserRole.OWNER, UserRole.ADMIN) as any,
  QRController.verifyReturn as any
);

export default router;

