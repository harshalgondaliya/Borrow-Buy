import app from './app.js';
import { env } from './config/env.js';
import { BackgroundJobRunner } from './integrations/jobs/job-runner.js';

const server = app.listen(env.PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 BorrowBuy Backend API Server running on port ${env.PORT}`);
  console.log(`📦 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Health Check: http://localhost:${env.PORT}/api/health`);
  console.log(`📂 Storage Driver: ${env.STORAGE_DRIVER}`);
  console.log(`🔔 Notification Driver: ${env.NOTIFICATION_DRIVER}`);
  console.log(`💳 Payment Driver: ${env.PAYMENT_DRIVER}`);
  console.log(`===============================================`);

  // Start periodic background tasks (expired holds reclaimer & overdue checks)
  BackgroundJobRunner.start(60000);
});

// Graceful Shutdown Handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server gracefully...');
  BackgroundJobRunner.stop();
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing HTTP server gracefully...');
  BackgroundJobRunner.stop();
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

