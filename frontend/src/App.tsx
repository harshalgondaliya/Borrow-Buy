import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Sparkles, 
  ShieldCheck, 
  Wrench, 
  SearchX, 
  CalendarDays,
  Menu,
  X,
  ArrowRight,
  Shield,
  CheckCircle2,
  Lock,
  QrCode,
  Camera,
  Laptop,
  Volume2,
  Bike,
  Compass
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

  const catalogRef = useRef<HTMLDivElement>(null);

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
    info('Filters reset to default listings', 'Catalog Reset');
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

  const scrollToCatalog = () => {
    setViewMode('marketplace');
    setTimeout(() => {
      catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Category visual icons mapping
  const getCategoryIcon = (slug?: string) => {
    if (slug?.includes('camera')) return <Camera className="w-5 h-5" />;
    if (slug?.includes('tool')) return <Wrench className="w-5 h-5" />;
    if (slug?.includes('audio') || slug?.includes('projector')) return <Volume2 className="w-5 h-5" />;
    if (slug?.includes('outdoor') || slug?.includes('bike')) return <Bike className="w-5 h-5" />;
    return <Laptop className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFC] text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div 
            onClick={() => { setViewMode('marketplace'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-card group-hover:shadow-glow transition-all duration-300 transform group-hover:scale-105">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <span className="font-display text-2xl font-black tracking-tight text-slate-950">
                Borrow<span className="text-blue-600">Buy</span>
              </span>
              <div className="flex items-center gap-1.5 -mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  P2P Rental Marketplace
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-2">
            <button
              onClick={() => { setViewMode('marketplace'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'marketplace'
                  ? 'bg-slate-100 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Explore Gear
            </button>

            {/* Role Dashboards */}
            {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
              <button
                onClick={() => setViewMode('owner-dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'owner-dashboard'
                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                <span>Owner Portal</span>
              </button>
            )}

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => setViewMode('admin-dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'admin-dashboard'
                    ? 'bg-rose-50 text-rose-700 shadow-sm border border-rose-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-rose-600" />
                <span>Admin Console</span>
              </button>
            )}

            {/* My Rentals Pill */}
            {isAuthenticated && (
              <button
                onClick={() => setCustomerBookingsOpen(true)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition flex items-center gap-1.5"
              >
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span>My Bookings</span>
              </button>
            )}
          </div>

          {/* Desktop Right Action Panel */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Notification Bell Dropdown */}
            {isAuthenticated && <NotificationDropdown />}

            {/* Auth Session State */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">{user.fullName}</div>
                  <div className="text-[11px] font-semibold text-blue-600 flex items-center justify-end gap-1">
                    <span>{user.role}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-medium">★ {user.trustScore.toFixed(1)}</span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  {user.fullName.charAt(0)}
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => { setAuthTab('login'); setAuthModalOpen(true); }}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthTab('register'); setAuthModalOpen(true); }}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Navigation Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            {isAuthenticated && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-slate-700 hover:bg-slate-100 rounded-2xl transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Slide-Over Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-slate-200 bg-white px-5 py-5 space-y-3 shadow-xl"
            >
              {isAuthenticated && user && (
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{user.fullName}</div>
                    <div className="text-[11px] text-blue-600 font-semibold">{user.role} • Trust Score: {user.trustScore.toFixed(1)}/5.0</div>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              )}

              <div className="space-y-1 text-xs font-bold">
                <button
                  onClick={() => { setViewMode('marketplace'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition ${
                    viewMode === 'marketplace' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Explore Marketplace Catalog
                </button>

                {isAuthenticated && (
                  <button
                    onClick={() => { setCustomerBookingsOpen(true); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 transition"
                  >
                    My Bookings & QR Handover Passes
                  </button>
                )}

                {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
                  <button
                    onClick={() => { setViewMode('owner-dashboard'); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center gap-2 ${
                      viewMode === 'owner-dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Wrench className="w-4 h-4 text-blue-600" />
                    <span>Owner Portal & Scanner</span>
                  </button>
                )}

                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => { setViewMode('admin-dashboard'); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center gap-2 ${
                      viewMode === 'admin-dashboard' ? 'bg-rose-50 text-rose-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-rose-600" />
                    <span>Administrator Console</span>
                  </button>
                )}
              </div>

              {!isAuthenticated && (
                <div className="pt-3 border-t border-slate-100 flex gap-2.5">
                  <button
                    onClick={() => { setAuthTab('login'); setAuthModalOpen(true); setMobileMenuOpen(false); }}
                    className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthTab('register'); setAuthModalOpen(true); setMobileMenuOpen(false); }}
                    className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-sm"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main View Area */}
      <main className="flex-1 w-full">
        {/* Admin Console View */}
        {viewMode === 'admin-dashboard' && user?.role === 'ADMIN' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AdminDashboard />
          </div>
        )}

        {/* Owner Portal View */}
        {viewMode === 'owner-dashboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <OwnerDashboard
              categories={categories}
              onRefreshProducts={loadProducts}
            />
          </div>
        )}

        {/* Marketplace / Landing Page View */}
        {viewMode === 'marketplace' && (
          <div>
            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-16 pb-24 md:pt-24 md:pb-32">
              {/* Subtle Ambient Glow Elements */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-indigo-500/15 rounded-full blur-[90px] pointer-events-none" />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto">
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-200 mb-6 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Peer-to-Peer Rental Ecosystem • Guaranteed Single-Use QR Handover</span>
                  </motion.div>

                  {/* Headline */}
                  <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white"
                  >
                    Why Buy When You Can <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">Borrow?</span>
                  </motion.h1>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-base sm:text-lg text-slate-300 mt-6 leading-relaxed font-normal"
                  >
                    Access high-end cinema cameras, drones, heavy-duty workshop tools, and workstation gear exactly when you need them. Rent safely with atomic date locking, simulated escrow deposits, and single-use QR handover.
                  </motion.p>

                  {/* Hero CTAs */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4"
                  >
                    <button
                      onClick={scrollToCatalog}
                      className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-glow hover:shadow-card-hover transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                    >
                      <span>Explore Equipment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          setAuthTab('register');
                          setAuthModalOpen(true);
                        } else {
                          setViewMode('owner-dashboard');
                        }
                      }}
                      className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl backdrop-blur-md border border-white/20 transition-all duration-200 text-sm"
                    >
                      List Your Gear
                    </button>
                  </motion.div>

                  {/* Micro Trust Indicators */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <div className="text-xl sm:text-2xl font-black font-display text-white">100%</div>
                      <div className="text-[11px] text-slate-400 font-medium">Refundable Deposits</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-xl sm:text-2xl font-black font-display text-blue-400">Zero</div>
                      <div className="text-[11px] text-slate-400 font-medium">Double-Bookings</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-xl sm:text-2xl font-black font-display text-emerald-400">QR Code</div>
                      <div className="text-[11px] text-slate-400 font-medium">Cryptographic Handover</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-xl sm:text-2xl font-black font-display text-amber-400">5.0 ★</div>
                      <div className="text-[11px] text-slate-400 font-medium">Verified Owner Trust</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* FEATURED CATEGORY NAVIGATION STRIP */}
            <section className="bg-white border-y border-slate-200/80 py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Browse Popular Rental Categories
                  </h3>
                  {filters.categoryId && (
                    <button
                      onClick={() => handleFilterChange({ categoryId: undefined })}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      Show All Categories
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                  {categories.map((cat) => {
                    const isSelected = filters.categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          handleFilterChange({ categoryId: isSelected ? undefined : cat.id });
                          scrollToCatalog();
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 group flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-card'
                            : 'bg-[#FBFBFC] border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-card'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600 group-hover:scale-110'
                        }`}>
                          {getCategoryIcon(cat.slug)}
                        </div>
                        <div>
                          <div className={`font-display font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {cat.name}
                          </div>
                          <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {cat._count?.products || 0} items listed
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* MARKETPLACE SECTION (Filters + Product Grid) */}
            <section ref={catalogRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                    <Compass className="w-4 h-4" />
                    <span>Real-Time Catalog</span>
                  </div>
                  <h2 className="font-display text-3xl font-black text-slate-950 tracking-tight">
                    Featured Rental Equipment
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500">
                    Showing <span className="text-slate-900 font-bold">{products.length}</span> verified listings
                  </span>
                </div>
              </div>

              {/* Layout: Sidebar + Product Grid */}
              <div className="grid lg:grid-cols-4 gap-8 items-start">
                {/* Left Column: Advanced Filters */}
                <div className="lg:col-span-1">
                  <div className="sticky top-28">
                    <FilterSidebar
                      categories={categories}
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onReset={handleResetFilters}
                    />
                  </div>
                </div>

                {/* Right Column: Dynamic Listings */}
                <div className="lg:col-span-3">
                  {loadingProducts ? (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <ProductCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : products.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-card">
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <SearchX className="w-8 h-8" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-slate-900">No matching equipment found</h3>
                      <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                        Try clearing your price filters, selecting another category, or searching for broader gear keywords.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-6 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-card hover:bg-blue-700 transition"
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
                          onSelect={(p) => setSelectedProduct(p)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* HOW IT WORKS (3-STEP WORKFLOW) */}
            <section className="bg-white border-y border-slate-200 py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                    Simple & Secure Process
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                    How Renting on BorrowBuy Works
                  </h2>
                  <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                    Designed from the ground up for mutual confidence, guaranteed reservation locking, and frictionless handovers.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {/* Step 1 */}
                  <div className="p-8 rounded-3xl bg-[#FBFBFC] border border-slate-200/90 relative group hover:shadow-card transition-all duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-display font-extrabold text-lg flex items-center justify-center mb-6 shadow-sm">
                      1
                    </div>
                    <h3 className="font-display font-bold text-lg text-slate-900 mb-2">
                      Find & Reserve Equipment
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Search local equipment and select rental dates. PostgreSQL row-level locks protect your dates for 15 minutes while you checkout.
                    </p>
                    <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-blue-600">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Zero collision guarantee</span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-8 rounded-3xl bg-[#FBFBFC] border border-slate-200/90 relative group hover:shadow-card transition-all duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-display font-extrabold text-lg flex items-center justify-center mb-6 shadow-sm">
                      2
                    </div>
                    <h3 className="font-display font-bold text-lg text-slate-900 mb-2">
                      Pickup with Single-Use QR
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Meet the verified owner and present your unique cryptographic QR code. Pre-rental inspection photos are recorded on the spot.
                    </p>
                    <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Replay-attack safe</span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-8 rounded-3xl bg-[#FBFBFC] border border-slate-200/90 relative group hover:shadow-card transition-all duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-display font-extrabold text-lg flex items-center justify-center mb-6 shadow-sm">
                      3
                    </div>
                    <h3 className="font-display font-bold text-lg text-slate-900 mb-2">
                      Return & Instant Refund
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Scan the return token to end the rental. The security deposit is automatically refunded, and both parties submit verified trust reviews.
                    </p>
                    <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Instant deposit release</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* TRUST & SAFETY SECTION */}
            <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold mb-4 border border-blue-500/20">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Enterprise-Grade Security Architecture</span>
                    </div>
                    <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                      Built for Absolute Confidence Between Owners and Renters.
                    </h2>
                    <p className="text-sm text-slate-300 mt-4 leading-relaxed">
                      BorrowBuy replaces verbal agreements with cryptographic handovers, automated deposit escrow, and comprehensive inspection audits.
                    </p>

                    <div className="mt-8 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Verified Owner Credentials</div>
                          <div className="text-xs text-slate-400 mt-0.5">Every lender undergoes phone and identity verification with public trust score ratings.</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Pre & Post Condition Photo Records</div>
                          <div className="text-xs text-slate-400 mt-0.5">High-resolution condition logs prevent unfair dispute claims on existing minor wear.</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">PostgreSQL Concurrency Serialization</div>
                          <div className="text-xs text-slate-400 mt-0.5">Two customers can never double-book the same piece of equipment for overlapping days.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Visual Graphic */}
                  <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Security Escrow Protocol
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ACTIVE ESCROW
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-400">Total Held in Escrow</div>
                        <div className="font-display text-2xl font-black text-white mt-0.5">$500.00</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-emerald-400 font-semibold">100% Protected</div>
                        <div className="text-[10px] text-slate-500">Auto-Release on Return</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                          QR
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Single-Use Token Validated</div>
                          <div className="text-[10px] text-slate-400">PK-A8F29C... • Replay Attack Blocked</div>
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* MODERN MULTI-COLUMN FOOTER */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-200">
            {/* Col 1: Brand Info */}
            <div className="col-span-2">
              <div className="flex items-center space-x-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                  <Package className="h-4 w-4" />
                </div>
                <span className="font-display text-xl font-black text-slate-950 tracking-tight">
                  Borrow<span className="text-blue-600">Buy</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-4">
                BorrowBuy is a peer-to-peer product rental marketplace connecting equipment owners with local creators, makers, and enthusiasts.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-[11px] font-semibold text-slate-700">
                <span>Stage A Local Verification</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-700">89/89 Tests Passing</span>
              </div>
            </div>

            {/* Col 2: Categories */}
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Categories
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><button onClick={() => scrollToCatalog()} className="hover:text-blue-600">Cameras & Lenses</button></li>
                <li><button onClick={() => scrollToCatalog()} className="hover:text-blue-600">Power Tools & Workshop</button></li>
                <li><button onClick={() => scrollToCatalog()} className="hover:text-blue-600">Audio & Projectors</button></li>
                <li><button onClick={() => scrollToCatalog()} className="hover:text-blue-600">Computers & Workstations</button></li>
                <li><button onClick={() => scrollToCatalog()} className="hover:text-blue-600">Outdoor & Camping</button></li>
              </ul>
            </div>

            {/* Col 3: Architecture & Security */}
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Architecture
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><span className="text-slate-500">PostgreSQL Row Locks</span></li>
                <li><span className="text-slate-500">Hexagonal Ports & Adapters</span></li>
                <li><span className="text-slate-500">Single-Use QR Tokens</span></li>
                <li><span className="text-slate-500">AWS Terraform IaC</span></li>
                <li><span className="text-slate-500">Zero Paid Dependencies</span></li>
              </ul>
            </div>

            {/* Col 4: Platform */}
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Platform
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><button onClick={() => { setAuthTab('login'); setAuthModalOpen(true); }} className="hover:text-blue-600">User Sign In</button></li>
                <li><button onClick={() => { setAuthTab('register'); setAuthModalOpen(true); }} className="hover:text-blue-600">Register as Lender</button></li>
                <li><span className="text-slate-500">Academic Project 2026</span></li>
                <li><span className="text-slate-500">v1.0.0-local Stable</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              BorrowBuy Platform &copy; 2026 – Academic Cloud Computing Project. All rights reserved.
            </div>
            <div className="flex gap-6">
              <span className="text-slate-500">Licensed photography via Unsplash</span>
              <span className="text-slate-500">PostgreSQL 16 Engine</span>
            </div>
          </div>
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
