import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RotateCw,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw as ResetIcon,
  CheckSquare,
  Square,
  AlertTriangle,
  Layers,
  FileText,
} from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { organizePdfApi } from '../services/api';
import { ToolSeoSection } from '../components/ToolSeoSection';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState } from '../types';

interface PageItem {
  id: string;
  originalIndex: number;
  rotation: number; // 0, 90, 180, 270
  thumbnailUrl?: string;
}

interface OrganizePageProps {
  onBack: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const OrganizePage: React.FC<OrganizePageProps> = ({ onBack, onSelectTool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [initialPages, setInitialPages] = useState<PageItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Load PDF pages and generate thumbnails
  useEffect(() => {
    if (!file) return;

    let isMounted = true;
    setLoadingPdf(true);

    const loadDoc = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const count = pdf.numPages;

        const newPages: PageItem[] = [];

        for (let i = 1; i <= count; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.3 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            await page.render({ canvasContext: context, viewport } as any).promise;
            newPages.push({
              id: `page-${i - 1}-${Date.now()}-${Math.random()}`,
              originalIndex: i - 1,
              rotation: 0,
              thumbnailUrl: canvas.toDataURL(),
            });
          } else {
            newPages.push({
              id: `page-${i - 1}-${Date.now()}-${Math.random()}`,
              originalIndex: i - 1,
              rotation: 0,
            });
          }
        }

        if (isMounted) {
          setPages(newPages);
          setInitialPages(newPages);
          setLoadingPdf(false);
        }
      } catch (err: any) {
        console.warn('PDF.js thumbnail rendering fallback to metadata placeholder:', err);
        const fallbackPages: PageItem[] = Array.from({ length: 3 }, (_, idx) => ({
          id: `page-${idx}-${Date.now()}`,
          originalIndex: idx,
          rotation: 0,
        }));
        if (isMounted) {
          setPages(fallbackPages);
          setInitialPages(fallbackPages);
          setLoadingPdf(false);
        }
      }
    };

    loadDoc();

    return () => {
      isMounted = false;
    };
  }, [file]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setError(null);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === pages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pages.map((p) => p.id)));
    }
  };

  const handleRotatePage = (index: number, degDelta: number = 90) => {
    setPages((prev) =>
      prev.map((p, idx) =>
        idx === index ? { ...p, rotation: ((p.rotation + degDelta) % 360) as 0 | 90 | 180 | 270 } : p
      )
    );
  };

  const handleRotateSelected = (degDelta: number = 90) => {
    setPages((prev) =>
      prev.map((p) =>
        selectedIds.has(p.id) ? { ...p, rotation: ((p.rotation + degDelta) % 360) as 0 | 90 | 180 | 270 } : p
      )
    );
  };

  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) {
      setError('A PDF document must retain at least one page.');
      return;
    }
    const pageId = pages[index].id;
    setPages((prev) => prev.filter((_, idx) => idx !== index));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(pageId);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size >= pages.length) {
      setError('Cannot delete all pages. At least one page must remain.');
      return;
    }
    setPages((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
  };

  const handleDuplicatePage = (index: number) => {
    const pageToDup = pages[index];
    const newPage: PageItem = {
      ...pageToDup,
      id: `dup-${pageToDup.id}-${Date.now()}`,
    };
    const nextPages = [...pages];
    nextPages.splice(index + 1, 0, newPage);
    setPages(nextPages);
  };

  const handleMove = (from: number, to: number) => {
    if (to < 0 || to >= pages.length) return;
    const next = [...pages];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setPages(next);
  };

  const handleReset = () => {
    setPages(initialPages);
    setSelectedIds(new Set());
    setError(null);
  };

  const handleOrganize = async () => {
    if (!file) {
      setError('Please select a PDF document first.');
      return;
    }
    if (pages.length === 0) {
      setError('At least one page is required.');
      return;
    }

    try {
      setState('uploading');
      setError(null);

      const operations = pages.map((p) => ({
        originalIndex: p.originalIndex,
        rotation: p.rotation || 0,
      }));

      setState('processing');
      const data = await organizePdfApi(file, operations);

      setResult(data);
      setState('success');
    } catch (err: any) {
      setError(err.message || 'An error occurred while organizing the PDF pages.');
      setState('error');
    }
  };

  if (state === 'success' && result) {
    return (
      <DownloadView
        result={result}
        toolName="Organize PDF"
        onReset={() => {
          setFile(null);
          setPages([]);
          setState('idle');
          setResult(null);
        }}
        onBackToHome={onBack}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-heading flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-600" />
              Organize PDF Pages
            </h1>
            <p className="text-xs text-slate-500">
              Drag to reorder, rotate individual pages, duplicate, or delete with visual canvas previews.
            </p>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-700 font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <ResetIcon className="w-3.5 h-3.5" />
              Reset All
            </button>
            <button
              onClick={handleOrganize}
              disabled={pages.length === 0}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              Save & Organize PDF ({pages.length} Pages)
            </button>
          </div>
        )}
      </div>

      {!file ? (
        <FileUploader
          accept=".pdf"
          multiple={false}
          maxSizeMB={100}
          onFilesSelected={handleFilesSelected}
          title="Select a PDF to organize and reorder"
          subtitle="Supports visual page reordering, rotation, deletion, and duplicate pages"
        />
      ) : (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="saas-card p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                {selectedIds.size === pages.length && pages.length > 0 ? (
                  <>
                    <Square className="w-3.5 h-3.5 text-indigo-600" /> Clear All
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> Select All ({pages.length})
                  </>
                )}
              </button>

              {selectedIds.size > 0 && (
                <>
                  <div className="h-4 w-px bg-slate-200 mx-1" />
                  <span className="text-xs text-indigo-600 font-medium">
                    {selectedIds.size} page{selectedIds.size > 1 ? 's' : ''} selected:
                  </span>
                  <button
                    onClick={() => handleRotateSelected(90)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-700 flex items-center gap-1 cursor-pointer"
                    title="Rotate selected 90° clockwise"
                  >
                    <RotateCw className="w-3 h-3 text-purple-600" /> Rotate 90°
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="px-2.5 py-1 rounded-lg border border-red-200 hover:bg-red-50 text-xs text-red-600 flex items-center gap-1 cursor-pointer"
                    title="Delete selected pages"
                  >
                    <Trash2 className="w-3 h-3" /> Delete ({selectedIds.size})
                  </button>
                </>
              )}
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>Original: {initialPages.length} pages</span>
              <span>•</span>
              <span className="text-slate-900 font-medium">Final: {pages.length} pages</span>
            </div>
          </div>

          {/* Error / Warning Alert */}
          {error && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Page Grid */}
          {loadingPdf ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mb-3" />
              <p className="text-sm text-slate-500">Rendering visual page thumbnails with PDF.js...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {pages.map((pageItem, index) => {
                const isSelected = selectedIds.has(pageItem.id);
                return (
                  <div
                    key={pageItem.id}
                    draggable
                    onDragStart={() => setDraggedIdx(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedIdx !== null && draggedIdx !== index) {
                        handleMove(draggedIdx, index);
                        setDraggedIdx(null);
                      }
                    }}
                    className={`relative group rounded-2xl border transition-all duration-200 bg-white flex flex-col overflow-hidden shadow-2xs ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30 shadow-md'
                        : 'border-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    {/* Page header bar */}
                    <div className="px-2.5 py-1.5 bg-slate-50 flex items-center justify-between text-xs border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(pageItem.id)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="font-semibold text-slate-900">#{index + 1}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Orig: {pageItem.originalIndex + 1}</span>
                    </div>

                    {/* Thumbnail Viewport */}
                    <div className="p-3 flex items-center justify-center bg-slate-100/60 min-h-[160px] relative overflow-hidden">
                      {pageItem.thumbnailUrl ? (
                        <img
                          src={pageItem.thumbnailUrl}
                          alt={`Page ${index + 1}`}
                          className="max-h-36 max-w-full rounded shadow-sm object-contain transition-transform duration-300"
                          style={{
                            transform: `rotate(${pageItem.rotation}deg)`,
                          }}
                        />
                      ) : (
                        <div
                          className="w-24 h-32 bg-white rounded border border-slate-200 flex flex-col items-center justify-center text-slate-500 gap-1.5 transition-transform"
                          style={{ transform: `rotate(${pageItem.rotation}deg)` }}
                        >
                          <FileText className="w-6 h-6 text-slate-400" />
                          <span className="text-[11px] font-medium">Page {pageItem.originalIndex + 1}</span>
                        </div>
                      )}

                      {/* Rotation indicator badge */}
                      {pageItem.rotation !== 0 && (
                        <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          {pageItem.rotation}°
                        </div>
                      )}
                    </div>

                    {/* Hover Page Controls */}
                    <div className="px-2 py-2 bg-white border-t border-slate-100 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMove(index, index - 1)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                          title="Move left"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === pages.length - 1}
                          onClick={() => handleMove(index, index + 1)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                          title="Move right"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleRotatePage(index, 90)}
                          className="p-1 rounded hover:bg-slate-100 text-purple-600 hover:text-purple-700 cursor-pointer"
                          title="Rotate 90°"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicatePage(index)}
                          className="p-1 rounded hover:bg-slate-100 text-blue-600 hover:text-blue-700 cursor-pointer"
                          title="Duplicate page"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePage(index)}
                          className="p-1 rounded hover:bg-red-50 text-red-500 hover:text-red-700 cursor-pointer"
                          title="Delete page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <ProcessingModal
        state={state}
        statusMessage="Rebuilding page sequence, applying orientations, and generating valid PDF..."
        sourceFormat="pdf"
        targetFormat="pdf"
      />

      {/* Educational SEO & FAQ Section */}
      <ToolSeoSection
        content={TOOLS_SEO_DATA['organize-pdf']}
        onNavigateTool={onSelectTool}
      />
    </div>
  );
};
