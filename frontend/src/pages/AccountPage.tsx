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
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-heading">
              Account Settings
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
              {user.tier} Tier
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Manage your personal profile, security configuration, and subscription plan.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateToDashboard}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4 text-blue-600" strokeWidth={2} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-sm font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-500" strokeWidth={2} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="saas-card bg-white border border-[#E5EAF2] p-6 rounded-2xl shadow-xs">
            <h2 className="text-lg font-bold text-[#101828] font-heading mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-[#4F46E5]" strokeWidth={2} />
              <span>User Profile</span>
            </h2>

            {user.avatarUrl && (
              <div className="flex items-center space-x-3.5 mb-4 pb-4 border-b border-[#E5EAF2]">
                <img
                  src={user.avatarUrl}
                  alt={user.name || 'User'}
                  className="w-14 h-14 rounded-2xl border-2 border-indigo-500/30 object-cover shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-[#101828] font-semibold text-base block">{user.name || user.email}</span>
                  <span className="text-xs text-[#10B981] flex items-center space-x-1 mt-0.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block" />
                    <span>Verified via Google OAuth / Supabase Auth</span>
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[#F7F9FF] border border-[#E5EAF2]">
                  <span className="text-xs text-[#64748B] uppercase tracking-wider font-semibold block mb-1">
                    Full Name
                  </span>
                  <span className="text-sm font-semibold text-[#101828]">
                    {user.name || 'Not specified'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F9FF] border border-[#E5EAF2]">
                  <span className="text-xs text-[#64748B] uppercase tracking-wider font-semibold block mb-1">
                    Email Address
                  </span>
                  <span className="text-sm font-semibold text-[#101828] break-all">
                    {user.email}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[#F7F9FF] border border-[#E5EAF2]">
                  <span className="text-xs text-[#64748B] uppercase tracking-wider font-semibold block mb-1">
                    Account Status
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span className="text-sm font-semibold text-[#10B981] capitalize">
                      {user.status}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F7F9FF] border border-[#E5EAF2]">
                  <span className="text-xs text-[#64748B] uppercase tracking-wider font-semibold block mb-1">
                    Member Since
                  </span>
                  <div className="flex items-center space-x-2 text-sm font-semibold text-[#101828]">
                    <Calendar className="w-4 h-4 text-[#64748B]" strokeWidth={2} />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Session Card */}
          <div className="saas-card bg-white border border-[#E5EAF2] p-6 rounded-2xl shadow-xs">
            <h2 className="text-lg font-bold text-[#101828] font-heading mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-[#4F46E5]" strokeWidth={2} />
              <span>Security &amp; Session Protections</span>
            </h2>

            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-[#F7F9FF] border border-[#E5EAF2]">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2} />
                <div className="text-xs">
                  <span className="font-semibold text-[#101828] block mb-0.5">Supabase Auth &amp; Google OAuth</span>
                  <span className="text-[#64748B]">
                    Cryptographic JWT token verification (RS256 / HS256) with strict issuer, expiry, and subject claim validation.
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-[#F7F9FF] border border-[#E5EAF2]">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2} />
                <div className="text-xs">
                  <span className="font-semibold text-[#101828] block mb-0.5">PostgreSQL Row-Level Security (RLS)</span>
                  <span className="text-[#64748B]">
                    Granular isolation guarantees that processing jobs and user profiles can only be queried by their verified owner.
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-[#F7F9FF] border border-[#E5EAF2]">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2} />
                <div className="text-xs">
                  <span className="font-semibold text-[#101828] block mb-0.5">Isolated Workspace Storage</span>
                  <span className="text-[#64748B]">
                    Temporary files and jobs are assigned unguessable UUIDs and strictly isolated per user session.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Plan Card */}
        <div className="space-y-6">
          <div className="saas-card bg-white border border-[#E5EAF2] p-6 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#101828] font-heading flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-500" strokeWidth={2} />
                <span>Current Tier</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-emerald-50 text-[#10B981] border border-emerald-200">
                Active
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F9FF] border border-[#E5EAF2] mb-4">
              <span className="text-2xl font-extrabold text-[#101828] font-heading block">
                Registered Free
              </span>
              <span className="text-xs text-[#64748B] font-medium">100% Free Lifetime Account</span>
            </div>

            <ul className="space-y-2.5 text-xs text-[#64748B] font-medium">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" strokeWidth={2} />
                <span className="text-[#101828]">60 daily PDF operations</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" strokeWidth={2} />
                <span className="text-[#101828]">100 MB max single file size</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" strokeWidth={2} />
                <span className="text-[#101828]">200 MB total batch size</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" strokeWidth={2} />
                <span className="text-[#101828]">25 files per operation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" strokeWidth={2} />
                <span className="text-[#101828]">Persistent job history &amp; downloads</span>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-[#E5EAF2]">
              <div className="p-3 rounded-xl bg-[#F7F9FF] border border-[#E5EAF2] text-[11px] text-[#64748B] text-center">
                Premium subscription upgrades will be enabled in a future release.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
