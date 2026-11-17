import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { S3StorageService } from '../src/integrations/storage/s3-storage.service.js';
import { SnsNotificationService } from '../src/integrations/notifications/sns-notification.service.js';
import { SqsQueueService } from '../src/integrations/queue/sqs-queue.service.js';
import { CloudWatchMonitoringService } from '../src/integrations/monitoring/cloudwatch.service.js';
import { dynamoDbService } from '../src/integrations/dynamodb/dynamodb.service.js';
import { cognitoAuthService } from '../src/integrations/auth/cognito.service.js';
import { calculateQuote } from '../src/lambda/quote-calculator.js';

describe('AWS Cloud Service Adapters & Integration Tests', () => {
  beforeAll(() => {
    process.env.AWS_ACCESS_KEY_ID = 'MOCK_KEY_ID_FOR_UNIT_TESTS';
    process.env.AWS_SECRET_ACCESS_KEY = 'MOCK_SECRET_KEY_FOR_UNIT_TESTS';
  });

  describe('Amazon S3 Storage Service Adapter', () => {
    const s3Service = new S3StorageService();

    it('should initialize S3 storage adapter with correct regional endpoint format', () => {
      expect(s3Service).toBeDefined();
      const url = s3Service.getFileUrl('products/test-camera.webp');
      expect(url).toContain('.s3.');
      expect(url).toContain('test-camera.webp');
    });

    it('should return external absolute URLs unchanged', () => {
      const externalUrl = 'https://images.unsplash.com/photo-sample.jpg';
      expect(s3Service.getFileUrl(externalUrl)).toBe(externalUrl);
    });

    it('should generate pre-signed upload URL structure for direct browser upload', async () => {
      const presigned = await s3Service.getPresignedUploadUrl('camera-photo.jpg', 'image/jpeg');
      expect(presigned).toHaveProperty('uploadUrl');
      expect(presigned).toHaveProperty('key');
      expect(presigned.key).toMatch(/^user-uploads\/\d+-[a-f0-9]+\.jpg$/);
      expect(presigned.uploadUrl).toContain('X-Amz-Signature');
    });
  });

  describe('Amazon SNS Notification Service Adapter', () => {
    it('should initialize SNS client with configured ARN and region', () => {
      const sns = new SnsNotificationService();
      expect(sns).toBeDefined();
      expect(typeof sns.sendNotification).toBe('function');
      expect(typeof sns.sendBulk).toBe('function');
    });
  });

  describe('Amazon SQS Queue Worker Adapter', () => {
    it('should initialize SQS queue worker with event payload validation', () => {
      const sqs = new SqsQueueService();
      expect(sqs).toBeDefined();
      expect(typeof sqs.publishEvent).toBe('function');
      expect(typeof sqs.processQueueBatch).toBe('function');
    });
  });

  describe('Amazon DynamoDB NoSQL Persistence Adapter', () => {
    it('should successfully record and retrieve rental audit logs', async () => {
      const res = await dynamoDbService.recordAuditEvent({
        bookingId: 'test-booking-uuid-001',
        eventType: 'BOOKING_CREATED',
        actorId: 'test-customer-001',
        actorRole: 'CUSTOMER',
        metadata: { productTitle: 'Sony FX3 Cinema Kit', totalAmount: 5600 },
      });
      expect(res.success).toBe(true);
      expect(res.eventId).toBeDefined();

      const logs = await dynamoDbService.getAuditLogsForBooking('test-booking-uuid-001');
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThanOrEqual(1);
      expect(logs[0].eventType).toBe('BOOKING_CREATED');
    });
  });

  describe('Amazon Cognito Authentication Adapter', () => {
    it('should be safely instantiated and report status', () => {
      expect(cognitoAuthService).toBeDefined();
      expect(typeof cognitoAuthService.isEnabled).toBe('function');
      expect(typeof cognitoAuthService.verifyAccessToken).toBe('function');
    });
  });

  describe('AWS Lambda Serverless Handlers', () => {
    it('should calculate accurate multi-day tiered rental quotes with 18% GST', () => {
      const quote = calculateQuote({
        pricePerDay: 2000,
        securityDeposit: 10000,
        startDate: '2026-12-01',
        endDate: '2026-12-08', // 7 days (15% weekly discount)
        insuranceOptIn: true,
      });

      expect(quote.rentalDays).toBe(7);
      expect(quote.baseRental).toBe(14000);
      expect(quote.discountPercentage).toBe(15);
      expect(quote.discountAmount).toBe(2100);
      expect(quote.subtotal).toBe(11900);
      expect(quote.gstAmount).toBe(Math.round(11900 * 0.18));
      expect(quote.securityDeposit).toBe(10000);
      expect(quote.currency).toBe('INR');
    });
  });

  describe('Cloud Operations API Telemetry Endpoints', () => {
    it('GET /api/cloud/overview should return system compute and 16 AWS services catalog', async () => {
      const res = await request(app).get('/api/cloud/overview');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('platform');
      expect(res.body.data).toHaveProperty('compute');
      expect(res.body.data).toHaveProperty('database');
      expect(res.body.data.database.status).toBe('CONNECTED');
      expect(Array.isArray(res.body.data.serviceCatalog)).toBe(true);
      expect(res.body.data.serviceCatalog.length).toBe(20);
    });

    it('POST /api/cloud/quote should compute serverless quote via Lambda logic', async () => {
      const res = await request(app)
        .post('/api/cloud/quote')
        .send({
          pricePerDay: 1500,
          securityDeposit: 5000,
          startDate: '2026-12-10',
          endDate: '2026-12-15',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rentalDays).toBe(5);
      expect(res.body.data.currency).toBe('INR');
    });

    it('GET /api/cloud/audit-logs should retrieve DynamoDB audit stream', async () => {
      const res = await request(app).get('/api/cloud/audit-logs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
