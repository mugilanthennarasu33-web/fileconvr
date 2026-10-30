import React, { useState } from 'react';
import {
  ArrowLeft,
  Languages,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { ocrPdfApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { OcrResultData, ProcessingState } from '../types';
import { FileFormatIcon } from '../components/FileFormatIcon';
import { formatFileSize } from '../components/FileList';

interface OcrPageProps {
  onBack: () => void;
  onSelectTool?: (toolId: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'spa', name: 'Spanish (Español)' },
  { code: 'fra', name: 'French (Français)' },
  { code: 'deu', name: 'German (Deutsch)' },
  { code: 'ita', name: 'Italian (Italiano)' },
  { code: 'por', name: 'Portuguese (Português)' },
  { code: 'nld', name: 'Dutch (Nederlands)' },
  { code: 'chi_sim', name: 'Chinese Simplified (简体中文)' },
  { code: 'rus', name: 'Russian (Русский)' },
  { code: 'jpn', name: 'Japanese (日本語)' },
  { code: 'ara', name: 'Arabic (العربية)' },
  { code: 'hin', name: 'Hindi (हिन्दी)' },
];

export const OcrPage: React.FC<OcrPageProps> = ({ onBack, onSelectTool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('eng');
  const [forceAllPages, setForceAllPages] = useState(false);

  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OcrResultData | null>(null);
  const [copied, setCopied] = useState(false);

  const handleOcr = async () => {
    if (!file) {
      setError('Please select a PDF document to run OCR on.');
      return;
    }

    setState('processing');
    setError(null);

    try {
      const data = await ocrPdfApi(file, language, forceAllPages);
      setResult(data);
      setState('success');
    } catch (err: any) {
      setError(err.message || 'OCR processing failed. Please ensure the document is valid.');
      setState('error');
    }
  };

  const handleCopyText = () => {
    if (result?.extractedText) {
      navigator.clipboard.writeText(result.extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
              OCR PDF
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Searchable PDF
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Detect scanned pages, recognize multi-lingual typography, and generate a fully searchable PDF.
          </p>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-semibold">OCR Notice</p>
            <p className="text-xs text-slate-600 mt-0.5">{error}</p>
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
              title="Select or drop a scanned PDF file"
              subtitle="Scanned invoices, contracts, textbooks, or image-based documents"
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
                      {formatFileSize(file.size)} • Ready for text recognition
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

              {/* OCR Configuration Options */}
              <div className="saas-card p-6 rounded-2xl border border-slate-200 space-y-6">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
                  <Languages className="w-4 h-4 text-indigo-600" />
                  <span>Recognition Settings</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Language Selector */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Document Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Selecting the native language enhances word recognition precision.
                    </p>
                  </div>

                  {/* Force OCR Checkbox */}
                  <div className="flex flex-col justify-center">
                    <label className="flex items-center space-x-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={forceAllPages}
                        onChange={(e) => setForceAllPages(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 bg-white border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-xs sm:text-sm text-slate-700 font-medium">
                        Force OCR on all pages
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1 pl-7">
                      By default, fileconvrt automatically inspects and OCRs pages with &lt; 30 characters of text.
                    </p>
                  </div>
                </div>

                {/* Transparency Notice */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2.5 text-xs text-slate-500">
                  <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p>
                    Searchable text is embedded as an invisible PDF text layer (spec render mode 3). Your original page dimensions, images, formatting, and colors are preserved 100%.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleOcr}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                <span>Execute High-Fidelity OCR</span>
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
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    OCR Recognition Complete
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {result?.pagesOcred ?? result?.pageCount} pages recognized • Language: {result?.language.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>OCR another</span>
                </button>
                <a
                  href={result?.downloadUrl}
                  download={result?.outputFilename}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Searchable PDF</span>
                </a>
              </div>
            </div>

            {/* Extracted Text Preview Card */}
            {result?.extractedText && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Extracted Text Preview
                  </span>
                  <button
                    onClick={handleCopyText}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-h-72 overflow-y-auto font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed select-all">
                  {result.extractedText}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processing Modal */}
      <ProcessingModal
        state={state}
        statusMessage="Invoking OCR engine, synthesizing invisible vector text layer, and embedding coordinates..."
        sourceFormat="pdf"
        targetFormat="pdf"
      />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['ocr-pdf']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
