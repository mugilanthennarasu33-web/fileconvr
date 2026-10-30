import React, { useState } from 'react';
import {
  ArrowLeft,
  Unlock,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { unlockPdfApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState } from '../types';

interface UnlockPageProps {
  onBack: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const UnlockPage: React.FC<UnlockPageProps> = ({ onBack, onSelectTool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const handleUnlock = async () => {
    if (!file) {
      setError('Please select a PDF document to unlock.');
      return;
    }

    try {
      setState('uploading');
      setError(null);

      setState('processing');
      const data = await unlockPdfApi(file, password);

      setResult(data);
      setState('success');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to unlock PDF document.');
      setState('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setPassword('');
    setResult(null);
    setState('idle');
    setError(null);
  };

  if (state === 'success' && result) {
    return (
      <DownloadView
        result={result}
        toolName="Unlock PDF"
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
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
            <Unlock className="w-6 h-6 text-brand-500" />
            Unlock PDF Document
          </h1>
          <p className="text-xs text-slate-400">
            Remove password encryption and security restrictions from authorized PDF files.
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
          title="Select or drop a password-protected PDF to unlock"
          subtitle="Decrypts authorized files and generates a clean, unencrypted PDF"
        />
      ) : (
        <div className="space-y-6">
          {/* Target File Info */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                <Unlock className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="text-sm font-semibold text-white truncate">{file.name}</div>
                <div className="text-[11px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              Change File
            </button>
          </div>

          {/* Password Entry Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Enter Current Document Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter document password..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-brand-500 focus:outline-none pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                If the document only has owner/permissions restrictions without an opening password, you can leave this blank.
              </p>
            </div>

            {/* Security Notice */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2 text-white font-medium">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Ethical & Authorized Decryption Only
              </div>
              <p className="text-[11px] leading-relaxed">
                fileconvr authenticates documents strictly with the supplied password. We never brute-force, bypass, or crack protected documents. Passwords are processed ephemerally in memory and never stored in logs or databases.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleUnlock}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Unlock Document & Download Unencrypted PDF
            </button>
          </div>
        </div>
      )}

      <ProcessingModal
        state={state}
        statusMessage="Authenticating password credentials and removing encryption stream..."
      />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['unlock-pdf']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
