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
    const duration = mediaQuery.matches ? 300 : 1300;

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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="startup-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#172B46] selection:bg-[#F06449]"
          aria-hidden="true"
        >
          {/* Subtle radial ambient background glow in Coral & Teal */}
          <div className="absolute w-96 h-96 rounded-full bg-[#F06449]/10 blur-3xl pointer-events-none" />
          <div className="absolute w-80 h-80 rounded-full bg-[#2F6B65]/15 blur-2xl pointer-events-none translate-x-12 translate-y-12" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center px-4"
          >
            <BorrowBuyLogo size="xl" variant="full" theme="dark" />
            
            <p className="mt-3.5 text-xs font-semibold text-[#E4E7EC] tracking-wide font-sans">
              Peer-to-Peer Equipment Rental • Gujarat & India
            </p>

            {/* Minimal refined progress bar in Coral */}
            <div className="w-40 h-1 bg-[#243B53] rounded-full overflow-hidden mt-6 relative shadow-inner">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-[#F06449] to-[#F2C66D] rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
