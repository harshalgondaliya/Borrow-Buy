import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Package,
  CreditCard,
  QrCode,
  Star,
  FileText,
  AlertCircle,
  Clock,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { Booking, bookingsService } from '../services/bookings';
import { useAuth } from '../features/auth/AuthContext';
import { useModals } from '../features/modal/ModalContext';
import { useToast } from '../features/toast/ToastContext';
import { formatINR, formatDateIN } from '../utils/formatters';
import { PaymentModal } from '../components/booking/PaymentModal';
import { QRCodeModal } from '../components/booking/QRCodeModal';
import { ReviewModal } from '../components/booking/ReviewModal';
import { PaymentReceiptModal } from '../components/booking/PaymentReceiptModal';

export const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { openAuth, openProduct } = useModals();
  const { success, error: toastError } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESERVED' | 'COMPLETED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sub-modal states
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [qrBooking, setQrBooking] = useState<Booking | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    if (!isAuthenticated) return;
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
    if (isAuthenticated) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleCancel = async (bookingId: string) => {
    const reason = prompt('Please enter a cancellation reason:');
    if (!reason) return;

    try {
      await bookingsService.cancelBooking(bookingId, reason);
      success('Booking cancelled successfully', 'Reservation Update');
      fetchBookings();
    } catch (err: any) {
      toastError(err.message || 'Failed to cancel booking', 'Cancellation Error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-[#172B46] text-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-black text-[#172B46]">
          Sign In to Access Your Bookings
        </h2>
        <p className="text-xs text-[#667085] mt-2 max-w-md mx-auto leading-relaxed">
          Access your digital handover passes, reservation timelines, escrow security deposits, and rental receipts.
        </p>
        <button
          type="button"
          onClick={() => openAuth('login')}
          className="mt-6 px-6 py-3 bg-[#F06449] hover:bg-[#D95339] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE')
      return ['CONFIRMED', 'READY_FOR_PICKUP', 'ACTIVE'].includes(b.status);
    if (filter === 'RESERVED') return b.status === 'RESERVED';
    if (filter === 'COMPLETED')
      return ['COMPLETED', 'RETURNED'].includes(b.status);
    return true;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case 'RESERVED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'CONFIRMED':
      case 'READY_FOR_PICKUP':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-[#E4E7EC]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#F06449] uppercase tracking-wider mb-1 font-display">
            <Calendar className="w-4 h-4 text-[#F06449]" />
            <span>Rental Activity</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#172B46] tracking-tight">
            My Bookings & Passes
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Manage your equipment reservations, present digital QR passes, and download invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBookings}
          className="text-xs font-semibold text-[#172B46] hover:text-[#F06449] flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E4E7EC] pb-3 mb-6 overflow-x-auto">
        {(['ALL', 'ACTIVE', 'RESERVED', 'COMPLETED'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              filter === t
                ? 'bg-[#172B46] text-white shadow-xs'
                : 'text-[#667085] hover:text-[#172B46] hover:bg-[#F5F6F8]'
            }`}
          >
            {t === 'ALL'
              ? `All Bookings (${bookings.length})`
              : t === 'ACTIVE'
              ? 'Active Rentals'
              : t === 'RESERVED'
              ? 'Reserved (Awaiting Payment)'
              : 'Completed & Returned'}
          </button>
        ))}
      </div>

      {/* Main List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-[#E4E7EC] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E4E7EC] p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-[#F5F6F8] text-[#172B46] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#E4E7EC]">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-display text-lg font-bold text-[#202833]">
            No bookings found
          </h3>
          <p className="text-xs text-[#667085] mt-1.5 max-w-sm mx-auto leading-relaxed">
            {filter === 'ALL'
              ? "You haven't rented any equipment yet. Explore our verified listings across Gujarat."
              : `No bookings currently match the "${filter}" filter.`}
          </p>
          <button
            type="button"
            onClick={() => navigate('/browse')}
            className="mt-6 px-6 py-2.5 bg-[#F06449] hover:bg-[#D95339] text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Gear Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-xs hover:border-[#172B46] transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge(
                        b.status
                      )}`}
                    >
                      {b.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] font-mono text-[#667085]">
                      #{b.id.slice(0, 8)}
                    </span>
                    <span className="text-[11px] text-[#667085] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDateIN(b.startDate)} &rarr; {formatDateIN(b.endDate)}
                      </span>
                    </span>
                  </div>

                  <h3
                    onClick={() => b.product && openProduct(b.product)}
                    className="font-display font-bold text-base text-[#172B46] hover:text-[#F06449] cursor-pointer transition-colors"
                  >
                    {b.product?.name || 'Equipment Rental'}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-[#667085] flex-wrap">
                    <span>
                      Rental Total:{' '}
                      <strong className="text-[#172B46]">{formatINR(b.rentalTotal)}</strong>
                    </span>
                    <span>
                      Security Deposit:{' '}
                      <strong className="text-[#2F6B65]">
                        {formatINR(b.securityDeposit)} (Escrow)
                      </strong>
                    </span>
                    {b.product?.owner?.fullName && (
                      <span>
                        Owner: <strong>{b.product.owner.fullName}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {['CONFIRMED', 'READY_FOR_PICKUP', 'ACTIVE'].includes(b.status) && (
                    <button
                      type="button"
                      onClick={() => setQrBooking(b)}
                      className="px-4 py-2 bg-[#172B46] hover:bg-[#202833] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Digital Pass</span>
                    </button>
                  )}

                  {b.status === 'RESERVED' && (
                    <button
                      type="button"
                      onClick={() => setPayingBooking(b)}
                      className="px-4 py-2 bg-[#F06449] hover:bg-[#D95339] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay Now</span>
                    </button>
                  )}

                  {['CONFIRMED', 'READY_FOR_PICKUP', 'ACTIVE', 'COMPLETED'].includes(
                    b.status
                  ) && (
                    <button
                      type="button"
                      onClick={() => setReceiptBooking(b)}
                      className="px-3.5 py-2 bg-[#F5F6F8] hover:bg-[#E9EDF2] text-[#172B46] text-xs font-semibold rounded-xl border border-[#E4E7EC] transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                  )}

                  {b.status === 'COMPLETED' && (
                    <button
                      type="button"
                      onClick={() => setReviewBooking(b)}
                      className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-200 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Leave Review</span>
                    </button>
                  )}

                  {['RESERVED', 'CONFIRMED'].includes(b.status) && (
                    <button
                      type="button"
                      onClick={() => handleCancel(b.id)}
                      className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
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

      {/* Sub Modals */}
      {payingBooking && (
        <PaymentModal
          booking={payingBooking}
          isOpen={!!payingBooking}
          onClose={() => setPayingBooking(null)}
          onPaymentSuccess={() => {
            setPayingBooking(null);
            fetchBookings();
          }}
        />
      )}

      {qrBooking && (
        <QRCodeModal
          booking={qrBooking}
          isOpen={!!qrBooking}
          onClose={() => setQrBooking(null)}
        />
      )}

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          isOpen={!!reviewBooking}
          onClose={() => setReviewBooking(null)}
          onReviewSuccess={() => {
            setReviewBooking(null);
            fetchBookings();
          }}
        />
      )}

      {receiptBooking && (
        <PaymentReceiptModal
          booking={receiptBooking}
          isOpen={!!receiptBooking}
          onClose={() => setReceiptBooking(null)}
        />
      )}
    </div>
  );
};
