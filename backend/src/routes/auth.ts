import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { registerUser, loginUser, revokeSession, AuthError } from '../services/auth.service.js';
import { requireAuth, rateLimitAuth } from '../middleware/auth.js';
import { config } from '../config.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address.').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  confirmPassword: z.string().optional(),
  name: z.string().trim().max(100).optional(),
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address.').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required.'),
});

const COOKIE_NAME = 'session_token';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Helper to set secure HTTP-only session cookie
 */
function setSessionCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: 'lax',
    expires: expiresAt,
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  });
}

/**
 * POST /api/auth/register
 */
router.post('/register', rateLimitAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.errors[0]?.message || 'Invalid registration parameters.',
        },
      });
      return;
    }

    const { email, password, name } = parseResult.data;
    const authResult = await registerUser({ email, password, name });

    setSessionCookie(res, authResult.sessionToken, authResult.expiresAt);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user: authResult.user,
        sessionToken: authResult.sessionToken,
      },
    });
  } catch (err: any) {
    if (err instanceof AuthError) {
      res.status(err.status).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
        },
      });
      return;
    }
    next(err);
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', rateLimitAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.errors[0]?.message || 'Invalid login parameters.',
        },
      });
      return;
    }

    const { email, password } = parseResult.data;
    const forwarded = req.headers['x-forwarded-for'];
    const ipAddress = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || undefined;
    const userAgent = req.headers['user-agent'] || undefined;

    const authResult = await loginUser({ email, password, ipAddress, userAgent });

    setSessionCookie(res, authResult.sessionToken, authResult.expiresAt);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: authResult.user,
        sessionToken: authResult.sessionToken,
      },
    });
  } catch (err: any) {
    if (err instanceof AuthError) {
      res.status(err.status).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
        },
      });
      return;
    }
    next(err);
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.[COOKIE_NAME] || req.sessionToken;
    if (token) {
      await revokeSession(token);
    }

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: config.isProd,
      sameSite: 'lax',
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl || null,
        status: user.status,
        role: user.role,
        tier: user.tier,
        createdAt: user.createdAt,
      },
    },
  });
});

export default router;
