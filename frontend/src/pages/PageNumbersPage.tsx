import React, { useState } from 'react';
import {
  ArrowLeft,
  Hash,
  AlertCircle,
} from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { addPageNumbersApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState } from '../types';

interface PageNumbersPageProps {
  onBack: () => void;
  onSelectTool?: (toolId: string) => void;
}

type PositionOption =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'top-left'
  | 'top-center'
  | 'top-right';

type FormatOption = 'number' | 'page-n' | 'page-n-of-total';

export const PageNumbersPage: React.FC<PageNumbersPageProps> = ({ onBack, onSelectTool }) => {
  const [file, setFile] = useState<File | null>(null);

  // Numbering options
  const [position, setPosition] = useState<PositionOption>('bottom-center');
  const [format, setFormat] = useState<FormatOption>('page-n-of-total');
  const [startNumber, setStartNumber] = useState(1);
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [fontSize, setFontSize] = useState(10);
  const [color, setColor] = useState('#333333');
  const [margin, setMargin] = useState(25);
  const [pagesSelection, setPagesSelection] = useState<'all' | 'odd' | 'even' | 'custom'>('all');
  const [customRange, setCustomRange] = useState('');
  const [excludeFirstPage, setExcludeFirstPage] = useState(false);

  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const handleAddPageNumbers = async () => {
    if (!file) {
      setError('Please select a PDF document first.');
      return;
    }

    const pages = pagesSelection === 'custom' ? customRange : pagesSelection;

    try {
      setState('uploading');
      setError(null);

      setState('processing');
      const data = await addPageNumbersApi(file, {
        position,
        format,
        startNumber,
        prefix,
        suffix,
        fontSize,
        color,
        margin,
        pages,
        excludeFirstPage,
      });

      setResult(data);
      setState('success');
    } catch (err: any) {
      setError(err.message || 'Failed to add page numbers to PDF.');
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
        toolName="Add Page Numbers"
        onReset={handleReset}
        onBackToHome={onBack}
      />
    );
  }

  // Format preview string
  const getPreviewText = () => {
    let base = '';
    if (format === 'number') base = `${startNumber}`;
    else if (format === 'page-n') base = `Page ${startNumber}`;
    else base = `Page ${startNumber} of 10`;
    return `${prefix}${base}${suffix}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
            <Hash className="w-6 h-6 text-brand-500" />
            Add PDF Page Numbers
          </h1>
          <p className="text-xs text-slate-400">
            Configure positions, numbering formats, custom ranges, and margins for clean document pagination.
          </p>
        </div>
      </div>

      {!file ? (
        <FileUploader
          accept=".pdf"
          multiple={false}
          maxSizeMB={100}
          onFilesSelected={(files) => {
            if (files.length > 0) setFile(files[0]);
          }}
          title="Select or drop a PDF to add page numbers"
          subtitle="Supports top/bottom alignments, custom prefixes, and first-page exclusion"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Options Form */}
          <div className="lg:col-span-7 space-y-5">
            {/* Position Picker */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Position & Alignment
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-2 font-medium">Top Margin</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['top-left', 'top-center', 'top-right'] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setPosition(pos)}
                        className={`py-2 rounded-lg border text-xs font-medium capitalize flex items-center justify-center transition-all ${
                          position === pos
                            ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {pos.split('-')[1]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-2 font-medium">Bottom Margin</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['bottom-left', 'bottom-center', 'bottom-right'] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setPosition(pos)}
                        className={`py-2 rounded-lg border text-xs font-medium capitalize flex items-center justify-center transition-all ${
                          position === pos
                            ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {pos.split('-')[1]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Number Format */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Numbering Format
              </label>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'page-n-of-total', label: 'Page 1 of N', desc: 'Standard formal' },
                  { id: 'page-n', label: 'Page 1', desc: 'Simple page' },
                  { id: 'number', label: '1, 2, 3...', desc: 'Minimal number' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormat(item.id as FormatOption)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      format === item.id
                        ? 'border-brand-500 bg-brand-500/10 text-white shadow-lg shadow-brand-500/10'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Start At</label>
                  <input
                    type="number"
                    min="1"
                    value={startNumber}
                    onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Prefix</label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="e.g. Vol 1 - "
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Suffix</label>
                  <input
                    type="text"
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    placeholder="e.g.  (Draft)"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Typography & Margins */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Font Size ({fontSize}pt)
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Margin ({margin}pt)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full accent-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-9 h-8 rounded bg-transparent border border-slate-800 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Exclusion option */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeFirstPage}
                    onChange={(e) => setExcludeFirstPage(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-500 bg-slate-900 border-slate-700 focus:ring-brand-500 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-300">
                    Exclude first page from numbering (e.g. Cover / Title page)
                  </span>
                </label>
              </div>
            </div>

            {/* Pages Range Selector */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Pages To Number
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['all', 'odd', 'even', 'custom'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPagesSelection(mode)}
                    className={`py-2 rounded-lg border text-xs font-medium capitalize transition-all ${
                      pagesSelection === mode
                        ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {pagesSelection === 'custom' && (
                <div className="pt-2">
                  <input
                    type="text"
                    value={customRange}
                    onChange={(e) => setCustomRange(e.target.value)}
                    placeholder="e.g. 2-10, 15"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAddPageNumbers}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Hash className="w-4 h-4" />
              Add Page Numbers & Download PDF
            </button>
          </div>

          {/* Interactive Simulation Viewport */}
          <div className="lg:col-span-5">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 sticky top-6">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
                Pagination Preview
              </h3>

              <div className="w-full aspect-[1/1.4] bg-white rounded-lg shadow-2xl p-6 relative flex flex-col justify-between overflow-hidden select-none border border-slate-200">
                {/* Header position preview */}
                <div
                  className="w-full flex text-[11px] font-mono"
                  style={{
                    color,
                    fontSize: `${fontSize}px`,
                    justifyContent: position.includes('left')
                      ? 'flex-start'
                      : position.includes('right')
                      ? 'flex-end'
                      : 'center',
                    visibility: position.startsWith('top') ? 'visible' : 'hidden',
                  }}
                >
                  {getPreviewText()}
                </div>

                {/* Simulated Content Skeleton */}
                <div className="space-y-3 opacity-25">
                  <div className="h-4 bg-slate-800 rounded w-1/2" />
                  <div className="h-2 bg-slate-600 rounded w-full" />
                  <div className="h-2 bg-slate-600 rounded w-5/6" />
                  <div className="h-2 bg-slate-600 rounded w-4/6" />
                  <div className="h-32 bg-slate-200 rounded w-full my-4" />
                  <div className="h-2 bg-slate-600 rounded w-full" />
                  <div className="h-2 bg-slate-600 rounded w-3/4" />
                </div>

                {/* Bottom position preview */}
                <div
                  className="w-full flex text-[11px] font-mono"
                  style={{
                    color,
                    fontSize: `${fontSize}px`,
                    justifyContent: position.includes('left')
                      ? 'flex-start'
                      : position.includes('right')
                      ? 'flex-end'
                      : 'center',
                    visibility: position.startsWith('bottom') ? 'visible' : 'hidden',
                  }}
                >
                  {getPreviewText()}
                </div>
              </div>

              <div className="mt-4 text-center">
                <span className="text-[11px] text-slate-400">
                  Target: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProcessingModal
        state={state}
        statusMessage="Computing rotation-invariant coordinates, applying page formats, and rendering PDF..."
      />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['page-numbers-pdf']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
