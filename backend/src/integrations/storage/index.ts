import { env } from '../../config/env.js';
import { IStorageService } from './storage.interface.js';
import { LocalStorageService } from './local-storage.service.js';

class StorageFactory {
  private static instance: IStorageService;

  public static getStorageService(): IStorageService {
    if (!this.instance) {
      if (env.STORAGE_DRIVER === 's3') {
        // Will load AWS S3 adapter in Phase 10
        console.log('[StorageFactory] Initializing S3 Storage Provider...');
        this.instance = new LocalStorageService(); // Fallback until S3 configured
      } else {
        console.log('[StorageFactory] Initializing Local Disk Storage Provider (./uploads)');
        this.instance = new LocalStorageService();
      }
    }
    return this.instance;
  }
}

export const storageService = StorageFactory.getStorageService();

