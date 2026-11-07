import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { IStorageService, UploadedFileResult } from './storage.interface.js';

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
    const url = `/uploads/${relativeKey}`;

    return {
      url,
      key: relativeKey,
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

