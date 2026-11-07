import React, { useState } from 'react';
import { Product } from '../../services/products';
import { 
  X, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Tag, 
  Info, 
  Calendar
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
      return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
    }
    if (url.startsWith('http')) return url;
    const base = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${base}${url}`;
  };

  const images = product.images && product.images.length > 0
    ? product.images.map(getImageUrl)
    : [getImageUrl('')];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: Image Gallery */}
          <div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-3 shadow-inner">
              <img
                src={images[selectedImgIndex]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                      selectedImgIndex === idx
                        ? 'border-sky-600 ring-2 ring-sky-200'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Refundable Deposit Notice */}
            <div className="mt-4 p-3.5 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="text-xs text-sky-900 leading-relaxed">
                <span className="font-bold">Refundable Security Deposit:</span> The ${product.securityDeposit} deposit is held securely during the rental and released automatically upon successful return inspection.
              </div>
            </div>
          </div>

          {/* Right Column: Specifications & Booking Panel */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category & Condition Badges */}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {product.category?.name || 'General Gear'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {product.condition.replace('_', ' ')}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium ml-auto">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {product.location}
                </span>
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {(product.brand || product.model) && (
                <div className="text-xs text-slate-500 font-medium mt-1">
                  {product.brand && <span className="font-bold text-slate-700">{product.brand}</span>}
                  {product.brand && product.model && ' • '}
                  {product.model && <span>{product.model}</span>}
                </div>
              )}

              {/* Price & Deposit Summary Box */}
              <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Daily Rental Rate</div>
                  <div className="text-2xl font-black text-slate-900">
                    ${product.pricePerDay} <span className="text-xs font-semibold text-slate-500">/ day</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-medium">Refundable Deposit</div>
                  <div className="text-lg font-bold text-slate-800">
                    ${product.securityDeposit}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Item Description
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Owner Information Card */}
              {product.owner && (
                <div className="p-4 bg-white border border-slate-200 rounded-2xl mb-6 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm border border-sky-200">
                        {product.owner.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          {product.owner.fullName}
                          {product.owner.isVerifiedOwner && (
                            <span title="Verified Owner" className="text-sky-600">
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
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        {product.owner.trustScore?.toFixed(1) || '5.0'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">Owner Rating</div>
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
                    <span className="text-amber-600 font-bold flex items-center gap-1 normal-case">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {product.averageRating || '5.0'} / 5.0
                    </span>
                  </h3>
                  <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                    {product.reviews.map((rev) => (
                      <div key={rev.id} className="p-3 bg-slate-50 rounded-xl text-xs">
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
                className="flex-1 py-3 px-6 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm"
              >
                <Calendar className="w-4 h-4" />
                Select Rental Dates & Reserve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
