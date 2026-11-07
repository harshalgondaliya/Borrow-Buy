import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Booking } from '../../services/bookings';
import { paymentsService } from '../../services/payments';
import { useToast } from '../../features/toast/ToastContext';
import { formatINR } from '../../utils/formatters';
import {
  X,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Lock,
  Smartphone,
  Building2,
  Info,
} from 'lucide-react';

interface PaymentModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

type PaymentMethodType = 'UPI' | 'CARD' | 'NET_BANKING';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  booking,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const { success } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('UPI');
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 5021');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      await paymentsService.payBooking(booking.id, simulateFailure);
      success(
        `Simulated payment of ${formatINR(booking.totalAmount)} confirmed! Your rental is locked.`,
        'Payment Confirmed'
      );
      onPaymentSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Simulated payment was declined. You can uncheck failure mode and try again.');
    } finally {
      setLoading(false);
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
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-lg w-full p-6 sm:p-8 z-10 max-h-[92vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-600 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Simulated Checkout
            </span>
            <h2 className="text-xl font-display font-extrabold text-slate-900">
              Confirm Rental Payment
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Booking Ref: {booking.bookingNumber}
            </p>
          </div>

          {/* Simulated Disclaimer Banner */}
          <div className="mb-5 p-3.5 bg-brand-50/70 border border-brand-100 rounded-2xl flex items-start gap-2.5 text-xs text-brand-900">
            <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <strong>Demonstration Environment:</strong> All payments are simulated for demo purposes. No real bank accounts, cards, or UPI handles are debited.
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-medium leading-relaxed">{error}</span>
            </motion.div>
          )}

          {/* Cost Breakdown Card */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl mb-5 space-y-2.5 text-xs">
            <div className="font-bold text-slate-900 text-sm truncate mb-1">
              {booking.product?.name}
            </div>
            
            <div className="flex justify-between text-slate-600">
              <span>Rental Duration</span>
              <span className="font-bold text-slate-900 font-display">
                {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Rental Charges</span>
              <span className="font-bold text-slate-900">{formatINR(booking.rentalTotal)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <span>Security Deposit</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  100% Refundable
                </span>
              </span>
              <span className="font-bold text-slate-900">{formatINR(booking.securityDeposit)}</span>
            </div>

            <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
              <div>
                <span className="font-bold text-sm block">Total Payable Now</span>
                <span className="text-[10px] text-slate-500">Rental fee + deposit held in escrow</span>
              </div>
              <span className="text-xl font-display font-extrabold text-brand-600">
                {formatINR(booking.totalAmount)}
              </span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Simulated Payment Method
            </label>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Smartphone className="w-5 h-5 mx-auto mb-1 text-brand-600" />
                <span className="font-bold text-xs block text-slate-900">UPI</span>
                <span className="text-[10px] text-slate-500 block">GPay • PhonePe</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-brand-600" />
                <span className="font-bold text-xs block text-slate-900">Card</span>
                <span className="text-[10px] text-slate-500 block">RuPay • Visa</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NET_BANKING')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'NET_BANKING'
                    ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Building2 className="w-5 h-5 mx-auto mb-1 text-brand-600" />
                <span className="font-bold text-xs block text-slate-900">Net Banking</span>
                <span className="text-[10px] text-slate-500 block">HDFC • SBI • ICICI</span>
              </button>
            </div>

            {/* Contextual simulated inputs */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
              {paymentMethod === 'UPI' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Simulated UPI ID / VPA
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium focus:border-brand-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Supported demo handles: @okhdfcbank, @oksbi, @ybl, @paytm
                  </span>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Simulated Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <span className="text-slate-500">Network: RuPay / Visa</span>
                    <span className="text-slate-500 text-right">Valid Thru: 12/28</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'NET_BANKING' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Select Demonstration Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-brand-500 focus:outline-none"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Decline Simulator for Quality Assurance */}
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 font-medium select-none">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500/20 border-slate-300"
              />
              <span className="text-[11px] text-slate-600">
                Simulate payment decline (for testing error handling)
              </span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              disabled={loading}
              onClick={handlePay}
              className="flex-1 py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confirm Payment ({formatINR(booking.totalAmount)})</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
