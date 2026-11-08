import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../services/products';
import { formatINR } from '../../utils/formatters';
import {
  X,
  MapPin,
  ShieldCheck,
  Star,
  Calendar,
  CheckCircle2,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onBookNow: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onBookNow,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'rules' | 'reviews'>('details');

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80'];

  const getImageUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${base}${url}`;
  };

  const conditionLabels: Record<string, string> = {
    BRAND_NEW: 'Brand New (Sealed/Pristine)',
    LIKE_NEW: 'Like New (Mint Condition)',
    GOOD: 'Good (Minor Cosmetic Wear)',
    FAIR: 'Fair (Fully Functional)',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
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
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors z-20"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Grid Layout: Left Gallery + Right Information */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT: Image Gallery */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm group">
                <img
                  src={getImageUrl(images[selectedImageIndex])}
                  alt={`${product.name} - View ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-slate-800 shadow-sm border border-white/70">
                  {product.category?.name || 'Equipment'}
                </div>

                {/* Image Counter Badge */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white shadow-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Arrow navigation buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md flex items-center justify-center backdrop-blur-sm transition-all opacity-80 group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md flex items-center justify-center backdrop-blur-sm transition-all opacity-80 group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Selector */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImageIndex(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImageIndex === i
                          ? 'border-brand-600 ring-2 ring-brand-500/20'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`${product.name} thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust & Escrow Guarantee Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>BorrowBuy Rental Guarantee</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  • <strong>Refundable Deposit:</strong> The {formatINR(product.securityDeposit)} deposit is held safely during your rental and automatically returned upon inspection.
                </p>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  • <strong>Digital Pass:</strong> Single-use QR pass prevents confusion at pickup and return.
                </p>
              </div>
            </div>

            {/* RIGHT: Product Details & Booking Action */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                {/* Location & Rating */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{product.location}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-amber-900">
                      {product.owner?.trustScore?.toFixed(1) || '5.0'}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-display font-extrabold text-slate-900 leading-tight mb-2">
                  {product.name}
                </h1>

                {/* Brand & Model Pills */}
                {(product.brand || product.model) && (
                  <div className="flex items-center gap-2 mb-4">
                    {product.brand && (
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200">
                        {product.brand}
                      </span>
                    )}
                    {product.model && (
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-mono rounded-lg border border-slate-200">
                        {product.model}
                      </span>
                    )}
                  </div>
                )}

                {/* Pricing Box */}
                <div className="p-4 bg-brand-50/60 border border-brand-100 rounded-2xl mb-5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-display font-black text-brand-700">
                        {formatINR(product.pricePerDay)}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 ml-1">/ day</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Security Deposit</span>
                      <span className="text-sm font-bold text-slate-900 font-display">
                        {formatINR(product.securityDeposit)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabs Switcher: Details vs Rules vs Reviews */}
                <div className="flex p-1 bg-slate-100 rounded-2xl mb-4 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 py-1.5 rounded-xl transition-all ${
                      activeTab === 'details'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('rules')}
                    className={`flex-1 py-1.5 rounded-xl transition-all ${
                      activeTab === 'rules'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Rental Rules
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className={`flex-1 py-1.5 rounded-xl transition-all ${
                      activeTab === 'reviews'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Reviews
                  </button>
                </div>

                {/* TAB CONTENT: Details */}
                {activeTab === 'details' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block mb-1">Description</span>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Condition</span>
                        <span className="font-bold text-slate-800">
                          {conditionLabels[product.condition] || product.condition}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Location</span>
                        <span className="font-bold text-slate-800">{product.location}</span>
                      </div>
                    </div>

                    {/* Owner Card */}
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {product.owner?.fullName?.charAt(0) || 'O'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {product.owner?.fullName || 'Verified Lender'}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Identity Verified • Gujarati Local</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: Rental Rules */}
                {activeTab === 'rules' && (
                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <span>Carry original government ID (Aadhaar / Driving License) during pickup for verification.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <span>Take 2 minutes to inspect equipment and test battery/accessories with the owner at pickup.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <span>Standard pickup window: 8:00 AM – 8:00 PM. Flexible by mutual chat.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <span>Security deposit is released immediately upon return in original functional condition.</span>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: Reviews */}
                {activeTab === 'reviews' && (
                  <div className="space-y-3 text-xs max-h-48 overflow-y-auto">
                    {product.bookings?.some((b: any) => b.reviews && b.reviews.length > 0) ? (
                      product.bookings.flatMap((b: any) => b.reviews).map((r: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">{r.reviewer?.fullName || 'Renter'}</span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: r.rating }).map((_, s) => (
                                <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">"{r.comment}"</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-400">
                        <Star className="w-6 h-6 text-amber-400 mx-auto mb-1 fill-amber-400" />
                        <span className="font-bold text-slate-800 block text-xs">5.0 Star Owner Rating</span>
                        <span className="text-[11px] text-slate-400">Verified through previous local handovers</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Daily Rent</span>
                  <span className="text-xl font-display font-black text-slate-900">
                    {formatINR(product.pricePerDay)}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    onClose();
                    onBookNow(product);
                  }}
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Choose Dates & Book</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
