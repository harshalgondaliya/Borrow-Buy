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
    BRAND_NEW: { label: 'Brand New', bg: 'bg-[#E3ECE7] border-[#C7D9D0]', text: 'text-[#244B3A]' },
    LIKE_NEW: { label: 'Like New', bg: 'bg-[#E9EDE7] border-[#D4DCD1]', text: 'text-[#2D5E4C]' },
    GOOD: { label: 'Good', bg: 'bg-[#F7F5EF] border-[#DFD8C8]', text: 'text-[#4D5045]' },
    FAIR: { label: 'Fair', bg: 'bg-[#FDF6F4] border-[#F2D3C9]', text: 'text-[#904830]' },
  };

  const condition = conditionLabels[product.condition] || conditionLabels.GOOD;
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      onClick={() => onSelect(product)}
      className="group bg-white rounded-3xl border border-[#D4DCD1]/60 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Image Container with 4:3 Aspect Ratio */}
        <div className="relative aspect-[4/3] w-full bg-[#FAF8F3] overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[#ECE7DC] animate-pulse" />
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
              <span className="hidden sm:inline-block px-2 py-1 text-[10px] font-bold rounded-lg bg-[#244B3A]/85 text-[#F7F5EF] backdrop-blur-md border border-white/20">
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
              <MapPin className="w-3.5 h-3.5 text-[#87977F] shrink-0" />
              <span className="truncate text-[#4D5045] font-medium">{product.location}</span>
            </div>

            <div className="flex items-center gap-1 bg-[#FDF6F4] px-2 py-0.5 rounded-md border border-[#F2D3C9] shrink-0">
              <Star className="w-3 h-3 fill-[#C7785A] text-[#C7785A]" />
              <span className="text-[11px] font-bold text-[#904830]">
                {product.owner?.trustScore?.toFixed(1) || '5.0'}
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-display font-extrabold text-[#292D29] text-base leading-snug group-hover:text-[#244B3A] transition-colors line-clamp-2 mb-1.5">
            {product.name}
          </h3>

          {/* Owner Line & Included Accessories Highlight */}
          <div className="flex items-center justify-between gap-1 text-xs text-slate-500 mb-3">
            <div className="flex items-center gap-1.5 truncate">
              <span>By</span>
              <span className="font-semibold text-[#292D29] truncate">{product.owner?.fullName || 'Verified Lender'}</span>
              <span title="Verified Lender">
                <ShieldCheck className="w-3.5 h-3.5 text-[#244B3A] shrink-0" />
              </span>
            </div>

            {product.includedAccessories && product.includedAccessories.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E9EDE7] text-[#2D5E4C] font-semibold shrink-0">
                +{product.includedAccessories.length} items included
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Pricing & CTA */}
      <div className="px-5 pb-5 pt-3 border-t border-[#D4DCD1]/50 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-black text-xl text-[#244B3A]">
              {formatINR(product.pricePerDay)}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ day</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Deposit: <span className="text-[#292D29] font-semibold">{formatINR(product.securityDeposit)}</span> (Refundable)
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelect(product)}
          className="inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl bg-[#244B3A] hover:bg-[#1C3B2E] text-white font-bold text-xs shadow-sm transition-all group-hover:bg-[#C7785A]"
        >
          <span>View</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
