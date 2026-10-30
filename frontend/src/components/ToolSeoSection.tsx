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
    <section className="mt-16 pt-12 border-t border-[#E5EAF2] text-[#101828]">
      {/* 1. How It Works Steps */}
      <div className="mb-14">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[#4F46E5] text-xs font-semibold mb-3 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-[#4F46E5]" strokeWidth={2} />
            <span>Fast & Simple Process</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] font-heading">
            How to Use {content.h1}
          </h2>
          <p className="text-sm text-[#64748B] mt-2 font-medium">
            Follow these straightforward steps to complete your document task in seconds without installing software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.howToSteps.map((step, idx) => (
            <div
              key={idx}
              className="saas-card bg-white border border-[#E5EAF2] p-5 rounded-2xl relative flex flex-col justify-between shadow-xs"
            >
              <div>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white font-bold text-sm mb-3 shadow-sm">
                  {idx + 1}
                </span>
                <p className="text-sm text-[#101828] leading-relaxed font-medium">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Key Capabilities & Technical Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-14">
        {/* Features Card */}
        <div className="lg:col-span-2 saas-card bg-white border border-[#E5EAF2] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="p-2 rounded-xl bg-indigo-50 text-[#4F46E5] border border-indigo-100">
              <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-[#101828] font-heading">Key Features & Highlights</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {content.features.map((feat, i) => (
              <div key={i} className="flex items-start space-x-2 text-sm text-[#64748B]">
                <span className="text-[#4F46E5] font-bold mt-0.5">•</span>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Formats & Lifecycle Specs */}
        <div className="saas-card bg-white border border-[#E5EAF2] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="p-2 rounded-xl bg-emerald-50 text-[#10B981] border border-emerald-100">
                <FileCheck className="w-5 h-5" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-[#101828] font-heading">Technical Specs</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-[#64748B]">
              <li className="flex justify-between py-1.5 border-b border-[#E5EAF2]">
                <span className="text-[#64748B]">Supported Input:</span>
                <span className="font-semibold text-[#101828]">{content.supportedFormats.input.join(', ')}</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-[#E5EAF2]">
                <span className="text-[#64748B]">Output Format:</span>
                <span className="font-semibold text-[#101828]">{content.supportedFormats.output.join(', ')}</span>
              </li>
              <li className="flex justify-between py-1.5 border-b border-[#E5EAF2]">
                <span className="text-[#64748B]">Max File Size:</span>
                <span className="font-semibold text-[#101828]">{content.supportedFormats.maxSizeMB} MB</span>
              </li>
              <li className="flex justify-between py-1.5">
                <span className="text-[#64748B]">Compatibility:</span>
                <span className="font-semibold text-[#101828]">All modern browsers</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E5EAF2] flex items-start space-x-2 text-[11px] text-[#64748B]">
            <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2} />
            <span>{content.privacyNotice}</span>
          </div>
        </div>
      </div>

      {/* 3. Frequently Asked Questions (FAQ) with Accordion */}
      {content.faqs && content.faqs.length > 0 && (
        <div className="mb-14">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[#4F46E5] text-xs font-semibold mb-3 shadow-2xs">
              <HelpCircle className="w-3.5 h-3.5 text-[#4F46E5]" strokeWidth={2} />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] font-heading">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#64748B] mt-2 font-medium">
              Everything you need to know about processing files with {content.h1}.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {content.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="saas-card bg-white border border-[#E5EAF2] rounded-xl overflow-hidden shadow-2xs"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between text-[#101828] font-semibold text-sm hover:text-[#4F46E5] transition-colors focus:outline-none cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#64748B] transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? 'rotate-180 text-[#4F46E5]' : ''
                      }`}
                      strokeWidth={2}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-[#64748B] border-t border-[#E5EAF2] pt-3 leading-relaxed animate-fade-in">
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
              <Layers className="w-4 h-4 text-[#4F46E5]" strokeWidth={2} />
              <h3 className="text-base font-bold text-[#101828] font-heading">Related Document Utilities</h3>
            </div>
            <span className="text-xs text-[#64748B] font-medium">Discover more free tools</span>
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
                className="saas-card bg-white border border-[#E5EAF2] p-4 rounded-xl hover:border-[#4F46E5] block group cursor-pointer transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-[#101828] group-hover:text-[#4F46E5] transition-colors">
                    {tool.title}
                  </h4>
                  <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#4F46E5] group-hover:translate-x-0.5 transition-all" strokeWidth={2} />
                </div>
                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
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
