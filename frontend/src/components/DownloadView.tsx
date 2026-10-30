import React from 'react';
import { Download, CheckCircle, RefreshCw, ArrowLeft, FileText, Sparkles, Archive } from 'lucide-react';
import type { ProcessingResult } from '../types';
import { formatFileSize } from './FileList';

interface DownloadViewProps {
  result: ProcessingResult;
  toolName: string;
  onReset: () => void;
  onBackToHome: () => void;
}

export const DownloadView: React.FC<DownloadViewProps> = ({
  result,
  toolName,
  onReset,
  onBackToHome,
}) => {
  const isZip = result.outputFilename.endsWith('.zip');
  const isImage = result.outputFilename.endsWith('.jpg') || result.outputFilename.endsWith('.png');

  return (
    <div className="w-full max-w-2xl mx-auto text-center py-6 animate-fade-in">
      {/* Success Badge */}
      <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20 mb-6">
        <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
      </div>

      <h2 className="text-3xl font-extrabold text-white mb-2 font-heading">
        {toolName} Complete!
      </h2>
      <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">
        Your document has been processed and is ready for secure download.
      </p>

      {/* Result Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 mb-8 text-left">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0">
            {isZip ? (
              <Archive className="w-6 h-6 text-amber-400" />
            ) : isImage ? (
              <FileText className="w-6 h-6 text-blue-400" />
            ) : (
              <FileText className="w-6 h-6 text-red-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate" title={result.outputFilename}>
              {result.outputFilename}
            </h4>
            <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
              <span>Size: <strong className="text-white">{formatFileSize(result.fileSizeBytes)}</strong></span>
              {result.pageCount !== undefined && (
                <>
                  <span>•</span>
                  <span>Pages: <strong className="text-white">{result.pageCount}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Compression Metrics Banner if applicable */}
        {result.originalSizeBytes !== undefined && result.savedPercentage !== undefined && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-semibold">
                Original: {formatFileSize(result.originalSizeBytes)} → Optimized: {formatFileSize(result.fileSizeBytes)}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">
              {result.savedPercentage}% Saved
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href={result.downloadUrl}
          download={result.outputFilename}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-base shadow-xl shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200 cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>Download File</span>
        </a>

        <button
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-800 hover:border-slate-700 transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Process Another</span>
        </button>
      </div>

      <div className="mt-8">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Tools</span>
        </button>
      </div>
    </div>
  );
};
