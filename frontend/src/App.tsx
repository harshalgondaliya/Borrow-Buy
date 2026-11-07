import { useEffect, useState, useCallback } from 'react';
import { 
  Package, 
  Sparkles, 
  Cloud, 
  LogOut, 
  ShieldAlert, 
  Wrench, 
  LayoutGrid, 
  SearchX, 
  CalendarDays,
  Menu,
  X
} from 'lucide-react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { ToastProvider, useToast } from './features/toast/ToastContext';
import { AuthModal } from './components/auth/AuthModal';
import { 
  Category, 
  Product, 
  ProductQueryParams, 
  productsService 
} from './services/products';
import { ProductCard } from './components/product/ProductCard';
import { ProductCardSkeleton } from './components/common/Skeleton';
import { FilterSidebar } from './components/product/FilterSidebar';
import { ProductDetailsModal } from './components/product/ProductDetailsModal';
import { OwnerDashboard } from './components/dashboard/OwnerDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { NotificationDropdown } from './components/layout/NotificationDropdown';
import { DateRangePickerModal } from './components/booking/DateRangePickerModal';
import { CustomerBookingsModal } from './components/booking/CustomerBookingsModal';

function MainContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const { info } = useToast();

  // Navigation view mode: 'marketplace' | 'owner-dashboard' | 'admin-dashboard'
  const [viewMode, setViewMode] = useState<'marketplace' | 'owner-dashboard' | 'admin-dashboard'>('marketplace');

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Marketplace states
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bookingProduct, setBookingProduct] = useState<Product | null>(null);
  const [customerBookingsOpen, setCustomerBookingsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Filters state
  const [filters, setFilters] = useState<ProductQueryParams>({
    sortBy: 'newest',
    page: 1,
  });

  // Fetch categories
  const loadCategories = async () => {
    try {
      const res = await productsService.getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  // Fetch products
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await productsService.listProducts(filters);
      setProducts(res.products);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoadingProducts(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleFilterChange = (newFilters: Partial<ProductQueryParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({ sortBy: 'newest', page: 1 });
    info('Filters reset to defaults', 'Catalog Reset');
  };

  const handleInitiateBooking = (product: Product) => {
    if (!isAuthenticated) {
      setAuthTab('login');
      setAuthModalOpen(true);
      return;
    }
    setSelectedProduct(null);
    setBookingProduct(product);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => setViewMode('marketplace')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="bg-sky-600 group-hover:bg-sky-700 text-white p-2 rounded-xl shadow transition transform group-hover:scale-105">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Borrow<span className="text-sky-600">Buy</span>
              </span>
              <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-sky-100 text-sky-800 rounded-full uppercase tracking-wider">
                Phase 7 Polished
              </span>
            </div>
          </div>

          {/* Desktop Navigation Controls */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* View Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setViewMode('marketplace')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'marketplace'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Marketplace
              </button>

              {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
                <button
                  onClick={() => setViewMode('owner-dashboard')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                    viewMode === 'owner-dashboard'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  Owner Portal
                </button>
              )}

              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => setViewMode('admin-dashboard')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                    viewMode === 'admin-dashboard'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  Admin Console
                </button>
              )}
            </div>

            {/* My Rentals Button */}
            {isAuthenticated && (
              <button
                onClick={() => setCustomerBookingsOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition flex items-center gap-1.5"
              >
                <CalendarDays className="w-3.5 h-3.5 text-sky-600" />
                <span>My Rentals</span>
              </button>
            )}

            {/* Notification Bell Dropdown */}
            {isAuthenticated && <NotificationDropdown />}

            <span className="text-xs font-medium text-slate-400 inline-flex items-center gap-1 border-l pl-3 border-slate-200">
              <Cloud className="w-3.5 h-3.5 text-sky-500" />
              AWS Ready
            </span>

            {/* Auth Session State */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800">{user.fullName}</div>
                  <div className="text-[11px] font-medium text-sky-600 flex items-center justify-end gap-1">
                    {user.role === 'ADMIN' && <ShieldAlert className="w-3 h-3 text-rose-600" />}
                    {user.role === 'OWNER' && <Wrench className="w-3 h-3 text-amber-600" />}
                    <span>{user.role}</span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs border border-sky-300">
                  {user.fullName.charAt(0)}
                </div>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { setAuthTab('login'); setAuthModalOpen(true); }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthTab('register'); setAuthModalOpen(true); }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Navigation Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            {isAuthenticated && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-4 duration-200">
            {isAuthenticated && user && (
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{user.fullName}</div>
                  <div className="text-[10px] text-sky-600 font-semibold">{user.role} • Trust: {user.trustScore.toFixed(1)}/5.0</div>
                </div>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-xs font-semibold text-rose-600"
                >
                  Sign Out
                </button>
              </div>
            )}

            <div className="space-y-1 text-sm font-semibold">
              <button
                onClick={() => { setViewMode('marketplace'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl transition ${
                  viewMode === 'marketplace' ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Marketplace Catalog
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => { setCustomerBookingsOpen(true); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 transition"
                >
                  My Rentals & Handover Passes
                </button>
              )}

              {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
                <button
                  onClick={() => { setViewMode('owner-dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center gap-2 ${
                    viewMode === 'owner-dashboard' ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Wrench className="w-4 h-4 text-amber-600" />
                  Owner Portal & QR Scanner
                </button>
              )}

              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => { setViewMode('admin-dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center gap-2 ${
                    viewMode === 'admin-dashboard' ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Administrator Console
                </button>
              )}
            </div>

            {!isAuthenticated && (
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => { setAuthTab('login'); setAuthModalOpen(true); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthTab('register'); setAuthModalOpen(true); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-sky-600 rounded-xl"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Admin Dashboard View */}
        {viewMode === 'admin-dashboard' && user?.role === 'ADMIN' && (
          <AdminDashboard />
        )}

        {/* Owner Dashboard View */}
        {viewMode === 'owner-dashboard' && (
          <OwnerDashboard
            categories={categories}
            onRefreshProducts={loadProducts}
          />
        )}

        {/* Marketplace View */}
        {viewMode === 'marketplace' && (
          <div>
            {/* Hero Banner */}
            <div className="mb-8 p-6 sm:p-10 bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-xl relative overflow-hidden">
              <div className="max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-sky-200 mb-3 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                  Peer-to-Peer Rental Ecosystem with Single-Use QR Handover
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Borrow High-End Equipment from Verified Local Owners.
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed max-w-xl">
                  Rent cameras, woodworking tools, projectors, tech workstations, and outdoor gear with guaranteed date locks, simulated checkout, and automated damage protection.
                </p>
              </div>
            </div>

            {/* Marketplace Layout: Filters Sidebar + Products Grid */}
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Left Column: Filters */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <FilterSidebar
                    categories={categories}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                  />
                </div>
              </div>

              {/* Right Column: Products Display */}
              <div className="lg:col-span-3">
                {/* Result Bar */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <LayoutGrid className="w-4 h-4 text-sky-600" />
                    Available Listings ({products.length})
                  </span>
                  {filters.search && (
                    <span className="text-slate-500">
                      Results for <span className="font-bold text-slate-800">"{filters.search}"</span>
                    </span>
                  )}
                </div>

                {/* Loading Skeleton State */}
                {loadingProducts ? (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  /* Empty State */
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                    <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <SearchX className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">No matching products found</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Try broadening your search keywords, clearing your price filters, or exploring all categories.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-5 px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl shadow hover:bg-sky-700 transition"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  /* Product Grid */
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={(p) => setSelectedProduct(p)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          BorrowBuy Platform &copy; 2026 – Academic Cloud Computing Project. Local Zero-Cost Stage A.
        </div>
      </footer>

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onBookNow={(p) => handleInitiateBooking(p)}
      />

      {/* Date Range Picker & Atomic Reservation Modal */}
      <DateRangePickerModal
        product={bookingProduct}
        isOpen={!!bookingProduct}
        onClose={() => setBookingProduct(null)}
        onBookingSuccess={() => {
          loadProducts();
          setCustomerBookingsOpen(true);
        }}
      />

      {/* Customer Bookings Dashboard Modal */}
      <CustomerBookingsModal
        isOpen={customerBookingsOpen}
        onClose={() => setCustomerBookingsOpen(false)}
      />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authTab}
      />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
