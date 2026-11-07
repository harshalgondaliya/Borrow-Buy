import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

// Public auth endpoints
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected auth endpoints
router.get('/me', requireAuth as any, AuthController.getMe as any);
router.put('/me', requireAuth as any, AuthController.updateMe as any);
router.post('/become-owner', requireAuth as any, AuthController.upgradeToOwner as any);

export default router;

