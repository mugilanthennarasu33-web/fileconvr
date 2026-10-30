import React from 'react';

interface IconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 1. Zero Document Logging — Modern Duotone Security Lock
 */
export const ModernLockIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lock-body-grad" x1="4" y1="10" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="lock-shackle-grad" x1="7" y1="2" x2="17" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="#059669" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      {/* Shackle */}
      <path
        d="M7.5 10V6.8C7.5 4.15 9.5 2 12 2C14.5 2 16.5 4.15 16.5 6.8V10"
        stroke="url(#lock-shackle-grad)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Lock Body */}
      <rect
        x="4"
        y="10"
        width="16"
        height="12"
        rx="3.5"
        fill="url(#lock-body-grad)"
        className="filter drop-shadow-xs"
      />
      {/* Inner Highlight Bar */}
      <rect x="5.5" y="11.5" width="13" height="1" rx="0.5" fill="#A7F3D0" fillOpacity="0.6" />
      {/* Keyhole */}
      <circle cx="12" cy="15" r="1.5" fill="#FFFFFF" />
      <path d="M12 16.5V18.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
};

/**
 * 2. 60-Min Auto Cleanup — Modern Duotone Clock & Cycle Arrows
 */
export const ModernRefreshIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="refresh-arrow-grad" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      {/* Upper clockwise loop */}
      <path
        d="M20.5 8C19.2 5 16.3 3 12.8 3C8.2 3 4.5 6.7 4.5 11.3"
        stroke="url(#refresh-arrow-grad)"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        d="M21.5 4V8.5H17"
        stroke="url(#refresh-arrow-grad)"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Lower counter loop */}
      <path
        d="M3.5 16C4.8 19 7.7 21 11.2 21C15.8 21 19.5 17.3 19.5 12.7"
        stroke="url(#refresh-arrow-grad)"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        d="M2.5 20V15.5H7"
        stroke="url(#refresh-arrow-grad)"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center 60-min clock indicator */}
      <circle cx="12" cy="12" r="3.2" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.2" />
      <path d="M12 10.5V12L13.2 12" stroke="#1D4ED8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
};

/**
 * 3. High-Speed Engine — Modern Duotone Turbo Bolt
 */
export const ModernTurboIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="turbo-bolt-grad" x1="6" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
      {/* Velocity streaks */}
      <path d="M4 8H7" stroke="#C4B5FD" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M2.5 12H5.5" stroke="#C4B5FD" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 16H6.5" stroke="#C4B5FD" strokeWidth="1.8" strokeLinecap="round" />
      {/* Main Lightning Bolt */}
      <path
        d="M14 2L6.5 13H12.5L10 22L19.5 10H13.5L15.5 2H14Z"
        fill="url(#turbo-bolt-grad)"
        stroke="#5B21B6"
        strokeWidth="1.2"
        strokeLinejoin="round"
        className="filter drop-shadow-xs"
      />
      {/* Shiny surface highlight */}
      <path d="M13.8 4L8.5 12H12" stroke="#EDE9FE" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
};

/**
 * 4. 10+ Powerful Conversion Tools — Modern Duotone Infinity Symbol
 */
export const ModernInfinityIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="infinity-grad" x1="3" y1="7" x2="21" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9333EA" />
          <stop offset="1" stopColor="#6B21A8" />
        </linearGradient>
      </defs>
      {/* Soft background glow fill */}
      <path
        d="M18.178 8c-1.39 0-2.61.64-3.41 1.63L12 12.92l-2.768-3.29C8.432 8.64 7.212 8 5.822 8 3.711 8 2 9.79 2 12s1.711 4 3.822 4c1.39 0 2.61-.64 3.41-1.63L12 11.08l2.768 3.29c.8 1 2.02 1.63 3.41 1.63 2.111 0 3.822-1.79 3.822-4s-1.711-4-3.822-4Z"
        fill="#F3E8FF"
      />
      {/* Smooth flowing ribbon outline */}
      <path
        d="M18.178 8c-1.39 0-2.61.64-3.41 1.63L12 12.92l-2.768-3.29C8.432 8.64 7.212 8 5.822 8 3.711 8 2 9.79 2 12s1.711 4 3.822 4c1.39 0 2.61-.64 3.41-1.63L12 11.08l2.768 3.29c.8 1 2.02 1.63 3.41 1.63 2.111 0 3.822-1.79 3.822-4s-1.711-4-3.822-4Z"
        stroke="url(#infinity-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sparkle badge */}
      <circle cx="19.5" cy="8" r="1.5" fill="#E9D5FF" />
    </svg>
  );
};

