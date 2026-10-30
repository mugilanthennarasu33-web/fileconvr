import React, { useState } from 'react';
import {
  ArrowLeft,
  Stamp,
  Type,
  Image as ImageIcon,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { watermarkTextApi, watermarkImageApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState } from '../types';

interface WatermarkPageProps {
  onBack: () => void;
  onSelectTool?: (toolId: string) => void;
}

type WatermarkType = 'text' | 'image';

type GridPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export const WatermarkPage: React.FC<WatermarkPageProps> = ({ onBack, onSelectTool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');

  // Text watermark options
  const [text, setText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(36);
  const [color, setColor] = useState('#e11d48');
  const [opacity, setOpacity] = useState(0.35);
  const [rotation, setRotation] = useState(45);
  const [position, setPosition] = useState<GridPosition>('middle-center');
  const [pagesSelection, setPagesSelection] = useState<'all' | 'odd' | 'even' | 'custom'>('all');
  const [customRange, setCustomRange] = useState('');
  const [layer, setLayer] = useState<'above' | 'below'>('above');

  // Image watermark options
  const [scale, setScale] = useState(0.5);

  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const handleApplyWatermark = async () => {
    if (!file) {
      setError('Please select a PDF document first.');
      return;
    }

    const pages = pagesSelection === 'custom' ? customRange : pagesSelection;

    try {
      setState('uploading');
      setError(null);

      let res: ProcessingResult;

      if (watermarkType === 'text') {
        if (!text.trim()) {
          setError('Please provide watermark text.');
          setState('idle');
          return;
        }
        setState('processing');
        res = await watermarkTextApi(file, {
          text,
          fontSize,
          color,
          opacity,
          rotation,
          position,
          pages,
          layer,
        });
      } else {
        if (!imageFile) {
          setError('Please upload an image file (PNG/JPEG) for the image watermark.');
          setState('idle');
          return;
        }
        setState('processing');
        res = await watermarkImageApi(file, imageFile, {
          scale,
          opacity,
          rotation,
          position,
          pages,
          layer,
        });
      }

      setResult(res);
      setState('success');
    } catch (err: any) {
      setError(err.message || 'Failed to apply watermark to PDF.');
      setState('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setImageFile(null);
    setResult(null);
    setState('idle');
    setError(null);
  };

  if (state === 'success' && result) {
    return (
      <DownloadView
        result={result}
        toolName="Watermark PDF"
        onReset={handleReset}
        onBackToHome={onBack}
      />
    );
  }

  const gridPositions: GridPosition[] = [
    'top-left',
    'top-center',
    'top-right',
    'middle-left',
    'middle-center',
    'middle-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading flex items-center gap-2">
            <Stamp className="w-6 h-6 text-indigo-600" />
            Watermark PDF
          </h1>
          <p className="text-xs text-slate-500">
            Stamp customizable text or logo image watermarks across your document pages.
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
          title="Select or drop a PDF document to watermark"
          subtitle="Supports text watermarks and transparent PNG / JPEG logo images"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-7 space-y-5">
            {/* Watermark Type Selector */}
            <div className="saas-card p-4 rounded-2xl border border-slate-200">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-3">
                Watermark Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setWatermarkType('text')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-all cursor-pointer ${
                    watermarkType === 'text'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Type className="w-4 h-4 text-indigo-600" />
                  Text Watermark
                </button>
                <button
                  type="button"
                  onClick={() => setWatermarkType('image')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-all cursor-pointer ${
                    watermarkType === 'image'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-purple-500" />
                  Image Watermark
                </button>
              </div>
            </div>

            {/* Type-specific inputs */}
            {watermarkType === 'text' ? (
              <div className="saas-card p-5 rounded-2xl border border-slate-200 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Watermark Text</label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g. CONFIDENTIAL, DRAFT, SAMPLE"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Font Size ({fontSize}pt)</label>
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-10 h-9 rounded-lg bg-transparent border border-slate-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="saas-card p-5 rounded-2xl border border-slate-200 space-y-4">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Upload Watermark Image (PNG or JPEG)
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                />

                {imageFile && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <ImageIcon className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span className="truncate flex-1">{imageFile.name}</span>
                    <span className="text-slate-500">{(imageFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Image Scale ({(scale * 100).toFixed(0)}%)
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.5"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>
            )}

            {/* Position and Opacity */}
            <div className="saas-card p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">3x3 Grid Position</label>
                  <div className="grid grid-cols-3 gap-1.5 w-32">
                    {gridPositions.map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setPosition(pos)}
                        className={`h-9 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                          position === pos
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600 font-bold'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-400'
                        }`}
                        title={pos}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            position === pos ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Opacity ({(opacity * 100).toFixed(0)}%)
                    </label>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Rotation ({rotation}°)
                    </label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="5"
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pages Range Selector */}
            <div className="saas-card p-5 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Apply to Pages
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['all', 'odd', 'even', 'custom'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPagesSelection(mode)}
                    className={`py-2 rounded-lg border text-xs font-medium capitalize transition-all cursor-pointer ${
                      pagesSelection === mode
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
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
                    placeholder="e.g. 1-3, 5, 8-10"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Specify comma-separated page numbers or ranges.</p>
                </div>
              )}

              {/* Layer Placement */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Layer Placement</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLayer('above')}
                    className={`py-1.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      layer === 'above'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Above Page Content
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayer('below')}
                    className={`py-1.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      layer === 'below'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Background Layer
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleApplyWatermark}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Stamp className="w-4 h-4" />
              Apply Watermark & Download PDF
            </button>
          </div>

          {/* Interactive Visual Preview Card */}
          <div className="lg:col-span-5">
            <div className="saas-card p-5 rounded-2xl border border-slate-200 sticky top-6">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-4">
                Watermark Simulation
              </h3>

              <div className="w-full aspect-[1/1.4] bg-white rounded-lg shadow-xl p-6 relative flex flex-col justify-between overflow-hidden select-none border border-slate-200">
                {/* Simulated Document Content Skeleton */}
                <div className="space-y-3 opacity-60">
                  <div className="h-4 bg-slate-300 rounded w-2/3" />
                  <div className="h-2 bg-slate-200 rounded w-full" />
                  <div className="h-2 bg-slate-200 rounded w-5/6" />
                  <div className="h-2 bg-slate-200 rounded w-4/6" />
                  <div className="h-24 bg-slate-100 rounded w-full my-4 border border-slate-200" />
                  <div className="h-2 bg-slate-200 rounded w-full" />
                  <div className="h-2 bg-slate-200 rounded w-3/4" />
                </div>

                {/* Simulated Watermark Overlay */}
                <div
                  className="absolute inset-0 p-6 flex pointer-events-none transition-all duration-200"
                  style={{
                    alignItems: position.startsWith('top')
                      ? 'flex-start'
                      : position.startsWith('bottom')
                      ? 'flex-end'
                      : 'center',
                    justifyContent: position.includes('left')
                      ? 'flex-start'
                      : position.includes('right')
                      ? 'flex-end'
                      : 'center',
                  }}
                >
                  {watermarkType === 'text' ? (
                    <span
                      style={{
                        color,
                        opacity,
                        fontSize: `${Math.max(12, fontSize * 0.45)}px`,
                        transform: `rotate(${rotation}deg)`,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                      className="font-mono select-none"
                    >
                      {text || 'WATERMARK'}
                    </span>
                  ) : (
                    <div
                      style={{
                        opacity,
                        transform: `rotate(${rotation}deg) scale(${scale * 0.8})`,
                      }}
                      className="border-2 border-dashed border-purple-500/50 p-2 rounded flex items-center justify-center bg-purple-500/10 text-purple-700 font-bold text-xs"
                    >
                      {imageFile ? imageFile.name : 'LOGO WATERMARK'}
                    </div>
                  )}
                </div>

                {/* Footer simulation */}
                <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-2 flex justify-between">
                  <span>Page 1</span>
                  <span>fileconvrt Protected</span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <span className="text-[11px] text-slate-500">
                  Target: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProcessingModal
        state={state}
        statusMessage="Rendering watermark layers, computing vector coordinates, and generating PDF..."
        sourceFormat="pdf"
        targetFormat="pdf"
      />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['watermark-pdf']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
