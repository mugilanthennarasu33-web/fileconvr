import { createClient, SupabaseClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { db, UserRecord } from '../db/index.js';

export class SupabaseAuthError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string = 'UNAUTHORIZED', statusCode: number = 401) {
    super(message);
    this.name = 'SupabaseAuthError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

let _supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!_supabaseClient && config.supabaseUrl && (config.supabaseServiceRoleKey || config.supabasePublishableKey)) {
    try {
      _supabaseClient = createClient(
        config.supabaseUrl,
        config.supabaseServiceRoleKey || config.supabasePublishableKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
    } catch (err) {
      console.error('[Supabase Client Error]', err);
      _supabaseClient = null;
    }
  }
  return _supabaseClient;
}

export interface VerifiedUserPayload {
  sub: string; // Supabase Auth User UUID
  email?: string;
  name?: string | null;
  avatarUrl?: string | null;
  role?: string;
  exp?: number;
  iss?: string;
  aud?: string;
}

/**
 * Verifies a Supabase Bearer token and returns the synchronized application user record.
 * 
 * Supports:
 * 1. Live Supabase Auth token verification via Supabase client (getUser)
 * 2. Cryptographic JWT signature and claims verification (HS256/RS256 with JWT Secret)
 * 3. Idempotent user profile creation and synchronization into application database
 */
export async function verifySupabaseToken(token: string): Promise<UserRecord> {
  if (!token || typeof token !== 'string') {
    throw new SupabaseAuthError('Authentication required. Missing token.', 'MISSING_TOKEN', 401);
  }

  const cleanToken = token.startsWith('Bearer ') ? token.substring(7).trim() : token.trim();
  if (!cleanToken) {
    throw new SupabaseAuthError('Authentication required. Empty token.', 'EMPTY_TOKEN', 401);
  }

  let verifiedPayload: VerifiedUserPayload | null = null;
  const client = getSupabaseClient();

  // 1. Attempt live verification via Supabase Auth API if client configured
  if (client) {
    try {
      const { data, error } = await client.auth.getUser(cleanToken);
      if (!error && data?.user) {
        verifiedPayload = {
          sub: data.user.id,
          email: data.user.email,
          name:
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.email?.split('@')[0] ||
            null,
          avatarUrl: data.user.user_metadata?.avatar_url || null,
          role: data.user.role || 'authenticated',
        };
      }
    } catch (apiErr) {
      // Supabase network error or invalid token, fall back to cryptographic verification
      console.warn('[Supabase API Token Verify]', apiErr);
    }
  }

  // 2. Cryptographic JWT verification if not verified via live API
  if (!verifiedPayload) {
    try {
      const decodedUnverified = jwt.decode(cleanToken, { complete: true });
      if (!decodedUnverified || typeof decodedUnverified.payload !== 'object') {
        throw new SupabaseAuthError('Invalid token format.', 'INVALID_TOKEN', 401);
      }

      const payload = decodedUnverified.payload as Record<string, any>;

      // Check Expiration
      if (payload.exp && typeof payload.exp === 'number') {
        const nowSec = Math.floor(Date.now() / 1000);
        if (payload.exp < nowSec) {
          throw new SupabaseAuthError('Authentication session has expired. Please sign in again.', 'TOKEN_EXPIRED', 401);
        }
      }

      // Check sub claim
      if (!payload.sub || typeof payload.sub !== 'string') {
        throw new SupabaseAuthError('Token is missing user identifier claim.', 'INVALID_CLAIMS', 401);
      }

      // Verify signature if secret is configured
      const secret = config.supabaseJwtSecret || (process.env.NODE_ENV === 'test' ? 'test-supabase-jwt-secret' : null);
      if (secret) {
        try {
          jwt.verify(cleanToken, secret);
        } catch (jwtErr: any) {
          if (jwtErr?.name === 'TokenExpiredError') {
            throw new SupabaseAuthError('Authentication session has expired. Please sign in again.', 'TOKEN_EXPIRED', 401);
          }
          throw new SupabaseAuthError('Invalid token signature.', 'INVALID_SIGNATURE', 401);
        }
      } else if (config.isProd) {
        // In production, an unverified JWT without Supabase API or JWT Secret must be rejected
        throw new SupabaseAuthError('Cannot verify token: Supabase Auth configuration is incomplete.', 'AUTH_UNAVAILABLE', 503);
      }

      verifiedPayload = {
        sub: payload.sub,
        email: payload.email || `${payload.sub}@supabase.auth`,
        name:
          payload.user_metadata?.full_name ||
          payload.user_metadata?.name ||
          payload.name ||
          payload.email?.split('@')[0] ||
          null,
        avatarUrl: payload.user_metadata?.avatar_url || payload.picture || null,
        role: payload.role || 'authenticated',
      };
    } catch (err: any) {
      if (err instanceof SupabaseAuthError) throw err;
      throw new SupabaseAuthError(`Token verification failed: ${err.message}`, 'INVALID_TOKEN', 401);
    }
  }

  if (!verifiedPayload || !verifiedPayload.sub) {
    throw new SupabaseAuthError('Authentication failed: Could not derive verified user identity.', 'UNAUTHORIZED', 401);
  }

  // 3. Idempotent User Profile Synchronization in Application Database
  const userId = verifiedPayload.sub;
  const userEmail = (verifiedPayload.email || `${userId}@supabase.auth`).toLowerCase().trim();

  let user = await db.user.findUnique({ where: { id: userId } });

  if (!user) {
    // Check if account already exists by email (migration from legacy system)
    const existingByEmail = await db.user.findUnique({ where: { email: userEmail } });
    if (existingByEmail) {
      // Update existing record with Supabase metadata
      user = await db.user.update({
        where: { id: existingByEmail.id },
        data: {
          name: verifiedPayload.name || existingByEmail.name,
          avatarUrl: verifiedPayload.avatarUrl || existingByEmail.avatarUrl,
        },
      });
    } else {
      // Create new application profile record
      user = await db.user.create({
        data: {
          id: userId,
          email: userEmail,
          name: verifiedPayload.name || null,
          avatarUrl: verifiedPayload.avatarUrl || null,
          status: 'active',
          role: 'user',
          tier: 'free',
        },
      });
    }
  }

  if (user.status !== 'active') {
    throw new SupabaseAuthError('Your user account has been suspended or deactivated.', 'ACCOUNT_SUSPENDED', 403);
  }

  return user;
}
