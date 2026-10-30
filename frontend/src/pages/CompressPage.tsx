import React, { useState } from 'react';
import { ArrowLeft, AlertCircle, Check } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { compressPdfApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState } from '../types';
import { formatFileSize } from '../components/FileList';
import { FileFormatIcon } from '../components/FileFormatIcon';

interface CompressPageProps {
  onBack: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const CompressPage: React.FC<CompressPageProps> = ({ onBack, onSelectTool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<'extreme' | 'recommended' | 'low'>('recommended');
  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const handleFileSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setError(null);
    }
  };

  const handleCompress = async () => {
    if (!file) {
      setError('Please select a PDF file to compress.');
      return;
    }

    try {
      setState('uploading');
      setError(null);

      setState('processing');
      const data = await compressPdfApi(file, level);

      setResult(data);
      setState('success');
    } catch (err: any) {
      setError(err.message || 'An error occurred while compressing the PDF.');
      setState('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setLevel('recommended');
    setResult(null);
    setState('idle');
    setError(null);
  };

  if (state === 'success' && result) {
    return (
      <DownloadView
        result={result}
        toolName="Compress PDF"
        onReset={handleReset}
        onBackToHome={onBack}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header with back */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm cursor-pointer"
          title="Back to home"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Compress PDF Documents</h1>
          <p className="text-xs text-slate-500">Reduce document file size with precision stream and raster optimization.</p>
        </div>
      </div>

      {!file ? (
        <FileUploader
          accept=".pdf"
          multiple={false}
          maxSizeMB={100}
          onFilesSelected={handleFileSelected}
          title="Select or drop a PDF to compress"
          subtitle="Reduce file size for web publishing, sharing, or email attachments"
        />
      ) : (
        <div className="space-y-6">
          {/* Selected File Card */}
          <div className="saas-card p-5 flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <FileFormatIcon format="pdf" size="md" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">Original Size: {formatFileSize(file.size)}</p>
              </div>
            </div>

            <button
              onClick={() => setFile(null)}
              className="text-xs text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Change File
            </button>
          </div>

          {/* Compression Level Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Compression Tier
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Extreme */}
              <div
                onClick={() => setLevel('extreme')}
                className={`saas-card p-5 cursor-pointer transition-all ${
                  level === 'extreme'
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                    : 'hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Extreme</span>
                  {level === 'extreme' && <Check className="w-4 h-4 text-blue-600" strokeWidth={2.5} />}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">Maximum Compression</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  High space saving, lower image resolution. Perfect for email limits.
                </p>
              </div>

              {/* Recommended */}
              <div
                onClick={() => setLevel('recommended')}
                className={`saas-card p-5 cursor-pointer transition-all ${
                  level === 'recommended'
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                    : 'hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Recommended</span>
                  {level === 'recommended' && <Check className="w-4 h-4 text-blue-600" strokeWidth={2.5} />}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">Balanced Optimization</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Best compromise between sharp visual quality and compact file size.
                </p>
              </div>

              {/* Low */}
              <div
                onClick={() => setLevel('low')}
                className={`saas-card p-5 cursor-pointer transition-all ${
                  level === 'low'
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                    : 'hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Low</span>
                  {level === 'low' && <Check className="w-4 h-4 text-blue-600" strokeWidth={2.5} />}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">Lossless Clean</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Removes duplicate metadata and compresses object streams with zero image loss.
                </p>
              </div>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-3 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleCompress}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              Compress PDF →
            </button>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      <ProcessingModal state={state} />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['compress-pdf']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
