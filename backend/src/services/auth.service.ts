import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { db, UserRecord, SessionRecord } from '../db/index.js';

const BCRYPT_SALT_ROUNDS = 12;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AuthSessionResult {
  user: {
    id: string;
    email: string;
    name: string | null;
    status: string;
    role: string;
    tier: string;
    createdAt: Date;
  };
  sessionToken: string;
  expiresAt: Date;
}

export class AuthError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string = 'AUTH_ERROR', status: number = 400) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Hash raw password with bcrypt (salt rounds = 12)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Verify password against stored hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Hash a session token using SHA-256 for secure database storage
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Register a new user account
 */
export async function registerUser(params: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthSessionResult> {
  const email = params.email.toLowerCase().trim();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new AuthError('Please provide a valid email address.', 'INVALID_EMAIL', 400);
  }

  // Validate password strength
  if (!params.password || params.password.length < 8) {
    throw new AuthError('Password must be at least 8 characters long.', 'WEAK_PASSWORD', 400);
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AuthError('An account with this email address already exists.', 'EMAIL_EXISTS', 409);
  }

  const passwordHash = await hashPassword(params.password);

  const newUser = await db.user.create({
    data: {
      email,
      passwordHash,
      name: params.name ? params.name.trim() : null,
      status: 'active',
      role: 'user',
      tier: 'free',
    },
  });

  // Automatically create session upon registration
  return createSession(newUser.id);
}

/**
 * Authenticate user with email and password
 */
export async function loginUser(params: {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<AuthSessionResult> {
  const email = params.email.toLowerCase().trim();

  if (!email || !params.password) {
    throw new AuthError('Invalid email or password.', 'INVALID_CREDENTIALS', 401);
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    // Constant-time dummy compare to prevent timing side-channels
    await bcrypt.compare(params.password, '$2a$12$e80yVv69yZq7lKz9PzN1ue1u8m1n9k0l1m9n0k1l2m3n4k5l6m7n8');
    throw new AuthError('Invalid email or password.', 'INVALID_CREDENTIALS', 401);
  }

  if (user.status !== 'active') {
    throw new AuthError('This account has been suspended or deactivated.', 'ACCOUNT_SUSPENDED', 403);
  }

  if (!user.passwordHash) {
    // Account was created via Google OAuth (Supabase) without a local password
    await bcrypt.compare(params.password, '$2a$12$e80yVv69yZq7lKz9PzN1ue1u8m1n9k0l1m9n0k1l2m3n4k5l6m7n8');
    throw new AuthError('This account was created via Google Sign-In. Please click "Continue with Google".', 'OAUTH_ACCOUNT_NO_PASSWORD', 400);
  }

  const isPasswordValid = await verifyPassword(params.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AuthError('Invalid email or password.', 'INVALID_CREDENTIALS', 401);
  }

  return createSession(user.id, params.ipAddress, params.userAgent);
}

/**
 * Create a new cryptographically random session for a user
 */
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<AuthSessionResult> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.session.create({
    data: {
      userId,
      tokenHash,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      expiresAt,
    },
  });

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AuthError('User account not found.', 'USER_NOT_FOUND', 404);
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      role: user.role,
      tier: user.tier,
      createdAt: user.createdAt,
    },
    sessionToken: rawToken,
    expiresAt,
  };
}

/**
 * Validate session token from cookie/header
 */
export async function validateSession(rawToken: string): Promise<UserRecord | null> {
  if (!rawToken || typeof rawToken !== 'string') return null;

  const tokenHash = hashToken(rawToken);
  const session = await db.session.findUnique({ where: { tokenHash } });

  if (!session) return null;
  if (session.revokedAt !== null) return null; // Revoked
  if (session.expiresAt.getTime() < Date.now()) return null; // Expired

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user || user.status !== 'active') return null;

  return user;
}

/**
 * Revoke session on logout
 */
export async function revokeSession(rawToken: string): Promise<boolean> {
  if (!rawToken) return false;

  const tokenHash = hashToken(rawToken);
  try {
    await db.session.update({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch user profile by ID
 */
export async function getUserById(userId: string): Promise<UserRecord | null> {
  return db.user.findUnique({ where: { id: userId } });
}
