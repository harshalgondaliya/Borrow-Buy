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

  const iconDimensions = {
    sm: { w: 24, h: 24 },
    md: { w: 30, h: 30 },
    lg: { w: 36, h: 36 },
    xl: { w: 44, h: 44 },
  }[size];

  const textSize = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  }[size];

  const subtextSize = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
    xl: 'text-xs',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric Equipment Rental Emblem */}
      <svg
        width={iconDimensions.w}
        height={iconDimensions.h}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      >
        <rect width="36" height="36" rx="9" fill={isDark ? '#FFFFFF' : '#17191C'} />
        {/* Infinite Circulation / Sharing Loop */}
        <path
          d="M10 18C10 13.5817 13.5817 10 18 10C22.4183 10 26 13.5817 26 18C26 22.4183 22.4183 26 18 26"
          stroke={isDark ? '#17191C' : '#FAFAF8'}
          strokeWidth="2.75"
          strokeLinecap="round"
        />
        <circle cx="18" cy="18" r="4.5" fill="#315CF5" />
        <path
          d="M26 14L26 18L22 18"
          stroke="#315CF5"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {variant !== 'icon' && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-display font-bold tracking-tight ${textSize} ${
              isDark ? 'text-white' : 'text-[#17191C]'
            }`}
          >
            Borrow<span className="text-[#315CF5]">Buy</span>
          </span>
          {variant === 'full' && (
            <span
              className={`font-sans font-medium uppercase tracking-wider mt-0.5 ${subtextSize} ${
                isDark ? 'text-neutral-400' : 'text-[#66707A]'
              }`}
            >
              Equipment Rental
            </span>
          )}
        </div>
      )}
    </div>
  );
};
