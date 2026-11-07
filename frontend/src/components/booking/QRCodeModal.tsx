import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Booking } from '../../services/bookings';
import { qrService, BookingQRCodesResponse } from '../../services/qr';
import {
  X,
  QrCode,
  ShieldCheck,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';

interface QRCodeModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  booking,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'pickup' | 'return'>('pickup');
  const [qrData, setQrData] = useState<BookingQRCodesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (booking && isOpen) {
      setLoading(true);
      qrService
        .getBookingQRCodes(booking.id)
        .then((res) => setQrData(res.data))
        .catch((err) => console.error('Failed to load QR codes', err))
        .finally(() => setLoading(false));
    }
  }, [booking, isOpen]);

  if (!isOpen || !booking) return null;

  const currentCode = activeTab === 'pickup' ? qrData?.pickupCode : qrData?.returnCode;
  const currentQrImage = activeTab === 'pickup' ? qrData?.pickupQrDataUrl : qrData?.returnQrDataUrl;

  const handleCopy = () => {
    if (currentCode) {
      navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-charcoal-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl shadow-elevated border border-charcoal-100 max-w-sm w-full p-6 sm:p-8 z-10 text-center"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-charcoal-400 hover:text-charcoal-700 p-2 rounded-xl hover:bg-charcoal-100/70 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-2.5 border border-brand-100 shadow-sm">
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-display font-extrabold text-charcoal-900">
              Digital Handover Pass
            </h2>
            <p className="text-xs text-charcoal-500 font-mono mt-0.5">
              Ref: {booking.bookingNumber}
            </p>
          </div>

          {/* Tab Switcher: Pickup vs Return */}
          <div className="flex p-1 bg-charcoal-100/80 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => setActiveTab('pickup')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'pickup'
                  ? 'bg-white text-charcoal-900 shadow-sm'
                  : 'text-charcoal-500 hover:text-charcoal-800'
              }`}
            >
              Pickup Pass
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('return')}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'return'
                  ? 'bg-white text-charcoal-900 shadow-sm'
                  : 'text-charcoal-500 hover:text-charcoal-800'
              }`}
            >
              Return Pass
            </button>
          </div>

          {/* High-Contrast QR Code Card */}
          <div className="p-5 bg-charcoal-50/80 border border-charcoal-200/70 rounded-2xl mb-5">
            {loading ? (
              <div className="aspect-square flex flex-col items-center justify-center text-xs text-charcoal-400 gap-2">
                <span className="inline-block w-6 h-6 border-2 border-brand-500/30 border-t-brand-600 rounded-full animate-spin" />
                <span>Generating tamper-proof token...</span>
              </div>
            ) : currentQrImage ? (
              <div className="flex flex-col items-center justify-center">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-charcoal-200/80">
                  <img
                    src={currentQrImage}
                    alt="Verification QR Code"
                    className="w-48 h-48 mx-auto rounded-lg"
                  />
                </div>

                {/* Token string badge with 1-click copy */}
                <div className="mt-3.5 flex items-center justify-center gap-2">
                  <span className="font-mono text-xs font-bold text-charcoal-900 bg-white px-3 py-1.5 rounded-xl border border-charcoal-200 shadow-xs">
                    {currentCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    title="Copy verification code"
                    className="p-2 text-charcoal-400 hover:text-charcoal-700 bg-white hover:bg-charcoal-100 rounded-xl border border-charcoal-200 transition-colors shadow-xs"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-square flex flex-col items-center justify-center text-xs text-charcoal-400 p-4">
                <ShieldAlert className="w-6 h-6 text-charcoal-300 mb-2" />
                <span>Pass is not active for the current rental status.</span>
              </div>
            )}
          </div>

          {/* Security & Instructions */}
          <div className="p-3 bg-brand-50/70 border border-brand-100 rounded-2xl text-[11px] text-brand-900 text-left flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              {activeTab === 'pickup'
                ? 'Present this QR pass to the owner during physical handoff. Single-use token prevents replay fraud.'
                : 'Present this QR pass to the owner upon equipment return to complete inspection and release deposit.'}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
