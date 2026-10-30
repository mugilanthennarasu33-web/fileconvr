import React, { useState } from 'react';
import { ArrowLeft, Minimize2, AlertCircle, Check } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { compressPdfApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState } from '../types';
import { formatFileSize } from '../components/FileList';

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
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Compress PDF Documents</h1>
          <p className="text-xs text-slate-400">Reduce document file size with precision stream and raster optimization.</p>
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
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Minimize2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-400">Original Size: {formatFileSize(file.size)}</p>
              </div>
            </div>

            <button
              onClick={() => setFile(null)}
              className="text-xs text-slate-400 hover:text-red-400 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Change File
            </button>
          </div>

          {/* Compression Level Selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Select Compression Tier
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Extreme */}
              <div
                onClick={() => setLevel('extreme')}
                className={`glass-panel p-5 rounded-2xl border cursor-pointer transition-all ${
                  level === 'extreme'
                    ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10 scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400">Extreme</span>
                  {level === 'extreme' && <Check className="w-4 h-4 text-red-400" />}
                </div>
                <h4 className="text-base font-bold text-white mb-1">Maximum Compression</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  High space saving, lower image resolution. Perfect for email limits.
                </p>
              </div>

              {/* Recommended */}
              <div
                onClick={() => setLevel('recommended')}
                className={`glass-panel p-5 rounded-2xl border cursor-pointer transition-all ${
                  level === 'recommended'
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Recommended</span>
                  {level === 'recommended' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <h4 className="text-base font-bold text-white mb-1">Balanced Optimization</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Best compromise between sharp visual quality and compact file size.
                </p>
              </div>

              {/* Low */}
              <div
                onClick={() => setLevel('low')}
                className={`glass-panel p-5 rounded-2xl border cursor-pointer transition-all ${
                  level === 'low'
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Low</span>
                  {level === 'low' && <Check className="w-4 h-4 text-blue-400" />}
                </div>
                <h4 className="text-base font-bold text-white mb-1">Lossless Clean</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Removes duplicate metadata and compresses object streams with zero image loss.
                </p>
              </div>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-800">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-semibold border border-slate-800"
            >
              Cancel
            </button>

            <button
              onClick={handleCompress}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-red-500/25 hover:shadow-red-500/40 transition-all cursor-pointer"
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
