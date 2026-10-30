import React from 'react';

export const HeroOrbitalGraphic: React.FC = () => {
  return (
    <div className="relative w-full max-w-[460px] h-[380px] sm:h-[420px] mx-auto flex items-center justify-center select-none">
      {/* Background circular orbit track and connector arrows SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 460 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Arrowhead markers */}
          <marker
            id="arrow-red"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#EF4444" />
          </marker>
          <marker
            id="arrow-blue"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#3B82F6" />
          </marker>
          <marker
            id="arrow-orange"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#F97316" />
          </marker>
          <marker
            id="arrow-green"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10B981" />
          </marker>
        </defs>

        {/* Outer subtle circular track */}
        <circle
          cx="230"
          cy="210"
          r="150"
          stroke="#E2E8F0"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />

        {/* Subtle sparkle accents */}
        <circle cx="230" cy="60" r="3" fill="#6366F1" opacity="0.3" />
        <circle cx="380" cy="210" r="3" fill="#3B82F6" opacity="0.3" />
        <circle cx="80" cy="210" r="3" fill="#EF4444" opacity="0.3" />
        <circle cx="230" cy="360" r="3" fill="#10B981" opacity="0.3" />

        {/* 1. Curved Arrow: Top-Left (PDF) -> Center */}
        <path
          d="M 125 95 C 165 95 175 145 180 165"
          stroke="#EF4444"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 3"
          markerEnd="url(#arrow-red)"
          opacity="0.9"
        />

        {/* 2. Curved Arrow: Top-Right (DOC) -> Center */}
        <path
          d="M 335 95 C 295 95 285 145 280 165"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 3"
          markerEnd="url(#arrow-blue)"
          opacity="0.9"
        />

        {/* 3. Curved Arrow: Bottom-Left (PPT) -> Center */}
        <path
          d="M 125 325 C 165 325 175 275 180 255"
          stroke="#F97316"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 3"
          markerEnd="url(#arrow-orange)"
          opacity="0.9"
        />

        {/* 4. Curved Arrow: Bottom-Right (XLS) -> Center */}
        <path
          d="M 335 325 C 295 325 285 275 280 255"
          stroke="#10B981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 3"
          markerEnd="url(#arrow-green)"
          opacity="0.9"
        />
      </svg>

      {/* Central Hub Card: fileconvrt (Official brand emblem) */}
      <div className="relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-3xl bg-white border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center p-4 transition-transform hover:scale-102">
        <img
          src="/logo-mark.png"
          alt="fileconvrt emblem"
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain filter drop-shadow-sm"
        />
        <div className="mt-2 text-lg font-black tracking-tight text-slate-900 font-heading">
          fileconvrt
        </div>
      </div>

      {/* Satellite Card 1: Top-Left -> Red PDF */}
      <div className="absolute top-4 left-6 sm:left-8 z-20 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-md flex flex-col items-center w-18 sm:w-20 transition-transform hover:-translate-y-1">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-red-500 to-red-600 flex items-center justify-center shadow-xs">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 7C9.5 7 8 8.8 8 11C8 13.5 10.5 15 12 15C13.5 15 16 13.5 16 11C16 8.8 14.5 7 12 7ZM12 9C13 9 14 10 14 11C14 12 13 13 12 13C11 13 10 12 10 11C10 10 11 9 12 9Z"
              fill="white"
            />
          </svg>
        </div>
        <span className="mt-1.5 px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[9px] tracking-wide shadow-2xs">
          PDF
        </span>
      </div>

      {/* Satellite Card 2: Top-Right -> Blue DOC */}
      <div className="absolute top-4 right-6 sm:right-8 z-20 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-md flex flex-col items-center w-18 sm:w-20 transition-transform hover:-translate-y-1">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center shadow-xs">
          <span className="text-white font-black text-xl leading-none font-heading">W</span>
        </div>
        <span className="mt-1.5 px-2 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-[9px] tracking-wide shadow-2xs">
          DOC
        </span>
      </div>

      {/* Satellite Card 3: Bottom-Left -> Orange PPT */}
      <div className="absolute bottom-4 left-6 sm:left-8 z-20 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-md flex flex-col items-center w-18 sm:w-20 transition-transform hover:-translate-y-1">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 flex items-center justify-center shadow-xs">
          <span className="text-white font-black text-xl leading-none font-heading">P</span>
        </div>
        <span className="mt-1.5 px-2 py-0.5 rounded-full bg-orange-600 text-white font-extrabold text-[9px] tracking-wide shadow-2xs">
          PPT
        </span>
      </div>

      {/* Satellite Card 4: Bottom-Right -> Green XLS */}
      <div className="absolute bottom-4 right-6 sm:right-8 z-20 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-md flex flex-col items-center w-18 sm:w-20 transition-transform hover:-translate-y-1">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xs">
          <span className="text-white font-black text-xl leading-none font-heading">X</span>
        </div>
        <span className="mt-1.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[9px] tracking-wide shadow-2xs">
          XLS
        </span>
      </div>
    </div>
  );
};
