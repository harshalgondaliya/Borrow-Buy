import React, { useEffect, useState } from 'react';
import { Booking, bookingsService } from '../../services/bookings';
import { X, Calendar, Package, CreditCard, QrCode, Star } from 'lucide-react';
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

  const statusColors: Record<string, string> = {
    RESERVED: 'bg-amber-100 text-amber-800 border-amber-200',
    CONFIRMED: 'bg-sky-100 text-sky-800 border-sky-200',
    READY_FOR_PICKUP: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    RETURN_REQUESTED: 'bg-purple-100 text-purple-800 border-purple-200',
    RETURNED: 'bg-teal-100 text-teal-800 border-teal-200',
    COMPLETED: 'bg-slate-100 text-slate-800 border-slate-200',
    CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
    DISPUTED: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">My Rental Bookings</h2>
            <p className="text-xs text-slate-500">Track active reservations, scheduled pickups, and return receipts.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading your rentals...</div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">No bookings yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't reserved any gear yet. Explore the marketplace to find cameras, tools, and tech.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-sm space-y-3"
              >
                {/* Top Row: Booking Number & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800">{booking.bookingNumber}</span>
                    <span className="text-[11px] text-slate-400">• Booked {new Date(booking.createdAt).toLocaleDateString()}</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      statusColors[booking.status] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                {/* Middle Row: Product & Dates */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={booking.product?.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=100&q=80'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">{booking.product?.name}</div>
                      <div className="text-xs text-slate-500">
                        Owner: {booking.product?.owner?.fullName || 'Verified Owner'}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs sm:text-right text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <div className="font-semibold text-slate-900">
                      {new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'} rental
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Financials & Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Total: </span>
                    <span className="font-extrabold text-slate-900 text-sm">${booking.totalAmount.toFixed(2)}</span>
                    <span className="text-[11px] text-slate-400 ml-1">
                      (Rental: ${booking.rentalTotal} + Deposit: ${booking.securityDeposit})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Pay & Confirm CTA for RESERVED bookings */}
                    {booking.status === 'RESERVED' && (
                      <button
                        onClick={() => setPayingBooking(booking)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm transition"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Pay & Confirm (${booking.totalAmount.toFixed(2)})
                      </button>
                    )}

                    {/* View QR Code Pass for CONFIRMED or ACTIVE rentals */}
                    {(booking.status === 'CONFIRMED' || booking.status === 'ACTIVE' || booking.status === 'READY_FOR_PICKUP') && (
                      <button
                        onClick={() => setQrBooking(booking)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs shadow-sm transition"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        View QR Pass
                      </button>
                    )}

                    {/* Write Review for COMPLETED rentals */}
                    {booking.status === 'COMPLETED' && (
                      <button
                        onClick={() => setReviewBooking(booking)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs shadow-sm transition"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        Write Review
                      </button>
                    )}

                    {/* Cancellation Action */}
                    {(booking.status === 'RESERVED' || booking.status === 'CONFIRMED') && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition border border-rose-200"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
      </div>
    </div>
  );
};
