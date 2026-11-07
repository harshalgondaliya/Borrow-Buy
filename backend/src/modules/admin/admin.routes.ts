import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

// Gated strictly to ADMIN role
router.use(requireAuth as any, requireRole(UserRole.ADMIN) as any);

router.get('/stats', AdminController.getPlatformStats as any);
router.get('/users', AdminController.getUsers as any);
router.patch('/users/:id/status', AdminController.updateUserStatus as any);
router.patch('/products/:id/review', AdminController.reviewProduct as any);
router.get('/bookings', AdminController.getAllBookings as any);
router.get('/disputes', AdminController.getDisputes as any);
router.post('/disputes/:id/resolve', AdminController.resolveDispute as any);

export default router;
