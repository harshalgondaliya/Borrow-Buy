import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';
import { env } from '../../config/env.js';
import { IStorageService, UploadedFileResult } from './storage.interface.js';

export class S3StorageService implements IStorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = env.AWS_S3_BUCKET_NAME || 'borrowbuy-product-assets';
    this.s3Client = new S3Client({
      region: env.AWS_REGION || 'ap-south-1',
    });
    console.log(`[S3StorageService] Configured with bucket: ${this.bucketName}, region: ${env.AWS_REGION}`);
  }

  public async uploadFile(file: Express.Multer.File, folder = 'products'): Promise<UploadedFileResult> {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const key = `${folder}/${uniqueSuffix}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: encodeURIComponent(file.originalname),
        uploadedAt: new Date().toISOString(),
      },
    });

    await this.s3Client.send(command);

    // If CloudFront is configured, deliver via CloudFront domain, else S3 standard URL
    const url = env.CLOUDFRONT_DOMAIN
      ? `https://${env.CLOUDFRONT_DOMAIN}/${key}`
      : `https://${this.bucketName}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

    return { url, key };
  }

  public async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    await this.s3Client.send(command);
  }

  public getFileUrl(keyOrPath: string): string {
    if (keyOrPath.startsWith('http://') || keyOrPath.startsWith('https://')) {
      return keyOrPath;
    }
    const cleanKey = keyOrPath.replace(/^\/+/, '');
    if (env.CLOUDFRONT_DOMAIN) {
      return `https://${env.CLOUDFRONT_DOMAIN}/${cleanKey}`;
    }
    return `https://${this.bucketName}.s3.${env.AWS_REGION}.amazonaws.com/${cleanKey}`;
  }

  /**
   * Generates a pre-signed URL for direct, secure browser-to-S3 client uploads
   */
  public async getPresignedUploadUrl(filename: string, contentType: string, folder = 'user-uploads'): Promise<{ uploadUrl: string; key: string }> {
    const ext = path.extname(filename).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const key = `${folder}/${uniqueSuffix}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 300 }); // 5 minutes validity
    return { uploadUrl, key };
  }
}
