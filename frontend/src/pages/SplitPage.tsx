import React, { useState } from 'react';
import { ArrowLeft, AlertCircle, Layers } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { splitPdfApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState } from '../types';
import { formatFileSize } from '../components/FileList';
import { FileFormatIcon } from '../components/FileFormatIcon';

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
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm cursor-pointer"
          title="Back to home"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Split PDF Pages</h1>
          <p className="text-xs text-slate-500">Extract specific page ranges or isolate individual pages.</p>
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
          <div className="saas-card p-5 flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <FileFormatIcon format="pdf" size="md" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
              </div>
            </div>

            <button
              onClick={() => setFile(null)}
              className="text-xs text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Change File
            </button>
          </div>

          {/* Range Configuration Box */}
          <div className="saas-card p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 font-heading">
              <Layers className="w-4 h-4 text-blue-600" strokeWidth={2} />
              <span>Define Split Ranges</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Page Range or Numbers (e.g. <code className="text-blue-600 font-mono">1-3, 5, 8-10</code>):
              </label>
              <input
                type="text"
                value={ranges}
                onChange={(e) => setRanges(e.target.value)}
                placeholder="e.g. 1-2, 4"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Comma-separated individual pages or hyphenated ranges.
              </p>
            </div>

            {/* Merge toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={mergeResult}
                  onChange={(e) => setMergeResult(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-800">Merge all extracted pages into 1 PDF</span>
                  <p className="text-xs text-slate-500">If unchecked, extracts into individual PDFs inside a ZIP archive.</p>
                </div>
              </label>
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
              onClick={handleSplit}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer"
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
