import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import type { ProcessingState } from '../types';
import { FileFormatIcon } from './FileFormatIcon';

interface ProcessingModalProps {
  state: ProcessingState;
  statusMessage?: string;
  sourceFormat?: string;
  targetFormat?: string;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  state,
  statusMessage,
  sourceFormat = 'pdf',
  targetFormat = 'word',
}) => {
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    if (state !== 'uploading' && state !== 'processing') {
      setProgress(25);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 92;
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [state]);

  if (state !== 'uploading' && state !== 'processing') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="max-w-xl w-full my-8">
        {/* Main Converting Card */}
        <div className="bg-white p-6 sm:p-8 text-center rounded-3xl shadow-2xl border border-[#E5EAF2] relative overflow-hidden">
          {/* Header */}
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#101828] font-heading mb-1">
            Converting Your File...
          </h3>
          <p className="text-xs sm:text-sm text-[#64748B] mb-8 font-normal">
            {statusMessage || 'Please wait while we convert and optimize your document.'}
          </p>

          {/* Dual Format Animated Flow */}
          <div className="flex items-center justify-center space-x-6 sm:space-x-10 mb-8">
            {/* Source Card */}
            <div className="p-3.5 bg-white rounded-2xl border border-[#E5EAF2] shadow-sm">
              <FileFormatIcon format={sourceFormat} size="md" />
            </div>

            {/* Animated Connector Dots */}
            <div className="flex items-center space-x-1 text-[#4F46E5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse delay-75" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse delay-150" />
              <ArrowRight className="w-5 h-5 ml-1 text-[#4F46E5] animate-pulse" />
            </div>

            {/* Target Card */}
            <div className="p-3.5 bg-white rounded-2xl border border-[#E5EAF2] shadow-sm">
              <FileFormatIcon format={targetFormat} size="md" />
            </div>
          </div>

          {/* Progress Bar & Percentage */}
          <div className="max-w-md mx-auto mb-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#101828] mb-2">
              <span>Processing...</span>
              <span className="text-[#4F46E5] font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-[#F7F9FF] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#E5EAF2]">
              <div
                className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-[#94A3B8]">
            This may take a few seconds. Please don't close this page.
          </p>
        </div>

        {/* While You Wait info cards matching reference image */}
        <div className="mt-4">
          <div className="text-xs font-semibold text-[#64748B] mb-2 px-1">
            While you wait...
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5EAF2] shadow-2xs flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#64748B] leading-snug">
                Files are securely processed and automatically deleted.
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5EAF2] shadow-2xs flex items-start space-x-2.5">
              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#64748B] leading-snug">
                Large files may take longer to process.
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5EAF2] shadow-2xs flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#64748B] leading-snug">
                You'll be redirected automatically when done.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
