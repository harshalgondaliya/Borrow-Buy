import { Router } from 'express';
import { CloudOperationsController } from './cloud.controller.js';

const router = Router();

router.get('/overview', CloudOperationsController.getCloudOverview);
router.get('/audit-logs', CloudOperationsController.getAuditLogs);
router.post('/quote', CloudOperationsController.calculateQuote);

export default router;
