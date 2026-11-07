import React, { useState } from 'react';
import { Booking } from '../../services/bookings';
import { paymentsService } from '../../services/payments';
import { useToast } from '../../features/toast/ToastContext';
import { X, CreditCard, ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" />
            <span>Simulated Checkout</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Complete Rental Payment</h2>
          <p className="text-xs text-slate-500 mt-0.5">Booking Ref: {booking.bookingNumber}</p>
        </div>

        {/* Academic Simulator Disclaimer */}
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Payment Simulator:</span> This environment simulates card processing locally. No real money or payment credentials are required.
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Item Summary */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-4 space-y-2 text-xs">
          <div className="font-bold text-slate-800 text-sm mb-1">{booking.product?.name}</div>
          <div className="flex justify-between text-slate-600">
            <span>Rental Duration</span>
            <span className="font-semibold text-slate-900">{booking.totalDays} days</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Rental Charge</span>
            <span className="font-semibold text-slate-900">${booking.rentalTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="flex items-center gap-1">
              Refundable Security Deposit
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            </span>
            <span className="font-semibold text-slate-900">${booking.securityDeposit.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
            <span>Total Payable Amount</span>
            <span className="text-base font-extrabold text-sky-600">${booking.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Simulation Options */}
        <div className="mb-6 p-3 bg-slate-100 rounded-xl text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
            <span>Simulate Payment Decline / Failure (Negative test case)</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handlePay}
            className="flex-1 py-3 px-5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Authorizing Payment...' : `Simulate Pay $${booking.totalAmount.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};
