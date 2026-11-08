import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BorrowBuyLogo } from './BorrowBuyLogo';
import {
  X,
  Sparkles,
  ShieldCheck,
  MapPin,
  Users,
  Award
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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

          {/* Logo & Headline */}
          <div className="text-center pb-6 border-b border-slate-100">
            <div className="inline-block mb-3">
              <BorrowBuyLogo size="lg" variant="full" />
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">
              Why Buy When You Can Borrow?
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              BorrowBuy is India's trusted product rental platform connecting equipment owners with creators, students, professionals, and neighbors.
            </p>
          </div>

          {/* Mission & Values */}
          <div className="mt-6 space-y-6 text-xs text-slate-600 leading-relaxed">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h3 className="font-display font-bold text-sm text-slate-900 mb-1.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Our Mission</span>
              </h3>
              <p>
                Expensive equipment often sits idle for months while creators, students, and DIY enthusiasts need it for just a few days. BorrowBuy unlocks high-grade gear — cinema cameras, laptops, projectors, power drills, and outdoor gear — so you can achieve your goals without spending lakhs upfront.
              </p>
            </div>

            {/* Core Pillars */}
            <div className="grid sm:grid-cols-3 gap-3.5">
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="font-display font-bold text-xs text-slate-900 mb-1">Escrow Deposits</div>
                <p className="text-[11px] text-slate-500">
                  100% refundable security deposits held safely until the item is returned in agreed condition.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
                  <Users className="w-4 h-4" />
                </div>
                <div className="font-display font-bold text-xs text-slate-900 mb-1">Verified Members</div>
                <p className="text-[11px] text-slate-500">
                  Phone and identity verification, community ratings, and public trust scores for every lender and borrower.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5">
                  <Award className="w-4 h-4" />
                </div>
                <div className="font-display font-bold text-xs text-slate-900 mb-1">Digital Passes</div>
                <p className="text-[11px] text-slate-500">
                  Contactless QR check-in on pickup and return. No paper clutter, zero double-booking collisions.
                </p>
              </div>
            </div>

            {/* Regional Gujarat Footprint */}
            <div className="p-4 rounded-2xl border border-slate-200 flex items-start gap-3 bg-white">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="font-display font-bold text-xs text-slate-900">Rooted in Gujarat</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Serving communities across Ahmedabad (Satellite, Vastrapur, Navrangpura), Gandhinagar (Kudasan, Infocity), Surat (Vesu, Piplod), Vadodara (Alkapuri, Akota), Rajkot, and Anand.
                </p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>BorrowBuy Platform &copy; 2026</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
