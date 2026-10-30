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
        title="404 — Page Not Found | fileconvr"
        description="The requested page could not be found. Explore our free online PDF tools including merge, split, compress, and convert."
        canonicalPath="/404"
        noindex={true}
      />

      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 mx-auto flex items-center justify-center mb-6">
        <FileQuestion className="w-8 h-8" />
      </div>

      <h1 className="text-4xl font-extrabold text-white font-heading mb-3">
        Page Not Found (404)
      </h1>
      <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">
        We couldn&apos;t find the page you were looking for. The link may have moved or been updated.
      </p>

      <div className="flex justify-center gap-4 mb-12">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold text-sm hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-500/20 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Back to Homepage</span>
        </button>
      </div>

      <div className="border-t border-slate-800/80 pt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
          Popular PDF Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <button
            onClick={() => onSelectTool('merge-pdf')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/40 text-slate-300 hover:text-white transition-all flex items-center space-x-3 text-sm font-medium"
          >
            <Files className="w-4 h-4 text-red-400" />
            <span>Merge PDF</span>
          </button>
          <button
            onClick={() => onSelectTool('compress-pdf')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/40 text-slate-300 hover:text-white transition-all flex items-center space-x-3 text-sm font-medium"
          >
            <Minimize2 className="w-4 h-4 text-rose-400" />
            <span>Compress PDF</span>
          </button>
          <button
            onClick={() => onSelectTool('split-pdf')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/40 text-slate-300 hover:text-white transition-all flex items-center space-x-3 text-sm font-medium"
          >
            <Scissors className="w-4 h-4 text-amber-400" />
            <span>Split PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
