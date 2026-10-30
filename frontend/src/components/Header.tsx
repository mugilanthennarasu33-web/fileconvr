import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { checkBackendHealth } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTool: string | null;
  onSelectTool: (toolId: string | null) => void;
  onSearchClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTool, onSelectTool }) => {
  const { user } = useAuth();
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendHealth()
      .then((data) => setIsHealthy(data.status === 'ok'))
      .catch(() => setIsHealthy(false));
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, toolId: string | null) => {
    // Let browser handle middle clicks or ctrl/meta clicks to open in new tab
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onSelectTool(toolId);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, null)}
          className="flex items-center space-x-3 group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white font-heading">
                file<span className="text-red-500">convr</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">Convert. Manage. Simplify.</p>
          </div>
        </a>

        {/* Quick Nav Tools with Semantic Anchor Links */}
        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium" aria-label="Main Navigation">
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, null)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTool === null
                ? 'text-white bg-slate-800'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            All Tools
          </a>
          <a
            href="/merge-pdf"
            onClick={(e) => handleLinkClick(e, 'merge-pdf')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTool === 'merge-pdf'
                ? 'text-white bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Merge
          </a>
          <a
            href="/split-pdf"
            onClick={(e) => handleLinkClick(e, 'split-pdf')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTool === 'split-pdf'
                ? 'text-white bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Split
          </a>
          <a
            href="/compress-pdf"
            onClick={(e) => handleLinkClick(e, 'compress-pdf')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTool === 'compress-pdf'
                ? 'text-white bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Compress
          </a>
          <a
            href="/pdf-to-word"
            onClick={(e) => handleLinkClick(e, 'pdf-to-word')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTool === 'pdf-to-word'
                ? 'text-white bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            PDF to Word
          </a>
          <a
            href="/organize-pdf"
            onClick={(e) => handleLinkClick(e, 'organize-pdf')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTool === 'organize-pdf'
                ? 'text-white bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Organize
          </a>
          <a
            href="/ocr-pdf"
            onClick={(e) => handleLinkClick(e, 'ocr-pdf')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTool === 'ocr-pdf'
                ? 'text-white bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            OCR
          </a>
          <a
            href="/summarize-pdf"
            onClick={(e) => handleLinkClick(e, 'summarize-pdf')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
              activeTool === 'summarize-pdf'
                ? 'text-white bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <span>AI Summarizer</span>
          </a>
        </nav>

        {/* Right Status / Actions */}
        <div className="flex items-center space-x-3">
          {/* Health indicator badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            {isHealthy === true ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 font-medium">Engine Online</span>
              </>
            ) : isHealthy === false ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-amber-400 font-medium">Offline</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-ping" />
                <span className="text-slate-400 font-medium">Connecting</span>
              </>
            )}
          </div>

          {/* User Auth Controls */}
          {user ? (
            <div className="flex items-center space-x-2">
              <a
                href="/dashboard"
                onClick={(e) => handleLinkClick(e, 'dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTool === 'dashboard'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200'
                }`}
              >
                Dashboard
              </a>
              <a
                href="/account"
                onClick={(e) => handleLinkClick(e, 'account')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTool === 'account'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300'
                }`}
                title={user.email}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || 'User avatar'}
                    className="w-4 h-4 rounded-full object-cover border border-slate-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
                <span className="max-w-[100px] truncate">{user.name || user.email.split('@')[0]}</span>
              </a>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <a
                href="/login"
                onClick={(e) => handleLinkClick(e, 'login')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                Sign In
              </a>
              <a
                href="/register"
                onClick={(e) => handleLinkClick(e, 'register')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-600/20 transition-all"
              >
                Register
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
