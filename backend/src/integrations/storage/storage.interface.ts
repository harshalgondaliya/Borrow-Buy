export interface UploadedFileResult {
  url: string;
  key: string;
}

export interface IStorageService {
  uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadedFileResult>;
  deleteFile(key: string): Promise<void>;
  getFileUrl(keyOrPath: string): string;
}

