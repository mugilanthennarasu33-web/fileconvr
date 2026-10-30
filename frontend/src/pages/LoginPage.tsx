import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, LogIn, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onSuccess: () => void;
}

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister, onSuccess }) => {
  const { login, signInWithGoogle, isSupabaseConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Browser redirects to Google OAuth flow
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to initiate Google Sign-In. Verify your Supabase configuration.'
      );
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-0.5 shadow-xl shadow-red-500/20 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <LogIn className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Welcome to fileconvr
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Sign in to access your cloud dashboard, persistent job history, and usage quotas.
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-8 shadow-2xl shadow-black/40">
          {errorMessage && (
            <div className="mb-6 flex items-start space-x-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Primary Action: Google OAuth via Supabase */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-slate-100 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 hover:border-slate-600 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-black/20 flex items-center justify-center space-x-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-rose-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              {isGoogleLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="w-5 h-5 shrink-0" />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {!isSupabaseConfigured && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-2">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Supabase Auth is ready. Set <code>VITE_SUPABASE_URL</code> in <code>.env</code> to enable live Google Sign-In.
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-slate-900 px-3 text-slate-500 font-medium">
                or sign in with password
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2 text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign in with password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-sm text-slate-400">
            Don&apos;t have an account yet?{' '}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-red-400 hover:text-red-300 font-semibold transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
