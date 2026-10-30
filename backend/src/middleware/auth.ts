import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import { validateSession } from '../services/auth.service.js';
import { verifySupabaseToken, SupabaseAuthError } from '../services/supabase-auth.service.js';
import { UserRecord } from '../db/index.js';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: UserRecord;
      sessionToken?: string;
      authError?: SupabaseAuthError | Error;
      anonymousId?: string;
    }
  }
}

/**
 * Optional authentication: extracts and validates Supabase Bearer token or session
 */
export async function authenticateUser(req: Request, _res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7).trim();
    } else if (req.cookies?.session_token) {
      token = req.cookies.session_token;
    }

    if (token) {
      // 1. If token is a JWT (three segments separated by dots), verify with Supabase Auth
      if (token.includes('.')) {
        try {
          const user = await verifySupabaseToken(token);
          if (user) {
            req.user = user;
            req.sessionToken = token;
          }
        } catch (err: any) {
          req.authError = err;
        }
      } else {
        // 2. Legacy / test token validation
        try {
          const user = await validateSession(token);
          if (user) {
            req.user = user;
            req.sessionToken = token;
          }
        } catch (err: any) {
          req.authError = err;
        }
      }
    }

    // Identify anonymous visitor by IP address or hashed fallback
    if (!req.user) {
      const forwarded = req.headers['x-forwarded-for'];
      const rawIp = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || '127.0.0.1';
      req.anonymousId = `anon_${rawIp.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Enforce authentication: requires valid logged-in user
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    if (req.authError && req.authError instanceof SupabaseAuthError) {
      res.status(req.authError.statusCode).json({
        success: false,
        error: {
          code: req.authError.code,
          message: req.authError.message,
        },
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required to access this resource. Please sign in.',
      },
    });
    return;
  }
  next();
}

/**
 * Rate limiter for authentication endpoints (/login, /register)
 */
export const rateLimitAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 20, // Test-friendly limit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again in a few minutes.',
    },
  },
});
