import React, { useState, useEffect } from 'react';
import { Product } from '../../services/products';
import { formatINR } from '../../utils/formatters';
import { isInWishlist, toggleWishlist } from '../../utils/wishlist';
import { MapPin, Star, Heart, ArrowUpRight } from 'lucide-react';
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
    BRAND_NEW: { label: 'Brand New', bg: 'bg-[#EBF5F1]', text: 'text-[#13795B]', border: 'border-[#13795B]/20' },
    LIKE_NEW: { label: 'Like New', bg: 'bg-[#EFF3FE]', text: 'text-[#315CF5]', border: 'border-[#315CF5]/20' },
    GOOD: { label: 'Good', bg: 'bg-[#F1F3F3]', text: 'text-[#66707A]', border: 'border-[#E5E8EA]' },
    FAIR: { label: 'Fair', bg: 'bg-[#FEF7ED]', text: 'text-[#B76E16]', border: 'border-[#B76E16]/20' },
  };

  const condition = conditionLabels[product.condition] || conditionLabels.GOOD;
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white rounded-xl border border-[#E5E8EA] overflow-hidden hover:border-[#D0D5DD] hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Image Container with 4:3 Aspect Ratio */}
        <div className="relative aspect-[4/3] w-full bg-[#F1F3F3] overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[#F1F3F3] animate-pulse" />
          )}

          <img
            src={getImageUrl(mainImage)}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 ease-out ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Condition Badge (Top-Left) */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
            <span className={`px-2 py-0.5 text-[11px] font-medium rounded-md border ${condition.bg} ${condition.text} ${condition.border}`}>
              {condition.label}
            </span>
            {product.category?.name && (
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-medium rounded-md bg-[#17191C]/80 text-white backdrop-blur-sm">
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
            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/90 hover:bg-white text-[#17191C] shadow-xs transition-colors z-10 border border-[#E5E8EA]"
            aria-label="Save to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${isLiked ? 'fill-[#C43838] text-[#C43838]' : ''}`} />
          </button>

          {/* Verified Escrow Protection Pill (Bottom-Left) */}
          <div className="absolute bottom-2.5 left-2.5 bg-white/95 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs border border-[#E5E8EA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#13795B]" />
            <span className="text-[10px] font-medium text-[#17191C]">Verified Escrow</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4">
          {/* Location & Rating Header */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1 truncate max-w-[70%] text-[#66707A]">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#66707A]" />
              <span className="truncate font-medium">{product.location || 'Gujarat'}</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#17191C] bg-[#FEF7ED] px-1.5 py-0.5 rounded border border-[#FEF7ED]">
              <Star className="w-3 h-3 fill-[#B76E16] text-[#B76E16]" />
              <span>{product.owner?.trustScore?.toFixed(1) || '5.0'}</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-sans font-semibold text-[#17191C] text-sm leading-snug group-hover:text-[#315CF5] transition-colors line-clamp-2 mb-1">
            {product.name}
          </h3>

          {/* Brand & Model metadata */}
          {(product.brand || product.model) && (
            <div className="text-[11px] text-[#66707A] mb-2 truncate">
              {[product.brand, product.model].filter(Boolean).join(' • ')}
            </div>
          )}
        </div>
      </div>

      {/* Pricing Footer */}
      <div className="px-4 pb-4 pt-2 border-t border-[#F1F3F3] flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-base text-[#17191C]">
              {formatINR(product.pricePerDay)}
            </span>
            <span className="text-xs text-[#66707A]">/ day</span>
          </div>
          <div className="text-[10px] text-[#66707A]">
            Deposit: {formatINR(product.securityDeposit)}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product);
          }}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#F1F3F3] text-[#17191C] group-hover:bg-[#315CF5] group-hover:text-white transition-colors flex items-center gap-1"
        >
          <span>Rent</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
