import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  tempStorageDir: path.resolve(process.env.TEMP_STORAGE_DIR || './storage/temp'),
  fileTtlMinutes: parseInt(process.env.FILE_TTL_MINUTES || '60', 10),
  maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_BYTES || '104857600', 10), // 100 MB default
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isTest: process.env.NODE_ENV === 'test',
  isProd: process.env.NODE_ENV === 'production',
  chromePath:
    process.env.CHROME_PATH ||
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  edgePath:
    process.env.EDGE_PATH ||
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  pythonPath: process.env.PYTHON_PATH || 'python',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  aiProvider: process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : process.env.OPENAI_API_KEY ? 'openai' : ''),
  aiModel: process.env.AI_MODEL || (process.env.GEMINI_API_KEY ? 'gemini-1.5-flash' : 'gpt-4o-mini'),
  supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET || '',
  supabaseJwksUrl: process.env.SUPABASE_JWKS_URL || '',
};
