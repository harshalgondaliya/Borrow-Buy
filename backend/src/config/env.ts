import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  NOTIFICATION_DRIVER: z.enum(['local', 'sns']).default('local'),
  PAYMENT_DRIVER: z.enum(['simulation', 'gateway']).default('simulation'),
  QUEUE_DRIVER: z.enum(['local', 'sqs']).default('local'),
  AWS_REGION: z.string().default('ap-south-1'),
  AWS_S3_BUCKET_NAME: z.string().optional(),
  AWS_SNS_TOPIC_ARN: z.string().optional(),
  AWS_SQS_QUEUE_URL: z.string().optional(),
  CLOUDFRONT_DOMAIN: z.string().optional(),
});

const parseEnv = () => {
  // Support AWS_S3_BUCKET alias if AWS_S3_BUCKET_NAME is unset
  if (!process.env.AWS_S3_BUCKET_NAME && process.env.AWS_S3_BUCKET) {
    process.env.AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET;
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    throw new Error('Environment configuration error');
  }
  return parsed.data;
};

export const env = parseEnv();
