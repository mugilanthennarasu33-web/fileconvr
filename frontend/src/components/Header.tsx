import React, { useState } from 'react';
import { Menu, X, ChevronDown, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTool: string | null;
  onSelectTool: (toolId: string | null) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTool, onSelectTool }) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (activeTool !== null) {
      onSelectTool(null);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, toolId: string | null) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    setMobileMenuOpen(false);
    onSelectTool(toolId);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo: Official Fileconvrt Logo */}
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, null)}
          className="flex items-center group select-none cursor-pointer"
        >
          <img
            src="/logo.png"
            alt="fileconvrt"
            className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-102"
          />
        </a>

        {/* Desktop Navigation Links matching Image 2: Tools ⌄, Features, Blog, FAQ */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium" aria-label="Main Navigation">
          <button
            onClick={() => handleNavClick('all-tools')}
            className="flex items-center space-x-1 text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <span>Tools</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => handleNavClick('features')}
            className="text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => handleNavClick('blog')}
            className="text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            Blog
          </button>
          <button
            onClick={() => handleNavClick('faq')}
            className="text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* Right Section: Sign In / Get Started or User Menu */}
        <div className="flex items-center space-x-3">
          {/* User Auth Controls */}
          {user ? (
            <div className="flex items-center space-x-2">
              <a
                href="/dashboard"
                onClick={(e) => handleLinkClick(e, 'dashboard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTool === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Dashboard
              </a>
              <a
                href="/account"
                onClick={(e) => handleLinkClick(e, 'account')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                title={user.email}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || 'User avatar'}
                    className="w-4 h-4 rounded-full object-cover border border-slate-300 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-indigo-600" strokeWidth={2} />
                )}
                <span className="max-w-[80px] sm:max-w-[120px] truncate">
                  {user.name || user.email.split('@')[0]}
                </span>
              </a>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <a
                href="/login"
                onClick={(e) => handleLinkClick(e, 'login')}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 shadow-2xs transition-all"
              >
                Sign In
              </a>
              <a
                href="/register"
                onClick={(e) => handleLinkClick(e, 'register')}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all flex items-center"
              >
                <span>Get Started</span>
              </a>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" strokeWidth={2} /> : <Menu className="w-5 h-5" strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-fade-in">
          <div className="grid grid-cols-2 gap-2 pt-1 pb-3">
            <button
              onClick={() => handleNavClick('all-tools')}
              className="text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              All Tools
            </button>
            <button
              onClick={() => handleNavClick('features')}
              className="text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('blog')}
              className="text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Blog
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className="text-left px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              FAQ
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
