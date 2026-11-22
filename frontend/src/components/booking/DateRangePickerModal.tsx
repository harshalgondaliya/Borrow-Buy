import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../services/products';
import { BookingCalendarInterval, bookingsService } from '../../services/bookings';
import { useToast } from '../../features/toast/ToastContext';
import { formatINR, formatDateIN } from '../../utils/formatters';
import {
  X,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface DateRangePickerModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export const DateRangePickerModal: React.FC<DateRangePickerModalProps> = ({
  product,
  isOpen,
  onClose,
  onBookingSuccess,
}) => {
  const { success } = useToast();
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(tomorrowStr);
  const [calendarDates, setCalendarDates] = useState<BookingCalendarInterval[]>([]);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch product calendar intervals
  useEffect(() => {
    if (product && isOpen) {
      bookingsService
        .getProductCalendar(product.id)
        .then((res) => setCalendarDates(res.data))
        .catch((err) => console.error('Failed to load calendar', err));
      setError(null);
    }
  }, [product, isOpen]);

  // Live availability check whenever dates change
  useEffect(() => {
    if (!product || !startDate || !endDate) return;

    if (new Date(endDate) < new Date(startDate)) {
      setIsAvailable(false);
      setError('Return date must be on or after pickup date');
      return;
    }

    setCheckingAvailability(true);
    setError(null);

    const startISO = new Date(startDate).toISOString();
    const endISO = new Date(endDate).toISOString();

    bookingsService
      .checkAvailability(product.id, startISO, endISO)
      .then((res) => {
        setIsAvailable(res.available);
        if (!res.available) {
          setError('Selected dates are already reserved by another customer.');
        }
      })
      .catch((err) => {
        setIsAvailable(false);
        setError(err.message || 'Availability check failed');
      })
      .finally(() => setCheckingAvailability(false));
  }, [product, startDate, endDate]);

  if (!isOpen || !product) return null;

  // Calculate duration and financials
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const rentalTotal = diffDays * product.pricePerDay;
  const securityDeposit = product.securityDeposit;
  const totalAmount = rentalTotal + securityDeposit;

  const handleReserve = async () => {
    setBookingLoading(true);
    setError(null);
    try {
      await bookingsService.createBooking({
        productId: product.id,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      success('Dates held for 15 minutes! Please proceed to payment to confirm.', 'Dates Reserved');
      onBookingSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reserve booking. These dates may have just been booked.');
    } finally {
      setBookingLoading(false);
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
          className="relative bg-white rounded-2xl shadow-elevated border border-[#E5E8EA] max-w-lg w-full p-6 sm:p-7 z-10 text-[#17191C]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#66707A] hover:text-[#17191C] p-2 rounded-lg hover:bg-[#F1F3F3] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-3.5 mb-5">
            <img
              src={
                product.images?.[0] ||
                'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=150&q=80'
              }
              alt={product.name}
              className="w-14 h-14 rounded-xl object-cover border border-[#E5E8EA] shrink-0"
            />
            <div className="min-w-0 pr-6">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#315CF5] uppercase tracking-wider mb-0.5">
                <Calendar className="w-3.5 h-3.5" />
                Select Rental Dates
              </span>
              <h2 className="text-base font-semibold text-[#17191C] truncate">
                {product.name}
              </h2>
              <p className="text-xs text-[#66707A] mt-0.5">
                {formatINR(product.pricePerDay)}/day • {formatINR(product.securityDeposit)} refundable deposit
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-[#FDF2F2] border border-[#FDE68A] text-[#C43838] rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C43838]" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {/* Booked Dates Notice */}
          {calendarDates.length > 0 && (
            <div className="mb-4 p-3 bg-[#FEF7ED] border border-[#FDE68A] rounded-xl text-xs">
              <div className="font-semibold text-[#B76E16] mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Reserved Dates:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {calendarDates.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 bg-white border border-[#E5E8EA] text-[#B76E16] rounded-md text-[11px] font-medium"
                  >
                    {formatDateIN(c.startDate)} – {formatDateIN(c.endDate)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Date Range Inputs */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#FAFAF8] p-3 rounded-xl border border-[#E5E8EA]">
              <label className="block text-[11px] font-semibold text-[#66707A] uppercase tracking-wider mb-1">
                Pickup Date
              </label>
              <input
                type="date"
                min={todayStr}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white px-2.5 py-1.5 text-xs font-semibold text-[#17191C] border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors cursor-pointer"
              />
            </div>

            <div className="bg-[#FAFAF8] p-3 rounded-xl border border-[#E5E8EA]">
              <label className="block text-[11px] font-semibold text-[#66707A] uppercase tracking-wider mb-1">
                Return Date
              </label>
              <input
                type="date"
                min={startDate || todayStr}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white px-2.5 py-1.5 text-xs font-semibold text-[#17191C] border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors cursor-pointer"
              />
            </div>
          </div>

          {/* Availability Status Indicator */}
          <div className="mb-4 flex items-center justify-between px-3 py-2 bg-[#FAFAF8] border border-[#E5E8EA] rounded-xl text-xs">
            <span className="text-[#66707A]">Availability:</span>
            {checkingAvailability ? (
              <span className="text-[#B76E16] font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B76E16] animate-ping" />
                Checking calendar...
              </span>
            ) : isAvailable ? (
              <span className="text-[#13795B] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#13795B]" />
                Available to Book
              </span>
            ) : (
              <span className="text-[#C43838] font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Dates Unavailable
              </span>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="p-3.5 bg-[#FAFAF8] border border-[#E5E8EA] rounded-xl space-y-2 text-xs mb-4">
            <div className="flex justify-between text-[#66707A]">
              <span>Duration</span>
              <span className="font-semibold text-[#17191C]">
                {diffDays} {diffDays === 1 ? 'day' : 'days'}
              </span>
            </div>

            <div className="flex justify-between text-[#66707A]">
              <span>Rental Charge ({formatINR(product.pricePerDay)} × {diffDays} d)</span>
              <span className="font-semibold text-[#17191C]">{formatINR(rentalTotal)}</span>
            </div>

            <div className="flex justify-between text-[#66707A]">
              <span className="flex items-center gap-1">
                <span>Security Deposit</span>
                <span className="text-[10px] text-[#13795B] font-semibold bg-[#EBF5F1] px-1.5 py-0.2 rounded">
                  Refundable
                </span>
              </span>
              <span className="font-semibold text-[#17191C]">{formatINR(securityDeposit)}</span>
            </div>

            <div className="pt-2 border-t border-[#E5E8EA] flex justify-between items-baseline text-[#17191C]">
              <div>
                <span className="font-semibold text-xs block">Total Amount</span>
                <span className="text-[10px] text-[#66707A]">Rental fee + refundable deposit</span>
              </div>
              <span className="text-lg font-bold text-[#315CF5]">
                {formatINR(totalAmount)}
              </span>
            </div>
          </div>

          {/* 15-Minute Hold Notice */}
          <div className="flex items-center gap-2 p-2.5 bg-[#EFF3FE] border border-[#DBE4FD] rounded-xl mb-5 text-xs text-[#315CF5]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#315CF5]" />
            <span className="text-[11px]">
              Reserving holds dates for <strong>15 minutes</strong> while you complete payment simulation.
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-[#66707A] hover:text-[#17191C] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isAvailable || checkingAvailability || bookingLoading}
              onClick={handleReserve}
              className="flex-1 py-2.5 px-4 bg-[#315CF5] hover:bg-[#2447C9] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
            >
              {bookingLoading ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Holding Dates...</span>
                </>
              ) : (
                <>
                  <span>Reserve & Proceed to Payment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
