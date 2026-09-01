import React from 'react';

interface CareBridgeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
}

/**
 * 🌟 Sophisticated Modern CareBridge Brand Logo Component
 * Combines an architectural bridge curve with warm human care/heart connection iconography
 */
export const CareBridgeLogo: React.FC<CareBridgeLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  showBadge = true,
  badgeText = 'v3.5 AI',
  className = '',
}) => {
  // Dimension tokens
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  }[size];

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
  }[size];

  const subSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-xs sm:text-sm',
    xl: 'text-sm',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* 🌟 1. Sophisticated Geometric Vector Icon Emblem */}
      <div className="relative shrink-0">
        {/* Ambient Subtle Glow Behind Icon */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl blur-md opacity-40 group-hover:opacity-65 transition-opacity duration-300 pointer-events-none" />

        <div
          className={`${iconDimensions} relative rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 p-0.5 shadow-lg shadow-amber-950/40 border border-amber-300/40 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105`}
        >
          {/* Inner Gloss Reflection Highlight */}
          <div className="absolute -top-3 -left-3 w-8 h-8 bg-white/25 rounded-full blur-xs pointer-events-none" />

          {/* Custom Stylized Bridge + Heart Arc Vector */}
          <svg
            className="w-full h-full p-1.5 text-white"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Bridge Arch Base Beam */}
            <path
              d="M4 23C8.5 17 23.5 17 28 23"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {/* Bridge Support Suspension Cables */}
            <path
              d="M10 20.5V23.5M16 18.5V23.5M22 20.5V23.5"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeOpacity="0.85"
            />
            {/* Floating Care / Heart Radiant Apex Symbol */}
            <path
              d="M16 6.5C14.5 4.5 11.5 5 11.5 7.5C11.5 10 16 13.5 16 13.5C16 13.5 20.5 10 20.5 7.5C20.5 5 17.5 4.5 16 6.5Z"
              fill="#FEF3C7"
              stroke="white"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Radiating Care Particle Dots */}
            <circle cx="8" cy="11" r="1" fill="#FDE68A" />
            <circle cx="24" cy="11" r="1" fill="#FDE68A" />
          </svg>
        </div>
      </div>

      {/* 🌟 2. Typography Pairing */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight text-white ${titleSizes} drop-shadow-xs`}>
            케어브릿지
          </span>
          <span className="font-mono font-bold text-amber-400 tracking-wider text-[11px] sm:text-xs opacity-90">
            CareBridge
          </span>

          {showBadge && (
            <span className="ml-1 px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-2xs">
              {badgeText}
            </span>
          )}
        </div>

        {showSubtitle && (
          <p className={`text-stone-400 font-medium tracking-tight mt-0.5 ${subSizes}`}>
            사회복지시설 사례관리 스마트 통합 솔루션
          </p>
        )}
      </div>
    </div>
  );
};
