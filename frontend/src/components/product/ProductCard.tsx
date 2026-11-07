import React from 'react';
import { Product } from '../../services/products';
import { MapPin, Star, ShieldCheck, Tag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const getImageUrl = (url: string) => {
    if (!url) {
      return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80';
    }
    if (url.startsWith('http')) return url;
    const base = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${base}${url}`;
  };

  const primaryImage = product.images?.[0] ? getImageUrl(product.images[0]) : getImageUrl('');

  const conditionLabels: Record<string, { label: string; color: string }> = {
    BRAND_NEW: { label: 'Brand New', color: 'bg-emerald-100 text-emerald-800' },
    LIKE_NEW: { label: 'Like New', color: 'bg-sky-100 text-sky-800' },
    GOOD: { label: 'Good', color: 'bg-amber-100 text-amber-800' },
    FAIR: { label: 'Fair', color: 'bg-slate-100 text-slate-800' },
  };

  const conditionInfo = conditionLabels[product.condition] || conditionLabels.GOOD;

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${conditionInfo.color}`}>
            {conditionInfo.label}
          </span>
          {product.category?.name && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-900/75 text-white backdrop-blur-sm shadow-sm flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {product.category.name}
            </span>
          )}
        </div>
      </div>

      {/* Product Card Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {product.location}
            </span>
            <span className="flex items-center gap-1 text-amber-600 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {product.owner?.trustScore ? product.owner.trustScore.toFixed(1) : '5.0'}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-sky-600 transition">
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Owner Row */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">${product.pricePerDay}</span>
              <span className="text-xs font-medium text-slate-500">/ day</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Deposit: <span className="font-semibold text-slate-700">${product.securityDeposit}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {product.owner?.isVerifiedOwner && (
              <span title="Verified Owner" className="text-sky-600">
                <ShieldCheck className="w-4 h-4" />
              </span>
            )}
            <button className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white font-semibold text-xs rounded-xl transition">
              Rent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

