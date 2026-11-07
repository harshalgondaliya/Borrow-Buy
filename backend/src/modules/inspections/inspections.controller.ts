import { Request, Response } from 'express';
import { InspectionsService } from './inspections.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { z } from 'zod';
import { InspectionType } from '@prisma/client';

const createInspectionSchema = z.object({
  bookingId: z.string().uuid(),
  type: z.enum([InspectionType.PRE_PICKUP, InspectionType.POST_RETURN]),
  conditionNotes: z.string().min(5, 'Condition notes must be at least 5 characters'),
  existingDamage: z.string().optional(),
});

export class InspectionsController {
  static async createInspection(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validated = createInspectionSchema.parse(req.body);
      const files = (req.files as Express.Multer.File[]) || [];

      const inspection = await InspectionsService.createInspection(
        req.user.id,
        validated,
        files
      );

      res.status(201).json({
        success: true,
        message: 'Inspection condition record created successfully.',
        data: inspection,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
        return;
      }
      const statusCode = error.message.includes('Forbidden') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to create inspection',
      });
    }
  }

  static async confirmInspection(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const confirmed = await InspectionsService.confirmInspection(req.user.id, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Inspection condition confirmed by customer.',
        data: confirmed,
      });
    } catch (error: any) {
      const statusCode = error.message.includes('Forbidden') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to confirm inspection',
      });
    }
  }

  static async getBookingInspections(req: Request, res: Response) {
    try {
      const inspections = await InspectionsService.getBookingInspections(req.params.bookingId);
      res.status(200).json({
        success: true,
        data: inspections,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch inspections',
      });
    }
  }
}

