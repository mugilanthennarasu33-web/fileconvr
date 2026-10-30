import React from 'react';
import { Download, CheckCircle, RefreshCw, ArrowLeft, Sparkles } from 'lucide-react';
import type { ProcessingResult } from '../types';
import { formatFileSize } from './FileList';
import { FileFormatIcon } from './FileFormatIcon';

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
  let format = 'pdf';
  const lower = result.outputFilename.toLowerCase();
  if (lower.endsWith('.zip')) format = 'zip';
  else if (lower.endsWith('.docx') || lower.endsWith('.doc')) format = 'word';
  else if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) format = 'excel';
  else if (lower.endsWith('.pptx') || lower.endsWith('.ppt')) format = 'ppt';
  else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png')) format = 'image';

  return (
    <div className="w-full max-w-2xl mx-auto text-center py-6 animate-fade-in">
      {/* Success Badge */}
      <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#10B981] to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20 mb-6 flex items-center justify-center">
        <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-[#10B981]" strokeWidth={2.2} />
        </div>
      </div>

      <h2 className="text-3xl font-extrabold text-[#101828] mb-2 font-heading">
        {toolName} Complete!
      </h2>
      <p className="text-[#64748B] text-sm max-w-md mx-auto mb-8 font-normal">
        Your document has been processed and is ready for secure download.
      </p>

      {/* Result Card */}
      <div className="bg-white border border-[#E5EAF2] rounded-3xl p-6 sm:p-7 mb-8 text-left shadow-sm">
        <div className="flex items-center space-x-4 mb-6">
          <FileFormatIcon format={format} size="lg" />
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold text-[#101828] truncate font-heading" title={result.outputFilename}>
              {result.outputFilename}
            </h4>
            <div className="flex items-center space-x-3 text-xs text-[#64748B] mt-1 font-medium">
              <span>Size: <strong className="text-[#101828] font-bold">{formatFileSize(result.fileSizeBytes)}</strong></span>
              {result.pageCount !== undefined && (
                <>
                  <span>•</span>
                  <span>Pages: <strong className="text-[#101828] font-bold">{result.pageCount}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Compression Metrics Banner if applicable */}
        {result.originalSizeBytes !== undefined && result.savedPercentage !== undefined && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-800">
              <Sparkles className="w-5 h-5 shrink-0 text-[#10B981]" strokeWidth={2} />
              <span className="text-xs font-semibold">
                Original: {formatFileSize(result.originalSizeBytes)} → Optimized: {formatFileSize(result.fileSizeBytes)}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
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
          className="btn-primary w-full sm:w-auto px-8 py-4 font-bold text-base shadow-lg shadow-indigo-500/20 cursor-pointer space-x-2.5"
        >
          <Download className="w-5 h-5" strokeWidth={2} />
          <span>Download File</span>
        </a>

        <button
          onClick={onReset}
          className="btn-secondary w-full sm:w-auto px-6 py-4 font-semibold text-sm cursor-pointer space-x-2"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={2} />
          <span>Process Another</span>
        </button>
      </div>

      <div className="mt-8">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center space-x-1.5 text-xs text-[#64748B] hover:text-[#101828] transition-colors cursor-pointer font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Back to All Tools</span>
        </button>
      </div>
    </div>
  );
};
