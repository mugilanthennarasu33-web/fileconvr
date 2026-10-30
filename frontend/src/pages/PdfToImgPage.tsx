import React, { useState } from 'react';
import { ArrowLeft, AlertCircle, Archive } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { pdfToImgApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState } from '../types';
import { formatFileSize } from '../components/FileList';
import { FileFormatIcon } from '../components/FileFormatIcon';

interface PdfToImgPageProps {
  onBack: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const PdfToImgPage: React.FC<PdfToImgPageProps> = ({ onBack, onSelectTool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const handleFileSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setError(null);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a PDF file to convert.');
      return;
    }

    try {
      setState('uploading');
      setError(null);

      setState('processing');
      const data = await pdfToImgApi(file);

      setResult(data);
      setState('success');
    } catch (err: any) {
      setError(err.message || 'An error occurred while converting the PDF to images.');
      setState('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setState('idle');
    setError(null);
  };

  if (state === 'success' && result) {
    return (
      <DownloadView
        result={result}
        toolName="PDF to JPG"
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
          <h1 className="text-2xl font-bold text-slate-900 font-heading">PDF to JPG Converter</h1>
          <p className="text-xs text-slate-500">Render each page of your PDF into high-resolution JPG images.</p>
        </div>
      </div>

      {!file ? (
        <FileUploader
          accept=".pdf"
          multiple={false}
          maxSizeMB={100}
          onFilesSelected={handleFileSelected}
          title="Select or drop a PDF to convert to JPG"
          subtitle="Single-page documents output as JPG; multi-page documents output as ZIP"
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

          {/* Details Card */}
          <div className="saas-card p-5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <Archive className="w-4 h-4 text-violet-600" strokeWidth={2} />
              <span>Multi-Page Packaging</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Each page is rendered at 150 DPI in crisp sRGB color. Multi-page documents are automatically packaged into a clean ZIP archive with numbered files (e.g., page_1.jpg, page_2.jpg).
            </p>
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
              onClick={handleConvert}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              Convert to JPG →
            </button>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      <ProcessingModal state={state} sourceFormat="pdf" targetFormat="image" />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['pdf-to-img']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
