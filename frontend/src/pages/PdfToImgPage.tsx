import React, { useState } from 'react';
import { ArrowLeft, FileImage, AlertCircle, Archive } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { pdfToImgApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState } from '../types';
import { formatFileSize } from '../components/FileList';

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
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">PDF to JPG Converter</h1>
          <p className="text-xs text-slate-400">Render each page of your PDF into high-resolution JPG images.</p>
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
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <FileImage className="w-5 h-5" />
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

          {/* Format Details Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Output Format Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3">
                <FileImage className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Single Page PDFs</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Instantly rendered to a single high-quality `.jpg` image ready to save.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3">
                <Archive className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Multi-Page PDFs</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    All pages are cleanly archived into a `.zip` file containing individual numbered JPGs.
                  </p>
                </div>
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
              onClick={handleConvert}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-red-500/25 hover:shadow-red-500/40 transition-all cursor-pointer"
            >
              Convert to JPG →
            </button>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      <ProcessingModal state={state} />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['pdf-to-img']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
