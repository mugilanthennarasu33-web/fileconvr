import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { ToolDef } from '../types';
import { ToolIcon } from './ToolIcon';

interface ToolCardProps {
  tool: ToolDef;
  onSelect: (toolId: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
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
      className={`group relative p-4 rounded-2xl bg-white border border-[#E5EAF2] flex items-center justify-between text-left transition-all duration-200 cursor-pointer min-h-[92px] shadow-[0_1px_3px_rgba(16,24,40,0.03)] ${
        !isAvailable ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-md hover:border-[#CBD5E1]'
      }`}
    >
      <div className="flex items-center space-x-3.5 min-w-0 pr-2 flex-1">
        <div className="shrink-0 group-hover:scale-105 transition-transform duration-200">
          <ToolIcon toolId={tool.id} size="md" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-[15px] font-bold text-[#101828] group-hover:text-[#2563EB] transition-colors font-heading truncate">
              {tool.title}
            </h3>
            {tool.badge && (
              <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-200/60">
                {tool.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] line-clamp-2 mt-0.5 leading-relaxed font-normal">
            {tool.description}
          </p>
        </div>
      </div>

      <div className="w-8 h-8 rounded-full border border-[#E5EAF2] flex items-center justify-center text-slate-400 group-hover:text-[#2563EB] group-hover:border-[#93C5FD] shrink-0 transition-colors ml-2 bg-white shadow-2xs">
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
      </div>
    </a>
  );
};
