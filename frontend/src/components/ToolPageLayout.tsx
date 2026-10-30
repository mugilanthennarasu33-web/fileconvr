import React from 'react';
import { FileText } from 'lucide-react';
import { ModernTurboIcon, ModernShieldIcon } from './ModernIcons';
import { ToolSeoSection } from './ToolSeoSection';
import type { ToolSeoContent } from '../data/seoData';

interface ToolPageLayoutProps {
  toolShortName: string;
  toolHeading: string;
  toolSubtitle: string;
  onBack: () => void;
  children: React.ReactNode;
  seoContent?: ToolSeoContent;
  onNavigateTool?: (toolId: string) => void;
  benefit1Title?: string;
  benefit1Desc?: string;
  benefit2Title?: string;
  benefit2Desc?: string;
  benefit3Title?: string;
  benefit3Desc?: string;
  step1Title?: string;
  step1Desc?: string;
  step2Title?: string;
  step2Desc?: string;
  step3Title?: string;
  step3Desc?: string;
}

export const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({
  toolShortName,
  toolHeading,
  toolSubtitle,
  onBack,
  children,
  seoContent,
  onNavigateTool,
  benefit1Title = 'High Accuracy',
  benefit1Desc = 'Maintains formatting',
  benefit2Title = 'Fast Conversion',
  benefit2Desc = 'In seconds',
  benefit3Title = 'Secure & Private',
  benefit3Desc = 'Your files are safe',
  step1Title = 'Upload',
  step1Desc = 'Select your file',
  step2Title = 'Process',
  step2Desc = 'Our system processes it',
  step3Title = 'Download',
  step3Desc = 'Get your result file',
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumbs matching reference image */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-slate-600 mb-6 font-medium">
        <button
          onClick={onBack}
          className="hover:text-indigo-600 transition-colors cursor-pointer"
        >
          Tools
        </button>
        <span className="text-slate-400">&gt;</span>
        <span className="font-bold text-slate-900">
          {toolShortName}
        </span>
      </nav>

      {/* Centered Heading and Subtitle matching reference */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          {toolHeading}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">
          {toolSubtitle}
        </p>
      </div>

      {/* Main Interactive Tool Body (Uploader / File List / Form / Actions) */}
      <div className="mb-10">
        {children}
      </div>

      {/* 3 Benefit Cards matching reference */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="saas-card p-4 rounded-2xl flex items-center space-x-3.5 group bg-white border border-slate-200">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-blue-50 to-blue-100/70 border border-blue-200/90 shadow-[0_2px_8px_rgba(59,130,246,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
            <FileText className="w-5 h-5 text-blue-600" strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm font-heading">
              {benefit1Title}
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              {benefit1Desc}
            </div>
          </div>
        </div>

        <div className="saas-card p-4 rounded-2xl flex items-center space-x-3.5 group bg-white border border-slate-200">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-indigo-50 to-indigo-100/70 border border-indigo-200/90 shadow-[0_2px_8px_rgba(99,102,241,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
            <ModernTurboIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm font-heading">
              {benefit2Title}
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              {benefit2Desc}
            </div>
          </div>
        </div>

        <div className="saas-card p-4 rounded-2xl flex items-center space-x-3.5 group bg-white border border-slate-200">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-emerald-50 to-emerald-100/70 border border-emerald-200/90 shadow-[0_2px_8px_rgba(16,185,129,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
            <ModernShieldIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm font-heading">
              {benefit3Title}
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              {benefit3Desc}
            </div>
          </div>
        </div>
      </div>

      {/* How to Workflow 3-Step Section matching reference */}
      <div className="my-10">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading text-center mb-6">
          How to {toolShortName}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="saas-card p-5 rounded-2xl text-center bg-white border border-slate-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center mx-auto mb-3 shadow-xs">
              1
            </div>
            <div className="font-bold text-slate-900 text-sm mb-1 font-heading">
              {step1Title}
            </div>
            <div className="text-xs text-slate-600">
              {step1Desc}
            </div>
          </div>

          <div className="saas-card p-5 rounded-2xl text-center bg-white border border-slate-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center mx-auto mb-3 shadow-xs">
              2
            </div>
            <div className="font-bold text-slate-900 text-sm mb-1 font-heading">
              {step2Title}
            </div>
            <div className="text-xs text-slate-600">
              {step2Desc}
            </div>
          </div>

          <div className="saas-card p-5 rounded-2xl text-center bg-white border border-slate-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center mx-auto mb-3 shadow-xs">
              3
            </div>
            <div className="font-bold text-slate-900 text-sm mb-1 font-heading">
              {step3Title}
            </div>
            <div className="text-xs text-slate-600">
              {step3Desc}
            </div>
          </div>
        </div>
      </div>

      {/* SEO Section if content exists */}
      {seoContent && (
        <ToolSeoSection
          content={seoContent}
          onNavigateTool={onNavigateTool}
        />
      )}
    </div>
  );
};
