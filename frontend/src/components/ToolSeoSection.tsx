import React, { useState } from 'react';
import {
  ChevronDown,
  ShieldCheck,
  Zap,
  CheckCircle2,
  FileCheck,
  HelpCircle,
  ArrowRight,
  Layers,
} from 'lucide-react';
import type { ToolSeoContent } from '../data/seoData';
import { TOOLS_DIRECTORY } from '../data/tools';

interface ToolSeoSectionProps {
  content: ToolSeoContent;
  onNavigateTool?: (toolSlug: string) => void;
}

export const ToolSeoSection: React.FC<ToolSeoSectionProps> = ({
  content,
  onNavigateTool,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const relatedToolDefs = TOOLS_DIRECTORY.filter((tool) =>
    content.relatedTools.includes(tool.id)
  );

  return (
    <section className="mt-16 pt-12 border-t border-slate-800/80 text-slate-200">
      {/* 1. How It Works Steps */}
      <div className="mb-14">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Fast & Simple Process</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
            How to Use {content.h1}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Follow these straightforward steps to complete your PDF task in seconds without installing software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.howToSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white font-bold text-sm mb-3 shadow-md shadow-red-500/20">
                  {idx + 1}
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Key Capabilities & Technical Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-14">
        {/* Features Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-slate-800/90">
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">Key Features & Highlights</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {content.features.map((feat, i) => (
              <div key={i} className="flex items-start space-x-2 text-sm text-slate-300">
                <span className="text-red-500 mt-0.5">•</span>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Formats & Lifecycle Specs */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">Technical Specs</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Supported Input:</span>
                <span className="font-semibold text-white">{content.supportedFormats.input.join(', ')}</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Output Format:</span>
                <span className="font-semibold text-white">{content.supportedFormats.output.join(', ')}</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Max File Size:</span>
                <span className="font-semibold text-white">{content.supportedFormats.maxSizeMB} MB</span>
              </li>
              <li className="flex justify-between py-1.5">
                <span className="text-slate-400">Compatibility:</span>
                <span className="font-semibold text-white">All modern browsers</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-start space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{content.privacyNotice}</span>
          </div>
        </div>
      </div>

      {/* 3. Frequently Asked Questions (FAQ) with Accordion */}
      {content.faqs && content.faqs.length > 0 && (
        <div className="mb-14">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Everything you need to know about processing files with {content.h1}.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {content.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between text-white font-semibold text-sm hover:text-red-400 transition-colors focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-red-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-slate-300 border-t border-slate-800/60 pt-3 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Related PDF Tools Internal Linking */}
      {relatedToolDefs.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-red-400" />
              <h3 className="text-base font-bold text-white font-heading">Related PDF Utilities</h3>
            </div>
            <span className="text-xs text-slate-400">Discover more free tools</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {relatedToolDefs.map((tool) => (
              <a
                key={tool.id}
                href={`/${tool.id}`}
                onClick={(e) => {
                  if (onNavigateTool && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    onNavigateTool(tool.id);
                  }
                }}
                className="group p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-red-500/40 transition-all duration-200 block"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">
                    {tool.title}
                  </h4>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
