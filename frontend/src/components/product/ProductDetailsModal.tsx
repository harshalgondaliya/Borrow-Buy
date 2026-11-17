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
import { resolveImageUrl } from '../../utils/apiUrl.js';

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
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'accessories' | 'rules' | 'reviews'>('details');

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80'];

  const getImageUrl = (url: string) => resolveImageUrl(url);

  const conditionLabels: Record<string, string> = {
    BRAND_NEW: 'Brand New (Sealed/Pristine)',
    LIKE_NEW: 'Like New (Mint Condition)',
    GOOD: 'Good (Minor Cosmetic Wear)',
    FAIR: 'Fair (Fully Functional)',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#172B46]/70 backdrop-blur-md"
        />

        {/* Modal Window: Pure White surface on Porcelain with Light Grey border */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-[#E4E7EC] max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-[#667085] hover:text-[#172B46] p-2 rounded-xl hover:bg-[#F5F6F8] transition-colors z-20"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Grid Layout: Left Gallery + Right Information */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT: Image Gallery with Light Blue Grey background */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#E9EDF2] border border-[#E4E7EC] shadow-xs group">
                <img
                  src={getImageUrl(images[selectedImageIndex])}
                  alt={`${product.name} - View ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-md rounded-lg text-xs font-bold text-[#172B46] shadow-xs border border-[#E4E7EC]">
                  {product.category?.name || 'Equipment'}
                </div>

                {/* Image Counter Badge */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-[#172B46]/85 backdrop-blur-md rounded-lg text-[10px] font-bold text-white shadow-xs">
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#172B46] shadow-md flex items-center justify-center backdrop-blur-sm transition-all opacity-80 group-hover:opacity-100"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#172B46] shadow-md flex items-center justify-center backdrop-blur-sm transition-all opacity-80 group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2.5">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 bg-[#E9EDF2] transition-all ${
                        selectedImageIndex === idx
                          ? 'border-[#F06449] ring-2 ring-[#F06449]/20 shadow-xs'
                          : 'border-[#E4E7EC] hover:border-[#667085] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={getImageUrl(img)} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badge Bar */}
              <div className="p-3.5 bg-[#F5F6F8] rounded-2xl border border-[#E4E7EC] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#2F6B65] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Refundable Escrow</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#2F6B65] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Digital Pass QR</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#2F6B65] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zero Listing Fee</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Product Information & Booking Column */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                {/* Category & Location header */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-[#F06449] uppercase tracking-wider text-[11px]">
                    {product.category?.name || 'Verified Equipment'}
                  </span>

                  <div className="flex items-center gap-1 text-[#667085]">
                    <MapPin className="w-3.5 h-3.5 text-[#172B46]" />
                    <span className="font-medium">{product.location}</span>
                  </div>
                </div>

                {/* Main Heading: Midnight Navy */}
                <h1 className="text-xl sm:text-2xl font-display font-extrabold text-[#172B46] leading-tight mb-2">
                  {product.name}
                </h1>

                {/* Brand & Model tags */}
                {(product.brand || product.model) && (
                  <div className="flex items-center gap-2 mb-4">
                    {product.brand && (
                      <span className="px-2.5 py-0.5 bg-[#F5F6F8] text-[#172B46] text-xs font-semibold rounded-lg border border-[#E4E7EC]">
                        {product.brand}
                      </span>
                    )}
                    {product.model && (
                      <span className="px-2.5 py-0.5 bg-[#E9EDF2] text-[#202833] text-xs font-mono rounded-lg border border-[#E4E7EC]">
                        {product.model}
                      </span>
                    )}
                  </div>
                )}

                {/* Pricing Box: Porcelain background with Light Grey border */}
                <div className="p-4 bg-[#F5F6F8] border border-[#E4E7EC] rounded-2xl mb-5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-display font-black text-[#172B46]">
                        {formatINR(product.pricePerDay)}
                      </span>
                      <span className="text-xs font-semibold text-[#667085] ml-1">/ day</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#667085] font-medium block">Security Deposit</span>
                      <span className="text-sm font-bold text-[#172B46] font-display">
                        {formatINR(product.securityDeposit)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabs Switcher: Overview vs Specs vs Accessories vs Rules vs Reviews */}
                <div className="flex p-1 bg-[#F5F6F8] border border-[#E4E7EC] rounded-2xl mb-4 text-[11px] font-semibold overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                      activeTab === 'details'
                        ? 'bg-white text-[#172B46] shadow-xs font-bold border border-[#E4E7EC]'
                        : 'text-[#667085] hover:text-[#172B46]'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('specs')}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                      activeTab === 'specs'
                        ? 'bg-white text-[#172B46] shadow-xs font-bold border border-[#E4E7EC]'
                        : 'text-[#667085] hover:text-[#172B46]'
                    }`}
                  >
                    Specs
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('accessories')}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                      activeTab === 'accessories'
                        ? 'bg-white text-[#172B46] shadow-xs font-bold border border-[#E4E7EC]'
                        : 'text-[#667085] hover:text-[#172B46]'
                    }`}
                  >
                    Accessories
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('rules')}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                      activeTab === 'rules'
                        ? 'bg-white text-[#172B46] shadow-xs font-bold border border-[#E4E7EC]'
                        : 'text-[#667085] hover:text-[#172B46]'
                    }`}
                  >
                    Rules
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                      activeTab === 'reviews'
                        ? 'bg-white text-[#172B46] shadow-xs font-bold border border-[#E4E7EC]'
                        : 'text-[#667085] hover:text-[#172B46]'
                    }`}
                  >
                    Reviews
                  </button>
                </div>

                {/* TAB CONTENT: Details */}
                {activeTab === 'details' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="font-bold text-[#172B46] block mb-1">Description</span>
                      <p className="text-[#202833] leading-relaxed whitespace-pre-line">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E4E7EC] grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#667085] font-medium block">Condition</span>
                        <span className="font-bold text-[#172B46]">
                          {conditionLabels[product.condition] || product.condition}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#667085] font-medium block">Location</span>
                        <span className="font-bold text-[#172B46]">{product.location}</span>
                      </div>
                    </div>

                    {/* Owner Card */}
                    <div className="p-3 bg-[#F5F6F8] border border-[#E4E7EC] rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#172B46] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {product.owner?.fullName?.charAt(0) || 'O'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[#172B46] truncate">
                          {product.owner?.fullName || 'Verified Lender'}
                        </div>
                        <div className="text-[11px] text-[#2F6B65] flex items-center gap-1 font-semibold">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Identity Verified • Gujarat Hub</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: Specifications */}
                {activeTab === 'specs' && (
                  <div className="space-y-3 text-xs">
                    <span className="font-bold text-[#172B46] block">Technical Specifications</span>
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="p-2.5 rounded-xl bg-white border border-[#E4E7EC] flex flex-col justify-center shadow-xs">
                            <span className="text-[10px] text-[#667085] font-semibold uppercase tracking-wider">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-xs font-bold text-[#172B46] mt-0.5 truncate">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#667085] text-xs italic">
                        Standard manufacturer specifications. Contact owner for custom inquiries.
                      </p>
                    )}
                  </div>
                )}

                {/* TAB CONTENT: Included Accessories */}
                {activeTab === 'accessories' && (
                  <div className="space-y-3 text-xs">
                    <span className="font-bold text-[#172B46] block">Package & Included Accessories</span>
                    {product.includedAccessories && product.includedAccessories.length > 0 ? (
                      <div className="space-y-2 max-h-52 overflow-y-auto">
                        {product.includedAccessories.map((item, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-[#F5F6F8] border border-[#E4E7EC] flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-[#2F6B65] shrink-0" />
                            <span className="text-xs font-medium text-[#202833]">{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#667085] text-xs italic">
                        Includes standard power cable and basic accessories.
                      </p>
                    )}
                  </div>
                )}

                {/* TAB CONTENT: Rental Rules & Instructions */}
                {activeTab === 'rules' && (
                  <div className="space-y-3 text-xs max-h-56 overflow-y-auto">
                    {product.rentalInstructions && (
                      <div className="p-3 bg-[#FEF8EC] border border-[#FDE7B8] rounded-2xl text-xs text-[#A47426]">
                        <span className="font-bold block mb-1">Owner Instructions:</span>
                        <p className="leading-relaxed">{product.rentalInstructions}</p>
                      </div>
                    )}
                    <div className="space-y-2 text-[#202833] text-[11px]">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2F6B65] shrink-0 mt-0.5" />
                        <span>Carry original government ID (Aadhaar / Driving License) during pickup for verification.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2F6B65] shrink-0 mt-0.5" />
                        <span>Take 2 minutes to inspect equipment and test battery/accessories with the owner at pickup.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2F6B65] shrink-0 mt-0.5" />
                        <span>Standard pickup window: 8:00 AM – 8:00 PM. Flexible by mutual chat.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2F6B65] shrink-0 mt-0.5" />
                        <span>Security deposit is released immediately upon return in original functional condition.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: Reviews */}
                {activeTab === 'reviews' && (
                  <div className="space-y-3 text-xs max-h-48 overflow-y-auto">
                    {product.bookings?.some((b: any) => b.reviews && b.reviews.length > 0) ? (
                      product.bookings.flatMap((b: any) => b.reviews).map((r: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-[#E4E7EC]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[#172B46]">{r.reviewer?.fullName || 'Renter'}</span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: r.rating }).map((_, s) => (
                                <Star key={s} className="w-3 h-3 fill-[#F2C66D] text-[#F2C66D]" />
                              ))}
                            </div>
                          </div>
                          <p className="text-[#202833] text-[11px] leading-relaxed">"{r.comment}"</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-[#667085]">
                        <Star className="w-6 h-6 text-[#F2C66D] mx-auto mb-1 fill-[#F2C66D]" />
                        <span className="font-bold text-[#172B46] block text-xs">5.0 Star Owner Rating</span>
                        <span className="text-[11px] text-[#667085] font-medium">Verified through previous local handovers</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Sticky Action Bar: Coral CTA button */}
              <div className="pt-4 border-t border-[#E4E7EC] flex items-center justify-between gap-3 mt-6">
                <div>
                  <span className="text-[10px] text-[#667085] font-semibold uppercase tracking-wider block">Daily Rent</span>
                  <span className="text-xl font-display font-black text-[#172B46]">
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
                  className="px-6 py-3 bg-[#F06449] hover:bg-[#D95339] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
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
