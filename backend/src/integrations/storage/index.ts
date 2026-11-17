import { env } from '../../config/env.js';
import { IStorageService } from './storage.interface.js';
import { LocalStorageService } from './local-storage.service.js';
import { S3StorageService } from './s3-storage.service.js';

class StorageFactory {
  private static instance: IStorageService;

  public static getStorageService(): IStorageService {
    if (!this.instance) {
      if (env.STORAGE_DRIVER === 's3') {
        console.log('[StorageFactory] Initializing AWS S3 Storage Provider...');
        this.instance = new S3StorageService();
      } else {
        console.log('[StorageFactory] Initializing Local Disk Storage Provider (./uploads)');
        this.instance = new LocalStorageService();
      }
    }
    return this.instance;
  }
}

export const storageService = StorageFactory.getStorageService();
export { IStorageService, UploadedFileResult } from './storage.interface.js';
export { S3StorageService } from './s3-storage.service.js';
export { LocalStorageService } from './local-storage.service.js';
