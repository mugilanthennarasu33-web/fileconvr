import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getDashboardApi,
  getJobsApi,
  deleteJobApi,
} from '../services/api';
import type { JobRecord, UsageSummary } from '../types';
import {
  FileText,
  Download,
  Trash2,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle,
  XCircle,
  Loader2,
  FileDown,
  FolderOpen,
  AlertCircle,
} from 'lucide-react';

interface DashboardPageProps {
  onSelectTool: (toolId: string) => void;
  onNavigateToAccount: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectTool,
  onNavigateToAccount,
}) => {
  const { user } = useAuth();

  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isJobsLoading, setIsJobsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [toolFilter, setToolFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

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

  const loadJobsList = useCallback(async (page: number, tool?: string, status?: string) => {
    setIsJobsLoading(true);
    try {
      const data = await getJobsApi({
        page,
        limit: 10,
        toolType: tool || undefined,
        status: status || undefined,
      });
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error('Failed to filter jobs:', err);
    } finally {
      setIsJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleFilterChange = (newTool: string, newStatus: string) => {
    setToolFilter(newTool);
    setStatusFilter(newStatus);
    loadJobsList(1, newTool, newStatus);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    loadJobsList(newPage, toolFilter, statusFilter);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to remove this record from your history?')) return;
    try {
      await deleteJobApi(jobId);
      // Remove from state
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err: any) {
      alert(err.message || 'Failed to delete job.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const dailyUsed = usage?.dailyOperationsUsed || 0;
  const dailyLimit = usage?.dailyOperationsLimit || 60;
  const dailyPercent = Math.min(100, Math.round((dailyUsed / dailyLimit) * 100));

  const formatBytes = (bytes: number | null | undefined) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const quickTools = [
    { id: 'merge-pdf', name: 'Merge PDF', icon: 'Layers', desc: 'Combine multiple PDFs' },
    { id: 'split-pdf', name: 'Split PDF', icon: 'Split', desc: 'Extract custom page ranges' },
    { id: 'compress-pdf', name: 'Compress PDF', icon: 'Minimize2', desc: 'Optimize file size' },
    { id: 'word-to-pdf', name: 'Word to PDF', icon: 'FileText', desc: 'Convert DOCX to PDF' },
    { id: 'pdf-to-word', name: 'PDF to Word', icon: 'FileEdit', desc: 'Reconstruct editable DOCX' },
    { id: 'organize-pdf', name: 'Organize PDF', icon: 'Grid', desc: 'Reorder and rotate pages' },
    { id: 'protect-pdf', name: 'Protect PDF', icon: 'Lock', desc: 'AES-256 encryption' },
    { id: 'watermark-pdf', name: 'Watermark PDF', icon: 'Stamp', desc: 'Add text or image stamps' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {error && (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-red-950/20 backdrop-blur-xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
                Welcome back, {user?.name || user?.email?.split('@')[0]}!
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
                {user?.tier} Plan
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-2xl">
              Track your processed documents, monitor usage quotas, and launch high-performance PDF conversion workflows.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onNavigateToAccount}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-semibold transition-colors"
            >
              Account Details
            </button>
          </div>
        </div>
      </div>

      {/* Usage Quotas & Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Daily Operations Meter */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Daily Operations</span>
            <Clock className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{dailyUsed}</span>
            <span className="text-slate-400 text-sm">/ {dailyLimit} used</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                dailyPercent > 85 ? 'bg-amber-500' : 'bg-gradient-to-r from-red-600 to-rose-500'
              }`}
              style={{ width: `${dailyPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-1.5 block">
            Resets at midnight UTC
          </span>
        </div>

        {/* Max Upload Size */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Max Upload Limit</span>
            <FileDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">
              {formatBytes(usage?.limits.maxUploadSizeBytes)}
            </span>
            <span className="text-slate-400 text-xs">per file</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-3 block">
            {formatBytes(usage?.limits.maxTotalInputSizeBytes)} batch limit
          </span>
        </div>

        {/* Total Completed Jobs */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Completed</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">
              {usage?.totalCompletedJobs || 0}
            </span>
            <span className="text-slate-400 text-xs">successful jobs</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-3 block">
            {usage?.monthlyOperationsUsed || 0} this month
          </span>
        </div>

        {/* Total Data Processed */}
        <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Processed</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">
              {formatBytes(usage?.totalBytesProcessed)}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-3 block">
            Across all tools
          </span>
        </div>
      </div>

      {/* Available Tools Quick Directory */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-red-500" />
            <span>Quick Launch Tools</span>
          </h2>
          <span className="text-xs text-slate-400">8 Supported Core Utilities</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickTools.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTool(t.id)}
              className="text-left p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-red-500/40 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-slate-200 group-hover:text-red-400 transition-colors">
                  {t.name}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Processing History Section */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FolderOpen className="w-5 h-5 text-red-500" />
              <span>Processing History</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Persistent records of all documents processed with your account.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter:</span>
            </div>
            <select
              value={toolFilter}
              onChange={(e) => handleFilterChange(e.target.value, statusFilter)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">All Tools</option>
              <option value="merge">Merge</option>
              <option value="split">Split</option>
              <option value="compress">Compress</option>
              <option value="rotate">Rotate</option>
              <option value="word-to-pdf">Word to PDF</option>
              <option value="pdf-to-word">PDF to Word</option>
              <option value="organize">Organize</option>
              <option value="watermark-text">Watermark Text</option>
              <option value="watermark-image">Watermark Image</option>
              <option value="page-numbers">Page Numbers</option>
              <option value="protect">Protect</option>
              <option value="unlock">Unlock</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(toolFilter, e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="PROCESSING">Processing</option>
            </select>
          </div>
        </div>

        {/* Jobs Table / Empty State */}
        {isJobsLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-14 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800/80 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">No processing history yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your recent operations will be safely recorded here so you can re-download outputs while they remain active.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onSelectTool('merge-pdf')}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-red-600/20"
              >
                Try Merge PDF
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Tool</th>
                  <th className="py-3 px-4">Document / File</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-200 capitalize">
                      {job.toolType.replace(/-/g, ' ')}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-300">
                      {job.outputFilename || job.inputFilename || 'Untitled Operation'}
                    </td>
                    <td className="py-3 px-4">
                      {job.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" />
                          <span>Completed</span>
                        </span>
                      ) : job.status === 'FAILED' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle className="w-3 h-3" />
                          <span>Failed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Processing</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {formatBytes(job.outputSizeBytes || job.inputSizeBytes)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      {job.isFileAvailable && job.downloadUrl ? (
                        <a
                          href={job.downloadUrl}
                          download
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-colors"
                          title="Download generated file"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic pr-2">
                          Expired
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors inline-flex items-center"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
            <span>
              Showing {jobs.length} of {pagination.total} records
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Previous
              </button>
              <span className="px-2 font-medium text-slate-200">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
