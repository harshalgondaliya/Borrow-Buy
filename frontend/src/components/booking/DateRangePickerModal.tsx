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
          className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-lg w-full p-6 sm:p-8 z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <img
              src={
                product.images?.[0] ||
                'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=150&q=80'
              }
              alt={product.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
            />
            <div className="min-w-0 pr-6">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 uppercase tracking-wider mb-0.5">
                <Calendar className="w-3.5 h-3.5" />
                Select Rental Dates
              </span>
              <h2 className="text-lg font-display font-extrabold text-slate-900 truncate">
                {product.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatINR(product.pricePerDay)}/day • {formatINR(product.securityDeposit)} refundable deposit
              </p>
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

          {/* Booked Dates Notice */}
          {calendarDates.length > 0 && (
            <div className="mb-5 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs">
              <div className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Already Booked On These Dates:
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {calendarDates.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-0.5 bg-white border border-amber-200 text-amber-900 rounded-lg text-[11px] font-medium"
                  >
                    {formatDateIN(c.startDate)} – {formatDateIN(c.endDate)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Date Range Inputs */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Pickup Date
              </label>
              <input
                type="date"
                min={todayStr}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white px-3 py-2 text-xs font-semibold text-slate-900 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all cursor-pointer"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Return Date
              </label>
              <input
                type="date"
                min={startDate || todayStr}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white px-3 py-2 text-xs font-semibold text-slate-900 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Availability Status Indicator */}
          <div className="mb-5 flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs">
            <span className="text-slate-500 font-medium">Availability:</span>
            {checkingAvailability ? (
              <span className="text-amber-600 font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Checking calendar...
              </span>
            ) : isAvailable ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Available to Book
              </span>
            ) : (
              <span className="text-rose-600 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Dates Unavailable
              </span>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5 text-xs mb-5">
            <div className="flex justify-between text-slate-600">
              <span>Rental Duration</span>
              <span className="font-bold text-slate-900 font-display">
                {diffDays} {diffDays === 1 ? 'day' : 'days'}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Rental Charge ({formatINR(product.pricePerDay)} × {diffDays} days)</span>
              <span className="font-bold text-slate-900">{formatINR(rentalTotal)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <span>Security Deposit</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Refundable
                </span>
              </span>
              <span className="font-bold text-slate-900">{formatINR(securityDeposit)}</span>
            </div>

            <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
              <div>
                <span className="font-bold text-sm block">Total Payable Now</span>
                <span className="text-[10px] text-slate-500">Includes rental charge + refundable deposit</span>
              </div>
              <span className="text-xl font-display font-extrabold text-brand-600">
                {formatINR(totalAmount)}
              </span>
            </div>
          </div>

          {/* 15-Minute Hold Notice */}
          <div className="flex items-center gap-2 p-3 bg-brand-50/70 border border-brand-100 rounded-2xl mb-6 text-xs text-brand-900">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
            <span className="text-[11px] leading-relaxed">
              Reserving holds these dates exclusively for <strong>15 minutes</strong> while you complete checkout.
            </span>
          </div>

          {/* Action CTAs */}
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
              disabled={!isAvailable || checkingAvailability || bookingLoading}
              onClick={handleReserve}
              className="flex-1 py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {bookingLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Holding Dates...</span>
                </>
              ) : (
                <>
                  <span>Reserve & Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
