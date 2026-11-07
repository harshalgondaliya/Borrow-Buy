import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Booking } from '../../services/bookings';
import { paymentsService } from '../../services/payments';
import { useToast } from '../../features/toast/ToastContext';
import {
  X,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Lock,
  Sparkles,
} from 'lucide-react';

interface PaymentModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  booking,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const { success } = useToast();
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      await paymentsService.payBooking(booking.id, simulateFailure);
      success(`Simulated payment of $${booking.totalAmount.toFixed(2)} confirmed!`, 'Payment Successful');
      onPaymentSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Payment simulation failed');
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
          className="fixed inset-0 bg-charcoal-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl shadow-elevated border border-charcoal-100 max-w-md w-full p-6 sm:p-8 z-10"
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
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-600 uppercase tracking-wider mb-1">
              <CreditCard className="w-3.5 h-3.5" />
              Simulated Checkout
            </span>
            <h2 className="text-xl font-display font-extrabold text-charcoal-900">
              Complete Rental Escrow
            </h2>
            <p className="text-xs text-charcoal-500 font-mono mt-0.5">
              Ref: {booking.bookingNumber}
            </p>
          </div>

          {/* Virtual Simulated Credit Card Preview */}
          <div className="relative mb-5 p-5 rounded-2xl bg-gradient-to-tr from-charcoal-950 via-charcoal-900 to-brand-950 text-white shadow-elevated overflow-hidden border border-charcoal-800">
            {/* Background shimmer */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 rounded-md bg-amber-400/90 flex items-center justify-center text-[10px] font-bold text-charcoal-900 shadow-sm">
                  CHIP
                </div>
                <span className="text-[10px] text-charcoal-400 font-mono tracking-widest uppercase">
                  SIMULATED
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-brand-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>BorrowBuy Pay</span>
              </div>
            </div>

            <div className="font-mono text-base tracking-widest mb-4 text-charcoal-100">
              •••• •••• •••• 4242
            </div>

            <div className="flex justify-between items-end text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-charcoal-400 block">
                  Authorized Renter
                </span>
                <span className="font-bold text-charcoal-200">
                  {booking.customer?.fullName || 'Verified Customer'}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-charcoal-400 block text-right">
                  Expires
                </span>
                <span className="font-mono text-charcoal-200">12/28</span>
              </div>
            </div>
          </div>

          {/* Academic Simulator Banner */}
          <div className="mb-4 p-3 bg-brand-50/70 border border-brand-100 rounded-2xl flex items-start gap-2.5 text-xs text-brand-900">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <strong>Local Escrow Simulator:</strong> Funds and deposits are simulated locally. No real payment credentials or external gateway charges apply.
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

          {/* Itemized Charge Summary */}
          <div className="p-4 bg-charcoal-50/80 border border-charcoal-200/60 rounded-2xl mb-4 space-y-2 text-xs">
            <div className="font-bold text-charcoal-900 text-sm truncate mb-1">
              {booking.product?.name}
            </div>
            <div className="flex justify-between text-charcoal-600">
              <span>Rental Period</span>
              <span className="font-bold text-charcoal-900 font-display">
                {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'}
              </span>
            </div>
            <div className="flex justify-between text-charcoal-600">
              <span>Rental Charge</span>
              <span className="font-bold text-charcoal-900">${booking.rentalTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-charcoal-600">
              <span className="flex items-center gap-1">
                Refundable Deposit
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  Escrowed
                </span>
              </span>
              <span className="font-bold text-charcoal-900">${booking.securityDeposit.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-charcoal-200/80 flex justify-between items-baseline text-charcoal-900">
              <span className="font-bold text-sm">Total Charge</span>
              <span className="text-xl font-display font-black text-brand-600">
                ${booking.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Negative Test Case Simulation Toggle */}
          <div className="mb-6 p-3 bg-charcoal-50 border border-charcoal-200/60 rounded-2xl text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer text-charcoal-700 font-medium select-none">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500/20 border-charcoal-300"
              />
              <span className="text-[11px] text-charcoal-600">
                Simulate payment decline / failure (negative test scenario)
              </span>
            </label>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-charcoal-500 hover:text-charcoal-800 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              disabled={loading}
              onClick={handlePay}
              className="flex-1 py-3 px-5 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold text-xs rounded-xl shadow-card transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authorizing Escrow...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay & Lock ${booking.totalAmount.toFixed(2)}</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
