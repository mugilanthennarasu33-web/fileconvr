import React, { useState } from 'react';
import { ArrowLeft, FileCode, AlertCircle, Info } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { pdfToWordApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState } from '../types';
import { formatFileSize } from '../components/FileList';

interface PdfToWordPageProps {
  onBack: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const PdfToWordPage: React.FC<PdfToWordPageProps> = ({ onBack, onSelectTool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(ProcessingResult & { isScanned?: boolean; ocrRequired?: boolean }) | null>(null);

  const handleFileSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setError(null);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a PDF document to convert.');
      return;
    }

    try {
      setState('uploading');
      setError(null);

      setState('processing');
      const data = await pdfToWordApi(file);

      setResult(data);
      setState('success');
    } catch (err: any) {
      setError(err.message || 'An error occurred while converting the PDF to Word.');
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
      <div className="max-w-3xl mx-auto px-4 py-8">
        {result.ocrRequired && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-amber-300 text-sm">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Scanned Document Detected</p>
              <p className="text-xs text-amber-300/80 leading-relaxed">
                This PDF contains scanned or rasterized page graphics without selectable vector text layers. A layout DOCX was generated, but full optical character recognition (OCR) will be available in Milestone 5.
              </p>
            </div>
          </div>
        )}

        <DownloadView
          result={result}
          toolName="PDF to Word"
          onReset={handleReset}
          onBackToHome={onBack}
        />
      </div>
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
          <h1 className="text-2xl font-bold text-white font-heading">PDF to Word Converter</h1>
          <p className="text-xs text-slate-400">Reconstruct editable Microsoft Word (.docx) files from PDF documents.</p>
        </div>
      </div>

      {!file ? (
        <FileUploader
          accept=".pdf"
          multiple={false}
          maxSizeMB={50}
          onFilesSelected={handleFileSelected}
          title="Select or drop a PDF to convert to Word"
          subtitle="Extracts paragraphs, headings, table borders, and styles into an editable DOCX document"
        />
      ) : (
        <div className="space-y-6">
          {/* Selected File Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <FileCode className="w-5 h-5" />
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

          {/* Details Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Reconstruction Fidelity
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Powered by advanced PyMuPDF layout analysis that detects font weights, table cells, text flow, and shapes, producing an authentic Microsoft Word OpenXML (.docx) package.
            </p>
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
              Convert to Word (.docx) →
            </button>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      <ProcessingModal state={state} />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['pdf-to-word']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
