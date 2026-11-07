import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Booking, bookingsService } from '../../services/bookings';
import {
  X,
  Calendar,
  Package,
  CreditCard,
  QrCode,
  Star,
  AlertCircle,
} from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { QRCodeModal } from './QRCodeModal';
import { ReviewModal } from './ReviewModal';

interface CustomerBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerBookingsModal: React.FC<CustomerBookingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESERVED' | 'COMPLETED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sub-modal states
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [qrBooking, setQrBooking] = useState<Booking | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingsService.getCustomerBookings();
      setBookings(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBookings();
    }
  }, [isOpen]);

  const handleCancel = async (bookingId: string) => {
    const reason = prompt('Please enter a cancellation reason:');
    if (!reason) return;

    try {
      await bookingsService.cancelBooking(bookingId, reason);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  if (!isOpen) return null;

  const statusBadge = (status: string) => {
    switch (status) {
      case 'RESERVED':
        return 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500/20';
      case 'CONFIRMED':
      case 'READY_FOR_PICKUP':
        return 'bg-brand-50 text-brand-700 border-brand-200 ring-1 ring-brand-500/20';
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-500/20';
      case 'RETURN_REQUESTED':
      case 'RETURNED':
        return 'bg-teal-50 text-teal-800 border-teal-200 ring-1 ring-teal-500/20';
      case 'COMPLETED':
        return 'bg-charcoal-100 text-charcoal-800 border-charcoal-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'DISPUTED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-charcoal-100 text-charcoal-700 border-charcoal-200';
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ACTIVE') return b.status === 'ACTIVE' || b.status === 'CONFIRMED' || b.status === 'READY_FOR_PICKUP';
    if (filter === 'RESERVED') return b.status === 'RESERVED';
    if (filter === 'COMPLETED') return b.status === 'COMPLETED' || b.status === 'RETURNED';
    return true;
  });

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
          className="relative bg-white rounded-3xl shadow-elevated border border-charcoal-100 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-charcoal-400 hover:text-charcoal-700 p-2 rounded-xl hover:bg-charcoal-100/70 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-charcoal-100 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100 shadow-sm">
                  <Calendar className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-display font-extrabold text-charcoal-900">
                  My Rental Bookings
                </h2>
              </div>
              <p className="text-xs text-charcoal-500">
                Track active reservations, temporary locks, and single-use digital handover passes.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex p-1 bg-charcoal-100/80 rounded-xl text-xs font-semibold self-start sm:self-auto">
              {(['ALL', 'ACTIVE', 'RESERVED', 'COMPLETED'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                    filter === tab
                      ? 'bg-white text-charcoal-900 shadow-sm'
                      : 'text-charcoal-500 hover:text-charcoal-800'
                  }`}
                >
                  {tab.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Main Bookings List */}
          <div className="mt-6">
            {loading ? (
              <div className="py-16 text-center text-xs text-charcoal-400 space-y-2">
                <span className="inline-block w-6 h-6 border-2 border-brand-500/30 border-t-brand-600 rounded-full animate-spin" />
                <div>Loading your rental history...</div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 bg-charcoal-50 text-charcoal-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-charcoal-100">
                  <Package className="w-7 h-7 text-charcoal-300" />
                </div>
                <h4 className="text-sm font-bold text-charcoal-800">No bookings in this view</h4>
                <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto">
                  {filter === 'ALL'
                    ? "You haven't rented any equipment yet. Explore our curated catalog of cameras, tech, and gear."
                    : `No bookings found matching filter "${filter.toLowerCase()}".`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border border-charcoal-200/80 bg-white hover:border-charcoal-300 transition-all shadow-card hover:shadow-card-hover space-y-3.5"
                  >
                    {/* Top Row: Ref number, booked date, status pill */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-charcoal-900 bg-charcoal-50 px-2 py-0.5 rounded-lg border border-charcoal-200">
                          {booking.bookingNumber}
                        </span>
                        <span className="text-[11px] text-charcoal-400">
                          Booked {new Date(booking.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    {/* Middle Row: Product info and schedule */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-charcoal-100">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={
                            booking.product?.images?.[0] ||
                            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=120&q=80'
                          }
                          alt={booking.product?.name || 'Equipment'}
                          className="w-14 h-14 rounded-2xl object-cover border border-charcoal-100 shadow-sm shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-charcoal-900 truncate">
                            {booking.product?.name}
                          </div>
                          <div className="text-xs text-charcoal-500 mt-0.5">
                            Lender: <span className="text-charcoal-700 font-semibold">{booking.product?.owner?.fullName || 'Verified Owner'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs sm:text-right bg-charcoal-50/80 p-3 rounded-2xl border border-charcoal-100">
                        <div className="font-bold text-charcoal-900 font-display">
                          {new Date(booking.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} →{' '}
                          {new Date(booking.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-charcoal-500 mt-0.5">
                          {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'} duration
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Financial ledger & contextual actions */}
                    <div className="pt-2.5 border-t border-charcoal-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-charcoal-500">Total: </span>
                        <span className="font-display font-extrabold text-charcoal-900 text-sm">
                          ${booking.totalAmount.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-charcoal-400 ml-1.5">
                          (Rate: ${booking.rentalTotal} + Escrow Deposit: ${booking.securityDeposit})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Pay CTA for RESERVED bookings */}
                        {booking.status === 'RESERVED' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPayingBooking(booking)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Confirm & Pay (${booking.totalAmount.toFixed(2)})</span>
                          </motion.button>
                        )}

                        {/* View QR Code Pass */}
                        {(booking.status === 'CONFIRMED' ||
                          booking.status === 'ACTIVE' ||
                          booking.status === 'READY_FOR_PICKUP') && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setQrBooking(booking)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>View QR Pass</span>
                          </motion.button>
                        )}

                        {/* Write Review for COMPLETED */}
                        {booking.status === 'COMPLETED' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setReviewBooking(booking)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                          >
                            <Star className="w-3.5 h-3.5 fill-white" />
                            <span>Write Review</span>
                          </motion.button>
                        )}

                        {/* Cancellation Action */}
                        {(booking.status === 'RESERVED' || booking.status === 'CONFIRMED') && (
                          <button
                            type="button"
                            onClick={() => handleCancel(booking.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sub-Modals */}
          <PaymentModal
            booking={payingBooking}
            isOpen={!!payingBooking}
            onClose={() => setPayingBooking(null)}
            onPaymentSuccess={() => {
              fetchBookings();
            }}
          />

          <QRCodeModal
            booking={qrBooking}
            isOpen={!!qrBooking}
            onClose={() => setQrBooking(null)}
          />

          <ReviewModal
            booking={reviewBooking}
            isOpen={!!reviewBooking}
            onClose={() => setReviewBooking(null)}
            onReviewSuccess={() => {
              fetchBookings();
            }}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
