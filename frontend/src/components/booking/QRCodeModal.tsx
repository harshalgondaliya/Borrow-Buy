import React, { useState, useEffect } from 'react';
import { Booking } from '../../services/bookings';
import { qrService, BookingQRCodesResponse } from '../../services/qr';
import { X, QrCode, ShieldCheck, Copy, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 text-center">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-2">
            <QrCode className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Digital Handover Pass</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{booking.bookingNumber}</p>
        </div>

        {/* Tab Switcher: Pickup Pass vs Return Pass */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold mb-5">
          <button
            onClick={() => setActiveTab('pickup')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'pickup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Pickup Pass
          </button>
          <button
            onClick={() => setActiveTab('return')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'return'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Return Pass
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-4">
          {loading ? (
            <div className="aspect-square flex items-center justify-center text-xs text-slate-400">
              Generating secure QR token...
            </div>
          ) : currentQrImage ? (
            <div className="aspect-square flex flex-col items-center justify-center">
              <img
                src={currentQrImage}
                alt="Verification QR Code"
                className="w-48 h-48 mx-auto rounded-lg shadow-sm"
              />
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {currentCode}
                </span>
                <button
                  onClick={handleCopy}
                  title="Copy verification code"
                  className="p-1.5 text-slate-400 hover:text-sky-600 bg-white rounded-lg border border-slate-200 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="aspect-square flex items-center justify-center text-xs text-slate-400">
              Pass not available in current status.
            </div>
          )}
        </div>

        {/* Security Guidance */}
        <div className="text-[11px] text-slate-500 leading-relaxed flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {activeTab === 'pickup'
              ? 'Present to equipment owner at pickup location to activate rental.'
              : 'Present to equipment owner upon return to complete inspection.'}
          </span>
        </div>
      </div>
    </div>
  );
};
