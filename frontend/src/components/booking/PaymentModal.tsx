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
          className="relative bg-white rounded-2xl shadow-elevated border border-[#E5E8EA] max-w-lg w-full p-6 sm:p-7 z-10 max-h-[92vh] overflow-y-auto text-[#17191C]"
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
          <div className="mb-5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#315CF5] uppercase tracking-wider mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Simulated Payment Gateway
            </span>
            <h2 className="text-xl font-semibold text-[#17191C]">
              Confirm Rental Payment
            </h2>
            <p className="text-xs text-[#66707A] mt-0.5">
              Academic payment simulation • Escrow deposit isolation
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-[#FDF2F2] border border-[#FDE68A] text-[#C43838] rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C43838]" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {/* Booking Summary Box */}
          <div className="p-3.5 bg-[#FAFAF8] border border-[#E5E8EA] rounded-xl mb-5 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#66707A]">Equipment:</span>
              <span className="font-semibold text-[#17191C] truncate max-w-[240px]">
                {booking.product?.name || 'Equipment'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#66707A]">Duration:</span>
              <span className="font-semibold text-[#17191C]">
                {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#66707A]">Rental Fee:</span>
              <span className="font-semibold text-[#17191C]">
                {formatINR(booking.totalAmount - booking.securityDeposit)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#66707A]">Refundable Escrow Deposit:</span>
              <span className="font-semibold text-[#13795B]">
                {formatINR(booking.securityDeposit)}
              </span>
            </div>
            <div className="pt-2 border-t border-[#E5E8EA] flex justify-between items-baseline">
              <span className="font-semibold text-xs text-[#17191C]">Total Payable:</span>
              <span className="text-lg font-bold text-[#315CF5]">
                {formatINR(booking.totalAmount)}
              </span>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#17191C] mb-2">
              Select Simulated Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-2.5 rounded-lg border text-center transition-colors cursor-pointer ${
                  paymentMethod === 'UPI'
                    ? 'border-[#315CF5] bg-[#EFF3FE] text-[#315CF5] font-semibold'
                    : 'border-[#E5E8EA] hover:border-[#D0D5DD] bg-white text-[#66707A]'
                }`}
              >
                <Smartphone className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs">UPI App</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-2.5 rounded-lg border text-center transition-colors cursor-pointer ${
                  paymentMethod === 'CARD'
                    ? 'border-[#315CF5] bg-[#EFF3FE] text-[#315CF5] font-semibold'
                    : 'border-[#E5E8EA] hover:border-[#D0D5DD] bg-white text-[#66707A]'
                }`}
              >
                <CreditCard className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs">Debit / Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NET_BANKING')}
                className={`p-2.5 rounded-lg border text-center transition-colors cursor-pointer ${
                  paymentMethod === 'NET_BANKING'
                    ? 'border-[#315CF5] bg-[#EFF3FE] text-[#315CF5] font-semibold'
                    : 'border-[#E5E8EA] hover:border-[#D0D5DD] bg-white text-[#66707A]'
                }`}
              >
                <Building2 className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs">Net Banking</span>
              </button>
            </div>
          </div>

          {/* Method Input Details */}
          <div className="mb-4 space-y-3">
            {paymentMethod === 'UPI' && (
              <div>
                <label className="block text-xs font-semibold text-[#17191C] mb-1">UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors text-[#17191C]"
                />
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-[#17191C] mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors text-[#17191C]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    defaultValue="12/28"
                    className="px-3 py-2 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors text-[#17191C]"
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    defaultValue="123"
                    className="px-3 py-2 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors text-[#17191C]"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'NET_BANKING' && (
              <div>
                <label className="block text-xs font-semibold text-[#17191C] mb-1">Select Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors text-[#17191C]"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                </select>
              </div>
            )}
          </div>

          {/* Simulation Toggle Checkbox */}
          <div className="mb-5 p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E8EA] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                id="simFailure"
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="w-4 h-4 text-[#315CF5] rounded border-[#E5E8EA] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="simFailure" className="text-xs text-[#17191C] cursor-pointer">
                Simulate Payment Failure <span className="text-[#66707A]">(Test exception handling)</span>
              </label>
            </div>
            <Lock className="w-3.5 h-3.5 text-[#66707A]" />
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E8EA]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#66707A] hover:text-[#17191C] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handlePay}
              className="flex-1 py-2.5 px-4 bg-[#315CF5] hover:bg-[#2447C9] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Confirm {formatINR(booking.totalAmount)}</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
