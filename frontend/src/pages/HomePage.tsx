import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { TOOLS_DIRECTORY } from '../data/tools';
import { ToolCard } from '../components/ToolCard';
import { HeroOrbitalGraphic } from '../components/HeroOrbitalGraphic';
import { PdfToWordThumbnail, TopToolsThumbnail, StudentsThumbnail } from '../components/BlogThumbnails';
import {
  ModernTurboIcon,
  ModernShieldIcon,
  ModernDevicesIcon,
  ModernInfinityIcon,
  ModernUsersIcon,
  ModernCloudZapIcon,
} from '../components/ModernIcons';
import type { ToolDef } from '../types';

interface HomePageProps {
  onSelectTool: (toolId: string) => void;
}

type FaqCategory = 'general' | 'conversion' | 'security' | 'support';
type DirectoryCategory = 'all' | 'pdf' | 'office' | 'image' | 'other';

export const HomePage: React.FC<HomePageProps> = ({ onSelectTool }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDirectoryCategory, setSelectedDirectoryCategory] = useState<DirectoryCategory>('all');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<FaqCategory>('general');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [guideSearch, setGuideSearch] = useState('');

  // 8 Specific Popular Tools exactly matching Image 1
  const popularToolIds = [
    'pdf-to-word',
    'word-to-pdf',
    'pdf-to-ppt',
    'ppt-to-pdf',
    'excel-to-pdf',
    'img-to-pdf',
    'pdf-to-img',
    'merge-pdf',
  ];

  const popularTools = useMemo(() => {
    return popularToolIds
      .map((id) => {
        const found = TOOLS_DIRECTORY.find((t) => t.id === id);
        if (found) {
          // Adjust labels to match exact image 1 text if needed
          if (id === 'img-to-pdf') {
            return {
              ...found,
              title: 'JPG to PDF',
              description: 'Convert images (JPG, PNG, etc.) to PDF.',
            };
          }
          if (id === 'pdf-to-word') {
            return {
              ...found,
              title: 'PDF to Word',
              description: 'Convert PDF to editable Word documents (DOCX).',
            };
          }
          if (id === 'word-to-pdf') {
            return {
              ...found,
              title: 'Word to PDF',
              description: 'Convert Word documents to PDF files.',
            };
          }
          if (id === 'ppt-to-pdf') {
            return {
              ...found,
              title: 'PPT to PDF',
              description: 'Convert PowerPoint presentations to PDF.',
            };
          }
          if (id === 'excel-to-pdf') {
            return {
              ...found,
              title: 'Excel to PDF',
              description: 'Convert Excel spreadsheets to PDF files.',
            };
          }
          if (id === 'pdf-to-img') {
            return {
              ...found,
              title: 'PDF to JPG',
              description: 'Convert PDF pages to high-quality images.',
            };
          }
          if (id === 'merge-pdf') {
            return {
              ...found,
              title: 'Merge PDF',
              description: 'Combine multiple PDF files into one.',
            };
          }
        }
        return found;
      })
      .filter((t): t is ToolDef => Boolean(t));
  }, []);

  // Directory Category Filter
  const directoryCategories: { id: DirectoryCategory; label: string }[] = [
    { id: 'all', label: 'All Tools' },
    { id: 'pdf', label: 'PDF Tools' },
    { id: 'office', label: 'Office Tools' },
    { id: 'image', label: 'Image Tools' },
    { id: 'other', label: 'Other Tools' },
  ];

  const filteredDirectoryTools = useMemo(() => {
    return TOOLS_DIRECTORY.filter((tool) => {
      let matchesCategory = true;
      if (selectedDirectoryCategory === 'pdf') {
        matchesCategory = ['merge', 'split', 'rotate', 'organize', 'compress', 'protect', 'unlock', 'watermark', 'page-numbers'].some(
          (k) => tool.id.includes(k)
        );
      } else if (selectedDirectoryCategory === 'office') {
        matchesCategory = ['word', 'excel', 'ppt'].some((k) => tool.id.includes(k));
      } else if (selectedDirectoryCategory === 'image') {
        matchesCategory = ['img', 'jpg'].some((k) => tool.id.includes(k));
      } else if (selectedDirectoryCategory === 'other') {
        matchesCategory = ['ocr', 'repair', 'compare', 'summarize'].some((k) => tool.id.includes(k));
      }

      const matchesSearch =
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedDirectoryCategory, searchQuery]);

  // Educational Guides matching Image 2 bottom-left
  const educationalGuides = [
    {
      title: 'How to Convert PDF to Word Without Losing Formatting',
      desc: 'Learn how to preserve exact font styles, table layouts, and margins when converting documents.',
      date: 'Oct 18, 2026',
      readTime: '5 min read',
      toolId: 'pdf-to-word',
      category: 'Tutorial',
      accent: 'border-blue-500/20 bg-blue-50/30',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Top 10 Free PDF Tools You Should Know',
      desc: 'A comprehensive roundup of must-have online document utilities for students and professionals.',
      date: 'Oct 16, 2026',
      readTime: '7 min read',
      toolId: 'merge-pdf',
      category: 'Productivity',
      accent: 'border-purple-500/20 bg-purple-50/30',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Best File Conversion Tools for Students',
      desc: 'Streamline your assignments, coursework submissions, and lecture notes with quick conversions.',
      date: 'Oct 14, 2026',
      readTime: '5 min read',
      toolId: 'word-to-pdf',
      category: 'Guide',
      accent: 'border-emerald-500/20 bg-emerald-50/30',
      iconColor: 'text-emerald-600',
    },
  ];

  // FAQ Items by category matching Image 2 bottom-center
  const faqData: Record<FaqCategory, { q: string; a: string }[]> = {
    general: [
      {
        q: 'Is Fileconvrt free to use?',
        a: 'Yes, Fileconvrt is completely free to use. You can convert, edit, and optimize your files without paying anything or entering credit card details. First 2 conversions are free instantly with no signup required.',
      },
      {
        q: 'What file formats are supported?',
        a: 'We support PDF, Microsoft Word (DOC, DOCX), PowerPoint (PPT, PPTX), Excel (XLS, XLSX), and images (JPG, PNG). We also offer AI summarization and OCR scanning tools.',
      },
      {
        q: 'Are my files safe and private?',
        a: 'Yes, absolutely. We use 256-bit SSL encryption for all file transfers. Your files are processed securely in isolated sandboxes and automatically deleted within 60 minutes.',
      },
      {
        q: 'How long are my files stored?',
        a: 'Your files are only stored temporarily for 60 minutes to allow you to download them. After 60 minutes, our automated system permanently purges them.',
      },
      {
        q: 'Do I need to create an account?',
        a: 'No account is required to convert files! However, creating a free account allows you to view your conversion history, manage past files, and access higher limits.',
      },
      {
        q: 'What is the maximum file size?',
        a: 'Free users can upload files up to 100 MB each, which accommodates almost all documents, presentations, and high-resolution scans.',
      },
    ],
    conversion: [
      {
        q: 'How fast is the conversion process?',
        a: 'Most document conversions take between 2 to 5 seconds depending on file complexity and network speed.',
      },
      {
        q: 'Will my formatting and fonts be preserved?',
        a: 'Yes. Our conversion engines are tuned to maintain precise typography, margins, embedded graphics, and tabular layouts with high vector fidelity.',
      },
      {
        q: 'Can I convert multiple files simultaneously?',
        a: 'Yes! Tools like Merge PDF and JPG to PDF allow selecting and converting multiple files in a single batch.',
      },
    ],
    security: [
      {
        q: 'How do you encrypt my files?',
        a: 'All files are transmitted over secure TLS 1.3 connections with AES-256 in-transit encryption. We enforce a zero-retention policy.',
      },
      {
        q: 'Can Fileconvrt staff or third parties view my documents?',
        a: 'No. File processing is automated and isolated in ephemeral containers. Nobody has access to your private files.',
      },
    ],
    support: [
      {
        q: 'Which browsers and devices are supported?',
        a: 'Fileconvrt works on Chrome, Safari, Edge, Firefox, and Opera across Windows, macOS, Linux, iOS, and Android.',
      },
      {
        q: 'What should I do if a file fails to convert?',
        a: 'Make sure the file is under 100 MB and not password protected (or use our Unlock PDF tool first). For corrupted files, try our Repair PDF tool.',
      },
    ],
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, toolId: string) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onSelectTool(toolId);
  };

  const scrollToAllTools = () => {
    const el = document.getElementById('all-tools');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      {/* 1. Hero Section: Exact Two-Column Reference Design */}
      <section className="relative pt-10 pb-16 sm:pt-16 sm:pb-20 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading, Subtitle, Benefits */}
            <div className="lg:col-span-7 text-left">
              {/* Eyebrow Pill: Free • Fast • Secure */}
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/90 text-indigo-700 text-xs font-bold mb-6 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Free • Fast • Secure</span>
              </div>

              {/* Main Headline: High-Contrast Dark Slate + Vibrant Indigo Accent */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-slate-900 leading-[1.12] font-heading mb-5">
                All Your File Conversion Needs in{' '}
                <span className="text-indigo-600">One Place</span>
              </h1>

              {/* Subtitle: Rich High-Contrast Slate-700 */}
              <p className="text-base sm:text-lg text-slate-700 max-w-xl leading-relaxed mb-8 font-medium">
                Convert PDFs, Office files, images and more — fast, secure and easy to use. No software installation required.
              </p>

              {/* 3 Benefit Badges in horizontal row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-2">
                {/* Benefit 1: Lightning Fast */}
                <div className="flex items-center space-x-3.5 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-indigo-50 to-indigo-100/70 border border-indigo-200/90 shadow-[0_2px_8px_rgba(99,102,241,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                    <ModernTurboIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm sm:text-[15px] font-heading">
                      Lightning Fast
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600 font-medium">
                      Convert in seconds
                    </div>
                  </div>
                </div>

                {/* Benefit 2: Secure & Private */}
                <div className="flex items-center space-x-3.5 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-emerald-50 to-emerald-100/70 border border-emerald-200/90 shadow-[0_2px_8px_rgba(16,185,129,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                    <ModernShieldIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm sm:text-[15px] font-heading">
                      Secure & Private
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600 font-medium">
                      Your files are safe
                    </div>
                  </div>
                </div>

                {/* Benefit 3: Works on Any Device */}
                <div className="flex items-center space-x-3.5 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-blue-50 to-blue-100/70 border border-blue-200/90 shadow-[0_2px_8px_rgba(59,130,246,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                    <ModernDevicesIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm sm:text-[15px] font-heading">
                      Works on Any Device
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600 font-medium">
                      Desktop, tablet, mobile
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Orbital Diagram with Fileconvrt & 4 Formats */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <HeroOrbitalGraphic />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Tools Section: 4 cols x 2 rows = 8 cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Popular Tools
            </h2>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              Choose a tool to get started. First 2 conversions are free!
            </p>
          </div>
          <button
            onClick={scrollToAllTools}
            className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>View All Tools</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 8 Popular Tool Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
          ))}
        </div>

        {/* Horizontal Statistics Bar directly below Popular Tools */}
        <div className="mt-8 bg-[#F7F9FF] border border-[#E5EAF2] p-5 sm:p-6 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-6 items-center shadow-xs">
          {/* Stat 1: 10+ Powerful Conversion Tools */}
          <div className="flex items-center space-x-3.5 justify-center md:justify-start group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-purple-50 to-purple-100/70 border border-purple-200/90 shadow-[0_2px_8px_rgba(147,51,234,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
              <ModernInfinityIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-[#101828] text-base sm:text-lg font-heading leading-tight">
                10+
              </div>
              <div className="text-xs text-[#64748B] font-semibold mt-0.5">
                Powerful Conversion Tools
              </div>
            </div>
          </div>

          {/* Stat 2: 10K+ Happy Users */}
          <div className="flex items-center space-x-3.5 justify-center md:justify-start group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-blue-50 to-blue-100/70 border border-blue-200/90 shadow-[0_2px_8px_rgba(59,130,246,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
              <ModernUsersIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-[#101828] text-base sm:text-lg font-heading leading-tight">
                10K+
              </div>
              <div className="text-xs text-[#64748B] font-semibold mt-0.5">
                Happy Users
              </div>
            </div>
          </div>

          {/* Stat 3: 100% Secure & Private */}
          <div className="flex items-center space-x-3.5 justify-center md:justify-start group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-emerald-50 to-emerald-100/70 border border-emerald-200/90 shadow-[0_2px_8px_rgba(16,185,129,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
              <ModernShieldIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-[#101828] text-base sm:text-lg font-heading leading-tight">
                100%
              </div>
              <div className="text-xs text-[#64748B] font-semibold mt-0.5">
                Secure & Private
              </div>
            </div>
          </div>

          {/* Stat 4: Fast Cloud-Based Processing */}
          <div className="flex items-center space-x-3.5 justify-center md:justify-start group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100/70 border border-amber-200/90 shadow-[0_2px_8px_rgba(245,158,11,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
              <ModernCloudZapIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-[#101828] text-base sm:text-lg font-heading leading-tight">
                Fast
              </div>
              <div className="text-xs text-[#64748B] font-semibold mt-0.5">
                Cloud-Based Processing
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. All Conversion Tools Section: Alternating secondary section background */}
      <section id="all-tools" className="w-full bg-[#F7F9FF] border-y border-[#E5EAF2] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] font-heading">
              All Conversion Tools
            </h2>
            <p className="text-sm text-[#64748B] mt-2 font-medium">
              Everything you need to convert, edit and manage your files.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {directoryCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedDirectoryCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selectedDirectoryCategory === cat.id
                    ? 'bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white shadow-sm'
                    : 'bg-white text-[#64748B] border border-[#E5EAF2] hover:border-[#4F46E5] hover:text-[#101828]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative mb-10">
            <div className="relative flex items-center bg-white border border-[#E5EAF2] rounded-xl px-3.5 py-2.5 shadow-2xs">
              <Search className="w-4 h-4 text-[#64748B] mr-2.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all 19 tools..."
                className="w-full bg-transparent text-[#101828] placeholder-[#64748B]/70 text-xs sm:text-sm focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#64748B] hover:text-[#101828] cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* All Tools Grid (4 columns x rows) */}
          {filteredDirectoryTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredDirectoryTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#64748B]">
              <HelpCircle className="w-8 h-8 mx-auto text-[#64748B] mb-2" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-[#101828]">No matching tools found</p>
              <p className="text-xs text-[#64748B] mt-1">Try another search keyword or category tab.</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. Tips, Guides and Updates: Pure White Section */}
      <section id="blog" className="w-full py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] font-heading">
                Tips, Guides and Updates
              </h2>
              <p className="text-sm text-[#64748B] mt-1 font-medium">
                Learn useful tips about file conversion, productivity and more.
              </p>
            </div>

            {/* Guide search */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={guideSearch}
                  onChange={(e) => setGuideSearch(e.target.value)}
                  placeholder="Search articles..."
                  className="pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#E5EAF2] text-[#101828] placeholder-[#64748B]/70 rounded-xl focus:outline-none w-48 sm:w-60"
                />
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:opacity-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-opacity cursor-pointer">
                Search
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {educationalGuides.map((guide, idx) => (
              <a
                key={idx}
                href={`/${guide.toolId}`}
                onClick={(e) => handleLinkClick(e, guide.toolId)}
                className="saas-card rounded-2xl overflow-hidden block group hover:shadow-md transition-all cursor-pointer bg-white border border-[#E5EAF2]"
              >
                {/* Visual Article Header Card */}
                {idx === 0 && <PdfToWordThumbnail />}
                {idx === 1 && <TopToolsThumbnail />}
                {idx === 2 && <StudentsThumbnail />}

                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4F46E5] px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 shadow-2xs">
                      {guide.category}
                    </span>
                    <span className="text-xs text-[#64748B] font-medium">
                      {guide.date} • {guide.readTime}
                    </span>
                  </div>

                  <h3 className="font-bold text-[#101828] text-sm sm:text-base font-heading group-hover:text-[#4F46E5] transition-colors leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-2 mt-2 leading-relaxed">
                    {guide.desc}
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#E5EAF2] flex items-center justify-between text-xs font-semibold text-[#4F46E5]">
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Frequently Asked Questions: Alternating light background */}
      <section id="faq" className="w-full bg-[#F7F9FF] border-t border-[#E5EAF2] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] font-heading">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#64748B] mt-1 font-medium">
              Find answers to common questions about Fileconvrt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
            {/* Left Column: Category Tabs with Icons matching reference */}
            <div className="md:col-span-4 space-y-2">
              {[
                { id: 'general' as const, label: 'General', icon: FileText },
                { id: 'conversion' as const, label: 'File Conversion', icon: Sparkles },
                { id: 'security' as const, label: 'Account & Security', icon: ShieldCheck },
                { id: 'support' as const, label: 'Technical Support', icon: HelpCircle },
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedFaqCategory(tab.id);
                      setOpenFaqIndex(0);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-between ${
                      selectedFaqCategory === tab.id
                        ? 'bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white shadow-sm'
                        : 'bg-white text-[#64748B] border border-[#E5EAF2] hover:border-[#4F46E5] hover:text-[#101828]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <TabIcon className={`w-4 h-4 ${selectedFaqCategory === tab.id ? 'text-white' : 'text-[#64748B]'}`} />
                      <span>{tab.label}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        selectedFaqCategory === tab.id ? '-rotate-90 text-white' : 'text-[#64748B]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Right Column: Accordion List */}
            <div className="md:col-span-8 space-y-3">
              {faqData[selectedFaqCategory].map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="saas-card rounded-xl overflow-hidden transition-all bg-white border border-[#E5EAF2]">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between font-semibold text-[#101828] text-sm sm:text-base focus:outline-none cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#64748B] transition-transform duration-200 shrink-0 ml-3 ${
                          isOpen ? 'rotate-180 text-[#4F46E5]' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-[#E5EAF2] pt-3 animate-fade-in">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
