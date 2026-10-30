import React from 'react';

export const PdfToWordThumbnail: React.FC = () => (
  <div className="w-full h-36 bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-slate-100/60 flex items-center justify-center p-4 relative overflow-hidden select-none border-b border-[#E5EAF2]">
    <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] opacity-50" />
    
    <div className="relative z-10 flex items-center space-x-4">
      {/* Red PDF Card */}
      <div className="w-14 h-18 bg-white rounded-xl shadow-md border border-red-200 p-2 flex flex-col justify-between transform -rotate-3 transition-transform group-hover:-rotate-6">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-red-600 bg-red-50 px-1 rounded">PDF</span>
          <div className="w-2 h-2 rounded-full bg-red-400" />
        </div>
        <div className="space-y-1 my-1">
          <div className="w-8 h-1 rounded bg-slate-200" />
          <div className="w-6 h-1 rounded bg-slate-200" />
          <div className="w-7 h-1 rounded bg-slate-200" />
        </div>
        <div className="w-4 h-1 rounded bg-red-400/80" />
      </div>

      {/* Conversion Arrow */}
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white flex items-center justify-center shadow-md">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
        <span className="text-[9px] font-bold text-[#4F46E5] mt-1">100% Exact</span>
      </div>

      {/* Blue Word Card */}
      <div className="w-14 h-18 bg-white rounded-xl shadow-md border border-blue-200 p-2 flex flex-col justify-between transform rotate-3 transition-transform group-hover:rotate-6">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1 rounded">DOCX</span>
          <div className="w-2 h-2 rounded-full bg-blue-400" />
        </div>
        <div className="space-y-1 my-1">
          <div className="w-8 h-1 rounded bg-blue-200" />
          <div className="w-7 h-1 rounded bg-slate-200" />
          <div className="w-5 h-1 rounded bg-slate-200" />
        </div>
        <div className="w-5 h-1 rounded bg-blue-500" />
      </div>
    </div>
  </div>
);

export const TopToolsThumbnail: React.FC = () => (
  <div className="w-full h-36 bg-gradient-to-br from-purple-50/80 via-violet-50/50 to-slate-100/60 flex items-center justify-center p-4 relative overflow-hidden select-none border-b border-[#E5EAF2]">
    <div className="relative z-10 flex items-center justify-center space-x-2">
      {/* 4 Overlapping Mini Tool Emblems */}
      <div className="w-11 h-13 bg-white rounded-lg shadow-md border border-red-200 p-1.5 flex flex-col items-center justify-between transform -rotate-12 group-hover:-rotate-16 transition-transform">
        <span className="text-[8px] font-black text-red-500">PDF</span>
        <div className="w-5 h-5 rounded-md bg-red-100 flex items-center justify-center text-red-600 font-bold text-[9px]">P</div>
      </div>

      <div className="w-11 h-13 bg-white rounded-lg shadow-md border border-blue-200 p-1.5 flex flex-col items-center justify-between transform -rotate-3 group-hover:-rotate-6 transition-transform z-10">
        <span className="text-[8px] font-black text-blue-600">DOC</span>
        <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[9px]">W</div>
      </div>

      <div className="w-11 h-13 bg-white rounded-lg shadow-md border border-orange-200 p-1.5 flex flex-col items-center justify-between transform rotate-3 group-hover:rotate-6 transition-transform z-10">
        <span className="text-[8px] font-black text-orange-500">PPT</span>
        <div className="w-5 h-5 rounded-md bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-[9px]">P</div>
      </div>

      <div className="w-11 h-13 bg-white rounded-lg shadow-md border border-emerald-200 p-1.5 flex flex-col items-center justify-between transform rotate-12 group-hover:rotate-16 transition-transform">
        <span className="text-[8px] font-black text-emerald-600">XLS</span>
        <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-[9px]">X</div>
      </div>
    </div>

    {/* Sparkle badge */}
    <div className="absolute bottom-2 px-2.5 py-0.5 rounded-full bg-white/95 shadow-xs border border-purple-200 text-[10px] font-bold text-[#4F46E5]">
      ✦ 10 Essential Utilities
    </div>
  </div>
);

export const StudentsThumbnail: React.FC = () => (
  <div className="w-full h-36 bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-slate-100/60 flex items-center justify-center p-4 relative overflow-hidden select-none border-b border-[#E5EAF2]">
    <div className="relative z-10 flex items-center space-x-3">
      {/* Student Study Workspace Artwork */}
      <div className="w-24 h-16 bg-white rounded-xl shadow-md border border-emerald-200 p-2 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[8px] font-bold text-emerald-600">Free Tools</span>
        </div>
        <div className="space-y-1">
          <div className="w-14 h-1 rounded bg-slate-200" />
          <div className="w-10 h-1 rounded bg-emerald-200" />
        </div>
        <div className="flex items-center justify-between text-[8px] text-slate-400 font-mono">
          <span>Assignments</span>
          <span>✓ Done</span>
        </div>
      </div>

      {/* Graduation & Notes badge */}
      <div className="flex flex-col space-y-1.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>
        <span className="text-[9px] font-bold text-[#64748B]">Fast & Free</span>
      </div>
    </div>
  </div>
);
