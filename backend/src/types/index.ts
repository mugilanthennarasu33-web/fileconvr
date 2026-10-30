export interface ProcessedFileInfo {
  taskId: string;
  downloadUrl: string;
  outputFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  originalSizeBytes?: number;
  savedPercentage?: number;
  pageCount?: number;
}

export type CompressionLevel = 'extreme' | 'recommended' | 'low';

export type SplitMode = 'range' | 'extract';

export type RotationAngle = 90 | 180 | 270;

export type RotationTarget = 'all' | 'portrait' | 'landscape';

export type ImagePageSize = 'fit' | 'a4' | 'letter';

export type ImageOrientation = 'portrait' | 'landscape' | 'auto';

export type ImageMargin = 'none' | 'small' | 'big';

export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type PageNumberPosition =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'top-left'
  | 'top-center'
  | 'top-right';

export type PageNumberFormat = 'number' | 'page-n' | 'page-n-of-total';

export interface PageOperation {
  originalIndex: number;
  rotation?: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
