import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../services/products';
import { formatINR } from '../../utils/formatters';
import { isInWishlist, toggleWishlist } from '../../utils/wishlist';
import { MapPin, Star, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const [isLiked, setIsLiked] = useState(() => isInWishlist(product.id));
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setIsLiked(isInWishlist(product.id));
    };
    window.addEventListener('wishlist-updated', handleUpdate);
    return () => window.removeEventListener('wishlist-updated', handleUpdate);
  }, [product.id]);

  const getImageUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${base}${url}`;
  };

  const conditionLabels: Record<string, { label: string; bg: string; text: string }> = {
    BRAND_NEW: { label: 'Brand New', bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-700' },
    LIKE_NEW: { label: 'Like New', bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-700' },
    GOOD: { label: 'Good', bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-slate-700' },
    FAIR: { label: 'Fair', bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-800' },
  };

  const condition = conditionLabels[product.condition] || conditionLabels.GOOD;
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      onClick={() => onSelect(product)}
      className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Image Container with 4:3 Aspect Ratio */}
        <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-slate-200 animate-pulse" />
          )}

          <img
            src={getImageUrl(mainImage)}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Condition Badge (Top-Left) */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg backdrop-blur-md border shadow-sm ${condition.bg} ${condition.text}`}>
              {condition.label}
            </span>
            {product.category?.name && (
              <span className="hidden sm:inline-block px-2 py-1 text-[10px] font-bold rounded-lg bg-black/40 text-white backdrop-blur-md border border-white/20">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Wishlist Button (Top-Right) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const next = toggleWishlist(product.id);
              setIsLiked(next);
            }}
            className="absolute top-3 right-3 p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 backdrop-blur-md shadow-sm transition-all duration-200 hover:scale-110 z-10"
            aria-label="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 transition ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Live Availability Dot (Bottom-Left) */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-white/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-800">Available Now</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          {/* Location & Rating Header */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <div className="flex items-center gap-1 truncate max-w-[70%]">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{product.location}</span>
            </div>

            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-bold text-amber-900">
                {product.owner?.trustScore?.toFixed(1) || '5.0'}
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-display font-extrabold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition-colors line-clamp-2 mb-1.5">
            {product.name}
          </h3>

          {/* Owner Line */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
            <span>By</span>
            <span className="font-semibold text-slate-700 truncate">{product.owner?.fullName || 'Verified Lender'}</span>
            <span title="Verified Lender">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            </span>
          </div>
        </div>
      </div>

      {/* Footer Pricing & CTA */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-black text-xl text-slate-900">
              {formatINR(product.pricePerDay)}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ day</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Deposit: <span className="text-slate-700 font-semibold">{formatINR(product.securityDeposit)}</span> (Refundable)
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelect(product)}
          className="inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all group-hover:bg-brand-600"
        >
          <span>View</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
