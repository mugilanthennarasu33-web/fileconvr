import React, { useState } from 'react';
import { ArrowLeft, RotateCw, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { rotatePdfApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState } from '../types';
import { formatFileSize } from '../components/FileList';

interface RotatePageProps {
  onBack: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const RotatePage: React.FC<RotatePageProps> = ({ onBack, onSelectTool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [target, setTarget] = useState<'all' | 'portrait' | 'landscape'>('all');
  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const handleFileSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setError(null);
    }
  };

  const handleRotate = async () => {
    if (!file) {
      setError('Please select a PDF file to rotate.');
      return;
    }

    try {
      setState('uploading');
      setError(null);

      setState('processing');
      const data = await rotatePdfApi(file, angle, target);

      setResult(data);
      setState('success');
    } catch (err: any) {
      setError(err.message || 'An error occurred while rotating the PDF.');
      setState('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setAngle(90);
    setTarget('all');
    setResult(null);
    setState('idle');
    setError(null);
  };

  if (state === 'success' && result) {
    return (
      <DownloadView
        result={result}
        toolName="Rotate PDF"
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
          <h1 className="text-2xl font-bold text-white font-heading">Rotate PDF Pages</h1>
          <p className="text-xs text-slate-400">Permanently adjust the orientation of your document pages.</p>
        </div>
      </div>

      {!file ? (
        <FileUploader
          accept=".pdf"
          multiple={false}
          maxSizeMB={100}
          onFilesSelected={handleFileSelected}
          title="Select or drop a PDF to rotate"
          subtitle="Rotate all pages or target only portrait or landscape pages"
        />
      ) : (
        <div className="space-y-6">
          {/* Selected File Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <RotateCw className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
              </div>
            </div>

            <button
              onClick={() => setFile(null)}
              className="text-xs text-slate-400 hover:text-red-400 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Change File
            </button>
          </div>

          {/* Interactive Rotation Controls */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Rotation Angle
              </label>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setAngle(90)}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                    angle === 90
                      ? 'border-red-500 bg-red-500/10 text-white shadow-lg shadow-red-500/10'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <RotateCw className="w-6 h-6 text-red-400" />
                  <span className="text-sm font-bold">90° Right</span>
                  <span className="text-[11px] text-slate-400">Clockwise</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAngle(180)}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                    angle === 180
                      ? 'border-red-500 bg-red-500/10 text-white shadow-lg shadow-red-500/10'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <RefreshCw className="w-6 h-6 text-red-400" />
                  <span className="text-sm font-bold">180° Flip</span>
                  <span className="text-[11px] text-slate-400">Upside Down</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAngle(270)}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${
                    angle === 270
                      ? 'border-red-500 bg-red-500/10 text-white shadow-lg shadow-red-500/10'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <RotateCcw className="w-6 h-6 text-red-400" />
                  <span className="text-sm font-bold">90° Left</span>
                  <span className="text-[11px] text-slate-400">Counter-Clockwise</span>
                </button>
              </div>
            </div>

            {/* Target Filter */}
            <div className="pt-4 border-t border-slate-800/80">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Apply Rotation To:
              </label>

              <div className="flex flex-wrap gap-2">
                {(['all', 'portrait', 'landscape'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTarget(t)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                      target === t
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {t === 'all' ? 'All Pages' : t === 'portrait' ? 'Only Portrait Pages' : 'Only Landscape Pages'}
                  </button>
                ))}
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
              onClick={handleRotate}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-red-500/25 hover:shadow-red-500/40 transition-all cursor-pointer"
            >
              Rotate PDF →
            </button>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      <ProcessingModal state={state} />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['rotate-pdf']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