/**
 * 5. 10K+ Happy Users — Modern Duotone User Community
 */
export const ModernUsersIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="users-primary-grad" x1="5" y1="6" x2="19" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      {/* Secondary User (Left/Background) */}
      <circle cx="8" cy="8" r="3.2" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="1.8" />
      <path
        d="M3 19C3 16 5.5 14 8.5 14C10 14 11.3 14.5 12.2 15.4"
        stroke="#60A5FA"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Primary User (Right/Foreground) */}
      <circle
        cx="16"
        cy="9"
        r="3.5"
        fill="url(#users-primary-grad)"
        stroke="#1E40AF"
        strokeWidth="1.5"
      />
      <path
        d="M10.5 20C10.5 16.8 13 14.5 16 14.5C19 14.5 21.5 16.8 21.5 20"
        stroke="url(#users-primary-grad)"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * 6. 100% Secure & Private — Modern Duotone Shield with Checkmark
 */
export const ModernShieldIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shield-grad" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      {/* Shield Body */}
      <path
        d="M12 2L4 5.5V11.5C4 16.8 7.4 21.5 12 22.8C16.6 21.5 20 16.8 20 11.5V5.5L12 2Z"
        fill="#D1FAE5"
        stroke="url(#shield-grad)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Shield Inner Inset */}
      <path
        d="M12 4.2L6 6.8V11.5C6 15.5 8.6 19.3 12 20.5C15.4 19.3 18 15.5 18 11.5V6.8L12 4.2Z"
        fill="#A7F3D0"
        fillOpacity="0.4"
      />
      {/* Sharp Checkmark */}
      <path
        d="M8.8 11.8L11 14L15.5 9.5"
        stroke="#047857"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 7. Fast Cloud-Based Processing — Modern Duotone Cloud & Lightning
 */
export const ModernCloudZapIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cloud-zap-grad" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="cloud-bolt-grad" x1="9" y1="10" x2="16" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
      {/* Cloud Outline */}
      <path
        d="M6.5 17.5C4.2 17.5 2.5 15.8 2.5 13.5C2.5 11.4 4 9.6 6.1 9.5C6.7 6.4 9.4 4 12.7 4C16.4 4 19.4 6.8 19.8 10.4C21.6 10.9 22.8 12.6 22.8 14.5C22.8 16.8 21 18.5 18.7 18.5"
        fill="#FEF3C7"
        stroke="url(#cloud-zap-grad)"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      {/* Descending Lightning Bolt */}
      <path
        d="M13 10L9 16H13L11.5 22L17 14.5H13L14.5 10H13Z"
        fill="url(#cloud-bolt-grad)"
        stroke="#B45309"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 8. Works on Any Device — Modern Duotone Responsive Devices
 */
export const ModernDevicesIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="device-laptop-grad" x1="3" y1="4" x2="21" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      {/* Laptop Screen */}
      <rect
        x="3"
        y="5"
        width="14"
        height="10"
        rx="1.5"
        fill="#EFF6FF"
        stroke="url(#device-laptop-grad)"
        strokeWidth="2"
      />
      {/* Laptop Base */}
      <path d="M1.5 16.5H18.5" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round" />
      {/* Mobile Phone (Foreground) */}
      <rect
        x="15"
        y="9"
        width="7"
        height="12"
        rx="1.5"
        fill="#DBEAFE"
        stroke="#2563EB"
        strokeWidth="2"
      />
      {/* Phone Screen highlight */}
      <rect x="16.5" y="11" width="4" height="6.5" rx="0.5" fill="#FFFFFF" />
      <circle cx="18.5" cy="19" r="0.7" fill="#1D4ED8" />
    </svg>
  );
};
