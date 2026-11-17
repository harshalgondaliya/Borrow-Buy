import React from 'react';
import { Category, ProductQueryParams } from '../../services/products';
import { Search, SlidersHorizontal, RotateCcw, Sparkles, MapPin } from 'lucide-react';

interface FilterSidebarProps {
  categories: Category[];
  filters: ProductQueryParams;
  onFilterChange: (newFilters: Partial<ProductQueryParams>) => void;
  onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  filters,
  onFilterChange,
  onReset,
}) => {
  const conditions = [
    { value: '', label: 'Any' },
    { value: 'BRAND_NEW', label: 'Brand New' },
    { value: 'LIKE_NEW', label: 'Like New' },
    { value: 'GOOD', label: 'Good' },
  ];

  const popularLocations = [
    'Ahmedabad',
    'Gandhinagar',
    'Surat',
    'Vadodara',
    'Rajkot',
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-card space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E4E7EC]">
        <div className="flex items-center gap-2 text-[#172B46] font-display font-bold text-sm">
          <SlidersHorizontal className="w-4 h-4 text-[#F06449]" />
          <span>Filters & Discovery</span>
        </div>
        <button
          onClick={onReset}
          className="group text-xs text-[#667085] hover:text-[#F06449] flex items-center gap-1 font-medium transition"
        >
          <RotateCcw className="w-3 h-3 group-hover:-rotate-90 transition-transform duration-300" />
          <span>Reset</span>
        </button>
      </div>

      {/* Keyword Search */}
      <div>
        <label className="block text-xs font-semibold text-[#172B46] mb-1.5">Search Keywords</label>
        <div className="relative">
          <Search className="w-4 h-4 text-[#667085] absolute left-3 top-2.5" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            placeholder="Sony FX3, MacBook, projector, drill..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F5F6F8] border border-[#E4E7EC] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#F06449]/20 focus:border-[#F06449] focus:outline-none transition text-[#202833] placeholder:text-[#667085]"
          />
        </div>
      </div>

      {/* Location / City Filter */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-[#172B46] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#172B46]" />
            <span>Gujarat Cities</span>
          </label>
          {filters.location && (
            <button
              onClick={() => onFilterChange({ location: undefined, page: 1 })}
              className="text-[11px] text-[#F06449] hover:underline font-medium"
            >
              Clear
            </button>
          )}
        </div>
        <div className="relative mb-2">
          <input
            type="text"
            value={filters.location || ''}
            onChange={(e) => onFilterChange({ location: e.target.value || undefined, page: 1 })}
            placeholder="E.g. Ahmedabad, Surat, Infocity..."
            className="w-full px-3 py-1.5 text-xs bg-[#F5F6F8] border border-[#E4E7EC] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#F06449]/20 focus:border-[#F06449] focus:outline-none transition text-[#202833] placeholder:text-[#667085]"
          />
        </div>
        {/* Quick city pills */}
        <div className="flex flex-wrap gap-1.5">
          {popularLocations.map((loc) => {
            const isSelected = filters.location?.toLowerCase().includes(loc.toLowerCase());
            return (
              <button
                key={loc}
                onClick={() =>
                  onFilterChange({
                    location: isSelected ? undefined : loc,
                    page: 1,
                  })
                }
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition ${
                  isSelected
                    ? 'bg-[#172B46] text-white border-[#172B46] shadow-xs'
                    : 'bg-[#F5F6F8] border-[#E4E7EC] text-[#667085] hover:bg-white hover:text-[#172B46]'
                }`}
              >
                {loc}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-[#172B46]">Categories</label>
          {filters.categoryId && (
            <button
              onClick={() => onFilterChange({ categoryId: undefined, page: 1 })}
              className="text-[11px] text-[#F06449] hover:underline font-medium"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          <button
            onClick={() => onFilterChange({ categoryId: undefined, page: 1 })}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${
              !filters.categoryId
                ? 'bg-[#172B46] text-white font-bold border border-[#172B46]'
                : 'text-[#667085] hover:bg-[#F5F6F8] hover:text-[#172B46]'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => {
            const isSelected = filters.categoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onFilterChange({ categoryId: cat.id, page: 1 })}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                  isSelected
                    ? 'bg-[#172B46] text-white font-bold border border-[#172B46]'
                    : 'text-[#667085] hover:bg-[#F5F6F8] hover:text-[#172B46]'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {cat._count?.products !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-[#F06449] text-white' : 'bg-[#E9EDF2] text-[#172B46]'
                    }`}
                  >
                    {cat._count.products}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Price Range */}
      <div>
        <label className="block text-xs font-semibold text-[#172B46] mb-2">Daily Price Range (₹)</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <span className="absolute left-2.5 top-2 text-xs font-semibold text-[#667085]">₹</span>
            <input
              type="number"
              min="0"
              value={filters.minPrice ?? ''}
              onChange={(e) =>
                onFilterChange({
                  minPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                  page: 1,
                })
              }
              placeholder="Min"
              className="w-full pl-6 pr-2.5 py-1.5 text-xs bg-[#F5F6F8] border border-[#E4E7EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F06449]/20 focus:border-[#F06449] transition text-[#202833] placeholder:text-[#667085]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-2.5 top-2 text-xs font-semibold text-[#667085]">₹</span>
            <input
              type="number"
              min="0"
              value={filters.maxPrice ?? ''}
              onChange={(e) =>
                onFilterChange({
                  maxPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                  page: 1,
                })
              }
              placeholder="Max"
              className="w-full pl-6 pr-2.5 py-1.5 text-xs bg-[#F5F6F8] border border-[#E4E7EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F06449]/20 focus:border-[#F06449] transition text-[#202833] placeholder:text-[#667085]"
            />
          </div>
        </div>
      </div>

      {/* Condition Pills */}
      <div>
        <label className="block text-xs font-semibold text-[#172B46] mb-2">Item Condition</label>
        <div className="grid grid-cols-2 gap-1.5">
          {conditions.map((c) => {
            const isSelected = (filters.condition || '') === c.value;
            return (
              <button
                key={c.value}
                onClick={() => onFilterChange({ condition: c.value || undefined, page: 1 })}
                className={`py-1.5 px-2.5 text-[11px] font-semibold rounded-xl border transition text-center ${
                  isSelected
                    ? 'bg-[#172B46] text-white border-[#172B46] shadow-xs'
                    : 'bg-[#F5F6F8] border-[#E4E7EC] text-[#667085] hover:bg-white hover:text-[#172B46]'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort By Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-[#172B46] mb-1.5">Sort Listings</label>
        <select
          value={filters.sortBy || 'newest'}
          onChange={(e) => onFilterChange({ sortBy: e.target.value as any, page: 1 })}
          className="w-full px-3 py-2 text-xs bg-[#F5F6F8] border border-[#E4E7EC] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#F06449]/20 focus:border-[#F06449] focus:outline-none font-medium text-[#202833] transition"
        >
          <option value="newest">Featured & Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="deposit_asc">Deposit: Low to High</option>
        </select>
      </div>

      {/* Trust Guarantee Note */}
      <div className="pt-3 border-t border-[#E4E7EC] text-[11px] text-[#667085] flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#F06449] shrink-0 mt-0.5" />
        <span>All rentals include refundable deposit escrow & digital pass verification.</span>
      </div>
    </div>
  );
};
