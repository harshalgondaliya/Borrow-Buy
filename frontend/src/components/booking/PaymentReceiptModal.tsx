import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Booking } from '../../services/bookings';
import { formatINR, formatDateIN, formatDateTimeIST } from '../../utils/formatters';
import { BorrowBuyLogo } from '../common/BorrowBuyLogo';
import {
  X,
  Printer,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

interface PaymentReceiptModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  booking,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNumber = `REC-${booking.bookingNumber.replace('BB-', '')}`;
  const latestPayment = booking.payments?.[0];
  const txnId = latestPayment?.transactionId || `TXN-SIM-${booking.id.slice(0, 8).toUpperCase()}`;
  const paymentMethod = latestPayment?.paymentMethod || 'UPI (Simulated)';

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
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md print:hidden"
        />

        {/* Modal Window / Printable Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-bb-border max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-10 z-10 print:max-w-none print:shadow-none print:border-none print:p-0"
        >
          {/* Action Bar (Top) */}
          <div className="flex items-center justify-between pb-6 border-b border-bb-border print:hidden">
            <span className="text-xs font-bold text-bb-text-secondary uppercase tracking-wider">
              Official Rental Payment Receipt
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-bb-surface-subtle hover:bg-slate-200 text-bb-text-primary font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-bb-border"
              >
                <Printer className="w-3.5 h-3.5 text-bb-text-secondary" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-bb-text-secondary hover:text-bb-text-primary rounded-xl hover:bg-bb-surface-subtle transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Receipt Content */}
          <div className="py-4">
            {/* Header: Brand & Receipt Badge */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-bb-border">
              <div>
                <BorrowBuyLogo size="md" variant="full" />
                <p className="text-xs text-bb-text-secondary mt-2">
                  BorrowBuy Technologies Pvt. Ltd. • Gujarat, India
                </p>
                <p className="text-[11px] text-bb-text-secondary">
                  GST: 24AAACB1234F1Z8 • support@borrowbuy.in
                </p>
              </div>

              <div className="sm:text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PAYMENT CONFIRMED</span>
                </div>
                <div className="text-xs font-mono font-bold text-bb-text-primary">
                  Receipt: {receiptNumber}
                </div>
                <div className="text-[11px] text-bb-text-secondary mt-0.5">
                  Date: {formatDateTimeIST(booking.createdAt)}
                </div>
              </div>
            </div>

            {/* Renter & Lender Info Grid */}
            <div className="grid grid-cols-2 gap-4 py-5 border-b border-bb-border text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-bb-text-secondary block mb-1">
                  Rented By (Customer)
                </span>
                <div className="font-bold text-bb-text-primary font-display">
                  {booking.customer?.fullName || 'Verified Customer'}
                </div>
                <div className="text-bb-text-secondary text-[11px]">
                  {booking.customer?.email}
                </div>
                <div className="text-bb-text-secondary text-[11px] mt-0.5">
                  {booking.customer?.phone || '+91 98250 11000'}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-bb-text-secondary block mb-1">
                  Equipment Lender
                </span>
                <div className="font-bold text-bb-text-primary font-display">
                  {booking.product?.owner?.fullName || 'Verified Equipment Owner'}
                </div>
                <div className="text-bb-text-secondary text-[11px]">
                  {booking.product?.owner?.phone || '+91 98255 66778'}
                </div>
                <div className="text-bb-text-secondary text-[11px] mt-0.5">
                  {booking.product?.location || 'Ahmedabad, Gujarat'}
                </div>
              </div>
            </div>

            {/* Rental Schedule Details */}
            <div className="py-5 border-b border-bb-border text-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-bb-text-secondary block mb-1">
                Rental Equipment & Schedule
              </span>
              <div className="flex items-center justify-between font-bold text-bb-text-primary">
                <span className="text-sm font-display">{booking.product?.name}</span>
                <span className="font-mono text-bb-text-primary bg-bb-surface-subtle px-2 py-0.5 rounded-md text-[11px] border border-bb-border">
                  Booking #{booking.bookingNumber}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-bb-text-secondary text-[11px] pt-1">
                <span>Start Date: <strong className="text-bb-text-primary">{formatDateIN(booking.startDate)}</strong></span>
                <span>•</span>
                <span>Return Date: <strong className="text-bb-text-primary">{formatDateIN(booking.endDate)}</strong></span>
                <span>•</span>
                <span>Duration: <strong className="text-bb-text-primary">{booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'}</strong></span>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="py-5 border-b border-bb-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-bb-text-secondary block mb-3">
                Payment Breakdown
              </span>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-bb-text-secondary">
                  <span>
                    Daily Rental Charges ({formatINR(booking.dailyPrice)} &times; {booking.totalDays} days)
                  </span>
                  <span className="font-semibold text-bb-text-primary">
                    {formatINR(booking.rentalTotal)}
                  </span>
                </div>

                <div className="flex justify-between text-bb-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <span>Refundable Security Deposit</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 font-bold rounded">
                      100% Refundable
                    </span>
                  </span>
                  <span className="font-semibold text-bb-text-primary">
                    {formatINR(booking.securityDeposit)}
                  </span>
                </div>

                <div className="flex justify-between text-bb-text-secondary">
                  <span>Platform & Processing Fee</span>
                  <span className="font-semibold text-emerald-700">₹0 (Free)</span>
                </div>

                <div className="pt-3 border-t border-bb-border flex justify-between items-baseline">
                  <div>
                    <span className="font-display font-black text-sm text-bb-text-primary block">
                      Total Amount Paid
                    </span>
                    <span className="text-[10px] text-bb-text-secondary">
                      Paid via {paymentMethod} • Txn ID: {txnId}
                    </span>
                  </div>
                  <span className="font-display font-black text-xl text-bb-accent">
                    {formatINR(booking.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Refund & Escrow Guarantee Note */}
            <div className="mt-5 p-4 rounded-2xl bg-bb-surface-subtle border border-bb-border text-xs text-bb-text-secondary leading-relaxed flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-bb-text-primary font-display block">Refundable Escrow Protection</strong>
                <span>
                  Your security deposit of <strong>{formatINR(booking.securityDeposit)}</strong> is safely held in escrow. Once you return the equipment and the lender verifies the return pass, your full deposit is released immediately back to your original payment account.
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-6 pt-4 border-t border-bb-border flex items-center justify-between print:hidden">
            <span className="text-[11px] text-bb-text-secondary">
              Need assistance? Email support@borrowbuy.in
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-bb-text-primary hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
