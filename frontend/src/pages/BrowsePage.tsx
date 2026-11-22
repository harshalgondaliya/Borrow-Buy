import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, SearchX, SlidersHorizontal, RotateCcw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Product,
  Category,
  ProductQueryParams,
  productsService,
} from '../services/products';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import { FilterSidebar } from '../components/product/FilterSidebar';
import { useModals } from '../features/modal/ModalContext';
import { useToast } from '../features/toast/ToastContext';

export const BrowsePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openProduct } = useModals();
  const { info } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<ProductQueryParams>(() => {
    return {
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('category') || undefined,
      location: searchParams.get('city') || searchParams.get('location') || undefined,
      sortBy: (searchParams.get('sort') as any) || 'newest',
      page: Number(searchParams.get('page')) || 1,
    };
  });

  const syncParamsToUrl = (newFilters: ProductQueryParams) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.categoryId) params.set('category', newFilters.categoryId);
    if (newFilters.location) params.set('city', newFilters.location);
    if (newFilters.sortBy) params.set('sort', newFilters.sortBy);
    if (newFilters.page && newFilters.page > 1) params.set('page', String(newFilters.page));
    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    productsService
      .getCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err));
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsService.listProducts(filters);
      setProducts(res.products);
      setTotalCount(res.pagination?.total || res.products.length);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleFilterChange = (newFilters: Partial<ProductQueryParams>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters, page: 1 };
      syncParamsToUrl(updated);
      return updated;
    });
  };

  const handleResetFilters = () => {
    const reset: ProductQueryParams = { sortBy: 'newest', page: 1 };
    setFilters(reset);
    setSearchParams({});
    info('All filters have been reset', 'Catalog Reset');
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => {
      const updated = { ...prev, page: newPage };
      syncParamsToUrl(updated);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return updated;
    });
  };

  const activeCategory = categories.find((c) => c.id === filters.categoryId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-[#E5E8EA] gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#315CF5] uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Equipment Catalog</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#17191C] tracking-tight">
            {activeCategory ? activeCategory.name : 'Browse All Gear'}
          </h1>
          <p className="text-xs text-[#66707A] mt-1">
            Verified equipment for rent across Gujarat hubs with instant escrow protection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-3 py-1.5 bg-white border border-[#E5E8EA] text-xs font-medium text-[#17191C] rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <span className="text-xs font-medium text-[#66707A]">
            Showing <span className="font-semibold text-[#17191C]">{products.length}</span> of {totalCount || 116} listings
          </span>

          {(filters.search || filters.categoryId || filters.location || filters.minPrice || filters.maxPrice || filters.condition) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-[#315CF5] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {(filters.search || filters.categoryId || filters.location || filters.condition) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-[#66707A]">Active filters:</span>
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F1F3F3] text-xs text-[#17191C] border border-[#E5E8EA]">
              <span>Keyword: &quot;{filters.search}&quot;</span>
              <button onClick={() => handleFilterChange({ search: undefined })} className="hover:text-red-500 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.categoryId && activeCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EFF3FE] text-xs text-[#315CF5] border border-[#DBE4FD]">
              <span>Category: {activeCategory.name}</span>
              <button onClick={() => handleFilterChange({ categoryId: undefined })} className="hover:text-red-500 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.location && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F1F3F3] text-xs text-[#17191C] border border-[#E5E8EA]">
              <span>City: {filters.location}</span>
              <button onClick={() => handleFilterChange({ location: undefined })} className="hover:text-red-500 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.condition && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F1F3F3] text-xs text-[#17191C] border border-[#E5E8EA]">
              <span>Condition: {filters.condition}</span>
              <button onClick={() => handleFilterChange({ condition: undefined })} className="hover:text-red-500 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Main Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-20">
            <FilterSidebar
              categories={categories}
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-[#E5E8EA] p-8">
              <div className="w-12 h-12 rounded-xl bg-[#F1F3F3] text-[#66707A] flex items-center justify-center mx-auto mb-3">
                <SearchX className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-base text-[#17191C]">No Equipment Found</h3>
              <p className="text-xs text-[#66707A] mt-1 max-w-sm mx-auto leading-relaxed">
                No listings matched your active search criteria. Try loosening your keywords or reset all filters to view all available gear.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-[#315CF5] hover:bg-[#2447C9] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => openProduct(p)}
                  />
                ))}
              </div>

              {/* Pagination Bar */}
              {totalCount > 12 && (
                <div className="mt-10 pt-6 border-t border-[#E5E8EA] flex items-center justify-between">
                  <button
                    type="button"
                    disabled={filters.page === 1}
                    onClick={() => handlePageChange((filters.page || 1) - 1)}
                    className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-[#E5E8EA] bg-white text-[#17191C] hover:bg-[#F1F3F3] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <div className="text-xs text-[#66707A] font-medium">
                    Page <span className="font-semibold text-[#17191C]">{filters.page || 1}</span> of{' '}
                    <span className="font-semibold text-[#17191C]">{Math.ceil(totalCount / 12)}</span>
                  </div>

                  <button
                    type="button"
                    disabled={products.length < 12 || (filters.page || 1) * 12 >= totalCount}
                    onClick={() => handlePageChange((filters.page || 1) + 1)}
                    className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-[#E5E8EA] bg-white text-[#17191C] hover:bg-[#F1F3F3] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Slide-over / Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-sm h-full overflow-y-auto p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E8EA]">
              <h3 className="font-semibold text-base text-[#17191C]">Filter Equipment</h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-[#66707A] hover:bg-[#F1F3F3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar
              categories={categories}
              filters={filters}
              onFilterChange={(f) => {
                handleFilterChange(f);
                setMobileFilterOpen(false);
              }}
              onReset={() => {
                handleResetFilters();
                setMobileFilterOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
