import { Router } from 'express';
import { BookingsController } from './bookings.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.get('/calendar/:productId', BookingsController.getProductAvailabilityCalendar);
router.get('/check-availability', BookingsController.checkAvailability);

// Protected routes (Customer & Owner)
router.post('/', requireAuth as any, BookingsController.createBooking as any);
router.get('/my-bookings', requireAuth as any, BookingsController.getCustomerBookings as any);
router.get(
  '/owner-requests',
  requireAuth as any,
  requireRole(UserRole.OWNER, UserRole.ADMIN) as any,
  BookingsController.getOwnerBookings as any
);
router.get('/:id', requireAuth as any, BookingsController.getBookingById as any);
router.post('/:id/cancel', requireAuth as any, BookingsController.cancelBooking as any);
router.post(
  '/:id/confirm',
  requireAuth as any,
  requireRole(UserRole.OWNER, UserRole.ADMIN) as any,
  BookingsController.confirmBooking as any
);

export default router;

