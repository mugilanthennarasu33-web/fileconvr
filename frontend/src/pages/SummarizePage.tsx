import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Send,
  HelpCircle,
  AlertCircle,
  ScanText,
  RotateCcw,
  BookOpen,
  ListFilter,
  CheckSquare,
  Key,
  Info,
} from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { summarizePdfApi, askPdfApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { AiSummaryResultData, AiAnswerResultData, ProcessingState } from '../types';
import { FileFormatIcon } from '../components/FileFormatIcon';
import { formatFileSize } from '../components/FileList';

interface SummarizePageProps {
  onBack: () => void;
  onNavigateToOcr?: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const SummarizePage: React.FC<SummarizePageProps> = ({ onBack, onNavigateToOcr, onSelectTool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [detailLevel, setDetailLevel] = useState<'concise' | 'standard' | 'detailed'>('standard');

  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isScannedDetected, setIsScannedDetected] = useState(false);
  const [isProviderMissing, setIsProviderMissing] = useState(false);

  // Summary State
  const [summaryData, setSummaryData] = useState<AiSummaryResultData | null>(null);

  // Q&A State
  const [question, setQuestion] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ question: string; answer: string; citations: string[] }>>([]);

  const handleSummarize = async () => {
    if (!file) {
      setError('Please select a PDF document to summarize.');
      return;
    }

    setState('processing');
    setError(null);
    setIsScannedDetected(false);
    setIsProviderMissing(false);

    try {
      const data = await summarizePdfApi(file, detailLevel);
      setSummaryData(data);
      setState('success');
    } catch (err: any) {
      if (err.code === 'SCANNED_DOCUMENT_DETECTED') {
        setIsScannedDetected(true);
      } else if (err.code === 'AI_PROVIDER_NOT_CONFIGURED') {
        setIsProviderMissing(true);
      }
      setError(err.message || 'Summarization failed.');
      setState('error');
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !question.trim() || qaLoading) return;

    setQaLoading(true);
    const q = question.trim();
    setQuestion('');

    try {
      const res: AiAnswerResultData = await askPdfApi(file, q);
      setChatHistory((prev) => [
        ...prev,
        { question: q, answer: res.answer, citations: res.pageCitations },
      ]);
    } catch (err: any) {
      if (err.code === 'AI_PROVIDER_NOT_CONFIGURED') {
        setIsProviderMissing(true);
      }
      setChatHistory((prev) => [
        ...prev,
        {
          question: q,
          answer: `Error: ${err.message || 'Unable to process question.'}`,
          citations: [],
        },
      ]);
    } finally {
      setQaLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setSummaryData(null);
    setChatHistory([]);
    setQuestion('');
    setState('idle');
    setError(null);
    setIsScannedDetected(false);
    setIsProviderMissing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              AI PDF Summarizer &amp; Q&amp;A
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              Document Intelligence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate executive summaries, extract actionable insights, and ask factual questions with exact page citations.
          </p>
        </div>
      </div>

      {/* Provider Missing Banner */}
      {isProviderMissing && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-amber-700 text-sm">
          <Key className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
          <div>
            <p className="font-semibold">AI Provider Not Configured</p>
            <p className="text-xs text-amber-600 mt-0.5">
              To enable real AI document processing, please configure <code className="px-1 py-0.5 rounded bg-white border border-amber-300 text-xs font-mono">GEMINI_API_KEY</code> or <code className="px-1 py-0.5 rounded bg-white border border-amber-300 text-xs font-mono">OPENAI_API_KEY</code> in the backend <code className="px-1 py-0.5 rounded bg-white border border-amber-300 text-xs font-mono">.env</code> file.
            </p>
            <p className="text-[11px] text-slate-500 mt-2">
              fileconvrt never fakes AI output or logs sensitive private prompts.
            </p>
          </div>
        </div>
      )}

      {/* Scanned Document Alert with OCR CTA */}
      {isScannedDetected && (
        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start justify-between gap-4 text-blue-700 text-sm">
          <div className="flex items-start space-x-3">
            <ScanText className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
            <div>
              <p className="font-semibold text-slate-900">Scanned Document Detected</p>
              <p className="text-xs text-slate-600 mt-0.5">
                This PDF contains little or no extractable text. Run OCR PDF first to generate a searchable document with recognized typography.
              </p>
            </div>
          </div>
          {onNavigateToOcr && (
            <button
              onClick={onNavigateToOcr}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
            >
              Go to OCR PDF
            </button>
          )}
        </div>
      )}

      {/* Generic Error */}
      {error && !isProviderMissing && !isScannedDetected && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-semibold">Processing Notice</p>
            <p className="text-xs text-slate-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Upload / Config View */}
      {state !== 'success' ? (
        <div className="space-y-6">
          {!file ? (
            <FileUploader
              accept=".pdf"
              maxSizeMB={50}
              onFilesSelected={(files) => setFile(files[0])}
              title="Select or drop a PDF for AI Analysis"
              subtitle="Research papers, contracts, quarterly reports, legal briefs, or manuals"
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
                      {formatFileSize(file.size)} • Ready for AI intelligence
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

              {/* Detail Level Selector */}
              <div className="saas-card p-6 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
                  <ListFilter className="w-4 h-4 text-purple-600" />
                  <span>Summary Granularity</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'concise', title: 'Concise', desc: 'Brief executive bullets for quick triage' },
                    { id: 'standard', title: 'Standard', desc: 'Balanced summary with key insights and actions' },
                    { id: 'detailed', title: 'Detailed', desc: 'Comprehensive section analysis with deep citations' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDetailLevel(opt.id as any)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        detailLevel === opt.id
                          ? 'bg-purple-50 border-purple-400 text-purple-950 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-sm font-bold capitalize">{opt.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Privacy & Prompt Injection Protection Disclosure */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700 flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5 text-purple-600" />
                    <span>Privacy &amp; Security Protections:</span>
                  </p>
                  <p>
                    • Document text is treated strictly as passive, untrusted input behind rigid boundaries.
                  </p>
                  <p>
                    • Internal commands or instructions inside PDFs cannot override system instructions or leak API secrets.
                  </p>
                  <p>
                    • API keys reside exclusively in backend environment variables and are never transmitted to the client.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleSummarize}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate Executive Summary &amp; Citations</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results View: Summary + Interactive Q&A Chat */
        <div className="space-y-8">
          {/* Executive Summary Card */}
          <div className="saas-card p-6 rounded-2xl border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    Document Synthesis Complete
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {summaryData?.pageCount} pages analyzed • {summaryData?.totalCharacters} chars • Model: {summaryData?.modelUsed}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Analyze another</span>
                </button>
              </div>
            </div>

            {/* Page Citations Badges */}
            {summaryData?.pageCitations && summaryData.pageCitations.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-500 mr-1">Referenced Sources:</span>
                {summaryData.pageCitations.map((cite, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200"
                  >
                    {cite}
                  </span>
                ))}
              </div>
            )}

            {/* Structured Summary Content */}
            <div className="prose max-w-none text-xs sm:text-sm text-slate-700 bg-slate-50 p-6 rounded-2xl border border-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {summaryData?.summary}
            </div>

            {/* Key Insights & Action Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center space-x-1.5">
                  <CheckSquare className="w-4 h-4" />
                  <span>Key Insights</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                  {summaryData?.keyInsights.map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center space-x-1.5">
                  <ListFilter className="w-4 h-4" />
                  <span>Action Items &amp; Takeaways</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                  {summaryData?.actionItems.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              {summaryData?.disclaimer}
            </p>
          </div>

          {/* Interactive Document Q&A Section */}
          <div className="saas-card p-6 rounded-2xl border border-slate-200 space-y-6">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Ask Questions About This Document
              </h3>
            </div>

            {/* Chat History */}
            {chatHistory.length > 0 && (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {chatHistory.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="p-3 rounded-xl bg-indigo-50 text-xs text-slate-900 font-medium self-end max-w-xl ml-auto border border-indigo-200">
                      <p className="font-semibold text-indigo-600 mb-0.5">You asked:</p>
                      <p>{item.question}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 max-w-2xl mr-auto leading-relaxed space-y-2">
                      <p className="font-semibold text-emerald-600 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Factual Answer:</span>
                      </p>
                      <p className="whitespace-pre-wrap">{item.answer}</p>
                      {item.citations.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.citations.map((c, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 border border-purple-200"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Question Input Box */}
            <form onSubmit={handleAsk} className="flex items-center space-x-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything about the document (e.g. 'What were the key findings?')..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors"
                disabled={qaLoading}
              />
              <button
                type="submit"
                disabled={!question.trim() || qaLoading}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      <ProcessingModal
        state={state}
        statusMessage="Extracting page-tagged content, analyzing typography, and invoking factual AI provider..."
        sourceFormat="pdf"
        targetFormat="pdf"
      />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['summarize-pdf']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
