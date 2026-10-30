import React from 'react';
import { ModernLockIcon, ModernRefreshIcon, ModernTurboIcon } from './ModernIcons';

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
    <footer className="w-full border-t border-slate-200 bg-white text-slate-600 mt-20 transition-colors">
      {/* Privacy, Trust & Performance Bar */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            {/* Trust 1: Zero Document Logging */}
            <div className="flex items-center justify-center md:justify-start space-x-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-emerald-50 to-emerald-100/70 border border-emerald-200/90 shadow-[0_2px_8px_rgba(16,185,129,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                <ModernLockIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-heading">Zero Document Logging</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-normal">
                  Documents are processed ephemerally in isolated memory containers with zero persistent tracking.
                </p>
              </div>
            </div>

            {/* Trust 2: 60-Min Auto Cleanup */}
            <div className="flex items-center justify-center md:justify-start space-x-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-blue-50 to-blue-100/70 border border-blue-200/90 shadow-[0_2px_8px_rgba(59,130,246,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                <ModernRefreshIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-heading">60-Min Auto Cleanup</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-normal">
                  Uploaded inputs and generated outputs are permanently purged from scratch storage.
                </p>
              </div>
            </div>

            {/* Trust 3: High-Speed Engine */}
            <div className="flex items-center justify-center md:justify-start space-x-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-violet-50 to-violet-100/70 border border-violet-200/90 shadow-[0_2px_8px_rgba(139,92,246,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                <ModernTurboIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-heading">High-Speed Engine</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-normal">
                  High-performance stream rendering and vector rasterization optimized for instant delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Tool Directory Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Organize */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 font-heading">
              Organize PDF
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/merge-pdf"
                  onClick={(e) => handleLinkClick(e, 'merge-pdf')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Merge PDF
                </a>
              </li>
              <li>
                <a
                  href="/split-pdf"
                  onClick={(e) => handleLinkClick(e, 'split-pdf')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Split PDF
                </a>
              </li>
              <li>
                <a
                  href="/organize-pdf"
                  onClick={(e) => handleLinkClick(e, 'organize-pdf')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Organize Pages
                </a>
              </li>
              <li>
                <a
                  href="/rotate-pdf"
                  onClick={(e) => handleLinkClick(e, 'rotate-pdf')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Rotate PDF
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Edit & Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 font-heading">
              Edit & Security
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/page-numbers-pdf"
                  onClick={(e) => handleLinkClick(e, 'page-numbers-pdf')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Add Page Numbers
                </a>
              </li>
              <li>
                <a
                  href="/watermark-pdf"
                  onClick={(e) => handleLinkClick(e, 'watermark-pdf')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Watermark PDF
                </a>
              </li>
              <li>
                <a
                  href="/protect-pdf"
                  onClick={(e) => handleLinkClick(e, 'protect-pdf')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Protect with Password
                </a>
              </li>
              <li>
                <a
                  href="/unlock-pdf"
                  onClick={(e) => handleLinkClick(e, 'unlock-pdf')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Unlock PDF
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Convert to PDF */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 font-heading">
              Convert to PDF
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/word-to-pdf"
                  onClick={(e) => handleLinkClick(e, 'word-to-pdf')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Word to PDF
                </a>
              </li>
              <li>
                <a
                  href="/excel-to-pdf"
                  onClick={(e) => handleLinkClick(e, 'excel-to-pdf')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Excel to PDF
                </a>
              </li>
              <li>
                <a
                  href="/ppt-to-pdf"
                  onClick={(e) => handleLinkClick(e, 'ppt-to-pdf')}
                  className="hover:text-blue-600 transition-colors"
                >
                  PowerPoint to PDF
                </a>
              </li>
              <li>
                <a
                  href="/img-to-pdf"
                  onClick={(e) => handleLinkClick(e, 'img-to-pdf')}
                  className="hover:text-blue-600 transition-colors"
                >
                  JPG / PNG to PDF
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Convert from PDF */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 font-heading">
              Convert from PDF
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/pdf-to-word"
                  onClick={(e) => handleLinkClick(e, 'pdf-to-word')}
                  className="hover:text-blue-600 transition-colors"
                >
                  PDF to Word (DOCX)
                </a>
              </li>
              <li>
                <a
                  href="/pdf-to-img"
                  onClick={(e) => handleLinkClick(e, 'pdf-to-img')}
                  className="hover:text-blue-600 transition-colors"
                >
                  PDF to JPG Images
                </a>
              </li>
              <li>
                <a
                  href="/compress-pdf"
                  onClick={(e) => handleLinkClick(e, 'compress-pdf')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Compress PDF Size
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Advanced & AI */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 font-heading">
              Advanced & AI
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/ocr-pdf"
                  onClick={(e) => handleLinkClick(e, 'ocr-pdf')}
                  className="hover:text-blue-600 transition-colors"
                >
                  OCR Searchable PDF
                </a>
              </li>
              <li>
                <a
                  href="/repair-pdf"
                  onClick={(e) => handleLinkClick(e, 'repair-pdf')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Repair Damaged PDF
                </a>
              </li>
              <li>
                <a
                  href="/compare-pdf"
                  onClick={(e) => handleLinkClick(e, 'compare-pdf')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Compare PDF Files
                </a>
              </li>
              <li>
                <a
                  href="/summarize-pdf"
                  onClick={(e) => handleLinkClick(e, 'summarize-pdf')}
                  className="hover:text-purple-600 transition-colors font-medium"
                >
                  AI PDF Summarizer
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Brand Bottom Info */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="fileconvrt" className="h-6 sm:h-7 w-auto object-contain" />
            <p className="font-semibold text-slate-700">
              © {new Date().getFullYear()} Fileconvrt. Convert. Manage. Simplify.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-slate-500">
            <span>TLS 1.3 Encryption</span>
            <span>•</span>
            <span>GDPR-Ready Architecture</span>
            <span>•</span>
            <span className="font-mono text-[11px]">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
