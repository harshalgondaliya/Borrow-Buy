import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../services/products';
import { MapPin, Star, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getImageUrl = (url: string) => {
    if (!url) {
      return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';
    }
    if (url.startsWith('http')) return url;
    const base = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${base}${url}`;
  };

  const primaryImage = product.images?.[0] ? getImageUrl(product.images[0]) : getImageUrl('');

  const conditionBadges: Record<string, { label: string; bg: string; text: string }> = {
    BRAND_NEW: { label: 'Brand New', bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-700' },
    LIKE_NEW: { label: 'Like New', bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-700' },
    GOOD: { label: 'Good', bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-800' },
    FAIR: { label: 'Fair', bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-slate-700' },
  };

  const condition = conditionBadges[product.condition] || conditionBadges.GOOD;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={() => onSelect(product)}
      className="group relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse" />
        )}
        <img
          src={primaryImage}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg backdrop-blur-md border shadow-sm ${condition.bg} ${condition.text}`}>
              {condition.label}
            </span>
            {product.category?.name && (
              <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-900/80 text-white backdrop-blur-md shadow-sm">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Like Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="pointer-events-auto p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-600 hover:text-rose-600 shadow-sm transition hover:scale-110 active:scale-95"
            title="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 transition ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Availability Live Indicator */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/95 backdrop-blur-md text-slate-800 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Instant Hold
          </span>
        </div>
      </div>

      {/* Product Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1 font-medium text-slate-600 truncate max-w-[170px]">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{product.location}</span>
            </span>

            <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              {product.owner?.trustScore ? product.owner.trustScore.toFixed(1) : '5.0'}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Bottom Pricing & CTA */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-xl font-extrabold text-slate-900 tracking-tight">
                ${product.pricePerDay}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ day</span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">
              Deposit: <span className="text-slate-700 font-semibold">${product.securityDeposit}</span>
              <span className="text-emerald-600 font-medium ml-1">(Refundable)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {product.owner?.isVerifiedOwner && (
              <span title="Verified Lender" className="p-1 rounded-full bg-blue-50 text-blue-600">
                <ShieldCheck className="w-4 h-4" />
              </span>
            )}
            <div className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl font-semibold text-xs bg-slate-900 text-white group-hover:bg-blue-600 transition shadow-sm">
              <span>View</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
