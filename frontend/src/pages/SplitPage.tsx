import React, { useState } from 'react';
import { ArrowLeft, Scissors, AlertCircle, Layers } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { splitPdfApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState } from '../types';
import { formatFileSize } from '../components/FileList';

interface SplitPageProps {
  onBack: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const SplitPage: React.FC<SplitPageProps> = ({ onBack, onSelectTool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [ranges, setRanges] = useState<string>('1-2');
  const [mergeResult, setMergeResult] = useState<boolean>(true);
  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const handleFileSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setError(null);
    }
  };

  const handleSplit = async () => {
    if (!file) {
      setError('Please select a PDF file to split.');
      return;
    }
    if (!ranges.trim()) {
      setError('Please provide at least one page number or interval (e.g. "1-3, 5").');
      return;
    }

    try {
      setState('uploading');
      setError(null);

      setState('processing');
      const data = await splitPdfApi(file, ranges, mergeResult);

      setResult(data);
      setState('success');
    } catch (err: any) {
      setError(err.message || 'An error occurred while splitting the PDF.');
      setState('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setRanges('1-2');
    setResult(null);
    setState('idle');
    setError(null);
  };

  if (state === 'success' && result) {
    return (
      <DownloadView
        result={result}
        toolName="Split PDF"
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
          <h1 className="text-2xl font-bold text-white font-heading">Split PDF Pages</h1>
          <p className="text-xs text-slate-400">Extract specific page ranges or isolate individual pages.</p>
        </div>
      </div>

      {!file ? (
        <FileUploader
          accept=".pdf"
          multiple={false}
          maxSizeMB={100}
          onFilesSelected={handleFileSelected}
          title="Select or drop a PDF file to split"
          subtitle="Extract single pages or intervals (e.g., 1-5, 8, 11-14)"
        />
      ) : (
        <div className="space-y-6">
          {/* Selected File Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <Scissors className="w-5 h-5" />
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

          {/* Range Configuration Box */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center space-x-2 font-heading">
              <Layers className="w-4 h-4 text-red-400" />
              <span>Define Split Ranges</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Page Range or Numbers (e.g. <code className="text-red-400">1-3, 5, 8-10</code>):
              </label>
              <input
                type="text"
                value={ranges}
                onChange={(e) => setRanges(e.target.value)}
                placeholder="e.g. 1-2, 4"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-500"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Comma-separated individual pages or hyphenated ranges.
              </p>
            </div>

            {/* Merge toggle */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={mergeResult}
                  onChange={(e) => setMergeResult(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-red-600 focus:ring-red-500 bg-slate-900"
                />
                <div>
                  <span className="text-sm font-semibold text-white">Merge all extracted pages into 1 PDF</span>
                  <p className="text-xs text-slate-400">If unchecked, extracts into individual PDFs inside a ZIP archive.</p>
                </div>
              </label>
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
              onClick={handleSplit}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-red-500/25 hover:shadow-red-500/40 transition-all cursor-pointer"
            >
              Split PDF →
            </button>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      <ProcessingModal state={state} />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['split-pdf']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
