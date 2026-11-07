import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BorrowBuyLogo } from './BorrowBuyLogo';

export const StartupSplash: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(() => {
    // Only show on fresh browser session
    try {
      return !sessionStorage.getItem('borrowbuy_startup_seen');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isVisible) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const duration = mediaQuery.matches ? 300 : 1200;

    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem('borrowbuy_startup_seen', 'true');
      } catch {
        // ignore
      }
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="startup-splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeInOut' } }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
        aria-hidden="true"
      >
        {/* Subtle background glow */}
        <div className="absolute w-72 h-72 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center text-center px-4"
        >
          <BorrowBuyLogo size="xl" variant="full" />
          
          <p className="mt-3 text-xs font-sans text-slate-500 tracking-wide">
            Verified equipment rental across India
          </p>

          {/* Minimal refined progress bar */}
          <div className="w-36 h-1 bg-slate-100 rounded-full overflow-hidden mt-6">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
              className="w-1/2 h-full bg-gradient-to-r from-brand-600 to-cyan-500 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
