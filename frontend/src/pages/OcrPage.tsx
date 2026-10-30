import React, { useState } from 'react';
import {
  ArrowLeft,
  ScanText,
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
          className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              OCR PDF
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              Searchable PDF
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Detect scanned pages, recognize multi-lingual typography, and generate a fully searchable PDF.
          </p>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">OCR Notice</p>
            <p className="text-slate-300 mt-0.5">{error}</p>
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
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                    <ScanText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white truncate max-w-sm sm:max-w-md">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for text recognition
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Change file
                </button>
              </div>

              {/* OCR Configuration Options */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <Languages className="w-4 h-4 text-red-400" />
                  <span>Recognition Settings</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Language Selector */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Document Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-red-500 transition-colors"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">
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
                        className="w-4 h-4 rounded text-red-600 bg-slate-950 border-slate-700 focus:ring-red-500 focus:ring-offset-slate-900"
                      />
                      <span className="text-sm text-slate-300 font-medium">
                        Force OCR on all pages
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-1 pl-7">
                      By default, fileconvr automatically inspects and OCRs pages with &lt; 30 characters of text.
                    </p>
                  </div>
                </div>

                {/* Transparency Notice */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start space-x-2.5 text-xs text-slate-400">
                  <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p>
                    Searchable text is embedded as an invisible PDF text layer (spec render mode 3). Your original page dimensions, images, formatting, and colors are preserved 100%.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleOcr}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>Start OCR &amp; Make Searchable</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Success & Text Preview View */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">OCR Completed Successfully</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {result?.pagesOcred} page(s) processed in {result?.languageName} • {result?.wordsExtracted} words extracted
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>OCR another</span>
                </button>
                <a
                  href={result?.downloadUrl}
                  download={result?.outputFilename}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Searchable PDF</span>
                </a>
              </div>
            </div>

            {/* Extracted Text Preview Pane */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Extracted Text Preview
                </label>
                <button
                  onClick={handleCopyText}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy text</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                readOnly
                value={result?.extractedText || 'No text extracted from document.'}
                rows={10}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none resize-y leading-relaxed"
              />
            </div>

            {/* Accuracy Note */}
            {result?.accuracyNote && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start space-x-2">
                <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <p>{result.accuracyNote}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processing Modal */}
      <ProcessingModal
        state={state}
        statusMessage={`Analyzing document pages, recognizing ${SUPPORTED_LANGUAGES.find((l) => l.code === language)?.name || language} typography, and synthesizing invisible text layer...`}
      />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['ocr-pdf']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
