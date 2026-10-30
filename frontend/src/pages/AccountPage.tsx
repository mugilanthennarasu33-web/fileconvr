import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, CheckCircle2, LogOut, LayoutDashboard, Calendar, Sparkles } from 'lucide-react';

interface AccountPageProps {
  onNavigateToDashboard: () => void;
  onLogoutSuccess: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onNavigateToDashboard,
  onLogoutSuccess,
}) => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    onLogoutSuccess();
  };

  const formattedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
              Account Settings
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
              {user.tier} Tier
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Manage your personal profile, security configuration, and subscription plan.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateToDashboard}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-semibold transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-red-400" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-red-500" />
              <span>User Profile</span>
            </h2>

            {user.avatarUrl && (
              <div className="flex items-center space-x-3.5 mb-4 pb-4 border-b border-slate-800/80">
                <img
                  src={user.avatarUrl}
                  alt={user.name || 'User'}
                  className="w-14 h-14 rounded-2xl border-2 border-red-500/30 object-cover shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-white font-semibold text-base block">{user.name || user.email}</span>
                  <span className="text-xs text-emerald-400 flex items-center space-x-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    <span>Verified via Google OAuth / Supabase Auth</span>
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Full Name
                  </span>
                  <span className="text-sm font-medium text-slate-100">
                    {user.name || 'Not specified'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Email Address
                  </span>
                  <span className="text-sm font-medium text-slate-100 break-all">
                    {user.email}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Account Status
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-emerald-400 capitalize">
                      {user.status}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Member Since
                  </span>
                  <div className="flex items-center space-x-2 text-sm font-medium text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Session Card */}
          <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-500" />
              <span>Security &amp; Session Protections</span>
            </h2>

            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-200 block">Supabase Auth &amp; Google OAuth</span>
                  <span className="text-slate-400">
                    Cryptographic JWT token verification (RS256 / HS256) with strict issuer, expiry, and subject claim validation.
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-200 block">PostgreSQL Row-Level Security (RLS)</span>
                  <span className="text-slate-400">
                    Granular isolation guarantees that processing jobs and user profiles can only be queried by their verified owner.
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-200 block">Isolated Workspace Storage</span>
                  <span className="text-slate-400">
                    Temporary files and jobs are assigned unguessable UUIDs and strictly isolated per user session.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Plan Card */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Current Tier</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Active
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 mb-4">
              <span className="text-2xl font-extrabold text-white block">
                Registered Free
              </span>
              <span className="text-xs text-slate-400">100% Free Lifetime Account</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>60 daily PDF operations</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>100 MB max single file size</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>200 MB total batch size</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>25 files per operation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Persistent job history &amp; downloads</span>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-[11px] text-slate-400 text-center">
                Premium subscription upgrades will be enabled in a future release.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
