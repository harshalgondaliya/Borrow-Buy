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
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'accessories' | 'rules' | 'reviews'>('details');

  if (!product) return null;

  const primaryImage = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80';

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
          className="relative bg-white rounded-2xl shadow-elevated border border-[#E5E8EA] max-w-4xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 z-10 text-[#17191C]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#66707A] hover:text-[#17191C] p-2 rounded-lg hover:bg-[#F1F3F3] transition-colors z-20 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Grid Layout: Left Single Product Image + Right Information */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* LEFT: Single 100% Relevant Hero Image */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F1F3F3] border border-[#E5E8EA] group shadow-2xs">
                <img
                  src={getImageUrl(primaryImage)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-md text-xs font-semibold text-[#17191C] border border-[#E5E8EA] shadow-2xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#13795B]" />
                  <span>{product.category?.name || 'Equipment'}</span>
                </div>
                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-[#17191C]/85 backdrop-blur-sm rounded-md text-xs font-medium text-white shadow-xs">
                  {conditionLabels[product.condition] || 'Good Condition'}
                </div>
              </div>

              {/* Trust Badge Bar */}
              <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E5E8EA] flex items-center justify-between text-xs text-[#13795B]">
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Refundable Escrow</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-[#315CF5]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Gear</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-[#66707A]">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate max-w-[130px]">{product.location || 'Gujarat'}</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Product Information & Booking Column */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                {/* Category & Location header */}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#315CF5] uppercase tracking-wider text-[11px]">
                    {product.category?.name || 'Verified Gear'}
                  </span>

                  <div className="flex items-center gap-1 text-[#66707A]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{product.location}</span>
                  </div>
                </div>

                {/* Main Heading */}
                <h1 className="text-xl sm:text-2xl font-semibold text-[#17191C] leading-tight mb-2">
                  {product.name}
                </h1>

                {/* Brand & Model tags */}
                {(product.brand || product.model) && (
                  <div className="flex items-center gap-2 mb-4">
                    {product.brand && (
                      <span className="px-2 py-0.5 bg-[#F1F3F3] text-[#17191C] text-xs font-medium rounded-md">
                        {product.brand}
                      </span>
                    )}
                    {product.model && (
                      <span className="px-2 py-0.5 bg-[#F1F3F3] text-[#66707A] text-xs font-mono rounded-md">
                        {product.model}
                      </span>
                    )}
                  </div>
                )}

                {/* Pricing Box */}
                <div className="p-3.5 bg-[#FAFAF8] border border-[#E5E8EA] rounded-xl mb-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold text-[#17191C]">
                        {formatINR(product.pricePerDay)}
                      </span>
                      <span className="text-xs text-[#66707A] ml-1">/ day</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#66707A] block">Security Deposit</span>
                      <span className="text-sm font-semibold text-[#17191C]">
                        {formatINR(product.securityDeposit)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabs Switcher */}
                <div className="flex p-1 bg-[#F1F3F3] rounded-lg mb-3.5 text-xs font-medium overflow-x-auto">
                  {(['details', 'specs', 'accessories', 'rules', 'reviews'] as const).map((tabKey) => (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => setActiveTab(tabKey)}
                      className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors capitalize cursor-pointer ${
                        activeTab === tabKey
                          ? 'bg-white text-[#17191C] font-semibold shadow-xs'
                          : 'text-[#66707A] hover:text-[#17191C]'
                      }`}
                    >
                      {tabKey === 'details' ? 'Overview' : tabKey}
                    </button>
                  ))}
                </div>

                {/* TAB CONTENT: Details */}
                {activeTab === 'details' && (
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <span className="font-semibold text-[#17191C] block mb-1">Description</span>
                      <p className="text-[#17191C] leading-relaxed whitespace-pre-line text-xs">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E5E8EA] grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#66707A] block">Condition</span>
                        <span className="font-semibold text-[#17191C]">
                          {conditionLabels[product.condition] || product.condition}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#66707A] block">Location</span>
                        <span className="font-semibold text-[#17191C]">{product.location}</span>
                      </div>
                    </div>

                    {/* Owner Card */}
                    <div className="p-3 bg-[#FAFAF8] border border-[#E5E8EA] rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#17191C] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {product.owner?.fullName?.charAt(0) || 'O'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-[#17191C] truncate text-xs">
                          {product.owner?.fullName || 'Verified Owner'}
                        </div>
                        <div className="text-[11px] text-[#13795B] flex items-center gap-1 font-medium">
                          <UserCheck className="w-3 h-3" />
                          <span>Identity Verified • Gujarat Hub</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: Specifications */}
                {activeTab === 'specs' && (
                  <div className="space-y-2 text-xs">
                    <span className="font-semibold text-[#17191C] block">Technical Specifications</span>
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="p-2 rounded-lg bg-[#FAFAF8] border border-[#E5E8EA]">
                            <span className="text-[10px] text-[#66707A] uppercase tracking-wider block">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-xs font-semibold text-[#17191C] mt-0.5 truncate block">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#66707A] text-xs italic">
                        Standard manufacturer specifications.
                      </p>
                    )}
                  </div>
                )}

                {/* TAB CONTENT: Included Accessories */}
                {activeTab === 'accessories' && (
                  <div className="space-y-2 text-xs">
                    <span className="font-semibold text-[#17191C] block">Package Contents</span>
                    {product.includedAccessories && product.includedAccessories.length > 0 ? (
                      <div className="space-y-1.5 max-h-52 overflow-y-auto">
                        {product.includedAccessories.map((item, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-[#FAFAF8] border border-[#E5E8EA] flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#13795B] shrink-0" />
                            <span className="text-xs text-[#17191C]">{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#66707A] text-xs italic">
                        Includes standard accessories and power cables.
                      </p>
                    )}
                  </div>
                )}

                {/* TAB CONTENT: Rental Rules */}
                {activeTab === 'rules' && (
                  <div className="space-y-2.5 text-xs max-h-52 overflow-y-auto">
                    {product.rentalInstructions && (
                      <div className="p-2.5 bg-[#FEF7ED] border border-[#FDE68A] rounded-lg text-xs text-[#B76E16]">
                        <span className="font-semibold block mb-0.5">Owner Instructions:</span>
                        <p className="leading-relaxed">{product.rentalInstructions}</p>
                      </div>
                    )}
                    <div className="space-y-1.5 text-[#17191C] text-xs">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#13795B] shrink-0 mt-0.5" />
                        <span>Bring government ID (Aadhaar / Driving License) at pickup for verification.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#13795B] shrink-0 mt-0.5" />
                        <span>Inspect equipment and test accessories with owner during handover.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#13795B] shrink-0 mt-0.5" />
                        <span>Deposit released automatically upon return in original functional condition.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: Reviews */}
                {activeTab === 'reviews' && (
                  <div className="space-y-2 text-xs max-h-48 overflow-y-auto">
                    <div className="text-center py-4 text-[#66707A]">
                      <Star className="w-5 h-5 text-[#B76E16] mx-auto mb-1 fill-[#B76E16]" />
                      <span className="font-semibold text-[#17191C] block text-xs">5.0 Star Owner Rating</span>
                      <span className="text-[11px] text-[#66707A]">Verified through local handovers in Gujarat</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="pt-4 border-t border-[#E5E8EA] flex items-center justify-between gap-3 mt-6">
                <div>
                  <span className="text-[10px] text-[#66707A] uppercase tracking-wider block">Rate</span>
                  <span className="text-lg font-bold text-[#17191C]">
                    {formatINR(product.pricePerDay)}
                    <span className="text-xs font-normal text-[#66707A]"> / day</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBookNow(product);
                  }}
                  className="px-5 py-2.5 bg-[#315CF5] hover:bg-[#2447C9] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Choose Dates & Book</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
