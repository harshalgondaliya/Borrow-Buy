import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
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
  Compass,
  Video,
  Hammer,
  Tent,
  GraduationCap,
  Sparkle,
  MapPin,
  Smartphone,
  Gamepad2,
  Activity,
  Home,
  UtensilsCrossed,
  Music,
  Sun,
  Building2,
  Wifi,
  Send,
  Layers,
  Heart,
  HelpCircle,
  Info,
  LogOut
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
import { UserProfileDropdown } from './components/layout/UserProfileDropdown';
import { DateRangePickerModal } from './components/booking/DateRangePickerModal';
import { CustomerBookingsModal } from './components/booking/CustomerBookingsModal';
import { WishlistModal } from './components/product/WishlistModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { HelpFaqModal } from './components/common/HelpFaqModal';
import { AboutModal } from './components/common/AboutModal';
import { CategoryExplorerModal } from './components/product/CategoryExplorerModal';
import { BorrowBuyLogo } from './components/common/BorrowBuyLogo';
import { StartupSplash } from './components/common/StartupSplash';
import { formatINR } from './utils/formatters';

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

  // New Modals
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [categoryExplorerOpen, setCategoryExplorerOpen] = useState(false);

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
    info('Filters reset to show all listings', 'Catalog Reset');
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

  // Category visual icons mapping for all 21 categories
  const getCategoryIcon = (slug?: string) => {
    if (slug?.includes('camera') || slug?.includes('photography')) return <Camera className="w-5 h-5" />;
    if (slug?.includes('laptop') || slug?.includes('computer')) return <Laptop className="w-5 h-5" />;
    if (slug?.includes('projector') || slug?.includes('display')) return <Video className="w-5 h-5" />;
    if (slug?.includes('mobile')) return <Smartphone className="w-5 h-5" />;
    if (slug?.includes('audio') || slug?.includes('speaker') || slug?.includes('sound')) return <Volume2 className="w-5 h-5" />;
    if (slug?.includes('gaming')) return <Gamepad2 className="w-5 h-5" />;
    if (slug?.includes('sport') || slug?.includes('fitness')) return <Activity className="w-5 h-5" />;
    if (slug?.includes('bicycle') || slug?.includes('mobility') || slug?.includes('bike')) return <Bike className="w-5 h-5" />;
    if (slug?.includes('tool') || slug?.includes('workshop')) return <Hammer className="w-5 h-5" />;
    if (slug?.includes('appliance')) return <Home className="w-5 h-5" />;
    if (slug?.includes('kitchen')) return <UtensilsCrossed className="w-5 h-5" />;
    if (slug?.includes('instrument') || slug?.includes('music')) return <Music className="w-5 h-5" />;
    if (slug?.includes('event') || slug?.includes('party')) return <Sparkles className="w-5 h-5" />;
    if (slug?.includes('travel')) return <Compass className="w-5 h-5" />;
    if (slug?.includes('study') || slug?.includes('college')) return <GraduationCap className="w-5 h-5" />;
    if (slug?.includes('outdoor') || slug?.includes('camping')) return <Tent className="w-5 h-5" />;
    if (slug?.includes('lighting')) return <Sun className="w-5 h-5" />;
    if (slug?.includes('office')) return <Building2 className="w-5 h-5" />;
    if (slug?.includes('networking')) return <Wifi className="w-5 h-5" />;
    if (slug?.includes('cleaning')) return <Sparkle className="w-5 h-5" />;
    if (slug?.includes('drone')) return <Send className="w-5 h-5" />;
    return <Laptop className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 antialiased selection:bg-brand-600 selection:text-white font-sans">
      {/* Startup Splash Animation */}
      <StartupSplash />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div 
            onClick={() => { setViewMode('marketplace'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            className="cursor-pointer group flex items-center"
          >
            <BorrowBuyLogo size="md" variant="full" />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1.5">
            <button
              onClick={() => { setViewMode('marketplace'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                viewMode === 'marketplace'
                  ? 'bg-slate-100 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Explore Products
            </button>

            <button
              onClick={() => setCategoryExplorerOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Categories</span>
            </button>

            {/* Role Dashboards */}
            {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
              <button
                onClick={() => setViewMode('owner-dashboard')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  viewMode === 'owner-dashboard'
                    ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200/60'
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
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  viewMode === 'admin-dashboard'
                    ? 'bg-rose-50 text-rose-700 shadow-xs border border-rose-200/60'
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
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition flex items-center gap-1.5"
              >
                <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                <span>My Bookings</span>
              </button>
            )}

            {/* Wishlist Pill */}
            <button
              onClick={() => setWishlistOpen(true)}
              className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              title="Saved Wishlist"
            >
              <Heart className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Right Action Panel */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Notification Bell Dropdown */}
            {isAuthenticated && <NotificationDropdown />}

            {/* User Profile Dropdown (Replaces standalone X logout icon) */}
            {isAuthenticated && user ? (
              <UserProfileDropdown
                user={user}
                onLogout={logout}
                onOpenProfile={() => setProfileOpen(true)}
                onOpenBookings={() => setCustomerBookingsOpen(true)}
                onOpenWishlist={() => setWishlistOpen(true)}
                onOpenHelp={() => setHelpOpen(true)}
                onOpenAbout={() => setAboutOpen(true)}
                onNavigateToView={(view) => {
                  setViewMode(view);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ) : (
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => { setAuthTab('login'); setAuthModalOpen(true); }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthTab('register'); setAuthModalOpen(true); }}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow-card transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  List a Product
                </button>
              </div>
            )}
          </div>

          {/* Mobile Navigation Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            {isAuthenticated && <NotificationDropdown />}
            <button
              onClick={() => setWishlistOpen(true)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 text-rose-500" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-slate-700 hover:bg-slate-100 rounded-2xl transition"
              aria-label="Toggle menu"
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
              className="lg:hidden border-t border-slate-200 bg-white px-5 py-5 space-y-3 shadow-xl font-sans"
            >
              {isAuthenticated && user && (
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 font-display">{user.fullName}</div>
                      <div className="text-[11px] text-blue-600 font-semibold">{user.role} • ★ {user.trustScore ? user.trustScore.toFixed(1) : '5.0'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(true); setMobileMenuOpen(false); }}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>
              )}

              <div className="space-y-1 text-xs font-semibold">
                <button
                  onClick={() => { setViewMode('marketplace'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition ${
                    viewMode === 'marketplace' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Explore Products
                </button>

                <button
                  onClick={() => { setCategoryExplorerOpen(true); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 transition flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Browse All Categories</span>
                </button>

                <button
                  onClick={() => { setWishlistOpen(true); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 transition flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Saved Wishlist</span>
                </button>

                {isAuthenticated && (
                  <button
                    onClick={() => { setCustomerBookingsOpen(true); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 transition flex items-center gap-2"
                  >
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                    <span>My Bookings & Digital Passes</span>
                  </button>
                )}

                {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
                  <button
                    onClick={() => { setViewMode('owner-dashboard'); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center gap-2 ${
                      viewMode === 'owner-dashboard' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Wrench className="w-4 h-4 text-blue-600" />
                    <span>Owner Portal</span>
                  </button>
                )}

                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => { setViewMode('admin-dashboard'); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center gap-2 ${
                      viewMode === 'admin-dashboard' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-rose-600" />
                    <span>Admin Console</span>
                  </button>
                )}

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <button
                    onClick={() => { setHelpOpen(true); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition flex items-center gap-2 text-xs"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Help & FAQs</span>
                  </button>
                  <button
                    onClick={() => { setAboutOpen(true); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition flex items-center gap-2 text-xs"
                  >
                    <Info className="w-3.5 h-3.5 text-indigo-500" />
                    <span>About BorrowBuy</span>
                  </button>
                </div>
              </div>

              {isAuthenticated ? (
                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center justify-center gap-2 border border-rose-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100 flex gap-2.5">
                  <button
                    onClick={() => { setAuthTab('login'); setAuthModalOpen(true); setMobileMenuOpen(false); }}
                    className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthTab('register'); setAuthModalOpen(true); setMobileMenuOpen(false); }}
                    className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-xs"
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
                  {/* Natural Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-200 mb-6 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Trusted Equipment Rental Across Gujarat & India</span>
                  </motion.div>

                  {/* Headline */}
                  <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white"
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
                    Rent cameras, laptops, projectors, power tools, and gear from verified people near you in Gujarat and across India. Book easily, pick up with a secure pass, and return hassle-free.
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
                      className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-glow hover:shadow-card transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                    >
                      <span>Explore Products</span>
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
                      List Your Product
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
                      <div className="text-[11px] text-slate-400 font-medium">Refundable Deposit</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-xl sm:text-2xl font-black font-display text-blue-400">Instant</div>
                      <div className="text-[11px] text-slate-400 font-medium">Date Reservation</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-xl sm:text-2xl font-black font-display text-emerald-400">Digital Pass</div>
                      <div className="text-[11px] text-slate-400 font-medium">Contactless Pickup</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-xl sm:text-2xl font-black font-display text-amber-400">4.9 ★</div>
                      <div className="text-[11px] text-slate-400 font-medium">Community Trust Score</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* FEATURED CATEGORY NAVIGATION STRIP (21 Categories Supported) */}
            <section className="bg-white border-y border-slate-200/80 py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">
                    Rental Equipment Categories
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCategoryExplorerOpen(true)}
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Explore Visual Examples ({categories.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {filters.categoryId && (
                      <button
                        onClick={() => handleFilterChange({ categoryId: undefined })}
                        className="text-xs text-slate-500 font-bold hover:underline"
                      >
                        Show All
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {categories.slice(0, 12).map((cat) => {
                    const isSelected = filters.categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          handleFilterChange({ categoryId: isSelected ? undefined : cat.id });
                          scrollToCatalog();
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-200 group flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-card'
                            : 'bg-[#FBFBFC] border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-xs'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 transition ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600 group-hover:scale-110'
                        }`}>
                          {getCategoryIcon(cat.slug)}
                        </div>
                        <div>
                          <div className={`font-display font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {cat.name}
                          </div>
                          <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {cat._count?.products || 0} available
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* POPULAR LOCAL USE CASES (India / Gujarat Context) */}
            <section className="bg-slate-50/60 py-12 border-b border-slate-200/60">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 font-display">
                      <Sparkle className="w-3.5 h-3.5" />
                      <span>Rent for What You Need</span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Made for Your Needs & Projects
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 max-w-md">
                    From college presentations to wedding shoots, Navratri garba rehearsals to weekend home repairs — rent without the burden of buying.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Case 1 */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-sm text-slate-900 mb-1">
                      College Projects & Fests
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      MacBook Pros, Arduino kits, external monitors, and high-lumen projectors for hackathons and presentations.
                    </p>
                  </div>

                  {/* Case 2 */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                      <Camera className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-sm text-slate-900 mb-1">
                      Shoots & Family Events
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Cinema cameras, portrait primes, DJI gimbals, and wireless mics for weddings, baby showers, and YouTube creators.
                    </p>
                  </div>

                  {/* Case 3 */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                      <Hammer className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-sm text-slate-900 mb-1">
                      Home Repairs & DIY
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Bosch hammer drills, pressure washers, laser levels, and orbital sanders for quick weekend home upgrades.
                    </p>
                  </div>

                  {/* Case 4 */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                      <Tent className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-sm text-slate-900 mb-1">
                      Weekend Trips & Treks
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      GoPro action cameras, waterproof dome tents, hiking backpacks, and portable power stations for outdoor travel.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* MARKETPLACE SECTION (Filters + Product Grid) */}
            <section ref={catalogRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 font-display">
                    <Compass className="w-4 h-4" />
                    <span>Live Listings</span>
                  </div>
                  <h2 className="font-display text-3xl font-extrabold text-slate-950 tracking-tight">
                    Explore Rental Equipment
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
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <SearchX className="w-8 h-8" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-slate-900">No matching equipment found</h3>
                      <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                        Try resetting your price filter, selecting another city or category, or searching with broader keywords.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-6 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-700 transition"
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
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 font-display">
                    Simple & Safe Process
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                    How Renting on BorrowBuy Works
                  </h2>
                  <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                    Designed for simple handovers, clear pricing, and complete peace of mind.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {/* Step 1 */}
                  <div className="p-8 rounded-3xl bg-[#FBFBFC] border border-slate-200/90 relative group hover:shadow-card transition-all duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-display font-extrabold text-lg flex items-center justify-center mb-6 shadow-xs">
                      1
                    </div>
                    <h3 className="font-display font-bold text-lg text-slate-900 mb-2">
                      Find & Choose Dates
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Search equipment near you in Ahmedabad, Surat, or Gandhinagar. Pick your rental start and return dates with instant hold while you review.
                    </p>
                    <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-blue-600">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Instant date reservation</span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-8 rounded-3xl bg-[#FBFBFC] border border-slate-200/90 relative group hover:shadow-card transition-all duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-display font-extrabold text-lg flex items-center justify-center mb-6 shadow-xs">
                      2
                    </div>
                    <h3 className="font-display font-bold text-lg text-slate-900 mb-2">
                      Collect with Digital Pass
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Meet the owner locally. Show your single-use pass on your phone, inspect the item together, and take it with you.
                    </p>
                    <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Fast, contactless check-in</span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-8 rounded-3xl bg-[#FBFBFC] border border-slate-200/90 relative group hover:shadow-card transition-all duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-display font-extrabold text-lg flex items-center justify-center mb-6 shadow-xs">
                      3
                    </div>
                    <h3 className="font-display font-bold text-lg text-slate-900 mb-2">
                      Return & Deposit Release
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Return the item on the due date. The owner verifies the return pass and your security deposit is released back immediately.
                    </p>
                    <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Immediate deposit release</span>
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
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold mb-4 border border-blue-500/20 font-display">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Trusted Platform Protection</span>
                    </div>
                    <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                      Designed for Trust Between Neighbors & Creators.
                    </h2>
                    <p className="text-sm text-slate-300 mt-4 leading-relaxed font-normal">
                      BorrowBuy replaces informal lending with secure verification, refundable deposit protection, and clear return policies.
                    </p>

                    <div className="mt-8 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white font-display">Verified Local Members</div>
                          <div className="text-xs text-slate-400 mt-0.5">Every lender and borrower is verified with phone confirmation and community ratings.</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white font-display">Condition Photos at Handover</div>
                          <div className="text-xs text-slate-400 mt-0.5">Photos taken at pickup ensure clarity on existing condition and protect both parties.</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white font-display">Transparent Pricing & Refundable Deposits</div>
                          <div className="text-xs text-slate-400 mt-0.5">No hidden charges. Daily rental fee, refundable security deposit, and exact return dates are agreed upfront.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Visual Graphic */}
                  <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">
                        Refundable Security Deposit
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        PROTECTED IN ESCROW
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-400">Held in Escrow</div>
                        <div className="font-display text-2xl font-black text-white mt-0.5">{formatINR(2500)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-emerald-400 font-semibold">100% Refundable</div>
                        <div className="text-[10px] text-slate-500">Released upon return</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                          QR
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white font-display">Digital Handover Pass</div>
                          <div className="text-[10px] text-slate-400">Pass #BB-2026-GUJ • Verified for Pickup</div>
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
              <div className="mb-4">
                <BorrowBuyLogo size="md" variant="full" />
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-4">
                BorrowBuy is India's trusted product rental platform connecting equipment owners with creators, students, and local professionals.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Serving Ahmedabad, Gandhinagar, Surat, Vadodara & across Gujarat</span>
              </div>
            </div>

            {/* Col 2: Categories */}
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 font-display">
                Categories
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><button onClick={() => scrollToCatalog()} className="hover:text-blue-600">Cameras & Photography</button></li>
                <li><button onClick={() => scrollToCatalog()} className="hover:text-blue-600">Laptops & Computers</button></li>
                <li><button onClick={() => scrollToCatalog()} className="hover:text-blue-600">Power Tools & Workshop</button></li>
                <li><button onClick={() => scrollToCatalog()} className="hover:text-blue-600">Sound & Audio Systems</button></li>
                <li><button onClick={() => setCategoryExplorerOpen(true)} className="text-blue-600 font-bold hover:underline">View All 21 Categories &rarr;</button></li>
              </ul>
            </div>

            {/* Col 3: Trust & Safety */}
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 font-display">
                Trust & Safety
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><button onClick={() => setHelpOpen(true)} className="hover:text-blue-600">Verified Owners</button></li>
                <li><button onClick={() => setHelpOpen(true)} className="hover:text-blue-600">Refundable Deposits</button></li>
                <li><button onClick={() => setHelpOpen(true)} className="hover:text-blue-600">Digital QR Passes</button></li>
                <li><button onClick={() => setHelpOpen(true)} className="hover:text-blue-600">Condition Verification</button></li>
                <li><button onClick={() => setHelpOpen(true)} className="hover:text-blue-600">Dispute Arbitration</button></li>
              </ul>
            </div>

            {/* Col 4: Platform */}
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 font-display">
                Platform
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><button onClick={() => { setAuthTab('login'); setAuthModalOpen(true); }} className="hover:text-blue-600">Sign In</button></li>
                <li><button onClick={() => { setAuthTab('register'); setAuthModalOpen(true); }} className="hover:text-blue-600">List Your Equipment</button></li>
                <li><button onClick={() => setAboutOpen(true)} className="hover:text-blue-600">About BorrowBuy</button></li>
                <li><button onClick={() => setHelpOpen(true)} className="hover:text-blue-600">Help & FAQs</button></li>
                <li><span className="text-slate-500">support@borrowbuy.in</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>
              BorrowBuy Platform &copy; 2026. All rights reserved.
            </div>
            <div className="flex gap-6">
              <span className="text-slate-500">Licensed photography via Unsplash</span>
              <span className="text-slate-500">Secure Indian Digital Checkout</span>
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

      {/* Date Range Picker Modal */}
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

      {/* Saved Wishlist Modal */}
      <WishlistModal
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onInitiateBooking={(p) => handleInitiateBooking(p)}
      />

      {/* User Profile & Contact Edit Modal */}
      <UserProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

      {/* Help & FAQs Modal */}
      <HelpFaqModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />

      {/* About BorrowBuy Modal */}
      <AboutModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />

      {/* Category Visual Explorer Modal (All 21 Categories + 3 Previews) */}
      <CategoryExplorerModal
        isOpen={categoryExplorerOpen}
        onClose={() => setCategoryExplorerOpen(false)}
        categories={categories}
        selectedCategoryId={filters.categoryId}
        onSelectCategory={(catId) => {
          handleFilterChange({ categoryId: catId, page: 1 });
          scrollToCatalog();
        }}
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
