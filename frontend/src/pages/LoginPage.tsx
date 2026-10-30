import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, AlertCircle, Zap, ShieldCheck, Smartphone } from 'lucide-react';
import { HeroOrbitalGraphic } from '../components/HeroOrbitalGraphic';

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
  const { login, signInWithGoogle } = useAuth();

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
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to initiate Google Sign-In. Verify your configuration.'
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
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Sign In Card matching image 2 middle-center */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="saas-card p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200">
              <div className="text-center mb-6">
                <img src="/logo.png" alt="fileconvrt" className="h-8 sm:h-9 w-auto mx-auto mb-4 object-contain" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                  Welcome Back
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
                  Sign in to your account to continue
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 flex items-start space-x-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={2} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Continue with Google button */}
              <div className="space-y-2.5 mb-5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 active:scale-[0.99] transition-all duration-200 shadow-2xs flex items-center justify-center space-x-2.5 cursor-pointer"
                >
                  {isGoogleLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-indigo-600 rounded-full animate-spin" />
                  ) : (
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                  )}
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('login-email');
                    if (el) el.focus();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 active:scale-[0.99] transition-all duration-200 shadow-2xs flex items-center justify-center space-x-2.5 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Continue with Email</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                  <span className="bg-white px-2 text-slate-400 font-semibold">
                    OR
                  </span>
                </div>
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Email address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Password
                    </label>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-[11px] text-indigo-600 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 text-xs sm:text-sm cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <span>Signing in...</span>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>

              {/* Sign up prompt */}
              <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: One Platform Multiple Possibilities (hidden on mobile, visible on lg) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col items-center text-center p-6">
            <HeroOrbitalGraphic />

            <div className="mt-6 max-w-sm">
              <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                One Platform Multiple Possibilities
              </h2>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Convert, edit and manage your files with ease.
              </p>

              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3 text-xs font-semibold text-slate-700">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span>Fast & Reliable</span>
                </div>

                <div className="flex items-center space-x-3 text-xs font-semibold text-slate-700">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>Secure & Private</span>
                </div>

                <div className="flex items-center space-x-3 text-xs font-semibold text-slate-700">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <span>Works on Any Device</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
