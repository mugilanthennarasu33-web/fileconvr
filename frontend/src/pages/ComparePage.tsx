import React, { useState } from 'react';
import {
  ArrowLeft,
  GitCompare,
  FileText,
  Eye,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCcw,
  Info,
} from 'lucide-react';
import { ProcessingModal } from '../components/ProcessingModal';
import { comparePdfApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { CompareResultData, ProcessingState } from '../types';
import { FileFormatIcon } from '../components/FileFormatIcon';
import { formatFileSize } from '../components/FileList';

interface ComparePageProps {
  onBack: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({ onBack, onSelectTool }) => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);

  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompareResultData | null>(null);

  // Active page selector in comparison viewer
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'text' | 'visual'>('text');

  const handleCompare = async () => {
    if (!file1 || !file2) {
      setError('Please select both Document 1 and Document 2 to compare.');
      return;
    }

    setState('processing');
    setError(null);

    try {
      const data = await comparePdfApi(file1, file2);
      setResult(data);
      setSelectedPageIndex(0);
      setState('success');
    } catch (err: any) {
      setError(err.message || 'Comparison failed between the two documents.');
      setState('error');
    }
  };

  const handleReset = () => {
    setFile1(null);
    setFile2(null);
    setResult(null);
    setState('idle');
    setError(null);
  };

  const currentPage = result?.pageComparisons?.[selectedPageIndex];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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
              Compare PDF
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Text &amp; Visual Diffs
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare two PDF documents side-by-side to highlight added/removed text and detect visual raster shifts.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-semibold">Comparison Notice</p>
            <p className="text-xs text-slate-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Upload State */}
      {state !== 'success' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document 1 Selector */}
            <div className="saas-card p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Document 1 (Original / Baseline)
                </span>
                {file1 && (
                  <button
                    onClick={() => setFile1(null)}
                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {!file1 ? (
                <label className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 group">
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && setFile1(e.target.files[0])}
                  />
                  <FileText className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Select Document 1</p>
                  <p className="text-xs text-slate-400 mt-0.5">PDF up to 25MB</p>
                </label>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
                  <FileFormatIcon format="pdf" size="sm" />
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-900 truncate">{file1.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file1.size)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Document 2 Selector */}
            <div className="saas-card p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Document 2 (Revised / Comparison)
                </span>
                {file2 && (
                  <button
                    onClick={() => setFile2(null)}
                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {!file2 ? (
                <label className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 group">
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && setFile2(e.target.files[0])}
                  />
                  <FileText className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Select Document 2</p>
                  <p className="text-xs text-slate-400 mt-0.5">PDF up to 25MB</p>
                </label>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
                  <FileFormatIcon format="pdf" size="sm" />
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-900 truncate">{file2.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file2.size)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compare Action Button */}
          <button
            onClick={handleCompare}
            disabled={!file1 || !file2}
            className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all ${
              file1 && file2
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <GitCompare className="w-5 h-5" />
            <span>Compare Documents Side-by-Side</span>
          </button>
        </div>
      ) : (
        /* Results & Interactive Comparison Viewer */
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="saas-card p-6 rounded-2xl border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    result?.areIdentical
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                  }`}
                >
                  <GitCompare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    {result?.areIdentical
                      ? 'Documents are 100% Identical'
                      : 'Differences Detected Across Documents'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Doc 1 ({result?.doc1PageCount} pages) vs Doc 2 ({result?.doc2PageCount} pages) • Overall Similarity:{' '}
                    {Math.round((result?.overallSimilarityScore || 0) * 100)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Compare other files</span>
                </button>
                <a
                  href={result?.downloadUrl}
                  download={result?.reportFilename}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report (JSON)</span>
                </a>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500">Text Changes</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {result?.pagesWithTextChanges.length} page(s)
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500">Visual Changes</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {result?.pagesWithVisualChanges.length} page(s)
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500">Lines Added</p>
                <p className="text-lg font-bold text-emerald-600 mt-1">
                  +{result?.totalAddedLines}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500">Lines Removed</p>
                <p className="text-lg font-bold text-red-600 mt-1">
                  -{result?.totalRemovedLines}
                </p>
              </div>
            </div>

            {/* Page Navigation & View Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              {/* Page Navigator */}
              <div className="flex items-center space-x-2">
                <button
                  disabled={selectedPageIndex === 0}
                  onClick={() => setSelectedPageIndex((p) => Math.max(0, p - 1))}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-600 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-700">
                  Page {(currentPage?.pageNumber || selectedPageIndex + 1)} of{' '}
                  {result?.comparedPagesCount}
                </span>
                <button
                  disabled={selectedPageIndex >= (result?.comparedPagesCount || 1) - 1}
                  onClick={() =>
                    setSelectedPageIndex((p) =>
                      Math.min((result?.comparedPagesCount || 1) - 1, p + 1)
                    )
                  }
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-600 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {currentPage && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                      currentPage.status === 'identical'
                        ? 'bg-emerald-50 text-emerald-600'
                        : currentPage.status === 'added'
                        ? 'bg-blue-50 text-blue-600'
                        : currentPage.status === 'removed'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {currentPage.status}
                  </span>
                )}
              </div>

              {/* Tabs: Text Diff vs Visual Overlay */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                    activeTab === 'text'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Text Diff</span>
                </button>
                <button
                  onClick={() => setActiveTab('visual')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                    activeTab === 'visual'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visual Comparison</span>
                </button>
              </div>
            </div>

            {/* Comparison Content Body */}
            {activeTab === 'text' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Line-by-line textual analysis</span>
                  <span>
                    Similarity: {Math.round((currentPage?.textSimilarity || 1) * 100)}%
                  </span>
                </div>

                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-96 overflow-y-auto font-mono text-xs space-y-1">
                  {currentPage?.textChanges.diffLines &&
                  currentPage.textChanges.diffLines.length > 0 ? (
                    currentPage.textChanges.diffLines.map((line, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start space-x-2 px-2 py-0.5 rounded ${
                          line.type === 'added'
                            ? 'bg-emerald-50 text-emerald-700 font-semibold'
                            : line.type === 'removed'
                            ? 'bg-red-50 text-red-700 line-through opacity-80'
                            : 'text-slate-600'
                        }`}
                      >
                        <span className="w-4 select-none font-bold">
                          {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                        </span>
                        <span className="flex-1 whitespace-pre-wrap">{line.text}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic p-2">
                      No text found or page content is identical.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Visual Comparison Images */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Doc 1 Render */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-center">
                    <p className="text-xs font-semibold text-slate-700">Document 1 (Original)</p>
                    {currentPage?.visualChanges.doc1Image && result?.taskId ? (
                      <img
                        src={`/api/pdf/download/${result.taskId}/${currentPage.visualChanges.doc1Image}?inline=true`}
                        alt="Doc 1 Page"
                        className="w-full rounded-lg border border-slate-200 bg-white shadow-sm"
                      />
                    ) : (
                      <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                        Page removed in Document 1
                      </div>
                    )}
                  </div>

                  {/* Doc 2 Render */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-center">
                    <p className="text-xs font-semibold text-slate-700">Document 2 (Revised)</p>
                    {currentPage?.visualChanges.doc2Image && result?.taskId ? (
                      <img
                        src={`/api/pdf/download/${result.taskId}/${currentPage.visualChanges.doc2Image}?inline=true`}
                        alt="Doc 2 Page"
                        className="w-full rounded-lg border border-slate-200 bg-white shadow-sm"
                      />
                    ) : (
                      <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                        Page removed in Document 2
                      </div>
                    )}
                  </div>

                  {/* Difference Image Overlay */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <p className="text-xs font-semibold text-red-600">Diff Overlay (Red)</p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-50 text-red-700">
                        {currentPage?.visualChanges.diffPercentage}%
                      </span>
                    </div>
                    {currentPage?.visualChanges.diffImage && result?.taskId ? (
                      <img
                        src={`/api/pdf/download/${result.taskId}/${currentPage.visualChanges.diffImage}?inline=true`}
                        alt="Diff Page"
                        className="w-full rounded-lg border border-slate-200 bg-white shadow-sm"
                      />
                    ) : (
                      <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                        No difference image
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Methodology & Accuracy Disclaimer */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start space-x-2">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p>{result?.disclaimer}</p>
            </div>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      <ProcessingModal
        state={state}
        statusMessage="Extracting page text, running sequence diffs, rasterizing pages at 150 DPI, and computing pixel-level differences..."
        sourceFormat="pdf"
        targetFormat="pdf"
      />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['compare-pdf']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
