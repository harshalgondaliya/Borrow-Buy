import { Response } from 'express';
import { AdminService } from './admin.service.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { z } from 'zod';
import { UserStatus, ApprovalStatus, DisputeStatus, BookingStatus, UserRole } from '@prisma/client';

const updateUserStatusSchema = z.object({
  status: z.enum([UserStatus.ACTIVE, UserStatus.SUSPENDED, UserStatus.PENDING_VERIFICATION]).optional(),
  isVerifiedOwner: z.boolean().optional(),
});

const reviewProductSchema = z.object({
  approvalStatus: z.enum([ApprovalStatus.APPROVED, ApprovalStatus.REJECTED]),
  rejectionReason: z.string().optional(),
});

const resolveDisputeSchema = z.object({
  status: z.enum([DisputeStatus.RESOLVED, DisputeStatus.REJECTED]),
  resolutionNotes: z.string().min(5, 'Resolution notes required'),
  deductedFromDeposit: z.number().min(0).default(0),
});

export class AdminController {
  static async getPlatformStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await AdminService.getPlatformStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch platform statistics',
      });
    }
  }

  static async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const { role, status, search } = req.query;
      const users = await AdminService.getUsers({
        role: role as UserRole,
        status: status as UserStatus,
        search: search as string,
      });

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch users',
      });
    }
  }

  static async updateUserStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = updateUserStatusSchema.parse(req.body);
      const updated = await AdminService.updateUserStatus(req.params.id, validated);

      res.status(200).json({
        success: true,
        message: 'User account status updated successfully.',
        data: updated,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
        return;
      }
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update user',
      });
    }
  }

  static async reviewProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = reviewProductSchema.parse(req.body);
      const updated = await AdminService.reviewProduct(req.params.id, validated);

      res.status(200).json({
        success: true,
        message: `Product ${validated.approvalStatus.toLowerCase()} successfully.`,
        data: updated,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
        return;
      }
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to review product',
      });
    }
  }

  static async getAllBookings(req: AuthenticatedRequest, res: Response) {
    try {
      const { status } = req.query;
      const bookings = await AdminService.getAllBookings(status as BookingStatus);

      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch bookings',
      });
    }
  }

  static async getDisputes(req: AuthenticatedRequest, res: Response) {
    try {
      const disputes = await AdminService.getDisputes();
      res.status(200).json({
        success: true,
        data: disputes,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch disputes',
      });
    }
  }

  static async resolveDispute(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const validated = resolveDisputeSchema.parse(req.body);
      const resolved = await AdminService.resolveDispute(
        req.params.id,
        req.user.id,
        validated
      );

      res.status(200).json({
        success: true,
        message: 'Dispute mediated and resolved successfully.',
        data: resolved,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
        return;
      }
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to resolve dispute',
      });
    }
  }
}
