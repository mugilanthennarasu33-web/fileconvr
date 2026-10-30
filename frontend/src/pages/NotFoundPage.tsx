import React from 'react';
import { FileQuestion, Home, Files, Scissors, Minimize2 } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';

interface NotFoundPageProps {
  onNavigateHome: () => void;
  onSelectTool: (toolId: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigateHome,
  onSelectTool,
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <SeoHead
        title="404 — Page Not Found | Fileconvrt"
        description="The requested page could not be found. Explore our free online PDF tools including merge, split, compress, and convert."
        canonicalPath="/404"
        noindex={true}
      />

      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#4F46E5] mx-auto flex items-center justify-center mb-6 shadow-sm">
        <FileQuestion className="w-8 h-8" strokeWidth={2} />
      </div>

      <h1 className="text-4xl font-extrabold text-[#101828] font-heading mb-3">
        Page Not Found (404)
      </h1>
      <p className="text-[#64748B] text-sm max-w-md mx-auto mb-8 font-medium">
        We couldn&apos;t find the page you were looking for. The link may have moved or been updated.
      </p>

      <div className="flex justify-center gap-4 mb-12">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:opacity-95 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" strokeWidth={2} />
          <span>Back to Homepage</span>
        </button>
      </div>

      <div className="border-t border-[#E5EAF2] pt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-4">
          Popular Document Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <button
            onClick={() => onSelectTool('merge-pdf')}
            className="saas-card bg-white border border-[#E5EAF2] p-4 rounded-xl hover:border-[#4F46E5] text-[#101828] hover:text-[#4F46E5] transition-all flex items-center space-x-3 text-sm font-medium cursor-pointer shadow-2xs"
          >
            <Files className="w-4 h-4 text-[#2563EB]" strokeWidth={2} />
            <span>Merge PDF</span>
          </button>
          <button
            onClick={() => onSelectTool('compress-pdf')}
            className="saas-card bg-white border border-[#E5EAF2] p-4 rounded-xl hover:border-[#4F46E5] text-[#101828] hover:text-[#4F46E5] transition-all flex items-center space-x-3 text-sm font-medium cursor-pointer shadow-2xs"
          >
            <Minimize2 className="w-4 h-4 text-[#4F46E5]" strokeWidth={2} />
            <span>Compress PDF</span>
          </button>
          <button
            onClick={() => onSelectTool('split-pdf')}
            className="saas-card bg-white border border-[#E5EAF2] p-4 rounded-xl hover:border-[#4F46E5] text-[#101828] hover:text-[#4F46E5] transition-all flex items-center space-x-3 text-sm font-medium cursor-pointer shadow-2xs"
          >
            <Scissors className="w-4 h-4 text-amber-500" strokeWidth={2} />
            <span>Split PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
