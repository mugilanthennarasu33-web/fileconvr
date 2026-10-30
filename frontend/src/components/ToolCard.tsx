import React from 'react';
import * as Icons from 'lucide-react';
import type { ToolDef } from '../types';

interface ToolCardProps {
  tool: ToolDef;
  onSelect: (toolId: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  // Dynamically resolve icon from lucide-react or fallback
  const IconComponent = (Icons as any)[tool.iconName] || Icons.FileText;

  // Category color accents
  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    organize: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    optimize: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    convert: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    edit: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    security: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
    advanced: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
    ai: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  };

  const colors = categoryColors[tool.category] || categoryColors.organize;
  const isAvailable = !tool.badge?.startsWith('Milestone');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isAvailable) {
      e.preventDefault();
      return;
    }
    // Allow middle click or cmd/ctrl click to open in new tab
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;

    e.preventDefault();
    onSelect(tool.id);
  };

  return (
    <a
      href={`/${tool.id}`}
      onClick={handleClick}
      className={`glass-card relative rounded-2xl p-6 flex flex-col justify-between group block text-left ${
        !isAvailable ? 'opacity-60 cursor-not-allowed hover:transform-none hover:border-slate-800' : 'cursor-pointer'
      }`}
    >
      {/* Top row with icon & badge */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text} border ${colors.border} group-hover:scale-110 transition-transform duration-300 shadow-md`}
        >
          <IconComponent className="w-6 h-6" />
        </div>

        {tool.badge && (
          <span
            className={`text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full border ${
              tool.popular
                ? 'bg-red-500/15 text-red-400 border-red-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {tool.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div>
        <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors mb-2 font-heading">
          {tool.title}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
          {tool.description}
        </p>
      </div>

      {/* Bottom CTA affordance */}
      <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-red-400 transition-colors">
        <span>{isAvailable ? 'Open tool' : 'Coming soon'}</span>
        <Icons.ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </a>
  );
};
