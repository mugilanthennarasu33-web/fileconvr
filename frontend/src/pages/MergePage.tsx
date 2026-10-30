import React, { useState } from 'react';
import { ArrowLeft, ArrowUpDown, AlertCircle } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { FileList } from '../components/FileList';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { mergePdfsApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState, UploadedFileItem } from '../types';

interface MergePageProps {
  onBack: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const MergePage: React.FC<MergePageProps> = ({ onBack, onSelectTool }) => {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    const items: UploadedFileItem[] = newFiles.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      rotation: 0,
    }));
    setFiles((prev) => [...prev, ...items]);
    setError(null);
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleSortByName = () => {
    setFiles((prev) => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please add at least 2 PDF files to merge.');
      return;
    }

    try {
      setState('uploading');
      setError(null);

      const rawFiles = files.map((f) => f.file);
      setState('processing');
      const data = await mergePdfsApi(rawFiles);

      setResult(data);
      setState('success');
    } catch (err: any) {
      setError(err.message || 'An error occurred while merging your PDF files.');
      setState('error');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setState('idle');
    setError(null);
  };

  if (state === 'success' && result) {
    return (
      <DownloadView
        result={result}
        toolName="Merge PDF"
        onReset={handleReset}
        onBackToHome={onBack}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Merge PDF Documents</h1>
          <p className="text-xs text-slate-500">Combine multiple PDF files in the exact order you want.</p>
        </div>
      </div>

      {/* Main Container */}
      {files.length === 0 ? (
        <FileUploader
          accept=".pdf"
          multiple={true}
          maxSizeMB={100}
          onFilesSelected={handleFilesSelected}
          title="Select or drop PDF files to merge"
          subtitle="Select 2 or more PDF documents to merge into a single continuous file"
        />
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl saas-card">
            <span className="text-xs text-slate-600">
              Total: <strong className="text-slate-900">{files.length}</strong> PDF file(s)
            </span>

            <button
              onClick={handleSortByName}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" strokeWidth={2} />
              <span>Sort A-Z</span>
            </button>
          </div>

          {/* Files grid */}
          <FileList
            files={files}
            onRemove={handleRemove}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onAddMore={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf';
              input.multiple = true;
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files) handleFilesSelected(Array.from(target.files));
              };
              input.click();
            }}
          />

          {/* Error notice */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-3 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 cursor-pointer transition-colors"
            >
              Clear All
            </button>

            <button
              onClick={handleMerge}
              disabled={files.length < 2}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all ${
                files.length >= 2
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-blue-500/25 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Merge PDF Files →
            </button>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      <ProcessingModal state={state} />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['merge-pdf']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
