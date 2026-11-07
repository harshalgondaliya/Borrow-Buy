import { Router } from 'express';
import { InspectionsController } from './inspections.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { uploadImages } from '../../middleware/upload.js';

const router = Router();

router.get('/booking/:bookingId', requireAuth as any, InspectionsController.getBookingInspections as any);
router.post(
  '/',
  requireAuth as any,
  uploadImages.array('photos', 5),
  InspectionsController.createInspection as any
);
router.post('/:id/confirm', requireAuth as any, InspectionsController.confirmInspection as any);

export default router;

