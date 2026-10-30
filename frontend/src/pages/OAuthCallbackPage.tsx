import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface OAuthCallbackPageProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const OAuthCallbackPage: React.FC<OAuthCallbackPageProps> = ({
  onSuccess,
  onNavigateToLogin,
}) => {
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        // 1. Check for URL error parameters (e.g. user cancelled or provider rejected)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);

        const errorDesc =
          hashParams.get('error_description') ||
          searchParams.get('error_description') ||
          hashParams.get('error') ||
          searchParams.get('error');

        if (errorDesc) {
          throw new Error(decodeURIComponent(errorDesc).replace(/\+/g, ' '));
        }

        // 2. Retrieve session from Supabase client
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!session) {
          // If no immediate session, give onAuthStateChange a short window to exchange token
          await new Promise((resolve) => setTimeout(resolve, 800));
          const retry = await supabase.auth.getSession();
          if (!retry.data.session) {
            throw new Error('No authentication session was established from the Google OAuth redirect.');
          }
        }

        // 3. Sync profile with backend
        await refreshUser();

        if (isMounted) {
          setStatus('success');
          // Short delay to show success state before transition
          setTimeout(() => {
            if (isMounted) {
              onSuccess();
            }
          }, 600);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('[OAuth Callback Error]', err);
          setStatus('error');
          setErrorMessage(err.message || 'Failed to complete Google authentication.');
        }
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [onSuccess, refreshUser]);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-8 shadow-2xl shadow-black/40 text-center">
          {status === 'loading' && (
            <div className="space-y-4 py-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-2">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-white font-heading">
                Authenticating with Google
              </h2>
              <p className="text-sm text-slate-400">
                Securely verifying your credentials and establishing your session...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4 py-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white font-heading">
                Welcome to fileconvr!
              </h2>
              <p className="text-sm text-slate-400">
                Sign-in successful. Redirecting to your dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-5 py-4 animate-in fade-in">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-1">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white font-heading">
                Authentication Error
              </h2>
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm text-left">
                {errorMessage}
              </div>
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm transition-all shadow-lg shadow-red-600/20"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
