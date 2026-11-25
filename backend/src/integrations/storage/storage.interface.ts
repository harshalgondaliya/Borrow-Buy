import type { Readable } from 'stream';

export interface UploadedFileResult {
  url: string;
  key: string;
}

export interface FileStreamResult {
  stream: Readable;
  contentType: string;
}

export interface IStorageService {
  uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadedFileResult>;
  deleteFile(key: string): Promise<void>;
  getFileUrl(keyOrPath: string): string;
  getFileStream?(key: string): Promise<FileStreamResult>;
}

