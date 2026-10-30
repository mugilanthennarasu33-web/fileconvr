import React, { useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { FileList } from '../components/FileList';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { imgToPdfApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState, UploadedFileItem } from '../types';

interface ImgToPdfPageProps {
  onBack: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const ImgToPdfPage: React.FC<ImgToPdfPageProps> = ({ onBack, onSelectTool }) => {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('fit');
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [margin, setMargin] = useState<'none' | 'small' | 'big'>('none');
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

  const handleConvert = async () => {
    if (files.length === 0) {
      setError('Please add at least one image to convert.');
      return;
    }

    try {
      setState('uploading');
      setError(null);

      const rawFiles = files.map((f) => f.file);
      setState('processing');
      const data = await imgToPdfApi(rawFiles, pageSize, orientation, margin);

      setResult(data);
      setState('success');
    } catch (err: any) {
      setError(err.message || 'An error occurred while converting images to PDF.');
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
        toolName="JPG to PDF"
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
          <h1 className="text-2xl font-bold text-slate-900 font-heading">JPG / PNG to PDF Converter</h1>
          <p className="text-xs text-slate-500">Convert raster images into clean, formatted PDF documents.</p>
        </div>
      </div>

      {files.length === 0 ? (
        <FileUploader
          accept=".jpg,.jpeg,.png,.webp"
          multiple={true}
          maxSizeMB={100}
          onFilesSelected={handleFilesSelected}
          title="Select or drop images to convert to PDF"
          subtitle="Supports JPG, JPEG, PNG, and WebP raster images"
        />
      ) : (
        <div className="space-y-6">
          {/* Layout Configuration Panel */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              PDF Layout Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Page Size */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Page Size</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="fit">Fit (Same as image)</option>
                  <option value="a4">A4 (210 × 297 mm)</option>
                  <option value="letter">US Letter (8.5 × 11 in)</option>
                </select>
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="auto">Auto (Match image ratio)</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              {/* Margin */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Margin</label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="none">No margin</option>
                  <option value="small">Small margin</option>
                  <option value="big">Big margin</option>
                </select>
              </div>
            </div>
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
              input.accept = '.jpg,.jpeg,.png,.webp';
              input.multiple = true;
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files) handleFilesSelected(Array.from(target.files));
              };
              input.click();
            }}
          />

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
              Clear All
            </button>

            <button
              onClick={handleConvert}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              Convert to PDF →
            </button>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      <ProcessingModal state={state} sourceFormat="image" targetFormat="pdf" />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['img-to-pdf']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
