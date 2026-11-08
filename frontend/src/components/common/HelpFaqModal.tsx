import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  HelpCircle,
  ChevronDown,
  Mail
} from 'lucide-react';

interface HelpFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpFaqModal: React.FC<HelpFaqModalProps> = ({ isOpen, onClose }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'How does renting on BorrowBuy work?',
      a: 'Browse equipment near your city (Ahmedabad, Gandhinagar, Surat, Vadodara, etc.), select your rental dates, and reserve the gear. Once the owner accepts, complete the simulated payment. At handover, show your secure digital pass on your phone, inspect the equipment together, and take it home.',
    },
    {
      q: 'How does the refundable security deposit work?',
      a: 'The security deposit is held safely in escrow during the rental period. As soon as you return the equipment and the owner scans the return pass, the deposit is automatically released back to your original payment method in full.',
    },
    {
      q: 'What is the digital pass / QR handover?',
      a: 'Every confirmed booking generates a unique digital pass with a QR code on your phone. The owner scans this code at pickup to verify your identity and activate the rental without paper contracts. A second return pass is scanned when you return the item.',
    },
    {
      q: 'What happens if an item is returned late?',
      a: 'Rentals must be returned on the expected return date. If you need an extension, request it in advance. Overdue returns are charged a 1.5x daily rate for the extra days, which is automatically calculated and settled.',
    },
    {
      q: 'How are scratches or existing wear handled?',
      a: 'Before handover, the owner records condition notes and pre-pickup photos. You verify these on your device at pickup. This ensures you are never held responsible for pre-existing cosmetic wear.',
    },
    {
      q: 'How can I list my own equipment as an owner in Gujarat?',
      a: 'Register as an Owner or click "List Your Product". Fill in your item name, daily rental rate, security deposit, and pickup locality in Gujarat. Once approved, your listing appears live on the marketplace for local borrowers.',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 sm:p-8 z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-xs">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-extrabold text-slate-900">
                Help & Frequently Asked Questions
              </h2>
              <p className="text-xs text-slate-500">
                Quick answers on deposits, digital passes, return policies, and owner guidelines
              </p>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="mt-6 space-y-3">
            {faqs.map((faq, index) => {
              const isOpenItem = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpenItem ? null : index)}
                    className="w-full text-left p-4 flex items-center justify-between gap-3 font-display font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpenItem ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpenItem && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Direct Support Card */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <div className="font-bold text-slate-900 font-display">Need personal assistance?</div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Our Gujarat community support desk is available Monday through Saturday.
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href="mailto:support@borrowbuy.in"
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>support@borrowbuy.in</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
