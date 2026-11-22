import React from 'react';
import { Category, ProductQueryParams } from '../../services/products';
import { Search, SlidersHorizontal, RotateCcw, MapPin, Sparkles } from 'lucide-react';

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
    <div className="bg-white rounded-xl border border-[#E5E8EA] p-5 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E8EA]">
        <div className="flex items-center gap-2 text-[#17191C] font-semibold text-sm">
          <SlidersHorizontal className="w-4 h-4 text-[#315CF5]" />
          <span>Filter Gear</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-[#66707A] hover:text-[#17191C] flex items-center gap-1 font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Keyword Search */}
      <div>
        <label className="block text-xs font-semibold text-[#17191C] mb-1.5">Keywords</label>
        <div className="relative">
          <Search className="w-4 h-4 text-[#66707A] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            placeholder="Sony FX3, MacBook, drill..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors text-[#17191C] placeholder:text-[#66707A]"
          />
        </div>
      </div>

      {/* Gujarat Cities Filter */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-[#17191C] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#66707A]" />
            <span>Gujarat Hubs</span>
          </label>
          {filters.location && (
            <button
              onClick={() => onFilterChange({ location: undefined, page: 1 })}
              className="text-[11px] text-[#315CF5] hover:underline font-medium cursor-pointer"
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
            placeholder="Search city or area..."
            className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors text-[#17191C] placeholder:text-[#66707A]"
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
                className={`px-2 py-1 text-[11px] font-medium rounded-md border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#17191C] text-white border-[#17191C]'
                    : 'bg-[#FAFAF8] border-[#E5E8EA] text-[#66707A] hover:text-[#17191C] hover:bg-white'
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
          <label className="text-xs font-semibold text-[#17191C]">Categories</label>
          {filters.categoryId && (
            <button
              onClick={() => onFilterChange({ categoryId: undefined, page: 1 })}
              className="text-[11px] text-[#315CF5] hover:underline font-medium cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
          <button
            onClick={() => onFilterChange({ categoryId: undefined, page: 1 })}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
              !filters.categoryId
                ? 'bg-[#17191C] text-white font-semibold'
                : 'text-[#66707A] hover:bg-[#F1F3F3] hover:text-[#17191C]'
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
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#17191C] text-white font-semibold'
                    : 'text-[#66707A] hover:bg-[#F1F3F3] hover:text-[#17191C]'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {cat._count?.products !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#F1F3F3] text-[#66707A]'
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
        <label className="block text-xs font-semibold text-[#17191C] mb-2">Daily Rate (₹)</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <span className="absolute left-2.5 top-1.5 text-xs text-[#66707A]">₹</span>
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
              className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors text-[#17191C] placeholder:text-[#66707A]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-2.5 top-1.5 text-xs text-[#66707A]">₹</span>
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
              className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors text-[#17191C] placeholder:text-[#66707A]"
            />
          </div>
        </div>
      </div>

      {/* Condition Pills */}
      <div>
        <label className="block text-xs font-semibold text-[#17191C] mb-2">Condition</label>
        <div className="grid grid-cols-2 gap-1.5">
          {conditions.map((c) => {
            const isSelected = (filters.condition || '') === c.value;
            return (
              <button
                key={c.value}
                onClick={() => onFilterChange({ condition: c.value || undefined, page: 1 })}
                className={`py-1 px-2 text-[11px] font-medium rounded-lg border transition-colors text-center cursor-pointer ${
                  isSelected
                    ? 'bg-[#17191C] text-white border-[#17191C]'
                    : 'bg-[#FAFAF8] border-[#E5E8EA] text-[#66707A] hover:bg-white hover:text-[#17191C]'
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
        <label className="block text-xs font-semibold text-[#17191C] mb-1.5">Sort Order</label>
        <select
          value={filters.sortBy || 'newest'}
          onChange={(e) => onFilterChange({ sortBy: e.target.value as any, page: 1 })}
          className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none font-medium text-[#17191C] transition-colors cursor-pointer"
        >
          <option value="newest">Featured & Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="deposit_asc">Deposit: Low to High</option>
        </select>
      </div>

      {/* Trust Notice */}
      <div className="pt-3 border-t border-[#E5E8EA] text-[11px] text-[#66707A] flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#315CF5] shrink-0 mt-0.5" />
        <span>All listings include refundable deposit escrow & single-use QR handover tokens.</span>
      </div>
    </div>
  );
};
