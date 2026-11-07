import React from 'react';
import { Category, ProductQueryParams } from '../../services/products';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

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
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <SlidersHorizontal className="w-4 h-4 text-sky-600" />
          <span>Filters & Search</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-sky-600 flex items-center gap-1 font-medium transition"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Keyword Search */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Search Keywords</label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            placeholder="Cameras, drills, MacBooks..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">Category</label>
        <div className="space-y-1">
          <button
            onClick={() => onFilterChange({ categoryId: undefined, page: 1 })}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
              !filters.categoryId
                ? 'bg-sky-50 text-sky-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ categoryId: cat.id, page: 1 })}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                filters.categoryId === cat.id
                  ? 'bg-sky-50 text-sky-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              {cat._count?.products !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {cat._count.products}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Price Range */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">Daily Price ($)</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Min ($)</span>
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
              placeholder="0"
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Max ($)</span>
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
              placeholder="200"
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Condition Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Condition</label>
        <select
          value={filters.condition || ''}
          onChange={(e) => onFilterChange({ condition: e.target.value || undefined, page: 1 })}
          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
        >
          <option value="">Any Condition</option>
          <option value="BRAND_NEW">Brand New</option>
          <option value="LIKE_NEW">Like New</option>
          <option value="GOOD">Good</option>
          <option value="FAIR">Fair</option>
        </select>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sort Order</label>
        <select
          value={filters.sortBy || 'newest'}
          onChange={(e) => onFilterChange({ sortBy: e.target.value as any, page: 1 })}
          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
        >
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="deposit_asc">Deposit: Low to High</option>
        </select>
      </div>
    </div>
  );
};

