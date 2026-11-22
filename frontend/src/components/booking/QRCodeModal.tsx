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
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-2xl shadow-elevated border border-[#E5E8EA] max-w-sm w-full p-6 z-10 text-center text-[#17191C]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#66707A] hover:text-[#17191C] p-2 rounded-lg hover:bg-[#F1F3F3] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#EFF3FE] text-[#315CF5] flex items-center justify-center mx-auto mb-2 border border-[#DBE4FD]">
              <QrCode className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-[#17191C]">
              Digital Handover Pass
            </h2>
            <p className="text-xs text-[#66707A] font-mono mt-0.5">
              Ref: {booking.bookingNumber}
            </p>
          </div>

          {/* Tab Switcher: Pickup vs Return */}
          <div className="flex p-1 bg-[#F1F3F3] rounded-lg mb-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('pickup')}
              className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'pickup'
                  ? 'bg-white text-[#17191C] font-semibold shadow-xs'
                  : 'text-[#66707A] hover:text-[#17191C]'
              }`}
            >
              Pickup Pass
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('return')}
              className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'return'
                  ? 'bg-white text-[#17191C] font-semibold shadow-xs'
                  : 'text-[#66707A] hover:text-[#17191C]'
              }`}
            >
              Return Pass
            </button>
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-[#FAFAF8] rounded-xl border border-[#E5E8EA] mb-4 flex flex-col items-center justify-center min-h-[220px]">
            {loading ? (
              <div className="w-36 h-36 bg-[#F1F3F3] rounded-lg animate-pulse" />
            ) : currentQrImage ? (
              <img
                src={currentQrImage}
                alt="Encrypted Single-Use Handover QR"
                className="w-44 h-44 object-contain rounded-lg border border-[#E5E8EA] bg-white p-2 shadow-xs"
              />
            ) : (
              <div className="text-xs text-[#C43838] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>QR pass unavailable</span>
              </div>
            )}

            {currentCode && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <code className="text-xs font-mono font-bold text-[#17191C] bg-white px-2 py-0.5 rounded border border-[#E5E8EA]">
                  {currentCode}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 rounded text-[#66707A] hover:text-[#17191C] hover:bg-[#F1F3F3] transition-colors cursor-pointer"
                  title="Copy pass token"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#13795B]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="text-[11px] text-[#66707A] space-y-1 text-left px-1">
            <div className="flex items-center gap-1.5 text-[#13795B] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Single-use cryptographic verification token</span>
            </div>
            <p>
              Present this code to the owner during in-person equipment handover. The owner scans it to record physical timestamp and transition rental status.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
