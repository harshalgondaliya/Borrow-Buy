import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { FileStreamResult, IStorageService, UploadedFileResult } from './storage.interface.js';

export class LocalStorageService implements IStorageService {
  private baseUploadDir: string;

  constructor() {
    this.baseUploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'products'): Promise<UploadedFileResult> {
    const targetDir = path.join(this.baseUploadDir, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileExt = path.extname(file.originalname) || '.jpg';
    const uniqueFileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${fileExt}`;
    const destinationPath = path.join(targetDir, uniqueFileName);

    await fs.promises.writeFile(destinationPath, file.buffer);

    const relativeKey = `${folder}/${uniqueFileName}`;
    const url = `/api/media/${relativeKey}`;

    return {
      url,
      key: relativeKey,
    };
  }

  async getFileStream(key: string): Promise<FileStreamResult> {
    const filePath = path.resolve(this.baseUploadDir, key);
    if (!filePath.startsWith(this.baseUploadDir) || !fs.existsSync(filePath)) {
      const err: any = new Error('File not found');
      err.name = 'NoSuchKey';
      throw err;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.webp': 'image/webp',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    };
    return {
      stream: fs.createReadStream(filePath),
      contentType: mimeMap[ext] || 'application/octet-stream',
    };
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.baseUploadDir, key);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  getFileUrl(keyOrPath: string): string {
    if (keyOrPath.startsWith('http://') || keyOrPath.startsWith('https://')) {
      return keyOrPath;
    }
    if (keyOrPath.startsWith('/uploads/')) {
      return keyOrPath;
    }
    return `/uploads/${keyOrPath}`;
  }
}

