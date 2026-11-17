import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../services/products';
import { formatINR } from '../../utils/formatters';
import { isInWishlist, toggleWishlist } from '../../utils/wishlist';
import { MapPin, Star, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';
import { resolveImageUrl } from '../../utils/apiUrl.js';

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

  const getImageUrl = (url: string) => resolveImageUrl(url);

  const conditionLabels: Record<string, { label: string; bg: string; text: string; border: string }> = {
    BRAND_NEW: { label: 'Brand New', bg: 'bg-[#EBF3F2]', text: 'text-[#2F6B65]', border: 'border-[#C0DCD6]' },
    LIKE_NEW: { label: 'Like New', bg: 'bg-[#F0F4F8]', text: 'text-[#172B46]', border: 'border-[#BCCCDC]' },
    GOOD: { label: 'Good', bg: 'bg-[#F5F6F8]', text: 'text-[#667085]', border: 'border-[#E4E7EC]' },
    FAIR: { label: 'Fair', bg: 'bg-[#FEF8EC]', text: 'text-[#C79435]', border: 'border-[#FDE7B8]' },
  };

  const condition = conditionLabels[product.condition] || conditionLabels.GOOD;
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', damping: 22, stiffness: 320 }}
      onClick={() => onSelect(product)}
      className="group bg-white rounded-2xl border border-[#E4E7EC] overflow-hidden shadow-card hover:shadow-card-hover hover:border-[#F06449]/40 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Image Container with 4:3 Aspect Ratio and Light Blue Grey Background */}
        <div className="relative aspect-[4/3] w-full bg-[#E9EDF2] overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[#E9EDF2] animate-pulse" />
          )}

          <img
            src={getImageUrl(mainImage)}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Condition Badge (Top-Left) */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border shadow-xs ${condition.bg} ${condition.text} ${condition.border}`}>
              {condition.label}
            </span>
            {product.category?.name && (
              <span className="hidden sm:inline-block px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#172B46]/90 text-white backdrop-blur-md border border-white/10">
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
            className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-white text-[#172B46] backdrop-blur-md shadow-xs transition-all duration-200 hover:scale-110 z-10 border border-[#E4E7EC]"
            aria-label="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 transition ${isLiked ? 'fill-[#F06449] text-[#F06449]' : ''}`} />
          </button>

          {/* Mandatory Available Status: Teal #2F6B65 (Bottom-Left) */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs border border-[#E4E7EC]">
            <span className="w-2 h-2 rounded-full bg-[#2F6B65] animate-pulse" />
            <span className="text-[10px] font-bold text-[#2F6B65]">Available in Gujarat</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          {/* Location & Rating Header */}
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1 truncate max-w-[70%]">
              <MapPin className="w-3.5 h-3.5 text-[#172B46] shrink-0" />
              <span className="truncate text-[#667085] font-medium">{product.location}</span>
            </div>

            {/* Special Highlight: Amber #F2C66D */}
            <div className="flex items-center gap-1 bg-[#FEF8EC] px-2 py-0.5 rounded-md border border-[#FDE7B8] shrink-0">
              <Star className="w-3 h-3 fill-[#F2C66D] text-[#F2C66D]" />
              <span className="text-[11px] font-bold text-[#A47426]">
                {product.owner?.trustScore?.toFixed(1) || '5.0'}
              </span>
            </div>
          </div>

          {/* Product Name in Midnight Navy */}
          <h3 className="font-display font-extrabold text-[#172B46] text-base leading-snug group-hover:text-[#F06449] transition-colors line-clamp-2 mb-1.5">
            {product.name}
          </h3>

          {/* Brand & Model metadata */}
          {(product.brand || product.model) && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#667085] mb-2.5">
              {product.brand && <span className="font-semibold text-[#202833]">{product.brand}</span>}
              {product.brand && product.model && <span>•</span>}
              {product.model && <span className="font-mono text-[10px] bg-[#F5F6F8] px-1.5 py-0.5 rounded border border-[#E4E7EC]">{product.model}</span>}
            </div>
          )}

          {/* Owner Line & Included Accessories Highlight */}
          <div className="flex items-center justify-between gap-1 text-xs mb-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-[#667085]">By</span>
              <span className="font-semibold text-[#202833] truncate">{product.owner?.fullName || 'Verified Lender'}</span>
              <span title="Verified Lender">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2F6B65] shrink-0" />
              </span>
            </div>

            {product.includedAccessories && product.includedAccessories.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E9EDF2] text-[#172B46] font-semibold shrink-0 border border-[#E4E7EC]">
                +{product.includedAccessories.length} items
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Pricing & Mandatory Primary Coral CTA Button */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-[#E4E7EC] flex items-center justify-between bg-[#F5F6F8]/60">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-black text-xl text-[#172B46]">
              {formatINR(product.pricePerDay)}
            </span>
            <span className="text-xs font-semibold text-[#667085]">/ day</span>
          </div>
          <div className="text-[11px] text-[#667085] mt-0.5">
            Deposit: <span className="text-[#202833] font-semibold">{formatINR(product.securityDeposit)}</span>
          </div>
        </div>

        {/* Primary Action Button: Coral #F06449 */}
        <button
          type="button"
          onClick={() => onSelect(product)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#F06449] hover:bg-[#D95339] text-white font-bold text-xs shadow-xs transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Rent Gear</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
