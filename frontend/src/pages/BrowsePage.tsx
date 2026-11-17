import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, SearchX, SlidersHorizontal, RotateCcw } from 'lucide-react';
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

  // Sync state back to URL when filters change
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-[#E4E7EC]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#F06449] uppercase tracking-wider mb-1 font-display">
            <Compass className="w-4 h-4 text-[#F06449]" />
            <span>Equipment Catalog</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#172B46] tracking-tight">
            Browse All Gear
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Verified equipment for rent across Gujarat with secure digital escrow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#667085]">
            Showing <span className="text-[#172B46] font-bold">{products.length}</span> of {totalCount || 116} listings
          </span>
          {(filters.search || filters.categoryId || filters.location || filters.minPrice || filters.maxPrice) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-[#F06449] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid lg:grid-cols-4 gap-8 items-start">
        {/* Left: Filter Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-28 bg-white p-5 rounded-2xl border border-[#E4E7EC] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#172B46] uppercase tracking-wider mb-4 font-display">
              <SlidersHorizontal className="w-4 h-4 text-[#F06449]" />
              <span>Filters</span>
            </div>
            <FilterSidebar
              categories={categories}
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>
        </aside>

        {/* Right: Listings */}
        <section className="lg:col-span-3">
          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E4E7EC] p-12 text-center shadow-xs">
              <div className="w-16 h-16 bg-[#F5F6F8] text-[#172B46] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#E4E7EC]">
                <SearchX className="w-8 h-8" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#202833]">
                No matching equipment found
              </h3>
              <p className="text-xs text-[#667085] mt-1.5 max-w-sm mx-auto leading-relaxed">
                Try resetting your price filter, selecting another city or category, or searching with broader keywords.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-6 px-5 py-2.5 bg-[#F06449] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#D95339] transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(p) => openProduct(p)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
