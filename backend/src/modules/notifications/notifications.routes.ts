import { Router } from 'express';
import { NotificationsController } from './notifications.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth as any, NotificationsController.getUserNotifications as any);
router.patch('/mark-all-read', requireAuth as any, NotificationsController.markAllAsRead as any);
router.patch('/:id/read', requireAuth as any, NotificationsController.markAsRead as any);

export default router;
