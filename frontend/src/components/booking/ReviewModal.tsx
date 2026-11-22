import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Booking } from '../../services/bookings';
import { reviewsService } from '../../services/reviews';
import { useToast } from '../../features/toast/ToastContext';
import { X, Star, AlertCircle } from 'lucide-react';

interface ReviewModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSuccess: () => void;
}

const RATING_LABELS = ['', 'Needs Improvement', 'Fair Experience', 'Good Quality', 'Great Service', 'Exceptional!'];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  booking,
  isOpen,
  onClose,
  onReviewSuccess,
}) => {
  const { success } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await reviewsService.createReview({
        bookingId: booking.id,
        rating,
        comment,
      });
      success('Thank you for your feedback! The owner rating has been updated.', 'Review Submitted');
      onReviewSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Please try again.');
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
          className="relative bg-white rounded-2xl shadow-elevated border border-[#E5E8EA] max-w-md w-full p-6 sm:p-7 z-10 text-[#17191C]"
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
          <div className="text-center mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#FEF7ED] text-[#B76E16] flex items-center justify-center mx-auto mb-2 border border-[#FDE68A]">
              <Star className="w-5 h-5 fill-[#B76E16] text-[#B76E16]" />
            </div>
            <h2 className="text-lg font-semibold text-[#17191C]">
              Rate Your Experience
            </h2>
            <p className="text-xs text-[#66707A] mt-1 max-w-xs mx-auto">
              How was your rental of <strong>{booking.product?.name}</strong> from{' '}
              {booking.product?.owner?.fullName || 'the owner'}?
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-[#FDF2F2] border border-[#FDE68A] text-[#C43838] rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C43838]" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating Select */}
            <div className="text-center">
              <div className="flex justify-center items-center gap-2 mb-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(rating)}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'fill-[#B76E16] text-[#B76E16]'
                          : 'text-[#E5E8EA]'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-xs font-semibold text-[#B76E16] h-4">
                {RATING_LABELS[hoverRating || rating]}
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-xs font-semibold text-[#17191C] mb-1">
                Your Review
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share details about equipment condition, owner communication, and handover..."
                className="w-full p-2.5 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors text-[#17191C] placeholder:text-[#66707A]"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#66707A] hover:text-[#17191C] transition-colors cursor-pointer"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 bg-[#315CF5] hover:bg-[#2447C9] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Submit Review</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
