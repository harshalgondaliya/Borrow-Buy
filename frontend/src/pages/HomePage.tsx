import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Search,
  ArrowRight,
  CheckCircle2,
  Lock,
  QrCode,
  Star,
  MapPin,
  ChevronRight,
  TrendingUp,
  Clapperboard,
  GraduationCap,
  Hammer,
  Tent,
  Layers,
  Compass,
} from 'lucide-react';
import { Product, Category, productsService } from '../services/products';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import { useModals } from '../features/modal/ModalContext';
import { useAuth } from '../features/auth/AuthContext';
import { resolveImageUrl } from '../utils/apiUrl';
import { formatINR } from '../utils/formatters';

const GUJARAT_CITIES = ['Ahmedabad', 'Gandhinagar', 'Surat', 'Vadodara', 'Rajkot'];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { openProduct, openAuth, openCategoryExplorer, openHelp } = useModals();
  const { isAuthenticated } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Hero Search state
  const [heroKeyword, setHeroKeyword] = useState('');
  const [heroCategory, setHeroCategory] = useState('');
  const [heroCity, setHeroCity] = useState('');

  useEffect(() => {
    productsService
      .getCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err));

    productsService
      .listProducts({ page: 1, limit: 6, sortBy: 'newest' })
      .then((res) => setFeaturedProducts(res.products))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (heroKeyword.trim()) query.set('search', heroKeyword.trim());
    if (heroCategory) query.set('category', heroCategory);
    if (heroCity) query.set('city', heroCity);
    navigate(`/browse?${query.toString()}`);
  };

  const defaultFeaturedProduct: Product = {
    id: 'prod-featured-fallback',
    name: 'Sony FX3 Cinema Line Full-Frame Kit',
    description:
      'Pro cinema camera with XLR audio handle, 2x 160GB CFexpress cards, 3x batteries, and 24-70mm f/2.8 GM lens. Ready for commercial shoots.',
    pricePerDay: 2800,
    securityDeposit: 15000,
    condition: 'LIKE_NEW',
    approvalStatus: 'APPROVED',
    listingStatus: 'ACTIVE',
    location: 'Ahmedabad (SG Highway)',
    images: ['/images/products/camera-sony-fx3.jpg'],
    categoryId: 'cat-cameras',
    category: {
      id: 'cat-cameras',
      name: 'Cameras & Photography',
      slug: 'cameras',
    },
    ownerId: 'owner-default',
    owner: {
      id: 'owner-default',
      fullName: 'Rajesh Cinema Rentals',
      trustScore: 4.98,
      isVerifiedOwner: true,
    },
    includedAccessories: [
      'Top XLR Audio Handle',
      '2x CFexpress Type A 160GB',
      '3x NP-FZ100 Batteries',
      'Dual Charger',
      'Pelican Hard Shell Case',
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const spotlightProduct = featuredProducts[0] || defaultFeaturedProduct;

  return (
    <div className="space-y-0 bg-[#FAFAF8]">
      {/* HERO SECTION: Editorial Light Theme */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-[#E5E8EA] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Value Proposition & Discovery Search */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF3FE] border border-[#DBE4FD] text-xs font-semibold text-[#315CF5] mb-5">
                <Sparkles className="w-3.5 h-3.5 text-[#315CF5]" />
                <span>Verified Peer-to-Peer Equipment Network • Gujarat Hubs</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-[#17191C]">
                Rent professional gear without capital expense.
              </h1>

              <p className="text-base sm:text-lg text-[#66707A] mt-4 leading-relaxed font-normal max-w-xl">
                Find cinema cameras, audio rigs, workshop tools, and event technology from verified local owners across Gujarat. Protected by instant escrow.
              </p>

              {/* Integrated Search Bar */}
              <div className="mt-8 bg-[#FAFAF8] p-2.5 sm:p-3 rounded-2xl border border-[#E5E8EA] shadow-card text-[#17191C]">
                <form onSubmit={handleHeroSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 relative flex items-center">
                    <Search className="w-4 h-4 text-[#66707A] absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="What gear do you need? (e.g. Sony FX3, Lens, Tent)"
                      value={heroKeyword}
                      onChange={(e) => setHeroKeyword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm text-[#17191C] placeholder:text-[#66707A] bg-transparent focus:outline-none"
                    />
                  </div>

                  <div className="sm:border-l border-[#E5E8EA] sm:pl-2">
                    <select
                      value={heroCity}
                      onChange={(e) => setHeroCity(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2 text-xs text-[#17191C] bg-transparent focus:outline-none cursor-pointer font-medium"
                    >
                      <option value="">All Gujarat Hubs</option>
                      {GUJARAT_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:border-l border-[#E5E8EA] sm:pl-2">
                    <select
                      value={heroCategory}
                      onChange={(e) => setHeroCategory(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2 text-xs text-[#17191C] bg-transparent focus:outline-none cursor-pointer font-medium"
                    >
                      <option value="">All Categories ({categories.length || 25})</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#315CF5] hover:bg-[#2447C9] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <span>Search Gear</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Trust Indicators Bar */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-6 border-t border-[#E5E8EA]">
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-[#17191C] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#13795B]" />
                    100% Escrow
                  </span>
                  <span className="text-[11px] text-[#66707A]">Refundable deposit</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-[#17191C] flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#13795B]" />
                    Instant Hold
                  </span>
                  <span className="text-[11px] text-[#66707A]">Reserved calendar</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-[#17191C] flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-[#13795B]" />
                    Single-Use Pass
                  </span>
                  <span className="text-[11px] text-[#66707A]">QR code handover</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-[#17191C] flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#B76E16] fill-[#B76E16]" />
                    4.9★ Community
                  </span>
                  <span className="text-[11px] text-[#66707A]">Verified reviews</span>
                </div>
              </div>
            </div>

            {/* Right Column: Featured Gear Showcase Card */}
            <div className="lg:col-span-5">
              {spotlightProduct ? (
                <div
                  onClick={() => openProduct(spotlightProduct)}
                  className="bg-white rounded-2xl border border-[#E5E8EA] p-4 shadow-card hover:shadow-card-hover hover:border-[#D0D5DD] transition-all duration-200 cursor-pointer text-[#17191C]"
                  title="Click to view full equipment details and rent"
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFF3FE] text-[11px] font-semibold text-[#315CF5]">
                      <span>Featured Equipment</span>
                    </div>
                    <div className="text-[11px] font-medium text-[#66707A] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#66707A]" />
                      <span>{spotlightProduct.location || 'Ahmedabad'}</span>
                    </div>
                  </div>

                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-[#F1F3F3] mb-4 border border-[#E5E8EA]">
                    <img
                      src={resolveImageUrl(spotlightProduct.images?.[0])}
                      alt={spotlightProduct.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2.5 left-2.5 bg-[#17191C]/90 px-2.5 py-1 rounded-md text-white text-xs font-semibold backdrop-blur-sm">
                      {formatINR(spotlightProduct.pricePerDay)}{' '}
                      <span className="font-normal text-[10px] text-neutral-300">/ day</span>
                    </div>
                    <div className="absolute top-2.5 right-2.5 bg-white px-2 py-0.5 rounded-md text-[#17191C] text-[10px] font-semibold border border-[#E5E8EA] shadow-xs">
                      ★ 4.98 (24 rentals)
                    </div>
                  </div>

                  <div className="px-1 pb-1">
                    <h3 className="font-sans font-semibold text-base text-[#17191C] line-clamp-1 hover:text-[#315CF5] transition-colors">
                      {spotlightProduct.name}
                    </h3>
                    <p className="text-xs text-[#66707A] mt-1 line-clamp-2 leading-relaxed">
                      {spotlightProduct.description}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-[11px] text-[#66707A]">
                      <span className="px-2 py-0.5 rounded bg-[#F1F3F3] text-[#17191C] font-medium">
                        Deposit: {formatINR(spotlightProduct.securityDeposit)}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#EBF5F1] text-[#13795B] font-medium">
                        Instant Handover
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E5E8EA] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#17191C] text-white flex items-center justify-center font-bold text-xs">
                          {spotlightProduct.owner?.fullName?.charAt(0) || 'R'}
                        </div>
                        <span className="text-xs font-medium text-[#17191C]">
                          {spotlightProduct.owner?.fullName || 'Verified Owner'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProduct(spotlightProduct);
                        }}
                        className="px-3.5 py-1.5 bg-[#315CF5] hover:bg-[#2447C9] text-white font-medium text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-80 bg-white rounded-2xl border border-[#E5E8EA] animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CURATED CATEGORIES SHOWCASE STRIP */}
      <section className="bg-white border-b border-[#E5E8EA] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-[#66707A] uppercase tracking-wider">
                Rental Categories
              </h3>
              <p className="text-sm text-[#17191C] font-semibold mt-0.5">
                Explore equipment across {categories.length || 25} specialized categories
              </p>
            </div>
            <button
              type="button"
              onClick={openCategoryExplorer}
              className="text-xs text-[#315CF5] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({categories.length || 25})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
            {categories.slice(0, 16).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate(`/browse?category=${cat.id}`)}
                className="p-3 rounded-xl border text-left transition-colors group flex flex-col justify-between bg-[#FAFAF8] border-[#E5E8EA] hover:border-[#315CF5] hover:bg-white cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2 bg-white text-[#17191C] border border-[#E5E8EA] group-hover:border-[#315CF5] group-hover:text-[#315CF5]">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-medium text-xs truncate text-[#17191C]">
                    {cat.name}
                  </div>
                  <div className="text-[10px] mt-0.5 text-[#66707A]">
                    {cat._count?.products || 0} items
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASE SECTIONS */}
      <section className="bg-[#FAFAF8] py-14 border-b border-[#E5E8EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-semibold text-[#315CF5] uppercase tracking-wider mb-1">
                Equipment Solutions
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#17191C] tracking-tight">
                Gear for Every Project & Occasion
              </h2>
            </div>
            <p className="text-xs text-[#66707A] max-w-md leading-relaxed">
              From commercial cinema shoots to weekend DIY repairs, hackathons to outdoor expeditions — rent reliable tools without high purchase costs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => navigate('/browse?search=cinema')}
              className="p-5 rounded-xl bg-white border border-[#E5E8EA] hover:border-[#315CF5] transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-[#F1F3F3] text-[#17191C] flex items-center justify-center mb-3 group-hover:bg-[#EFF3FE] group-hover:text-[#315CF5] transition-colors">
                  <Clapperboard className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-[#17191C] mb-1 group-hover:text-[#315CF5] transition-colors">
                  Film & Video Production
                </h3>
                <p className="text-xs text-[#66707A] leading-relaxed">
                  Blackmagic Cinema 6K, Sony FX3, wireless audio transmitters, and Aputure studio lights.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F1F3F3] flex items-center justify-between text-xs font-semibold text-[#315CF5]">
                <span>Explore Gear</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => navigate('/browse?search=laptop')}
              className="p-5 rounded-xl bg-white border border-[#E5E8EA] hover:border-[#315CF5] transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-[#F1F3F3] text-[#17191C] flex items-center justify-center mb-3 group-hover:bg-[#EFF3FE] group-hover:text-[#315CF5] transition-colors">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-[#17191C] mb-1 group-hover:text-[#315CF5] transition-colors">
                  Hackathons & Research
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Apple Silicon workstations, Arduino hardware kits, and high-lumen projectors for student teams.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F1F3F3] flex items-center justify-between text-xs font-semibold text-[#315CF5]">
                <span>Explore Tech</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => navigate('/browse?search=bosch')}
              className="p-5 rounded-xl bg-white border border-[#E5E8EA] hover:border-[#315CF5] transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-[#F1F3F3] text-[#17191C] flex items-center justify-center mb-3 group-hover:bg-[#EFF3FE] group-hover:text-[#315CF5] transition-colors">
                  <Hammer className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-[#17191C] mb-1 group-hover:text-[#315CF5] transition-colors">
                  DIY & Home Repairs
                </h3>
                <p className="text-xs text-[#66707A] leading-relaxed">
                  Bosch rotary hammers, DeWalt cross-line lasers, and Kärcher high-pressure washers.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F1F3F3] flex items-center justify-between text-xs font-semibold text-[#315CF5]">
                <span>Explore Tools</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => navigate('/browse?search=tent')}
              className="p-5 rounded-xl bg-white border border-[#E5E8EA] hover:border-[#315CF5] transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-[#F1F3F3] text-[#17191C] flex items-center justify-center mb-3 group-hover:bg-[#EFF3FE] group-hover:text-[#315CF5] transition-colors">
                  <Tent className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm text-[#17191C] mb-1 group-hover:text-[#315CF5] transition-colors">
                  Outdoor & Expeditions
                </h3>
                <p className="text-xs text-[#66707A] leading-relaxed">
                  GoPro action kits, 4-person dome tents, trekking packs, and portable battery stations.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F1F3F3] flex items-center justify-between text-xs font-semibold text-[#315CF5]">
                <span>Explore Outdoor</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED GEAR SPOTLIGHT GRID (6 listings) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-[#E5E8EA]">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#315CF5] uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>Trending Gear</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#17191C] tracking-tight">
              Featured Verified Equipment
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('/browse')}
            className="text-xs font-semibold text-[#315CF5] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <span>Explore All 116 Items in Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(p) => openProduct(p)}
              />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => navigate('/browse')}
            className="px-6 py-3 bg-[#17191C] hover:bg-[#24282D] text-white font-medium text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Browse Full Catalog with Advanced Filters</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* HOW IT WORKS (3-STEP WORKFLOW) */}
      <section className="bg-white border-y border-[#E5E8EA] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-semibold text-[#315CF5] uppercase tracking-wider mb-1.5">
              Transparent Rental Flow
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#17191C] tracking-tight">
              How Renting on BorrowBuy Works
            </h2>
            <p className="text-xs text-[#66707A] mt-2 leading-relaxed">
              Designed for simple local handovers, transparent pricing, and complete peace of mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-[#FAFAF8] border border-[#E5E8EA] hover:border-[#D0D5DD] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#17191C] text-white font-bold text-sm flex items-center justify-center mb-5">
                01
              </div>
              <h3 className="font-semibold text-base text-[#17191C] mb-1.5">
                Find & Reserve Gear
              </h3>
              <p className="text-xs text-[#66707A] leading-relaxed">
                Search gear near you in Ahmedabad, Surat, or Gandhinagar. Select rental dates with an instant hold while your booking is reviewed.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[#17191C]">
                <Lock className="w-3.5 h-3.5 text-[#315CF5]" />
                <span>Instant date reservation hold</span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#FAFAF8] border border-[#E5E8EA] hover:border-[#D0D5DD] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#315CF5] text-white font-bold text-sm flex items-center justify-center mb-5">
                02
              </div>
              <h3 className="font-semibold text-base text-[#17191C] mb-1.5">
                Collect via Digital QR Pass
              </h3>
              <p className="text-xs text-[#66707A] leading-relaxed">
                Meet the owner locally. Present your single-use encrypted QR pass on your phone, inspect the equipment together, and take custody.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[#17191C]">
                <QrCode className="w-3.5 h-3.5 text-[#315CF5]" />
                <span>Encrypted contactless check-in</span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#FAFAF8] border border-[#E5E8EA] hover:border-[#D0D5DD] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#13795B] text-white font-bold text-sm flex items-center justify-center mb-5">
                03
              </div>
              <h3 className="font-semibold text-base text-[#17191C] mb-1.5">
                Return & Automatic Refund
              </h3>
              <p className="text-xs text-[#66707A] leading-relaxed">
                Return gear on the agreed date. The owner scans the return pass, verifies condition, and your security deposit releases automatically.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[#13795B]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#13795B]" />
                <span>Automated escrow deposit release</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OWNER PASSIVE INCOME BANNER */}
      <section className="py-14 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#17191C] text-white rounded-2xl p-8 md:p-12 relative overflow-hidden border border-[#24282D] shadow-lg">
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-neutral-300 text-xs font-medium mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-[#315CF5]" />
                <span>List With Confidence</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Turn your idle equipment into predictable monthly earnings.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 mt-3 leading-relaxed">
                Cameras, lenses, and power tools frequently sit unused in studios between projects. List them on BorrowBuy and earn rental revenue backed by verified borrower identities and refundable security deposits.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-neutral-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#13795B]" />
                  <span>100% deposit coverage held in escrow</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#13795B]" />
                  <span>Single-use digital QR handover verification</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#13795B]" />
                  <span>Zero listing or hosting fees</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      openAuth('register');
                    } else {
                      navigate('/dashboard');
                    }
                  }}
                  className="px-5 py-2.5 bg-[#315CF5] hover:bg-[#2447C9] text-white font-medium text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>List Your Equipment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={openHelp}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium text-xs rounded-lg border border-white/15 transition-colors cursor-pointer"
                >
                  Learn How Lending Works
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST & PLATFORM PROTECTION */}
      <section className="py-16 bg-white border-b border-[#E5E8EA] text-[#17191C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EBF5F1] text-[#13795B] text-xs font-semibold mb-3">
                <ShieldCheck className="w-4 h-4 text-[#13795B]" />
                <span>Verified Platform Security</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#17191C]">
                Built for Safety Between Creators and Equipment Owners.
              </h2>
              <p className="text-xs text-[#66707A] mt-3 leading-relaxed">
                BorrowBuy replaces informal, risky equipment lending with legally backed security deposits, condition photo audits, and verified digital timestamps.
              </p>

              <div className="mt-6 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-[#EBF5F1] text-[#13795B] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#13795B]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#17191C]">Verified User Profiles</div>
                    <div className="text-xs text-[#66707A] mt-0.5">
                      Every lender and borrower completes mobile verification and community trust scoring.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-[#EBF5F1] text-[#13795B] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#13795B]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#17191C]">Condition Inspection Checkpoints</div>
                    <div className="text-xs text-[#66707A] mt-0.5">
                      Pre-pickup and post-return inspection records document equipment state, preventing disputes.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-[#EBF5F1] text-[#13795B] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#13795B]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#17191C]">
                      Transparent Escrow Deposits
                    </div>
                    <div className="text-xs text-[#66707A] mt-0.5">
                      Daily rates and refundable deposits are defined upfront with zero hidden fees.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Trust Card */}
            <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-[#E5E8EA] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E8EA]">
                <div className="text-xs font-semibold text-[#17191C]">
                  Refundable Security Deposit Escrow
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EBF5F1] text-[#13795B]">
                  ESCROW PROTECTED
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E5E8EA] flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#66707A]">Escrow Account Sample</div>
                  <div className="font-sans text-xl font-bold text-[#17191C] mt-0.5">{formatINR(5000)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#13795B] font-semibold">100% Refundable</div>
                  <div className="text-[10px] text-[#66707A]">Released on verified return</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E5E8EA] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF3FE] text-[#315CF5] flex items-center justify-center font-bold text-xs">
                    QR
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#17191C]">Digital Handover Pass</div>
                    <div className="text-[10px] text-[#66707A]">Pass #BB-2026-GUJ • Single-Use Handover Token</div>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#13795B]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
