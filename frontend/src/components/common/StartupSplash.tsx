import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BorrowBuyLogo } from './BorrowBuyLogo';

export const StartupSplash: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(() => {
    try {
      return !sessionStorage.getItem('borrowbuy_startup_seen');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem('borrowbuy_startup_seen', 'true');
      } catch {
        // ignore
      }
      setIsVisible(false);
      onComplete?.();
    }, 600);

    return () => clearTimeout(timer);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="startup-splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAFAF8]"
        aria-hidden="true"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-3"
        >
          <BorrowBuyLogo size="lg" variant="full" />
          <div className="flex items-center gap-2 text-xs text-[#66707A] mt-2 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#315CF5] animate-ping" />
            <span>Connecting to BorrowBuy Network...</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
