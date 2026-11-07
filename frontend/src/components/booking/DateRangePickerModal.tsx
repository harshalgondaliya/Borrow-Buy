import React, { useState, useEffect } from 'react';
import { Product } from '../../services/products';
import { BookingCalendarInterval, bookingsService } from '../../services/bookings';
import { useToast } from '../../features/toast/ToastContext';
import { X, Calendar, ShieldCheck, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

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
  // Format today as YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(tomorrowStr);
  const [calendarDates, setCalendarDates] = useState<BookingCalendarInterval[]>([]);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch product calendar
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
      setError('End date cannot be earlier than start date');
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
          setError('Selected dates are already booked. Please choose alternative dates.');
        }
      })
      .catch((err) => {
        setIsAvailable(false);
        setError(err.message || 'Availability check failed');
      })
      .finally(() => setCheckingAvailability(false));
  }, [product, startDate, endDate]);

  if (!isOpen || !product) return null;

  // Calculate pricing
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
      success('15-minute reservation lock secured! Proceed to payment to confirm.', 'Dates Reserved');
      onBookingSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reserve booking. Dates may have been taken.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Select Rental Schedule</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 line-clamp-1">{product.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ${product.pricePerDay} / day • ${product.securityDeposit} refundable deposit
          </p>
        </div>

        {/* Alert / Error Box */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Currently Booked Ranges Reminder */}
        {calendarDates.length > 0 && (
          <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Existing Bookings on this item:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500">
              {calendarDates.map((c, i) => (
                <li key={i}>
                  {new Date(c.startDate).toLocaleDateString()} to {new Date(c.endDate).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Date Input Pickers */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Date</label>
            <input
              type="date"
              min={todayStr}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Return Date</label>
            <input
              type="date"
              min={startDate || todayStr}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Availability Status Badge */}
        <div className="mb-6 flex items-center justify-between text-xs px-3 py-2 bg-slate-50 rounded-xl">
          <span className="text-slate-500 font-medium">Availability Status:</span>
          {checkingAvailability ? (
            <span className="text-amber-600 font-semibold animate-pulse">Checking dates...</span>
          ) : isAvailable ? (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Dates Open & Available
            </span>
          ) : (
            <span className="text-rose-600 font-bold">Unavailable</span>
          )}
        </div>

        {/* Price & Deposit Breakdown */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs mb-6">
          <div className="flex justify-between text-slate-600">
            <span>Rental Duration</span>
            <span className="font-semibold text-slate-900">{diffDays} {diffDays === 1 ? 'day' : 'days'}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Daily Rate (${product.pricePerDay} × {diffDays} days)</span>
            <span className="font-semibold text-slate-900">${rentalTotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span className="flex items-center gap-1">
              Refundable Security Deposit
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            </span>
            <span className="font-semibold text-slate-900">${securityDeposit.toFixed(2)}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
            <span>Total Payable Amount</span>
            <span className="text-base font-extrabold text-sky-600">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Temporary Hold Notice */}
        <div className="text-[11px] text-slate-400 text-center mb-6">
          🛡️ Clicking below places an exclusive 15-minute temporary hold on these dates so no one else can book them.
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isAvailable || checkingAvailability || bookingLoading}
            onClick={handleReserve}
            className="flex-1 py-3 px-5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {bookingLoading ? 'Securing Dates...' : 'Lock Reservation Dates'}
          </button>
        </div>
      </div>
    </div>
  );
};

