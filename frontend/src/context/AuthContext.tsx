import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { getMeApi, loginApi, registerApi, logoutApi } from '../services/api';
import {
  supabase,
  signInWithGoogle as supabaseSignInWithGoogle,
  signOutFromSupabase,
  isSupabaseConfigured,
  getSupabaseAccessToken,
} from '../utils/supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSupabaseConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  login: (params: { email: string; password: string }) => Promise<void>;
  register: (params: { email: string; password: string; confirmPassword?: string; name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      // 1. If Supabase session exists, query backend with Supabase Bearer token
      const token = await getSupabaseAccessToken();
      const currentUser = await getMeApi(token);
      if (currentUser) {
        setUser(currentUser);
        return;
      }

      // 2. If backend /api/auth/me returned null, but Supabase has an active session, use Supabase profile
      if (token) {
        const { data: { user: supaUser } } = await supabase.auth.getUser();
        if (supaUser) {
          setUser({
            id: supaUser.id,
            email: supaUser.email || '',
            name:
              supaUser.user_metadata?.full_name ||
              supaUser.user_metadata?.name ||
              supaUser.email?.split('@')[0] ||
              'Google User',
            avatarUrl: supaUser.user_metadata?.avatar_url || null,
            tier: 'free',
            role: 'user',
            status: 'active',
            createdAt: supaUser.created_at || new Date().toISOString(),
          });
          return;
        }
      }

      // 3. Fallback to legacy cookie session check
      const cookieUser = await getMeApi();
      setUser(cookieUser);
    } catch (err) {
      console.warn('[AuthContext] Failed to fetch current user profile:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial check on mount
    refreshUser();

    // 2. Listen to Supabase auth state changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED)
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            await refreshUser();
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signInWithGoogle = async () => {
    await supabaseSignInWithGoogle();
  };

  const login = async (params: { email: string; password: string }) => {
    const res = await loginApi(params);
    setUser(res.user);
  };

  const register = async (params: { email: string; password: string; confirmPassword?: string; name?: string }) => {
    const res = await registerApi(params);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await signOutFromSupabase();
      await logoutApi();
    } catch (err) {
      console.warn('[Logout Error]', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isSupabaseConfigured: isSupabaseConfigured(),
        signInWithGoogle,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
