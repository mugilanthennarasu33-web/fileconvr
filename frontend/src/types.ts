export type ToolCategory =
  | 'all'
  | 'organize'
  | 'optimize'
  | 'convert'
  | 'edit'
  | 'security'
  | 'advanced'
  | 'ai';

export interface ToolDef {
  id: string;
  title: string;
  description: string;
  category: ToolCategory;
  iconName: string;
  badge?: string;
  popular?: boolean;
}

export type ProcessingState = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  rotation: number;
}

export interface ProcessingResult {
  taskId: string;
  downloadUrl: string;
  outputFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  originalSizeBytes?: number;
  savedPercentage?: number;
  pageCount?: number;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  status: string;
  role: string;
  tier: string;
  createdAt: string;
}

export interface TierLimits {
  tierName: string;
  maxUploadSizeBytes: number;
  maxTotalInputSizeBytes: number;
  maxFilesPerOperation: number;
  maxDailyOperations: number;
  maxConcurrentJobs: number;
  maxProcessingDurationSec: number;
  fileRetentionMinutes: number;
}

export interface UsageSummary {
  tier: string;
  tierName: string;
  dailyOperationsUsed: number;
  dailyOperationsLimit: number;
  dailyOperationsRemaining: number;
  monthlyOperationsUsed: number;
  totalCompletedJobs: number;
  totalBytesProcessed: number;
  limits: TierLimits;
}

export interface JobRecord {
  id: string;
  toolType: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  inputFilename: string | null;
  outputFilename: string | null;
  mimeType: string | null;
  inputSizeBytes: number | null;
  outputSizeBytes: number | null;
  pageCount: number | null;
  taskId: string | null;
  downloadUrl: string | null;
  isFileAvailable: boolean;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string;
}

export interface JobsListResponse {
  jobs: JobRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OcrResultData {
  taskId: string;
  downloadUrl: string;
  outputFilename: string;
  fileSizeBytes: number;
  originalSizeBytes: number;
  pageCount: number;
  pagesOcred: number;
  detectedScannedPages: number[];
  language: string;
  languageName: string;
  extractedText: string;
  wordsExtracted: number;
  accuracyNote: string;
}

export interface RepairResultData {
  taskId: string;
  downloadUrl: string;
  outputFilename: string;
  fileSizeBytes: number;
  originalSizeBytes: number;
  pageCount: number;
  reconstructedPagesCount: number;
  statusMessage: string;
}

export interface DiffLineItem {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

export interface PageComparisonItem {
  pageNumber: number;
  status: 'identical' | 'modified' | 'added' | 'removed';
  dimensionsMatch: boolean;
  doc1Dimensions: { width: number; height: number } | null;
  doc2Dimensions: { width: number; height: number } | null;
  textSimilarity: number;
  textChanges: {
    hasChanges: boolean;
    addedLines: number;
    removedLines: number;
    diffLines: DiffLineItem[];
  };
  visualChanges: {
    hasChanges: boolean;
    diffPercentage: number;
    diffImage: string | null;
    doc1Image: string | null;
    doc2Image: string | null;
  };
}

export interface CompareResultData {
  taskId: string;
  downloadUrl: string;
  reportFilename: string;
  areIdentical: boolean;
  doc1PageCount: number;
  doc2PageCount: number;
  comparedPagesCount: number;
  pagesWithTextChanges: number[];
  pagesWithVisualChanges: number[];
  totalAddedLines: number;
  totalRemovedLines: number;
  overallSimilarityScore: number;
  pageComparisons: PageComparisonItem[];
  disclaimer: string;
}

export interface AiSummaryResultData {
  taskId: string;
  summary: string;
  keyInsights: string[];
  actionItems: string[];
  pageCitations: string[];
  pageCount: number;
  totalCharacters: number;
  modelUsed: string;
  disclaimer: string;
}

export interface AiAnswerResultData {
  taskId: string;
  question: string;
  answer: string;
  pageCitations: string[];
  pageCount: number;
  modelUsed: string;
  disclaimer: string;
}
