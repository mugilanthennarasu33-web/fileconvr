import React, { useState } from 'react';
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  Info,
} from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { protectPdfApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState } from '../types';
import { FileFormatIcon } from '../components/FileFormatIcon';

interface ProtectPageProps {
  onBack: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const ProtectPage: React.FC<ProtectPageProps> = ({ onBack, onSelectTool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  // Compute password strength
  const calculateStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Empty', color: 'bg-slate-200', textCol: 'text-slate-400' };
    if (pwd.length < 8) return { score: 1, label: 'Weak (short)', color: 'bg-rose-500', textCol: 'text-rose-500' };

    let flags = 0;
    if (/[A-Z]/.test(pwd)) flags++;
    if (/[a-z]/.test(pwd)) flags++;
    if (/[0-9]/.test(pwd)) flags++;
    if (/[^A-Za-z0-9]/.test(pwd)) flags++;

    if (pwd.length >= 12 && flags >= 3) {
      return { score: 3, label: 'Strong', color: 'bg-emerald-500', textCol: 'text-emerald-500' };
    }
    if (pwd.length >= 8 && flags >= 2) {
      return { score: 2, label: 'Moderate', color: 'bg-amber-500', textCol: 'text-amber-500' };
    }
    return { score: 1, label: 'Weak', color: 'bg-rose-500', textCol: 'text-rose-500' };
  };

  const strength = calculateStrength(password);

  const handleProtect = async () => {
    if (!file) {
      setError('Please select a PDF document to encrypt.');
      return;
    }

    if (!password) {
      setError('Password cannot be empty.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entry.');
      return;
    }

    try {
      setState('uploading');
      setError(null);

      setState('processing');
      const data = await protectPdfApi(file, password);

      setResult(data);
      setState('success');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to encrypt PDF.');
      setState('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setPassword('');
    setConfirmPassword('');
    setResult(null);
    setState('idle');
    setError(null);
  };

  if (state === 'success' && result) {
    return (
      <DownloadView
        result={result}
        toolName="Protect PDF"
        onReset={handleReset}
        onBackToHome={onBack}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm cursor-pointer"
          title="Back to home"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading flex items-center gap-2">
            <Lock className="w-6 h-6 text-rose-600" strokeWidth={2} />
            Protect PDF Document
          </h1>
          <p className="text-xs text-slate-500">
            Encrypt confidential documents using industry-standard AES-256 password protection.
          </p>
        </div>
      </div>

      {!file ? (
        <FileUploader
          accept=".pdf"
          multiple={false}
          maxSizeMB={100}
          onFilesSelected={(files) => {
            if (files.length > 0) setFile(files[0]);
          }}
          title="Select or drop a PDF to protect with a password"
          subtitle="Real AES-256 encryption. Requires password upon every subsequent opening."
        />
      ) : (
        <div className="space-y-6">
          {/* Target File Info */}
          <div className="saas-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <FileFormatIcon format="pdf" size="sm" />
              <div className="truncate">
                <div className="text-sm font-semibold text-slate-900 truncate">{file.name}</div>
                <div className="text-[11px] text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-xs text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Change File
            </button>
          </div>

          {/* Password Entry Card */}
          <div className="saas-card p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Set Document Open Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter strong password..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:outline-none pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Strength guidance:</span>
                    <span className={`font-semibold ${strength.textCol}`}>{strength.label}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 h-1.5">
                    <div
                      className={`rounded-full transition-all ${
                        strength.score >= 1 ? strength.color : 'bg-slate-200'
                      }`}
                    />
                    <div
                      className={`rounded-full transition-all ${
                        strength.score >= 2 ? strength.color : 'bg-slate-200'
                      }`}
                    />
                    <div
                      className={`rounded-full transition-all ${
                        strength.score >= 3 ? strength.color : 'bg-slate-200'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password to confirm..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:outline-none pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
                </button>
              </div>

              {confirmPassword && password !== confirmPassword && (
                <p className="text-[11px] text-red-500 mt-1.5">Passwords do not match yet.</p>
              )}
            </div>

            {/* Honest Security Disclaimer */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 font-medium">
                <Info className="w-4 h-4 text-blue-600" strokeWidth={2} />
                Security & Encryption Details
              </div>
              <p className="text-[11px] leading-relaxed">
                Standard AES-256 PDF encryption requires the recipient to supply this opening password
                to view or print the file.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" strokeWidth={2} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleProtect}
              disabled={!password || password !== confirmPassword}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <KeyRound className="w-4 h-4" strokeWidth={2} />
              Encrypt with AES-256 & Download
            </button>
          </div>
        </div>
      )}

      <ProcessingModal
        state={state}
        statusMessage="Applying AES-256 encryption stream and verifying security state..."
      />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['protect-pdf']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
