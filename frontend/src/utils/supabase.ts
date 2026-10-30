import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js';
import { safeStorage } from './safeStorage';

const env =
  (typeof import.meta !== 'undefined' && import.meta.env)
    ? import.meta.env
    : (typeof globalThis !== 'undefined' && (globalThis as any).process?.env)
    ? (globalThis as any).process.env
    : {};

const supabaseUrl =
  env.VITE_SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://wqadoyzvepzqstpinyok.supabase.co';

const supabaseKey =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_mibkPUsd1YtyaGNm5Iu6rw_K_eul9lG';

export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    !!supabaseKey &&
    !supabaseUrl.includes('your-project-ref') &&
    !supabaseKey.includes('your_key_here')
  );
};

// Fallback dummy URL to allow client initialization without crashing before env configuration
const effectiveUrl = isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co';
const effectiveKey = isSupabaseConfigured() ? supabaseKey : 'sb_publishable_placeholder_key';

export const supabase: SupabaseClient = createClient(effectiveUrl, effectiveKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'fileconvr-supabase-auth',
    storage: safeStorage,
  },
});

/**
 * Initiates Google OAuth Sign-In via Supabase.
 * Redirects the browser to Google authentication and returns to /auth/callback.
 */
export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not yet configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in frontend/.env to enable live Google Sign-In.'
    );
  }

  // Derive redirect URL from current origin (supports localhost:5173, staging, and production)
  const redirectTo = `${window.location.origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Signs the user out of Supabase and clears persisted sessions.
 */
export async function signOutFromSupabase(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[Supabase SignOut Warning]', err);
    }
  }
}

/**
 * Returns current active Supabase access token (JWT), or null if unauthenticated.
 */
export async function getSupabaseAccessToken(): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

/**
 * Returns current Supabase session.
 */
export async function getSupabaseSession(): Promise<Session | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
}
