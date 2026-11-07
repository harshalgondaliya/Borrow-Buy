import { Request, Response } from 'express';
import { BookingsService } from './bookings.service.js';
import { 
  createBookingSchema, 
  checkAvailabilitySchema 
} from './bookings.validation.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export class BookingsController {
  static async getProductAvailabilityCalendar(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const calendar = await BookingsService.getProductAvailabilityCalendar(productId);
      res.status(200).json({
        success: true,
        data: calendar,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch availability calendar',
      });
    }
  }

  static async checkAvailability(req: Request, res: Response) {
    try {
      const validated = checkAvailabilitySchema.parse(req.query);
      const result = await BookingsService.checkAvailability(
        validated.productId,
        validated.startDate,
        validated.endDate
      );
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Invalid availability parameters',
          errors: error.errors,
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: error.message || 'Availability check failed',
      });
    }
  }

  static async createBooking(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validated = createBookingSchema.parse(req.body);
      const booking = await BookingsService.createBooking(req.user.id, validated);

      res.status(201).json({
        success: true,
        message: 'Rental booking reserved successfully! Complete payment to confirm.',
        data: booking,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create booking',
      });
    }
  }

  static async getCustomerBookings(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const bookings = await BookingsService.getCustomerBookings(req.user.id);
      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve bookings',
      });
    }
  }

  static async getOwnerBookings(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const bookings = await BookingsService.getOwnerBookings(req.user.id);
      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve owner bookings',
      });
    }
  }

  static async getBookingById(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const booking = await BookingsService.getBookingById(
        req.user.id,
        req.params.id,
        req.user.role
      );

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('Forbidden') ? 403 : 404;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Booking not found',
      });
    }
  }

  static async cancelBooking(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const reason = req.body?.reason;
      const cancelled = await BookingsService.cancelBooking(req.user.id, req.params.id, reason);

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully.',
        data: cancelled,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('Forbidden') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to cancel booking',
      });
    }
  }

  static async confirmBooking(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const confirmed = await BookingsService.confirmBooking(req.user.id, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Booking confirmed by owner.',
        data: confirmed,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('Forbidden') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to confirm booking',
      });
    }
  }
}

