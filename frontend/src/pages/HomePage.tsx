import React, { useState, useMemo } from 'react';
import { Search, Sparkles, ShieldCheck, Zap, Globe, BookOpen, ArrowRight } from 'lucide-react';
import { TOOLS_DIRECTORY } from '../data/tools';
import { ToolCard } from '../components/ToolCard';
import type { ToolCategory } from '../types';

interface HomePageProps {
  onSelectTool: (toolId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTool }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');

  const categories: { id: ToolCategory; label: string }[] = [
    { id: 'all', label: 'All Tools' },
    { id: 'organize', label: 'Organize' },
    { id: 'optimize', label: 'Optimize' },
    { id: 'convert', label: 'Convert' },
    { id: 'edit', label: 'Edit' },
    { id: 'security', label: 'Security' },
  ];

  const filteredTools = useMemo(() => {
    return TOOLS_DIRECTORY.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesSearch =
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const educationalGuides = [
    {
      title: 'How to Merge PDF Files Online Without Losing Formatting',
      desc: 'Learn how to combine multi-page documents, contracts, and receipts into a single continuous PDF while preserving vector fonts and form fields.',
      toolId: 'merge-pdf',
      readTime: '3 min read',
    },
    {
      title: 'How to Drastically Reduce PDF File Size for Email Attachments',
      desc: 'Discover how image downsampling, stream deduplication, and font subsetting shrink heavy PDFs without sacrificing readability.',
      toolId: 'compress-pdf',
      readTime: '4 min read',
    },
    {
      title: 'How to Convert Word Documents (DOCX) to Universal PDF',
      desc: 'Ensure your typography, margins, and layouts look identical on every screen by converting Microsoft Word documents to standard PDF.',
      toolId: 'word-to-pdf',
      readTime: '2 min read',
    },
    {
      title: 'How to Extract Pages and Split PDF Documents by Custom Range',
      desc: 'Step-by-step instructions on extracting specific page intervals (e.g. 1-3, 5, 8-10) or single sheets into separate clean files.',
      toolId: 'split-pdf',
      readTime: '3 min read',
    },
    {
      title: 'How OCR Makes Scanned Physical Paper Searchable & Selectable',
      desc: 'Understand how Optical Character Recognition aligns an invisible text layer over raster scans, enabling full-text Ctrl+F search and copy-paste.',
      toolId: 'ocr-pdf',
      readTime: '4 min read',
    },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, toolId: string) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onSelectTool(toolId);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden text-center">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[350px] h-[250px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Speed, Privacy-First PDF Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 font-heading leading-tight">
            Every tool you need to work with PDFs,{' '}
            <span className="text-gradient-red">100% free & fast</span>
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Merge, split, compress, rotate, and convert documents effortlessly with memory-isolated processing and zero document logging.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto relative group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 opacity-20 group-hover:opacity-40 blur transition duration-300" />
            <div className="relative flex items-center bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3.5 shadow-xl">
              <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g. merge, split, compress, word, ocr)..."
                className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
                aria-label="Search PDF tools"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs & Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/20'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tools Grid with Semantic Anchor Cards */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg font-semibold text-white mb-1">No tools found</p>
            <p className="text-sm">Try searching for a different keyword or category.</p>
          </div>
        )}
      </section>

      {/* Feature Highlights Section */}
      <section className="border-t border-slate-800/60 bg-slate-950/40 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4 font-heading">
              Engineered for Speed & Ironclad Privacy
            </h2>
            <p className="text-slate-400 text-sm">
              Modern architecture that processes documents with zero third-party telemetry, memory sandboxing, and automated lifecycle destruction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-heading">Complete Privacy</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Files are processed exclusively in isolated task sandboxes. No document contents are permanently stored or indexed.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-heading">Instant Performance</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Optimized streaming engines process and compress documents in fractions of a second with maximum visual fidelity.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-heading">Accessible Anywhere</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Fluid responsive experience across desktop, tablet, and mobile browsers with zero software installs required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Document Guides / SEO Knowledge Base */}
      <section className="border-t border-slate-800/60 bg-slate-900/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                <span>PDF Knowledge Base & Guides</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                Step-by-Step Document Guides
              </h2>
            </div>
            <p className="text-sm text-slate-400 max-w-md mt-2 md:mt-0">
              In-depth tutorials explaining how to solve common document formatting, compression, and conversion challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {educationalGuides.map((guide, idx) => (
              <a
                key={idx}
                href={`/${guide.toolId}`}
                onClick={(e) => handleLinkClick(e, guide.toolId)}
                className="group p-6 rounded-2xl glass-panel border border-slate-800 hover:border-red-500/40 transition-all duration-300 flex flex-col justify-between block"
              >
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    {guide.readTime}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors mb-3 leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {guide.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-red-400">
                  <span>Open {guide.title.split(' ')[2]} Tool</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
