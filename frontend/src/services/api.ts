import type {
  ProcessingResult,
  User,
  UsageSummary,
  JobsListResponse,
  JobRecord,
  OcrResultData,
  RepairResultData,
  CompareResultData,
  AiSummaryResultData,
  AiAnswerResultData,
} from '../types';

import { getSupabaseAccessToken } from '../utils/supabase';

const API_BASE = '/api';

export async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = await getSupabaseAccessToken();
  const headers = new Headers(init.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(url, {
    ...init,
    headers,
    credentials: init.credentials || 'include',
  });
}

export interface HealthStatus {
  status: string;
  uptimeSeconds: number;
  environment: string;
  features: Record<string, boolean>;
}

export async function checkBackendHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error('Backend service is currently unreachable.');
  }
  return res.json();
}

/**
 * Merge multiple PDF files.
 */
export async function mergePdfsApi(files: File[]): Promise<ProcessingResult> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const res = await fetch(`${API_BASE}/pdf/merge`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to merge PDF files.');
  }
  return json.data;
}

/**
 * Split PDF with ranges.
 */
export async function splitPdfApi(
  file: File,
  ranges: string,
  mergeResult: boolean
): Promise<ProcessingResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('ranges', ranges);
  formData.append('mergeResult', mergeResult ? 'true' : 'false');

  const res = await fetch(`${API_BASE}/pdf/split`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to split PDF file.');
  }
  return json.data;
}

/**
 * Rotate PDF.
 */
export async function rotatePdfApi(
  file: File,
  angle: 90 | 180 | 270,
  target: 'all' | 'portrait' | 'landscape'
): Promise<ProcessingResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('angle', angle.toString());
  formData.append('target', target);

  const res = await fetch(`${API_BASE}/pdf/rotate`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to rotate PDF.');
  }
  return json.data;
}

/**
 * Compress PDF.
 */
export async function compressPdfApi(
  file: File,
  level: 'extreme' | 'recommended' | 'low'
): Promise<ProcessingResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('level', level);

  const res = await fetch(`${API_BASE}/pdf/compress`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to compress PDF.');
  }
  return json.data;
}

/**
 * Convert images to PDF.
 */
export async function imgToPdfApi(
  files: File[],
  pageSize: 'fit' | 'a4' | 'letter',
  orientation: 'auto' | 'portrait' | 'landscape',
  margin: 'none' | 'small' | 'big'
): Promise<ProcessingResult> {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  formData.append('pageSize', pageSize);
  formData.append('orientation', orientation);
  formData.append('margin', margin);

  const res = await fetch(`${API_BASE}/pdf/img-to-pdf`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to convert images to PDF.');
  }
  return json.data;
}

/**
 * Convert PDF to JPG.
 */
export async function pdfToImgApi(file: File): Promise<ProcessingResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/pdf/pdf-to-img`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to convert PDF to images.');
  }
  return json.data;
}

/**
 * Convert Word document (.docx, .doc) to PDF.
 */
export async function wordToPdfApi(file: File): Promise<ProcessingResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/pdf/word-to-pdf`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to convert Word document to PDF.');
  }
  return json.data;
}

/**
 * Convert Excel spreadsheet (.xlsx, .xls) to PDF.
 */
export async function excelToPdfApi(file: File): Promise<ProcessingResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/pdf/excel-to-pdf`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to convert Excel spreadsheet to PDF.');
  }
  return json.data;
}

/**
 * Convert PowerPoint presentation (.pptx, .ppt) to PDF.
 */
export async function pptToPdfApi(file: File): Promise<ProcessingResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/pdf/ppt-to-pdf`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to convert PowerPoint presentation to PDF.');
  }
  return json.data;
}

/**
 * Convert PDF document to editable Word (.docx) document.
 */
