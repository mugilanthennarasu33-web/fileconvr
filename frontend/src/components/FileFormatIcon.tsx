import React from 'react';

export type FileFormat =
  | 'pdf'
  | 'word'
  | 'doc'
  | 'docx'
  | 'excel'
  | 'xls'
  | 'xlsx'
  | 'ppt'
  | 'pptx'
  | 'image'
  | 'jpg'
  | 'jpeg'
  | 'png'
  | 'zip'
  | 'merge'
  | 'split'
  | 'compress'
  | 'rotate'
  | 'protect'
  | 'unlock'
  | 'ocr'
  | 'ai'
  | 'compare'
  | 'generic';

interface FileFormatIconProps {
  format: FileFormat | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  showPill?: boolean;
  showBadge?: boolean;
}

export const FileFormatIcon: React.FC<FileFormatIconProps> = ({
  format,
  size = 'md',
  className = '',
  showPill: propShowPill = true,
  showBadge,
}) => {
  const showPill = showBadge !== undefined ? showBadge : propShowPill;
  const norm = format.toLowerCase().trim();

  // Pixel sizes for the container
  const sizes = {
    xs: { box: 24, icon: 12, pillH: 10, font: '7px' },
    sm: { box: 34, icon: 16, pillH: 12, font: '8px' },
    md: { box: 48, icon: 24, pillH: 16, font: '9px' },
    lg: { box: 64, icon: 32, pillH: 20, font: '11px' },
    xl: { box: 80, icon: 40, pillH: 24, font: '13px' },
    hero: { box: 96, icon: 48, pillH: 28, font: '15px' },
  }[size];

  // 1. PDF — Red document with Adobe curve and red PDF pill
  if (norm.includes('pdf')) {
    return (
      <div
        style={{ width: sizes.box, height: sizes.box }}
        className={`relative inline-flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-red-50/80 to-red-100/40 border border-red-200/80 shadow-sm shrink-0 select-none ${className}`}
      >
        <svg
          width={sizes.icon}
          height={sizes.icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-red-500 drop-shadow-sm"
        >
          <path
            d="M7 3C5.34315 3 4 4.34315 4 6V18C4 19.6569 5.34315 21 7 21H17C18.6569 21 20 19.6569 20 18V8.41421C20 7.6186 19.6839 6.85558 19.1213 6.29289L15.7071 2.87868C15.1444 2.31599 14.3814 2 13.5858 2H7C5.34315 2 4 3.34315 4 5"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 2V7C14 7.55228 14.4477 8 15 8H20"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Adobe PDF swirl */}
          <path
            d="M9 13C9 11.5 10.5 11 12 11C13.5 11 15 11.5 15 13C15 14.5 13 16 12 17C11 16 9 14.5 9 13Z"
            fill="#EF4444"
          />
        </svg>

        {showPill && (
          <span
            style={{ fontSize: sizes.font, height: sizes.pillH }}
            className="absolute -bottom-1.5 px-1.5 rounded-full bg-red-500 text-white font-black tracking-tight flex items-center justify-center shadow-sm"
          >
            PDF
          </span>
        )}
      </div>
    );
  }

  // 2. Word — Blue document with W and DOC pill
  if (norm.includes('word') || norm.includes('doc')) {
    return (
      <div
        style={{ width: sizes.box, height: sizes.box }}
        className={`relative inline-flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-blue-50/80 to-blue-100/40 border border-blue-200/80 shadow-sm shrink-0 select-none ${className}`}
      >
        <svg
          width={sizes.icon}
          height={sizes.icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-blue-600 drop-shadow-sm"
        >
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#2563EB" />
          <path
            d="M7 8L9 16L12 9.5L15 16L17 8"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {showPill && (
          <span
            style={{ fontSize: sizes.font, height: sizes.pillH }}
            className="absolute -bottom-1.5 px-1.5 rounded-full bg-blue-600 text-white font-black tracking-tight flex items-center justify-center shadow-sm"
          >
            DOC
          </span>
        )}
      </div>
    );
  }

  // 3. PowerPoint — Orange document with P and PPT pill
  if (norm.includes('ppt') || norm.includes('powerpoint')) {
    return (
      <div
        style={{ width: sizes.box, height: sizes.box }}
        className={`relative inline-flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-orange-50/80 to-orange-100/40 border border-orange-200/80 shadow-sm shrink-0 select-none ${className}`}
      >
        <svg
          width={sizes.icon}
          height={sizes.icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-orange-500 drop-shadow-sm"
        >
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#F97316" />
          <path
            d="M8.5 7H13C14.6569 7 16 8.34315 16 10C16 11.6569 14.6569 13 13 13H8.5V17"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {showPill && (
          <span
            style={{ fontSize: sizes.font, height: sizes.pillH }}
            className="absolute -bottom-1.5 px-1.5 rounded-full bg-orange-500 text-white font-black tracking-tight flex items-center justify-center shadow-sm"
          >
            PPT
          </span>
        )}
      </div>
    );
  }

  // 4. Excel — Green document with X and XLS pill
  if (norm.includes('excel') || norm.includes('xls') || norm.includes('table')) {
    return (
      <div
        style={{ width: sizes.box, height: sizes.box }}
        className={`relative inline-flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-emerald-50/80 to-emerald-100/40 border border-emerald-200/80 shadow-sm shrink-0 select-none ${className}`}
      >
        <svg
          width={sizes.icon}
          height={sizes.icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-emerald-500 drop-shadow-sm"
        >
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#10B981" />
          <path
            d="M8 8L16 16M16 8L8 16"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {showPill && (
          <span
            style={{ fontSize: sizes.font, height: sizes.pillH }}
            className="absolute -bottom-1.5 px-1.5 rounded-full bg-emerald-600 text-white font-black tracking-tight flex items-center justify-center shadow-sm"
          >
            XLS
          </span>
        )}
      </div>
    );
  }

  // 5. Image / JPG / PNG — Violet square with photo frame
  if (norm.includes('image') || norm.includes('img') || norm.includes('jpg') || norm.includes('png')) {
    return (
      <div
        style={{ width: sizes.box, height: sizes.box }}
        className={`relative inline-flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-purple-50/80 to-purple-100/40 border border-purple-200/80 shadow-sm shrink-0 select-none ${className}`}
      >
        <div className="w-7 h-7 rounded-xl bg-purple-600 flex items-center justify-center shadow-sm">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="white" />
            <path d="M21 15L16 10L5 21" />
          </svg>
        </div>

        {showPill && (
          <span
            style={{ fontSize: sizes.font, height: sizes.pillH }}
            className="absolute -bottom-1.5 px-1.5 rounded-full bg-purple-600 text-white font-black tracking-tight flex items-center justify-center shadow-sm"
          >
            IMG
          </span>
        )}
      </div>
    );
  }

  // 6. Merge PDF — 3 Stacked Isometric Layers (Purple/Violet)
  if (norm.includes('merge')) {
    return (
      <div
        style={{ width: sizes.box, height: sizes.box }}
        className={`relative inline-flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-indigo-50/80 to-purple-100/40 border border-indigo-200/80 shadow-sm shrink-0 select-none ${className}`}
      >
        <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm text-white">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.4" />
            <path d="M2 17L12 22L22 17" />
            <path d="M2 12L12 17L22 12" />
          </svg>
        </div>

        {showPill && (
          <span
            style={{ fontSize: sizes.font, height: sizes.pillH }}
            className="absolute -bottom-1.5 px-1.5 rounded-full bg-indigo-600 text-white font-black tracking-tight flex items-center justify-center shadow-sm"
          >
            MERGE
          </span>
        )}
      </div>
    );
  }

  // 7. Split PDF — Orange document with cut line and SPLIT pill
  if (norm.includes('split')) {
    return (
      <div
        style={{ width: sizes.box, height: sizes.box }}
        className={`relative inline-flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-orange-50/80 to-amber-100/40 border border-orange-200/80 shadow-sm shrink-0 select-none ${className}`}
      >
        <svg
          width={sizes.icon}
          height={sizes.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#EA580C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3v18" strokeDasharray="3 3" />
          <path d="M18 3v18" />
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M20 4L8.12 15.88" />
          <path d="M14.47 14.48L20 20" />
          <path d="M8.12 8.12L12 12" />
        </svg>

        {showPill && (
          <span
            style={{ fontSize: sizes.font, height: sizes.pillH }}
            className="absolute -bottom-1.5 px-1.5 rounded-full bg-orange-600 text-white font-black tracking-tight flex items-center justify-center shadow-sm"
          >
            SPLIT
          </span>
        )}
      </div>
    );
  }

  // 8. Compress PDF — Green document with inward arrows and ZIP pill
  if (norm.includes('compress') || norm.includes('zip')) {
    return (
      <div
        style={{ width: sizes.box, height: sizes.box }}
        className={`relative inline-flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-emerald-50/80 to-emerald-100/40 border border-emerald-200/80 shadow-sm shrink-0 select-none ${className}`}
      >
        <svg
          width={sizes.icon}
          height={sizes.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 14h6m0 0v6m0-6L3 21" />
          <path d="M20 10h-6m0 0V4m0 6l7-7" />
        </svg>

        {showPill && (
          <span
            style={{ fontSize: sizes.font, height: sizes.pillH }}
            className="absolute -bottom-1.5 px-1.5 rounded-full bg-emerald-600 text-white font-black tracking-tight flex items-center justify-center shadow-sm"
          >
            COMP
          </span>
        )}
      </div>
    );
  }

  // 9. Protect PDF — Rose/Red document with lock
  if (norm.includes('protect') || norm.includes('lock') && !norm.includes('unlock')) {
    return (
      <div
        style={{ width: sizes.box, height: sizes.box }}
        className={`relative inline-flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-rose-50/80 to-rose-100/40 border border-rose-200/80 shadow-sm shrink-0 select-none ${className}`}
      >
        <svg
          width={sizes.icon}
          height={sizes.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#E11D48"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>

        {showPill && (
          <span
            style={{ fontSize: sizes.font, height: sizes.pillH }}
            className="absolute -bottom-1.5 px-1.5 rounded-full bg-rose-600 text-white font-black tracking-tight flex items-center justify-center shadow-sm"
          >
            LOCK
          </span>
        )}
      </div>
    );
  }

  // 10. Unlock PDF — Green document with open lock
  if (norm.includes('unlock')) {
    return (
      <div
        style={{ width: sizes.box, height: sizes.box }}
        className={`relative inline-flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-emerald-50/80 to-emerald-100/40 border border-emerald-200/80 shadow-sm shrink-0 select-none ${className}`}
      >
        <svg
          width={sizes.icon}
          height={sizes.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#059669"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>

        {showPill && (
          <span
            style={{ fontSize: sizes.font, height: sizes.pillH }}
            className="absolute -bottom-1.5 px-1.5 rounded-full bg-emerald-600 text-white font-black tracking-tight flex items-center justify-center shadow-sm"
          >
            OPEN
          </span>
        )}
      </div>
    );
  }

  // 11. OCR — Indigo document with scanner line
  if (norm.includes('ocr')) {
    return (
      <div
        style={{ width: sizes.box, height: sizes.box }}
        className={`relative inline-flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-indigo-50/80 to-indigo-100/40 border border-indigo-200/80 shadow-sm shrink-0 select-none ${className}`}
      >
        <svg
          width={sizes.icon}
          height={sizes.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4F46E5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
          <line x1="7" y1="12" x2="17" y2="12" />
        </svg>

        {showPill && (
          <span
            style={{ fontSize: sizes.font, height: sizes.pillH }}
            className="absolute -bottom-1.5 px-1.5 rounded-full bg-indigo-600 text-white font-black tracking-tight flex items-center justify-center shadow-sm"
          >
            OCR
          </span>
        )}
      </div>
    );
  }

  // 12. Rotate — Blue document with circular arrow
  if (norm.includes('rotate')) {
    return (
      <div
        style={{ width: sizes.box, height: sizes.box }}
        className={`relative inline-flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-blue-50/80 to-blue-100/40 border border-blue-200/80 shadow-sm shrink-0 select-none ${className}`}
      >
        <svg
          width={sizes.icon}
          height={sizes.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2563EB"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
        </svg>

        {showPill && (
          <span
            style={{ fontSize: sizes.font, height: sizes.pillH }}
            className="absolute -bottom-1.5 px-1.5 rounded-full bg-blue-600 text-white font-black tracking-tight flex items-center justify-center shadow-sm"
          >
            TURN
          </span>
        )}
      </div>
    );
  }

  // 13. Summarize / AI — Violet document with sparkles
  if (norm.includes('summarize') || norm.includes('ai')) {
    return (
      <div
        style={{ width: sizes.box, height: sizes.box }}
        className={`relative inline-flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-violet-50/80 to-purple-100/40 border border-violet-200/80 shadow-sm shrink-0 select-none ${className}`}
      >
        <svg
          width={sizes.icon}
          height={sizes.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#7C3AED"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3l1.912 5.885L20 10.8l-4.5 4.385L16.5 21 12 17.5 7.5 21l1-5.815L4 10.8l6.088-1.915L12 3z" fill="#EDE9FE" />
        </svg>

        {showPill && (
          <span
            style={{ fontSize: sizes.font, height: sizes.pillH }}
            className="absolute -bottom-1.5 px-1.5 rounded-full bg-violet-600 text-white font-black tracking-tight flex items-center justify-center shadow-sm"
          >
            AI
          </span>
        )}
      </div>
    );
  }

  // 14. Generic fileconvr Logo Icon — Blue folded sheet with 3 bars
  return (
    <div
      style={{ width: sizes.box, height: sizes.box }}
      className={`relative inline-flex flex-col items-center justify-center rounded-2xl bg-indigo-600 shadow-md shrink-0 select-none ${className}`}
    >
      <svg
        width={sizes.icon}
        height={sizes.icon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7 2H14L19 7V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V4C5 2.89543 5.89543 2 7 2Z"
          fill="white"
        />
        <path
          d="M14 2V7H19L14 2Z"
          fill="#C7D2FE"
        />
        {/* 3 horizontal bars */}
        <line x1="8" y1="11" x2="16" y2="11" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="15" x2="16" y2="15" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="19" x2="13" y2="19" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
};
