import React from 'react';

interface BorrowBuyLogoProps {
  variant?: 'full' | 'icon' | 'compact';
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const BorrowBuyLogo: React.FC<BorrowBuyLogoProps> = ({
  variant = 'full',
  theme = 'light',
  size = 'md',
  className = '',
}) => {
  const isDark = theme === 'dark';

  // Dimension scaling
  const iconDimensions = {
    sm: { w: 26, h: 26 },
    md: { w: 34, h: 34 },
    lg: { w: 42, h: 42 },
    xl: { w: 52, h: 52 },
  }[size];

  const textSize = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  const subtextSize = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
    xl: 'text-xs',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Bespoke Sharing Emblem – Midnight Navy (#172B46) & Coral (#F06449) */}
      <svg
        width={iconDimensions.w}
        height={iconDimensions.h}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105 duration-200"
      >
        <defs>
          <linearGradient id="bb-grad-navy" x1="4" y1="4" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#172B46" />
            <stop offset="1" stopColor="#0F1E33" />
          </linearGradient>
          <linearGradient id="bb-grad-coral" x1="16" y1="12" x2="38" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F06449" />
            <stop offset="1" stopColor="#D95339" />
          </linearGradient>
        </defs>

        {/* Outer Rounded Container */}
        <rect
          x="2"
          y="2"
          width="40"
          height="40"
          rx="12"
          fill={isDark ? '#172B46' : '#FFFFFF'}
          stroke={isDark ? '#334E68' : '#E4E7EC'}
          strokeWidth="1.5"
        />

        {/* First Loop: The "Borrow" Arc (Midnight Navy) */}
        <path
          d="M13 14C13 11.7909 14.7909 10 17 10H23C26.3137 10 29 12.6863 29 16C29 18.2323 27.7818 20.1798 26 21.2C28.2091 22.3166 29.5 24.5827 29.5 27.2C29.5 30.9555 26.4555 34 22.7 34H17C14.7909 34 13 32.2091 13 30V14Z"
          fill={isDark ? '#FFFFFF' : 'url(#bb-grad-navy)'}
        />

        {/* Inner Counter 1 (Upper) */}
        <rect x="18" y="14.5" width="5.5" height="4.5" rx="2" fill={isDark ? '#172B46' : '#FFFFFF'} />

        {/* Inner Counter 2 (Lower) */}
        <rect x="18" y="24.5" width="6.5" height="5" rx="2" fill={isDark ? '#172B46' : '#FFFFFF'} />

        {/* The Exchange / Circular Arrow Accent in Coral */}
        <path
          d="M27 18.5L31.5 22.5L27 26.5"
          stroke={isDark ? '#172B46' : '#FFFFFF'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="31.5" cy="22.5" r="2.5" fill="url(#bb-grad-coral)" />
      </svg>

      {/* Typography Wordmark */}
      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className={`font-display font-extrabold tracking-tight leading-none ${textSize}`}>
            <span className={isDark ? 'text-white' : 'text-[#172B46]'}>Borrow</span>
            <span className="text-[#F06449]">Buy</span>
          </div>
          {variant === 'full' && (
            <span className={`font-sans tracking-wider uppercase font-bold mt-0.5 leading-none ${isDark ? 'text-slate-300' : 'text-[#667085]'} ${subtextSize}`}>
              Rent • Share • Gujarat
            </span>
          )}
        </div>
      )}
    </div>
  );
};
