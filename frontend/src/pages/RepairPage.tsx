import React, { useState } from 'react';
import {
  ArrowLeft,
  Wrench,
  CheckCircle2,
  Download,
  RotateCcw,
  ShieldAlert,
  FileCheck2,
  Info,
} from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { repairPdfApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { RepairResultData, ProcessingState } from '../types';
import { FileFormatIcon } from '../components/FileFormatIcon';
import { formatFileSize } from '../components/FileList';

interface RepairPageProps {
  onBack: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const RepairPage: React.FC<RepairPageProps> = ({ onBack, onSelectTool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RepairResultData | null>(null);

  const handleRepair = async () => {
    if (!file) {
      setError('Please select a corrupted or damaged PDF document to repair.');
      return;
    }

    setState('processing');
    setError(null);

    try {
      const data = await repairPdfApi(file);
      setResult(data);
      setState('success');
    } catch (err: any) {
      setError(
        err.message ||
          'PDF repair was unsuccessful. The document structure may be severely corrupted beyond recovery.'
      );
      setState('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setState('idle');
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Repair PDF
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Corrupted File Recovery
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Reconstruct damaged cross-reference tables, fix truncated trailers, and sanitize PDF object streams.
          </p>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-600 text-sm">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-semibold">Repair Unsuccessful</p>
            <p className="text-xs text-slate-600 mt-0.5">{error}</p>
            <p className="text-[11px] text-slate-400 mt-2">
              Note: Severe byte truncations or non-PDF binary files cannot always be reconstructed. Your original uploaded file is safely preserved.
            </p>
          </div>
        </div>
      )}

      {/* Main View */}
      {state !== 'success' ? (
        <div className="space-y-6">
          {!file ? (
            <FileUploader
              accept=".pdf"
              maxSizeMB={100}
              onFilesSelected={(files) => setFile(files[0])}
              title="Select or drop a damaged or corrupted PDF"
              subtitle="Files that fail to open, report broken xref tables, or corrupted trailers"
            />
          ) : (
            <div className="space-y-6">
              {/* Selected File Card */}
              <div className="saas-card p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileFormatIcon format="pdf" size="md" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 truncate max-w-sm sm:max-w-md">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatFileSize(file.size)} • Ready for reconstruction
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-xs text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Change file
                </button>
              </div>

              {/* Recovery Capabilities Info Card */}
              <div className="saas-card p-6 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
                  <FileCheck2 className="w-4 h-4 text-amber-500" />
                  <span>Recovery Engine Scope</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-1">Xref Rebuilding</p>
                    <p className="text-slate-500">Scans all indirect objects and regenerates damaged cross-reference index tables.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-1">Trailer Reconstruction</p>
                    <p className="text-slate-500">Recovers document catalog root and info dictionaries from partial headers.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-1">Stream Sanitization</p>
                    <p className="text-slate-500">Garbage collects orphaned objects and validates rendering before download.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start space-x-2">
                  <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p>
                    fileconvrt will never overwrite your original uploaded file. Repaired output is saved to an independent, sanitized file.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleRepair}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Wrench className="w-5 h-5" />
                <span>Execute Best-Effort Repair</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Success View */
        <div className="space-y-6">
          <div className="saas-card p-6 rounded-2xl border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">Document Repaired &amp; Validated</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {result?.statusMessage}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Repair another</span>
                </button>
                <a
                  href={result?.downloadUrl}
                  download={result?.outputFilename}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Repaired PDF</span>
                </a>
              </div>
            </div>

            {/* Validation Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-xs text-slate-500">Recovered Pages</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{result?.reconstructedPagesCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-xs text-slate-500">Repaired Size</p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {((result?.fileSizeBytes || 0) / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-xs text-slate-500">Original Size</p>
                <p className="text-xl font-bold text-slate-400 mt-1">
                  {((result?.originalSizeBytes || 0) / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-xs text-slate-500">Parser Verification</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">PASSED</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      <ProcessingModal
        state={state}
        statusMessage="Scanning byte streams, reconstructing damaged xref tables, sanitizing trailers, and verifying renderability with PDF parser..."
        sourceFormat="pdf"
        targetFormat="pdf"
      />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['repair-pdf']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
