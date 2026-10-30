import { config } from '../config.js';

const SENSITIVE_KEYS = new Set([
  'password',
  'confirmpassword',
  'token',
  'sessiontoken',
  'tokenhash',
  'apikey',
  'secret',
  'authorization',
  'cookie',
  'session_token',
  'filecontent',
  'documentcontent',
  'textcontent',
  'buffer',
]);

function redact(obj: any, depth = 0): any {
  if (depth > 5) return '[Depth Limit]';
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    // Redact bearer tokens or passwords if embedded
    if (obj.length > 500) {
      return `[Truncated text: ${obj.length} chars]`;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redact(item, depth + 1));
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lower = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lower) || lower.includes('password') || lower.includes('secret') || lower.includes('token') || lower.includes('apikey')) {
        sanitized[key] = '[REDACTED]';
      } else if (Buffer.isBuffer(value)) {
        sanitized[key] = `[Buffer ${value.length} bytes]`;
      } else {
        sanitized[key] = redact(value, depth + 1);
      }
    }
    return sanitized;
  }

  return obj;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: {
    name?: string;
    message: string;
    code?: string;
    stack?: string;
  };
}

export const logger = {
  log(level: LogLevel, message: string, meta?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (meta) {
      const sanitizedMeta = redact(meta);
      if (sanitizedMeta.error && sanitizedMeta.error instanceof Error) {
        entry.error = {
          name: sanitizedMeta.error.name,
          message: sanitizedMeta.error.message,
          code: (sanitizedMeta.error as any).code,
          stack: config.isDev ? sanitizedMeta.error.stack : undefined,
        };
        delete sanitizedMeta.error;
      }
      if (Object.keys(sanitizedMeta).length > 0) {
        entry.context = sanitizedMeta;
      }
    }

    if (config.isProd) {
      // In production, emit single-line structured JSON
      const jsonStr = JSON.stringify(entry);
      if (level === 'error') {
        console.error(jsonStr);
      } else if (level === 'warn') {
        console.warn(jsonStr);
      } else {
        console.log(jsonStr);
      }
    } else {
      // In development / test, emit human-readable format
      const color =
        level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : level === 'debug' ? '\x1b[36m' : '\x1b[32m';
      const reset = '\x1b[0m';
      const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
      const errorStr = entry.error ? ` [Error: ${entry.error.message}]` : '';
      console.log(`${color}[${entry.timestamp}] [${level.toUpperCase()}]${reset} ${message}${contextStr}${errorStr}`);
    }
  },

  info(message: string, meta?: Record<string, any>) {
    this.log('info', message, meta);
  },

  warn(message: string, meta?: Record<string, any>) {
    this.log('warn', message, meta);
  },

  error(message: string, meta?: Record<string, any>) {
    this.log('error', message, meta);
  },

  debug(message: string, meta?: Record<string, any>) {
    if (config.isDev) {
      this.log('debug', message, meta);
    }
  },
};
