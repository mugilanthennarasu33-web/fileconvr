import React from 'react';
import { Zap, Lock, RefreshCw, FileText } from 'lucide-react';

interface FooterProps {
  onSelectTool?: (toolId: string | null) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTool }) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, toolId: string | null) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    if (onSelectTool) {
      e.preventDefault();
      onSelectTool(toolId);
    }
  };

  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/95 text-slate-400 mt-20">
      {/* Privacy, Trust & Performance Bar */}
      <div className="border-b border-slate-900 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Zero Document Logging</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Documents are processed ephemerally in isolated memory containers with zero persistent tracking.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start space-x-3.5">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">60-Min Auto Cleanup</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Uploaded inputs and generated outputs are permanently purged from temporary scratch storage.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start space-x-3.5">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">High-Speed Engine</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-performance stream rendering and vector rasterization optimized for instant delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete SEO Tool Directory Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Organize */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-heading">
              Organize PDF
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/merge-pdf"
                  onClick={(e) => handleLinkClick(e, 'merge-pdf')}
                  className="hover:text-red-400 transition-colors"
                >
                  Merge PDF
                </a>
              </li>
              <li>
                <a
                  href="/split-pdf"
                  onClick={(e) => handleLinkClick(e, 'split-pdf')}
                  className="hover:text-red-400 transition-colors"
                >
                  Split PDF
                </a>
              </li>
              <li>
                <a
                  href="/organize-pdf"
                  onClick={(e) => handleLinkClick(e, 'organize-pdf')}
                  className="hover:text-red-400 transition-colors"
                >
                  Organize Pages
                </a>
              </li>
              <li>
                <a
                  href="/rotate-pdf"
                  onClick={(e) => handleLinkClick(e, 'rotate-pdf')}
                  className="hover:text-red-400 transition-colors"
                >
                  Rotate PDF
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Edit & Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-heading">
              Edit & Security
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/page-numbers-pdf"
                  onClick={(e) => handleLinkClick(e, 'page-numbers-pdf')}
                  className="hover:text-red-400 transition-colors"
                >
                  Add Page Numbers
                </a>
              </li>
              <li>
                <a
                  href="/watermark-pdf"
                  onClick={(e) => handleLinkClick(e, 'watermark-pdf')}
                  className="hover:text-red-400 transition-colors"
                >
                  Watermark PDF
                </a>
              </li>
              <li>
                <a
                  href="/protect-pdf"
                  onClick={(e) => handleLinkClick(e, 'protect-pdf')}
                  className="hover:text-red-400 transition-colors"
                >
                  Protect with Password
                </a>
              </li>
              <li>
                <a
                  href="/unlock-pdf"
                  onClick={(e) => handleLinkClick(e, 'unlock-pdf')}
                  className="hover:text-red-400 transition-colors"
                >
                  Unlock PDF
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Convert to PDF */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-heading">
              Convert to PDF
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/word-to-pdf"
                  onClick={(e) => handleLinkClick(e, 'word-to-pdf')}
                  className="hover:text-red-400 transition-colors"
                >
                  Word to PDF
                </a>
              </li>
              <li>
                <a
                  href="/excel-to-pdf"
                  onClick={(e) => handleLinkClick(e, 'excel-to-pdf')}
                  className="hover:text-red-400 transition-colors"
                >
                  Excel to PDF
                </a>
              </li>
              <li>
                <a
                  href="/ppt-to-pdf"
                  onClick={(e) => handleLinkClick(e, 'ppt-to-pdf')}
                  className="hover:text-red-400 transition-colors"
                >
                  PowerPoint to PDF
                </a>
              </li>
              <li>
                <a
                  href="/img-to-pdf"
                  onClick={(e) => handleLinkClick(e, 'img-to-pdf')}
                  className="hover:text-red-400 transition-colors"
                >
                  JPG / PNG to PDF
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Convert from PDF */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-heading">
              Convert from PDF
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/pdf-to-word"
                  onClick={(e) => handleLinkClick(e, 'pdf-to-word')}
                  className="hover:text-red-400 transition-colors"
                >
                  PDF to Word (DOCX)
                </a>
              </li>
              <li>
                <a
                  href="/pdf-to-img"
                  onClick={(e) => handleLinkClick(e, 'pdf-to-img')}
                  className="hover:text-red-400 transition-colors"
                >
                  PDF to JPG Images
                </a>
              </li>
              <li>
                <a
                  href="/compress-pdf"
                  onClick={(e) => handleLinkClick(e, 'compress-pdf')}
                  className="hover:text-red-400 transition-colors"
                >
                  Compress PDF Size
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Advanced AI & Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-heading">
              Advanced & AI
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/ocr-pdf"
                  onClick={(e) => handleLinkClick(e, 'ocr-pdf')}
                  className="hover:text-red-400 transition-colors"
                >
                  OCR Searchable PDF
                </a>
              </li>
              <li>
                <a
                  href="/repair-pdf"
                  onClick={(e) => handleLinkClick(e, 'repair-pdf')}
                  className="hover:text-red-400 transition-colors"
                >
                  Repair Damaged PDF
                </a>
              </li>
              <li>
                <a
                  href="/compare-pdf"
                  onClick={(e) => handleLinkClick(e, 'compare-pdf')}
                  className="hover:text-red-400 transition-colors"
                >
                  Compare PDF Files
                </a>
              </li>
              <li>
                <a
                  href="/summarize-pdf"
                  onClick={(e) => handleLinkClick(e, 'summarize-pdf')}
                  className="hover:text-purple-400 transition-colors font-medium"
                >
                  AI PDF Summarizer
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Brand Bottom Info */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <p>© {new Date().getFullYear()} fileconvr. Convert. Manage. Simplify.</p>
          </div>

          <div className="flex items-center space-x-6 text-slate-500">
            <span>TLS 1.3 Encryption</span>
            <span>•</span>
            <span>GDPR-Ready Architecture</span>
            <span>•</span>
            <span className="font-mono">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
