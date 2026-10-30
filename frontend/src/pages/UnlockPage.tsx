import React, { useState } from 'react';
import { ArrowLeft, Unlock, Eye, EyeOff, AlertCircle, ShieldAlert, KeyRound } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { unlockPdfApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState } from '../types';
import { FileFormatIcon } from '../components/FileFormatIcon';
import { formatFileSize } from '../components/FileList';

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
    } catch (err: any) {
      setError(err.message || 'Failed to unlock PDF document. Please verify your password.');
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
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading flex items-center gap-2">
            <Unlock className="w-6 h-6 text-indigo-600" />
            Unlock PDF Document
          </h1>
          <p className="text-xs text-slate-500">
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
          <div className="saas-card p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <FileFormatIcon format="pdf" size="md" />
              <div className="truncate">
                <div className="text-sm font-semibold text-slate-900 truncate">{file.name}</div>
                <div className="text-[11px] text-slate-500">{formatFileSize(file.size)}</div>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-xs text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Change File
            </button>
          </div>

          {/* Password Entry Card */}
          <div className="saas-card p-6 rounded-2xl border border-slate-200 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Enter Current Document Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter document password..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                If the document only has owner/permissions restrictions without an opening password, you can leave this blank.
              </p>
            </div>

            {/* Security Notice */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/80 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900 font-medium">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Ethical & Authorized Decryption Only
              </div>
              <p className="text-[11px] leading-relaxed">
                fileconvrt authenticates documents strictly with the supplied password. We never brute-force, bypass, or crack protected documents. Passwords are processed ephemerally in memory and never stored in logs or databases.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleUnlock}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
        sourceFormat="pdf"
        targetFormat="pdf"
      />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['unlock-pdf']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
