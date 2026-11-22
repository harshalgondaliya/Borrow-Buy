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
import { resolveImageUrl } from '../utils/apiUrl';

export const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { openAuth } = useModals();
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
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 bg-[#EFF3FE] text-[#315CF5] rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#DBE4FD]">
          <Calendar className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-[#17191C]">
          Sign In to Access Your Bookings
        </h2>
        <p className="text-xs text-[#66707A] mt-1.5 max-w-sm mx-auto leading-relaxed">
          Access your digital handover passes, reservation timelines, escrow security deposits, and rental receipts.
        </p>
        <button
          type="button"
          onClick={() => openAuth('login')}
          className="mt-5 px-5 py-2.5 bg-[#315CF5] hover:bg-[#2447C9] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ACTIVE') return b.status === 'ACTIVE' || b.status === 'CONFIRMED';
    if (filter === 'RESERVED') return b.status === 'RESERVED' || b.status === 'PENDING';
    if (filter === 'COMPLETED') return b.status === 'COMPLETED' || b.status === 'RETURNED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; bg: string; text: string; border: string }> = {
      RESERVED: { label: 'Hold Active (Pay Now)', bg: 'bg-[#FEF7ED]', text: 'text-[#B76E16]', border: 'border-[#FDE68A]' },
      CONFIRMED: { label: 'Paid • Ready for Pickup', bg: 'bg-[#EFF3FE]', text: 'text-[#315CF5]', border: 'border-[#DBE4FD]' },
      ACTIVE: { label: 'Active Rental', bg: 'bg-[#EBF5F1]', text: 'text-[#13795B]', border: 'border-[#13795B]/20' },
      RETURN_REQUESTED: { label: 'Return Pending', bg: 'bg-[#FEF7ED]', text: 'text-[#B76E16]', border: 'border-[#FDE68A]' },
      RETURNED: { label: 'Returned', bg: 'bg-[#F1F3F3]', text: 'text-[#17191C]', border: 'border-[#E5E8EA]' },
      COMPLETED: { label: 'Completed', bg: 'bg-[#F1F3F3]', text: 'text-[#66707A]', border: 'border-[#E5E8EA]' },
      CANCELLED: { label: 'Cancelled', bg: 'bg-[#FDF2F2]', text: 'text-[#C43838]', border: 'border-[#FDF2F2]' },
      EXPIRED: { label: 'Hold Expired', bg: 'bg-[#FDF2F2]', text: 'text-[#C43838]', border: 'border-[#FDF2F2]' },
    };
    const s = map[status] || { label: status, bg: 'bg-[#F1F3F3]', text: 'text-[#66707A]', border: 'border-[#E5E8EA]' };
    return (
      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border ${s.bg} ${s.text} ${s.border}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 mb-6 border-b border-[#E5E8EA] gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#315CF5] uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Customer Portal</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#17191C] tracking-tight">
            My Equipment Rentals
          </h1>
          <p className="text-xs text-[#66707A] mt-1">
            Manage your rental reservations, digital QR handover passes, and security deposits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/browse')}
          className="px-4 py-2 bg-white hover:bg-[#F1F3F3] text-[#17191C] text-xs font-medium rounded-lg border border-[#E5E8EA] shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>Rent More Gear</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1 bg-[#F1F3F3] rounded-lg mb-6 max-w-md text-xs font-medium">
        {(['ALL', 'ACTIVE', 'RESERVED', 'COMPLETED'] as const).map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setFilter(tabKey)}
            className={`flex-1 py-1.5 rounded-md transition-colors capitalize cursor-pointer ${
              filter === tabKey
                ? 'bg-white text-[#17191C] font-semibold shadow-xs'
                : 'text-[#66707A] hover:text-[#17191C]'
            }`}
          >
            {tabKey === 'ALL' ? 'All Bookings' : tabKey.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-6 p-3 bg-[#FDF2F2] border border-[#FDE68A] text-[#C43838] rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchBookings} className="underline text-xs font-semibold cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-[#E5E8EA] animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#E5E8EA] p-8">
          <div className="w-12 h-12 rounded-xl bg-[#F1F3F3] text-[#66707A] flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-base text-[#17191C]">No Bookings Found</h3>
          <p className="text-xs text-[#66707A] mt-1 max-w-sm mx-auto leading-relaxed">
            You don&apos;t have any equipment rentals matching this status filter. Browse our catalog to reserve gear today.
          </p>
          <button
            type="button"
            onClick={() => navigate('/browse')}
            className="mt-4 px-4 py-2 bg-[#315CF5] hover:bg-[#2447C9] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Browse Equipment Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-[#E5E8EA] p-5 shadow-xs hover:border-[#D0D5DD] transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F1F3F3]">
                <div className="flex items-start gap-4">
                  <img
                    src={
                      resolveImageUrl(b.product?.images?.[0]) ||
                      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={b.product?.name || 'Equipment'}
                    className="w-16 h-16 rounded-lg object-cover border border-[#E5E8EA] shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(b.status)}
                      <span className="text-xs text-[#66707A] font-mono">#{b.bookingNumber}</span>
                    </div>
                    <h3 className="font-semibold text-base text-[#17191C] leading-snug">
                      {b.product?.name || 'Equipment Rental'}
                    </h3>
                    <div className="text-xs text-[#66707A] mt-1 flex items-center gap-3">
                      <span>Owner: <strong className="text-[#17191C]">{b.product?.owner?.fullName || 'Verified Lender'}</strong></span>
                      <span>•</span>
                      <span>Location: {b.product?.location || 'Gujarat'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#66707A]">Total Amount</div>
                  <div className="font-bold text-lg text-[#17191C]">{formatINR(b.totalAmount)}</div>
                  <div className="text-[11px] text-[#13795B]">
                    Deposit: {formatINR(b.securityDeposit)} (Escrow)
                  </div>
                </div>
              </div>

              {/* Timeline & Actions Bar */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-[#66707A]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#315CF5]" />
                    <span>{formatDateIN(b.startDate)} → {formatDateIN(b.endDate)}</span>
                  </div>
                  <span>•</span>
                  <span>{b.totalDays} {b.totalDays === 1 ? 'day' : 'days'}</span>
                </div>

                {/* Status-Specific Interactive Actions */}
                <div className="flex items-center gap-2">
                  {b.status === 'RESERVED' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCancel(b.id)}
                        className="px-3 py-1.5 text-xs text-[#66707A] hover:text-[#C43838] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayingBooking(b)}
                        className="px-4 py-1.5 bg-[#315CF5] hover:bg-[#2447C9] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay {formatINR(b.totalAmount)}</span>
                      </button>
                    </>
                  )}

                  {(b.status === 'CONFIRMED' || b.status === 'READY_FOR_PICKUP') && (
                    <>
                      <button
                        type="button"
                        onClick={() => setReceiptBooking(b)}
                        className="px-3 py-1.5 text-xs text-[#66707A] hover:text-[#17191C] border border-[#E5E8EA] rounded-lg bg-white flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrBooking(b)}
                        className="px-3.5 py-1.5 bg-[#17191C] hover:bg-[#24282D] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Show Handover QR Pass</span>
                      </button>
                    </>
                  )}

                  {b.status === 'ACTIVE' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setReceiptBooking(b)}
                        className="px-3 py-1.5 text-xs text-[#66707A] hover:text-[#17191C] border border-[#E5E8EA] rounded-lg bg-white flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrBooking(b)}
                        className="px-3.5 py-1.5 bg-[#13795B] hover:bg-[#0E5B44] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Return QR Pass</span>
                      </button>
                    </>
                  )}

                  {b.status === 'COMPLETED' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setReceiptBooking(b)}
                        className="px-3 py-1.5 text-xs text-[#66707A] hover:text-[#17191C] border border-[#E5E8EA] rounded-lg bg-white flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewBooking(b)}
                        className="px-3.5 py-1.5 bg-white border border-[#E5E8EA] hover:border-[#315CF5] text-[#17191C] font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 text-[#B76E16]" />
                        <span>Leave Review</span>
                      </button>
                    </>
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
        onPaymentSuccess={fetchBookings}
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
        onReviewSuccess={fetchBookings}
      />

      <PaymentReceiptModal
        booking={receiptBooking}
        isOpen={!!receiptBooking}
        onClose={() => setReceiptBooking(null)}
      />
    </div>
  );
};
