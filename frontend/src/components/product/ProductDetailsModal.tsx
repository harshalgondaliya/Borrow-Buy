import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../services/products';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Tag, 
  Info, 
  Calendar,
  Lock,
  QrCode,
  ChevronRight
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
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  if (!product) return null;

  const getImageUrl = (url: string) => {
    if (!url) {
      return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80';
    }
    if (url.startsWith('http')) return url;
    const base = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${base}${url}`;
  };

  const images = product.images && product.images.length > 0
    ? product.images.map(getImageUrl)
    : [getImageUrl('')];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative bg-white rounded-3xl shadow-elevated max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 border border-slate-200/80"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100 transition z-10"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left Column: Image Gallery & Trust Highlights */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative group">
                <img
                  src={images[selectedImgIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-950/80 text-white backdrop-blur-md shadow-sm">
                    {product.condition.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImgIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                        selectedImgIndex === idx
                          ? 'border-blue-600 ring-2 ring-blue-100 scale-105'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Guarantees Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span>Row Lock Safe</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Zero double-booking guarantee via PostgreSQL pessimistic concurrency locks.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Single-Use QR</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Secure cryptographic handover with replay attack protection.
                  </p>
                </div>
              </div>

              {/* Refundable Deposit Notice */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/70 rounded-xl flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-950 leading-relaxed">
                  <span className="font-bold">Refundable Security Deposit:</span> The <span className="font-bold text-blue-700">${product.securityDeposit}</span> deposit is held securely during the rental and released automatically upon clean post-rental inspection.
                </div>
              </div>
            </div>

            {/* Right Column: Specifications & Sticky Booking Panel */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                {/* Category & Location Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {product.category?.name || 'General Gear'}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 font-medium ml-auto">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {product.location}
                  </span>
                </div>

                <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {product.name}
                </h1>

                {(product.brand || product.model) && (
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    {product.brand && <span className="font-bold text-slate-800">{product.brand}</span>}
                    {product.brand && product.model && ' • '}
                    {product.model && <span>{product.model}</span>}
                  </div>
                )}

                {/* Price & Deposit Summary Box */}
                <div className="my-5 p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Daily Rental Rate</div>
                    <div className="font-display text-2xl font-black text-slate-900">
                      ${product.pricePerDay} <span className="text-xs font-semibold text-slate-500">/ day</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-medium">Refundable Deposit</div>
                    <div className="font-display text-xl font-bold text-slate-800">
                      ${product.securityDeposit}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Equipment Overview
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>

                {/* Owner Information Card */}
                {product.owner && (
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
                          {product.owner.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            {product.owner.fullName}
                            {product.owner.isVerifiedOwner && (
                              <span title="Verified Lender Badge" className="text-blue-600">
                                <ShieldCheck className="w-4 h-4" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {product.owner.ownerAddress || product.location}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-700 font-bold text-xs rounded-md border border-amber-500/20">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {product.owner.trustScore?.toFixed(1) || '5.0'} / 5.0
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">Trust Score</div>
                      </div>
                    </div>

                    {product.owner.ownerBio && (
                      <p className="text-xs text-slate-500 italic mt-2 border-t border-slate-100 pt-2">
                        "{product.owner.ownerBio}"
                      </p>
                    )}
                  </div>
                )}

                {/* Verified Customer Reviews */}
                {product.reviews && product.reviews.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                      <span>Verified Renter Reviews ({product.reviews.length})</span>
                      <span className="text-amber-600 font-bold flex items-center gap-1 normal-case text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {product.averageRating || '5.0'} / 5.0
                      </span>
                    </h3>
                    <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                      {product.reviews.map((rev) => (
                        <div key={rev.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-800">{rev.reviewer.fullName}</span>
                            <span className="flex text-amber-400">
                              {Array.from({ length: rev.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400" />
                              ))}
                            </span>
                          </div>
                          <p className="text-slate-600 italic">"{rev.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <button
                  onClick={() => onBookNow(product)}
                  className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Check Availability & Book</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
