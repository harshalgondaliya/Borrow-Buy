import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { env } from './config/env.js';

import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/products/products.routes.js';
import bookingRoutes from './modules/bookings/bookings.routes.js';
import paymentRoutes from './modules/payments/payments.routes.js';
import qrRoutes from './modules/qr/qr.routes.js';
import inspectionRoutes from './modules/inspections/inspections.routes.js';
import reviewRoutes from './modules/reviews/reviews.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import cloudRoutes from './modules/cloud/cloud.routes.js';
import { cloudWatchService } from './integrations/monitoring/cloudwatch.service.js';
import { storageService } from './integrations/storage/index.js';

const app: Application = express();

// Telemetry & Metrics Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api') && env.NODE_ENV === 'production') {
    cloudWatchService.recordMetric('ApiRequestCount', 1, 'Count', { Method: req.method }).catch(() => {});
  }
  next();
});

// Ensure local uploads directory exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
const allowedOrigins = env.FRONTEND_URL
  ? env.FRONTEND_URL.split(',').map((s) => s.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    // Automatically permit any CloudFront distribution URL
    if (origin.endsWith('.cloudfront.net')) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static file serving for local image uploads
app.use('/uploads', express.static(uploadsDir));

// Secure private-S3 & local media streaming endpoint
app.get('/api/media/:folder/:filename', async (req: Request, res: Response) => {
  try {
    const { folder, filename } = req.params;
    const allowedFolders = ['products', 'user-uploads'];
    if (!allowedFolders.includes(folder) || !/^[a-zA-Z0-9._-]+$/.test(filename)) {
      res.status(400).json({ success: false, message: 'Invalid media path' });
      return;
    }

    if (!storageService.getFileStream) {
      res.status(501).json({ success: false, message: 'Media streaming not supported' });
      return;
    }

    const { stream, contentType } = await storageService.getFileStream(`${folder}/${filename}`);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(404).json({ success: false, message: 'Media not found' });
      }
    });
    stream.pipe(res);
  } catch (err: any) {
    const status = err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404 ? 404 : 500;
    res.status(status).json({
      success: false,
      message: status === 404 ? 'Media not found' : 'Failed to stream media',
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cloud', cloudRoutes);

// System Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'borrowbuy-backend',
    version: '1.0.0',
    environment: env.NODE_ENV,
    drivers: {
      storage: env.STORAGE_DRIVER,
      notification: env.NOTIFICATION_DRIVER,
      payment: env.PAYMENT_DRIVER,
    },
  });
});

// 404 Route Catch-all
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

// Centralized Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  console.error(`[Error] ${req.method} ${req.url}:`, err);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;