export async function pdfToWordApi(
  file: File
): Promise<ProcessingResult & { isScanned?: boolean; ocrRequired?: boolean }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/pdf/pdf-to-word`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to convert PDF to Word document.');
  }
  return json.data;
}

/**
 * Reorder, rotate, delete, or duplicate pages in PDF.
 */
export async function organizePdfApi(
  file: File,
  operations: Array<{ originalIndex: number; rotation?: number }>
): Promise<ProcessingResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('operations', JSON.stringify(operations));

  const res = await fetch(`${API_BASE}/pdf/organize`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to organize PDF pages.');
  }
  return json.data;
}

/**
 * Apply text watermark to PDF.
 */
export async function watermarkTextApi(
  file: File,
  options: {
    text: string;
    fontSize?: number;
    color?: string;
    opacity?: number;
    rotation?: number;
    position?: string;
    pages?: string;
    layer?: string;
  }
): Promise<ProcessingResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('text', options.text);
  if (options.fontSize) formData.append('fontSize', options.fontSize.toString());
  if (options.color) formData.append('color', options.color);
  if (options.opacity !== undefined) formData.append('opacity', options.opacity.toString());
  if (options.rotation !== undefined) formData.append('rotation', options.rotation.toString());
  if (options.position) formData.append('position', options.position);
  if (options.pages) formData.append('pages', options.pages);
  if (options.layer) formData.append('layer', options.layer);

  const res = await fetch(`${API_BASE}/pdf/watermark-text`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to apply text watermark.');
  }
  return json.data;
}

/**
 * Apply image watermark to PDF.
 */
export async function watermarkImageApi(
  file: File,
  imageFile: File,
  options: {
    scale?: number;
    opacity?: number;
    rotation?: number;
    position?: string;
    pages?: string;
    layer?: string;
  }
): Promise<ProcessingResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('image', imageFile);
  if (options.scale !== undefined) formData.append('scale', options.scale.toString());
  if (options.opacity !== undefined) formData.append('opacity', options.opacity.toString());
  if (options.rotation !== undefined) formData.append('rotation', options.rotation.toString());
  if (options.position) formData.append('position', options.position);
  if (options.pages) formData.append('pages', options.pages);
  if (options.layer) formData.append('layer', options.layer);

  const res = await fetch(`${API_BASE}/pdf/watermark-image`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to apply image watermark.');
  }
  return json.data;
}

/**
 * Add page numbers to PDF.
 */
export async function addPageNumbersApi(
  file: File,
  options: {
    position?: string;
    format?: string;
    startNumber?: number;
    prefix?: string;
    suffix?: string;
    fontSize?: number;
    color?: string;
    margin?: number;
    pages?: string;
    excludeFirstPage?: boolean;
  }
): Promise<ProcessingResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (options.position) formData.append('position', options.position);
  if (options.format) formData.append('format', options.format);
  if (options.startNumber !== undefined) formData.append('startNumber', options.startNumber.toString());
  if (options.prefix !== undefined) formData.append('prefix', options.prefix);
  if (options.suffix !== undefined) formData.append('suffix', options.suffix);
  if (options.fontSize !== undefined) formData.append('fontSize', options.fontSize.toString());
  if (options.color) formData.append('color', options.color);
  if (options.margin !== undefined) formData.append('margin', options.margin.toString());
  if (options.pages) formData.append('pages', options.pages);
  if (options.excludeFirstPage !== undefined) formData.append('excludeFirstPage', options.excludeFirstPage ? 'true' : 'false');

  const res = await fetch(`${API_BASE}/pdf/page-numbers`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to add page numbers.');
  }
  return json.data;
}

/**
 * Encrypt PDF with password protection (AES-256).
 */
export async function protectPdfApi(
  file: File,
  password: string,
  ownerPassword?: string
): Promise<ProcessingResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);
  if (ownerPassword) formData.append('ownerPassword', ownerPassword);

  const res = await fetch(`${API_BASE}/pdf/protect`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to protect PDF document.');
  }
  return json.data;
}

/**
 * Decrypt PDF and remove password protection.
 */
export async function unlockPdfApi(
  file: File,
  password: string
): Promise<ProcessingResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);

  const res = await fetch(`${API_BASE}/pdf/unlock`, {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to unlock PDF document.');
  }
  return json.data;
}

/* ==========================================================================
   Authentication & User Profile APIs (Milestone 4)
   ========================================================================== */

export async function registerApi(data: {
  email: string;
  password: string;
  confirmPassword?: string;
  name?: string;
}): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Registration failed.');
  }
  return json.data;
}

export async function loginApi(data: {
  email: string;
  password: string;
}): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Invalid email or password.');
  }
  return json.data;
}

export async function logoutApi(): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to logout.');
  }
}

export async function getMeApi(tokenOverride?: string | null): Promise<User | null> {
  const token = tokenOverride !== undefined ? tokenOverride : await getSupabaseAccessToken();
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers,
    credentials: 'include',
  });
  if (res.status === 401) {
    return null;
  }
  const json = await res.json();
  if (!res.ok || !json.success) {
    return null;
  }
  return json.data.user;
}

/* ==========================================================================
   Dashboard, Usage Quotas, and Job History APIs (Milestone 4)
   ========================================================================== */

export async function getDashboardApi(): Promise<{
  user: User;
  usage: UsageSummary;
  recentJobs: JobRecord[];
}> {
  const res = await authFetch(`${API_BASE}/dashboard`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to load dashboard data.');
  }
  return json.data;
}

export async function getUsageApi(): Promise<UsageSummary> {
  const res = await authFetch(`${API_BASE}/usage`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to load usage quotas.');
  }
  return json.data;
}

export async function getJobsApi(options?: {
  page?: number;
  limit?: number;
  toolType?: string;
  status?: string;
}): Promise<JobsListResponse> {
  const params = new URLSearchParams();
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.toolType) params.set('toolType', options.toolType);
  if (options?.status) params.set('status', options.status);

  const url = `${API_BASE}/jobs?${params.toString()}`;
  const res = await authFetch(url);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to load job history.');
  }
  return json.data;
}

export async function deleteJobApi(jobId: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/jobs/${jobId}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to delete job record.');
  }
}

/**
 * OCR PDF: Recognizes text in scanned PDFs and returns a searchable document
 */
export async function ocrPdfApi(
  file: File,
  language = 'eng',
  forceAllPages = false
): Promise<OcrResultData> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  if (forceAllPages) {
    formData.append('forceAllPages', 'true');
  }

  const res = await fetch(`${API_BASE}/pdf/ocr`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'OCR processing failed.');
  }
  return json.data;
}

/**
 * Repair PDF: Best-effort reconstruction of damaged or corrupted cross-reference tables
 */
export async function repairPdfApi(file: File): Promise<RepairResultData> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/pdf/repair`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'PDF repair was unsuccessful.');
  }
  return json.data;
}

/**
 * Compare PDF: Dual document textual and visual comparison
 */
export async function comparePdfApi(file1: File, file2: File): Promise<CompareResultData> {
  const formData = new FormData();
  formData.append('file1', file1);
  formData.append('file2', file2);

  const res = await fetch(`${API_BASE}/pdf/compare`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'PDF comparison failed.');
  }
  return json.data;
}

/**
 * Summarize PDF: Executive summary, key insights, and action items with page citations
 */
export async function summarizePdfApi(
  file: File,
  detailLevel: 'concise' | 'standard' | 'detailed' = 'standard'
): Promise<AiSummaryResultData> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('detailLevel', detailLevel);

  const res = await fetch(`${API_BASE}/pdf/summarize`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    const err = new Error(json.error?.message || 'AI summarization failed.');
    (err as any).code = json.error?.code;
    throw err;
  }
  return json.data;
}

/**
 * Ask PDF: Contextual Q&A about the document with page citations
 */
export async function askPdfApi(file: File, question: string): Promise<AiAnswerResultData> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('question', question);

  const res = await fetch(`${API_BASE}/pdf/ask`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    const err = new Error(json.error?.message || 'Failed to answer question.');
    (err as any).code = json.error?.code;
    throw err;
  }
  return json.data;
}



