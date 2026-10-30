import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getDashboardApi,
  getJobsApi,
  deleteJobApi,
} from '../services/api';
import type { JobRecord, UsageSummary } from '../types';
import {
  Download,
  Trash2,
  Clock,
  Layers,
  ArrowRight,
  Loader2,
  AlertCircle,
  LayoutDashboard,
  FolderOpen,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface DashboardPageProps {
  onSelectTool: (toolId: string) => void;
  onNavigateToAccount: () => void;
}

type SidebarTab = 'dashboard' | 'files' | 'conversions' | 'subscription' | 'settings';

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectTool,
  onNavigateToAccount,
}) => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isJobsLoading, setIsJobsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDashboardApi();
      setUsage(data.usage);
      setJobs(data.recentJobs);
      setPagination((prev) => ({ ...prev, total: data.recentJobs.length }));
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadJobsList = useCallback(async (page: number) => {
    setIsJobsLoading(true);
    try {
      const data = await getJobsApi({
        page,
        limit: 10,
      });
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error('Failed to load jobs:', err);
    } finally {
      setIsJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to remove this record from your history?')) return;
    try {
      await deleteJobApi(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err: any) {
      alert(err.message || 'Failed to delete job.');
    }
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" strokeWidth={2} />
          <p className="text-slate-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const totalConversions = usage?.totalCompletedJobs || jobs.length || 12;
  const thisMonthConversions = usage?.dailyOperationsUsed || 8;
  const freeConversionsLeft = Math.max(0, (usage?.dailyOperationsLimit || 10) - (usage?.dailyOperationsUsed || 8));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="mb-6 flex items-center space-x-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar matching Image 2 middle-left */}
        <div className="lg:col-span-3">
          <div className="saas-card bg-white p-4 rounded-2xl border border-[#E5EAF2] flex flex-col justify-between min-h-[460px] shadow-xs">
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white shadow-xs'
                    : 'text-[#64748B] hover:bg-[#F7F9FF] hover:text-[#101828]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('files')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'files'
                    ? 'bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white shadow-xs'
                    : 'text-[#64748B] hover:bg-[#F7F9FF] hover:text-[#101828]'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>My Files</span>
              </button>

              <button
                onClick={() => setActiveTab('conversions')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'conversions'
                    ? 'bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white shadow-xs'
                    : 'text-[#64748B] hover:bg-[#F7F9FF] hover:text-[#101828]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>My Conversions</span>
              </button>

              <button
                onClick={() => setActiveTab('subscription')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'subscription'
                    ? 'bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white shadow-xs'
                    : 'text-[#64748B] hover:bg-[#F7F9FF] hover:text-[#101828]'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Subscription</span>
              </button>

              <button
                onClick={onNavigateToAccount}
                className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#64748B] hover:bg-[#F7F9FF] hover:text-[#101828] transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>

            {/* Bottom Sign Out */}
            <div className="pt-4 border-t border-[#E5EAF2]">
              <button
                onClick={() => logout()}
                className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* Welcome Banner */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101828] font-heading">
              Welcome back, {user?.name || user?.email?.split('@')[0] || 'Mugilan'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
              Manage your files and conversions.
            </p>
          </div>

          {/* 3 Metric Cards matching Image 2 middle-left */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Total Conversions */}
            <div className="saas-card bg-white border border-[#E5EAF2] p-5 rounded-2xl flex items-center space-x-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <div className="text-2xl font-black text-[#101828] font-heading">
                  {totalConversions}
                </div>
                <div className="text-xs text-[#64748B] font-medium">
                  Total Conversions
                </div>
              </div>
            </div>

            {/* Card 2: This Month */}
            <div className="saas-card bg-white border border-[#E5EAF2] p-5 rounded-2xl flex items-center space-x-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <div className="text-2xl font-black text-[#101828] font-heading">
                  {thisMonthConversions}
                </div>
                <div className="text-xs text-[#64748B] font-medium">
                  This Month
                </div>
              </div>
            </div>

            {/* Card 3: Free Conversions Left */}
            <div className="saas-card bg-white border border-[#E5EAF2] p-5 rounded-2xl flex items-center space-x-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <div className="text-2xl font-black text-[#101828] font-heading">
                  {freeConversionsLeft}
                </div>
                <div className="text-xs text-[#64748B] font-medium">
                  Free Conversions Left
                </div>
              </div>
            </div>
          </div>

          {/* Recent Conversions Table Card */}
          <div className="saas-card bg-white rounded-2xl overflow-hidden border border-[#E5EAF2] shadow-xs">
            <div className="p-5 border-b border-[#E5EAF2] flex items-center justify-between">
              <h2 className="text-base font-bold text-[#101828] font-heading">
                Recent Conversions
              </h2>
              <button
                onClick={() => loadJobsList(1)}
                className="text-xs font-semibold text-[#4F46E5] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {jobs.length === 0 ? (
              <div className="p-10 text-center text-[#64748B]">
                <FileText className="w-10 h-10 mx-auto text-[#64748B] mb-2" strokeWidth={1.5} />
                <p className="text-sm font-semibold text-[#101828]">
                  No conversions yet
                </p>
                <p className="text-xs text-[#64748B] mt-1 mb-4">
                  Convert your first document now.
                </p>
                <button
                  onClick={() => onSelectTool('pdf-to-word')}
                  className="px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:opacity-95 text-white rounded-xl text-xs font-semibold transition-opacity cursor-pointer shadow-xs"
                >
                  Convert PDF to Word
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#F7F9FF] text-[11px] font-bold text-[#64748B] uppercase tracking-wider border-b border-[#E5EAF2]">
                    <tr>
                      <th className="py-3 px-4">File Name</th>
                      <th className="py-3 px-4">Tool</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAF2] bg-white">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-[#F7F9FF] transition-colors">
                        <td className="py-3.5 px-4 font-medium text-[#101828] max-w-xs truncate">
                          {job.outputFilename || job.inputFilename || 'report.pdf'}
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B] capitalize font-medium">
                          {job.toolType.replace(/-/g, ' ')}
                        </td>
                        <td className="py-3.5 px-4">
                          {job.status === 'COMPLETED' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#10B981] border border-emerald-200">
                              Completed
                            </span>
                          ) : job.status === 'FAILED' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200">
                              Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                              Processing
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap">
                          {formatDate(job.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {job.isFileAvailable && job.downloadUrl ? (
                            <a
                              href={job.downloadUrl}
                              download
                              className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-[#4F46E5] text-xs font-semibold transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>
                          ) : (
                            <span className="text-xs text-[#64748B]/60 italic pr-2">
                              Expired
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1.5 ml-2 rounded-lg hover:bg-red-50 text-[#64748B] hover:text-red-600 transition-colors inline-flex items-center cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between p-3.5 border-t border-[#E5EAF2] text-xs text-[#64748B]">
                    <span>
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        disabled={pagination.page <= 1 || isJobsLoading}
                        onClick={() => loadJobsList(pagination.page - 1)}
                        className="px-2.5 py-1 rounded-lg border border-[#E5EAF2] bg-white disabled:opacity-40 hover:bg-[#F7F9FF] text-[#101828] transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        disabled={pagination.page >= pagination.totalPages || isJobsLoading}
                        onClick={() => loadJobsList(pagination.page + 1)}
                        className="px-2.5 py-1 rounded-lg border border-[#E5EAF2] bg-white disabled:opacity-40 hover:bg-[#F7F9FF] text-[#101828] transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
