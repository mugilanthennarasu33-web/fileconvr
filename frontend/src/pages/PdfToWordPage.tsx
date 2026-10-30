import React, { useState } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { ToolPageLayout } from '../components/ToolPageLayout';
import { pdfToWordApi } from '../services/api';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState } from '../types';
import { formatFileSize } from '../utils/formatters';
import { FileFormatIcon } from '../components/FileFormatIcon';

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
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-amber-700 text-sm">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <p className="font-semibold mb-1">Scanned Document Detected</p>
              <p className="text-xs text-amber-600 leading-relaxed">
                This PDF contains scanned or rasterized page graphics without selectable vector text layers. A layout DOCX was generated, and optical character recognition (OCR) can also be run for full OCR extraction.
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
    <ToolPageLayout
      toolShortName="PDF to Word"
      toolHeading="PDF to Word Converter"
      toolSubtitle="Convert PDF files to editable Word documents (DOCX) with high accuracy."
      onBack={onBack}
      seoContent={TOOLS_SEO_DATA['pdf-to-word']}
      onNavigateTool={onSelectTool}
      benefit1Title="High Accuracy"
      benefit1Desc="Maintains formatting"
      benefit2Title="Fast Conversion"
      benefit2Desc="In seconds"
      benefit3Title="Secure & Private"
      benefit3Desc="Your files are safe"
      step1Title="Upload"
      step1Desc="Select your PDF file"
      step2Title="Convert"
      step2Desc="Our system converts it"
      step3Title="Download"
      step3Desc="Get your Word file"
    >
      {!file ? (
        <FileUploader
          accept=".pdf"
          multiple={false}
          maxSizeMB={50}
          onFilesSelected={handleFileSelected}
          title="Drag & drop your PDF file here"
          subtitle="Extracts paragraphs, headings, table borders, and styles into an editable DOCX document"
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
              className="text-xs text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Change File
            </button>
          </div>

          {/* Details Card */}
          <div className="saas-card p-5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Reconstruction Fidelity
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Powered by advanced PyMuPDF layout analysis that detects font weights, table cells, text flow, and shapes, producing an authentic Microsoft Word OpenXML (.docx) package.
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
              Convert to Word (.docx) →
            </button>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      <ProcessingModal state={state} sourceFormat="pdf" targetFormat="word" />
    </ToolPageLayout>
  );
};
