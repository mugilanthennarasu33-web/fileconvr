import React from 'react';

interface ToolIconProps {
  toolId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ToolIcon: React.FC<ToolIconProps> = ({ toolId, size = 'md', className = '' }) => {
  // Dimensions
  const containerSize = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12';
  const iconPixel = size === 'sm' ? 24 : size === 'lg' ? 36 : 28;

  switch (toolId) {
    // 1. PDF to Word — Pastel red circle with red Acrobat document & Word badge
    case 'pdf-to-word':
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#FEE2E2] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            {/* Main Red PDF Document */}
            <path
              d="M7 5C7 3.89543 7.89543 3 9 3H19L25 9V27C25 28.1046 24.1046 29 23 29H9C7.89543 29 7 28.1046 7 27V5Z"
              fill="#EF4444"
            />
            {/* Folded Corner */}
            <path d="M19 3V9H25L19 3Z" fill="#FCA5A5" />
            {/* Adobe Ribbon Loop */}
            <path
              d="M16 11C13.5 11 12 12.8 12 15C12 17.5 14.5 19 16 19C17.5 19 20 17.5 20 15C20 12.8 18.5 11 16 11ZM16 13C17 13 18 14 18 15C18 16 17 17 16 17C15 17 14 16 14 15C14 14 15 13 16 13Z"
              fill="white"
            />
            {/* Overlapping Bottom-Right Mini Badge */}
            <rect x="17" y="19" width="11" height="9" rx="2.5" fill="#DC2626" />
            <path d="M19.5 22L20.8 26L22.5 23L24.2 26L25.5 22" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );

    // 2. Word to PDF — Pastel blue circle with blue Word "W" document & mini red PDF badge
    case 'word-to-pdf':
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#DBEAFE] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            {/* Main Blue Word Document */}
            <path
              d="M7 5C7 3.89543 7.89543 3 9 3H19L25 9V27C25 28.1046 24.1046 29 23 29H9C7.89543 29 7 28.1046 7 27V5Z"
              fill="#2563EB"
            />
            {/* Folded Corner */}
            <path d="M19 3V9H25L19 3Z" fill="#93C5FD" />
            {/* White Word 'W' */}
            <path
              d="M10.5 13L12.5 21L15 14.5L17.5 21L19.5 13"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Overlapping Bottom-Right Mini Red PDF Badge */}
            <rect x="17" y="19" width="11" height="9" rx="2.5" fill="#EF4444" />
            <path d="M20.5 21.5H23C23.6 21.5 24 21.9 24 22.5C24 23.1 23.6 23.5 23 23.5H20.5V26" stroke="white" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>
      );

    // 3. PDF to PPT — Pastel orange circle with orange PowerPoint document
    case 'pdf-to-ppt':
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#FFEDD5] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            {/* Main Orange PPT Document */}
            <path
              d="M7 5C7 3.89543 7.89543 3 9 3H19L25 9V27C25 28.1046 24.1046 29 23 29H9C7.89543 29 7 28.1046 7 27V5Z"
              fill="#F97316"
            />
            {/* Folded Corner */}
            <path d="M19 3V9H25L19 3Z" fill="#FDBA74" />
            {/* Adobe Ribbon Loop */}
            <path
              d="M16 11C13.5 11 12 12.8 12 15C12 17.5 14.5 19 16 19C17.5 19 20 17.5 20 15C20 12.8 18.5 11 16 11ZM16 13C17 13 18 14 18 15C18 16 17 17 16 17C15 17 14 16 14 15C14 14 15 13 16 13Z"
              fill="white"
            />
            {/* Overlapping Mini Orange PPT Badge */}
            <rect x="17" y="19" width="11" height="9" rx="2.5" fill="#EA580C" />
            <path d="M20.5 21.5H23C23.8 21.5 24.5 22.1 24.5 22.9C24.5 23.7 23.8 24.3 23 24.3H20.5V26.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>
      );

    // 4. PPT to PDF — Pastel coral circle with orange PowerPoint 'P' document & mini red PDF badge
    case 'ppt-to-pdf':
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#FFEDD5] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            {/* Main Orange PowerPoint Document */}
            <path
              d="M7 5C7 3.89543 7.89543 3 9 3H19L25 9V27C25 28.1046 24.1046 29 23 29H9C7.89543 29 7 28.1046 7 27V5Z"
              fill="#EA580C"
            />
            {/* Folded Corner */}
            <path d="M19 3V9H25L19 3Z" fill="#FDBA74" />
            {/* White PowerPoint 'P' */}
            <path
              d="M12.5 12H16C17.6569 12 19 13.3431 19 15C19 16.6569 17.6569 18 16 18H12.5V22"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Overlapping Bottom-Right Mini Red PDF Badge */}
            <rect x="17" y="19" width="11" height="9" rx="2.5" fill="#DC2626" />
            <circle cx="22.5" cy="23.5" r="2" stroke="white" strokeWidth="1" />
          </svg>
        </div>
      );

    // 5. Excel to PDF — Pastel green circle with green Excel 'X' spreadsheet document
    case 'excel-to-pdf':
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#D1FAE5] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            {/* Main Green Excel Document */}
            <path
              d="M7 5C7 3.89543 7.89543 3 9 3H19L25 9V27C25 28.1046 24.1046 29 23 29H9C7.89543 29 7 28.1046 7 27V5Z"
              fill="#10B981"
            />
            {/* Folded Corner */}
            <path d="M19 3V9H25L19 3Z" fill="#6EE7B7" />
            {/* White Excel 'X' */}
            <path d="M12 13L18 21" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M18 13L12 21" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            {/* Overlapping Bottom-Right Mini Green Badge */}
            <rect x="17" y="19" width="11" height="9" rx="2.5" fill="#059669" />
            <path d="M20.5 21.5L24.5 25.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <path d="M24.5 21.5L20.5 25.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>
      );

    // 6. JPG to PDF — Pastel purple circle with purple photo landscape card
    case 'img-to-pdf':
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#F3E8FF] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            {/* Purple Photo Container */}
            <rect x="6" y="5" width="20" height="22" rx="4" fill="#8B5CF6" />
            {/* White Sun Circle */}
            <circle cx="11.5" cy="11.5" r="2.5" fill="white" />
            {/* White Mountain Peaks */}
            <path
              d="M8 23L13 16L18 21L21 18L24 23H8Z"
              fill="white"
            />
          </svg>
        </div>
      );

    // 7. PDF to JPG — Pastel sky-blue circle with blue document & photo badge
    case 'pdf-to-img':
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#E0F2FE] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            {/* Main Blue PDF Document */}
            <path
              d="M7 5C7 3.89543 7.89543 3 9 3H19L25 9V27C25 28.1046 24.1046 29 23 29H9C7.89543 29 7 28.1046 7 27V5Z"
              fill="#0284C7"
            />
            {/* Folded Corner */}
            <path d="M19 3V9H25L19 3Z" fill="#7DD3FC" />
            {/* Adobe Swirl */}
            <path
              d="M16 11C13.5 11 12 12.8 12 15C12 17.5 14.5 19 16 19C17.5 19 20 17.5 20 15C20 12.8 18.5 11 16 11ZM16 13C17 13 18 14 18 15C18 16 17 17 16 17C15 17 14 16 14 15C14 14 15 13 16 13Z"
              fill="white"
            />
            {/* Overlapping Bottom-Right Mini Photo Badge */}
            <rect x="17" y="19" width="11" height="9" rx="2.5" fill="#0369A1" />
            <circle cx="19.5" cy="21.5" r="1" fill="white" />
            <path d="M18.5 26L21 23L23 25L24.5 24L26.5 26H18.5Z" fill="white" />
          </svg>
        </div>
      );

    // 8. Merge PDF — Pastel violet circle with 3 stacked purple isometric layers
    case 'merge-pdf':
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#EDE9FE] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            {/* Layer 3 (Bottom) */}
            <path d="M16 26L7 21.5L16 17L25 21.5L16 26Z" fill="#6D28D9" />
            {/* Layer 2 (Middle) */}
            <path d="M16 21L7 16.5L16 12L25 16.5L16 21Z" fill="#7C3AED" />
            {/* Layer 1 (Top) */}
            <path d="M16 16L7 11.5L16 7L25 11.5L16 16Z" fill="#A78BFA" />
          </svg>
        </div>
      );

    // 9. Split PDF — Pastel rose circle with divided PDF document
    case 'split-pdf':
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#FFE4E6] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            {/* Left Half Document */}
            <path d="M7 6C7 4.89543 7.89543 4 9 4H14V28H9C7.89543 28 7 27.1046 7 26V6Z" fill="#F43F5E" />
            {/* Right Half Document */}
            <path d="M18 4H21C22.1046 4 23 4.89543 23 6V26C23 27.1046 22.1046 28 21 28H18V4Z" fill="#FB7185" />
            {/* Split Dotted Line */}
            <line x1="16" y1="5" x2="16" y2="27" stroke="#E11D48" strokeWidth="1.5" strokeDasharray="2 2" />
          </svg>
        </div>
      );

    // 10. Compress PDF — Pastel green/salmon circle with shield & compression arrow
    case 'compress-pdf':
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#FEE2E2] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            <path
              d="M16 4L7 8V15C7 21 11 25.5 16 28C21 25.5 25 21 25 15V8L16 4Z"
              fill="#EF4444"
            />
            {/* Compression downward arrow */}
            <path
              d="M16 11V19M16 19L13 16M16 19L19 16"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M12 22H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    // 11. Rotate PDF — Pastel orange circle with document & curved arrow
    case 'rotate-pdf':
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#FFEDD5] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            <rect x="9" y="8" width="14" height="16" rx="3" fill="#F97316" />
            {/* Circular Arrow */}
            <path
              d="M16 4C22 4 26 8 26 14M26 14H22M26 14V10"
              stroke="#EA580C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 28C10 28 6 24 6 18M6 18H10M6 18V22"
              stroke="#EA580C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );

    // 12. Protect PDF — Pastel blue circle with padlock document
    case 'protect-pdf':
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#DBEAFE] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            <rect x="7" y="5" width="18" height="22" rx="3.5" fill="#3B82F6" />
            {/* Lock Shackle */}
            <path
              d="M13 14V11.5C13 9.8 14.3 8.5 16 8.5C17.7 8.5 19 9.8 19 11.5V14"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Lock Body */}
            <rect x="11.5" y="14" width="9" height="7.5" rx="2" fill="white" />
            <circle cx="16" cy="17.5" r="1" fill="#2563EB" />
          </svg>
        </div>
      );

    // 13. Unlock PDF — Pastel emerald circle with open padlock
    case 'unlock-pdf':
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#D1FAE5] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            <rect x="7" y="5" width="18" height="22" rx="3.5" fill="#10B981" />
            {/* Open Shackle */}
            <path
              d="M13 13V11.5C13 9.8 14.3 8.5 16 8.5C17.7 8.5 19 9.8 19 11.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect x="11.5" y="14" width="9" height="7.5" rx="2" fill="white" />
            <circle cx="16" cy="17.5" r="1" fill="#059669" />
          </svg>
        </div>
      );

    // 14. OCR PDF — Pastel indigo circle with text scan frame
    case 'ocr-pdf':
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#E0E7FF] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            <rect x="7" y="5" width="18" height="22" rx="3.5" fill="#6366F1" />
            <path d="M12 11H10V13M20 11H22V13M10 21H12M22 21H20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <text x="16" y="18" fill="white" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">OCR</text>
          </svg>
        </div>
      );

    // 15. Repair PDF — Pastel teal circle with maintenance wrench
    case 'repair-pdf':
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#CCFBF1] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            <rect x="7" y="5" width="18" height="22" rx="3.5" fill="#14B8A6" />
            <path d="M19 10L17 12M15 14L11 18C10.5 18.5 10.5 19.5 11 20C11.5 20.5 12.5 20.5 13 20L17 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    // 16. Compare PDF — Pastel sky circle with dual document diff
    case 'compare-pdf':
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#E0F2FE] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            <rect x="6" y="8" width="10" height="16" rx="2" fill="#0284C7" />
            <rect x="16" y="8" width="10" height="16" rx="2" fill="#38BDF8" />
            <path d="M13 14H19M13 18H19" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    // 17. Summarize PDF — Pastel violet circle with AI sparkles
    case 'summarize-pdf':
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#EDE9FE] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            <rect x="7" y="5" width="18" height="22" rx="3.5" fill="#7C3AED" />
            <path d="M16 10L17 13L20 14L17 15L16 18L15 15L12 14L15 13L16 10Z" fill="white" />
            <circle cx="12" cy="20" r="1.5" fill="white" />
            <circle cx="20" cy="20" r="1.5" fill="white" />
          </svg>
        </div>
      );

    // Default / Organize / Watermark / Page Numbers
    default:
      return (
        <div className={`relative ${containerSize} rounded-2xl bg-[#F1F5F9] flex items-center justify-center shrink-0 shadow-2xs ${className}`}>
          <svg width={iconPixel} height={iconPixel} viewBox="0 0 32 32" fill="none">
            <rect x="7" y="5" width="18" height="22" rx="3.5" fill="#64748B" />
            <path d="M11 11H21M11 16H21M11 21H17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      );
  }
};
