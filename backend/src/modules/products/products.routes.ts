import { Router } from 'express';
import { ProductsController } from './products.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { uploadImages } from '../../middleware/upload.js';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.get('/categories', ProductsController.getCategories);
router.get('/', ProductsController.listProducts);
router.get('/:id', ProductsController.getProductById);

// Owner protected routes
router.get(
  '/owner/my-listings',
  requireAuth as any,
  requireRole(UserRole.OWNER, UserRole.ADMIN) as any,
  ProductsController.getOwnerProducts as any
);

router.post(
  '/',
  requireAuth as any,
  requireRole(UserRole.OWNER, UserRole.ADMIN) as any,
  uploadImages.array('images', 5),
  ProductsController.createProduct as any
);

router.put(
  '/:id',
  requireAuth as any,
  requireRole(UserRole.OWNER, UserRole.ADMIN) as any,
  uploadImages.array('images', 5),
  ProductsController.updateProduct as any
);

router.delete(
  '/:id',
  requireAuth as any,
  requireRole(UserRole.OWNER, UserRole.ADMIN) as any,
  ProductsController.deleteProduct as any
);

export default router;

