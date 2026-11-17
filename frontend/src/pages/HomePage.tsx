import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Sparkle,
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
      'Pro cinema camera with XLR audio handle, 2x 160GB CFexpress cards, 3x batteries, and 24-70mm f/2.8 GM lens. Ready for high-end commercials.',
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
      'Top XLR Handle',
      '2x CFexpress Type A',
      '3x NP-FZ100 Batteries',
      'Dual Charger',
      'Pelican Hard Case',
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const spotlightProduct = featuredProducts[0] || defaultFeaturedProduct;

  return (
    <div className="space-y-0">
      {/* HERO SECTION: Full-width Midnight Navy #172B46 with Coral #F06449 Search */}
      <section className="relative overflow-hidden bg-[#172B46] text-white pt-14 pb-20 md:pt-18 md:pb-28 border-b border-[#172B46]">
        {/* Soft decorative background accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-[#2F6B65]/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[320px] h-[320px] bg-[#F06449]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Editorial Value Proposition & Discovery Search */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-white/90 mb-6 backdrop-blur-sm shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F2C66D]" />
                <span>Peer-to-Peer Rental Network • Verified across Gujarat</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white"
              >
                Good things are better shared.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-[#E4E7EC] mt-5 leading-relaxed font-normal max-w-xl"
              >
                Find useful equipment and products to rent from verified owners near you. Get what you need, without buying everything.
              </motion.p>

              {/* Integrated Quick Discovery Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 bg-white p-2.5 sm:p-3 rounded-2xl border border-[#E4E7EC] shadow-elevated text-[#202833]"
              >
                <form onSubmit={handleHeroSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 relative flex items-center">
                    <Search className="w-4 h-4 text-[#667085] absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="What do you need? (e.g. Sony FX3, Tent, Projector)"
                      value={heroKeyword}
                      onChange={(e) => setHeroKeyword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs text-[#202833] placeholder:text-[#667085] bg-transparent focus:outline-none font-medium"
                    />
                  </div>

                  <div className="sm:border-l border-[#E4E7EC] sm:pl-2">
                    <select
                      value={heroCity}
                      onChange={(e) => setHeroCity(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2.5 text-xs text-[#202833] bg-transparent focus:outline-none font-medium cursor-pointer"
                    >
                      <option value="">All Gujarat Hubs</option>
                      {GUJARAT_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:border-l border-[#E4E7EC] sm:pl-2">
                    <select
                      value={heroCategory}
                      onChange={(e) => setHeroCategory(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2.5 text-xs text-[#202833] bg-transparent focus:outline-none font-medium cursor-pointer"
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
                    className="px-6 py-2.5 bg-[#F06449] hover:bg-[#D95339] text-white font-bold text-xs rounded-xl shadow-xs transition-all duration-200 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <span>Search Gear</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </motion.div>

              {/* Micro Trust Indicators Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-6 border-t border-white/15"
              >
                <div className="flex flex-col">
                  <span className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#2F6B65]" />
                    100% Escrow
                  </span>
                  <span className="text-[11px] text-[#E4E7EC] font-medium">Refundable deposit</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#2F6B65]" />
                    Instant Lock
                  </span>
                  <span className="text-[11px] text-[#E4E7EC] font-medium">Reserved dates</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-[#2F6B65]" />
                    Single-Use Pass
                  </span>
                  <span className="text-[11px] text-[#E4E7EC] font-medium">Secure handover</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#F2C66D] fill-[#F2C66D]" />
                    4.9 ★ Rated
                  </span>
                  <span className="text-[11px] text-[#E4E7EC] font-medium">Local community</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Editorial Featured Gear Showcase Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-5"
            >
              {spotlightProduct ? (
                <div
                  onClick={() => openProduct(spotlightProduct)}
                  className="editorial-card bg-white rounded-3xl border border-[#E4E7EC] p-4 shadow-elevated hover:-translate-y-1 transition-all duration-300 relative group cursor-pointer text-[#202833]"
                  title="Click to view full equipment details and rent"
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F6F8] border border-[#E4E7EC] text-[11px] font-bold text-[#172B46]">
                      <Sparkle className="w-3 h-3 text-[#F2C66D]" />
                      <span>Featured Gear</span>
                    </div>
                    <div className="text-[11px] font-semibold text-[#667085] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#F06449]" />
                      <span>{spotlightProduct.location || 'Ahmedabad (SG Highway)'}</span>
                    </div>
                  </div>

                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#E9EDF2] mb-4 border border-[#E4E7EC]">
                    <img
                      src={resolveImageUrl(spotlightProduct.images?.[0])}
                      alt={spotlightProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-3 left-3 bg-[#172B46] px-3 py-1.5 rounded-xl text-white text-xs font-display font-bold shadow-xs">
                      {formatINR(spotlightProduct.pricePerDay)}{' '}
                      <span className="font-normal text-[10px] text-[#E4E7EC]">/ day</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[#202833] text-[10px] font-bold border border-[#E4E7EC] shadow-xs">
                      ★ 4.98 (24 rentals)
                    </div>
                    <div className="absolute inset-0 bg-[#172B46]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3.5 py-1.5 bg-white text-[#172B46] text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transform group-hover:scale-105 transition-transform">
                        <span>Open Gear Details</span>
                        <ChevronRight className="w-4 h-4 text-[#F06449]" />
                      </span>
                    </div>
                  </div>

                  <div className="px-1 pb-1">
                    <h3 className="font-display font-extrabold text-base text-[#202833] line-clamp-1 group-hover:text-[#F06449] transition-colors">
                      {spotlightProduct.name}
                    </h3>
                    <p className="text-xs text-[#667085] mt-1 line-clamp-2 leading-relaxed">
                      {spotlightProduct.description}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-[11px] text-[#667085]">
                      <span className="px-2 py-0.5 rounded-md bg-[#E9EDF2] text-[#172B46] font-medium">
                        Deposit: {formatINR(spotlightProduct.securityDeposit)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#F5F6F8] border border-[#E4E7EC] text-[#202833] font-medium">
                        Instant Handover
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E4E7EC] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#172B46] text-white flex items-center justify-center font-bold text-xs">
                          {spotlightProduct.owner?.fullName?.charAt(0) || 'R'}
                        </div>
                        <span className="text-xs font-semibold text-[#202833]">
                          {spotlightProduct.owner?.fullName || 'Verified Owner'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProduct(spotlightProduct);
                        }}
                        className="px-4 py-2 bg-[#F06449] hover:bg-[#D95339] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>View & Reserve</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-80 bg-white rounded-3xl border border-[#E4E7EC] animate-pulse" />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CURATED CATEGORIES SHOWCASE STRIP (25 Categories Supported) */}
      <section className="bg-[#F5F6F8] border-b border-[#E4E7EC] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xs font-bold text-[#667085] uppercase tracking-wider font-display">
                Curated Rental Categories
              </h3>
              <p className="text-sm text-[#172B46] font-bold mt-0.5">
                Explore equipment across {categories.length || 25} specialized categories
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openCategoryExplorer}
                className="text-xs text-[#F06449] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Explore Visual Examples ({categories.length || 25})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {categories.slice(0, 16).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate(`/browse?category=${cat.id}`)}
                className="p-3 rounded-2xl border text-left transition-all duration-200 group flex flex-col justify-between bg-white border-[#E4E7EC] hover:border-[#F06449] hover:shadow-xs cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2 transition bg-[#F5F6F8] text-[#172B46] group-hover:bg-[#F06449] group-hover:text-white shadow-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-display font-bold text-xs truncate text-[#202833]">
                    {cat.name}
                  </div>
                  <div className="text-[10px] mt-0.5 text-[#667085] font-medium">
                    {cat._count?.products || 0} listings
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR LOCAL USE CASES */}
      <section className="bg-white py-16 border-b border-[#E4E7EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F06449] uppercase tracking-wider mb-1 font-display">
                <Sparkle className="w-3.5 h-3.5 text-[#F2C66D]" />
                <span>Rent For What You Need</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#172B46] tracking-tight">
                Made for Your Needs & Projects
              </h2>
            </div>
            <p className="text-xs text-[#667085] max-w-md leading-relaxed font-medium">
              From college hackathons to commercial cinema shoots, weekend DIY home repairs to mountain treks — get quality equipment without high purchase costs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => navigate('/browse?search=cinema')}
              className="p-5 rounded-2xl bg-[#F5F6F8] border border-[#E4E7EC] shadow-xs hover:border-[#F06449] hover:bg-white hover:shadow-card hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white text-[#172B46] border border-[#E4E7EC] flex items-center justify-center mb-3 group-hover:bg-[#172B46] group-hover:text-white transition-colors">
                  <Clapperboard className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-sm text-[#202833] mb-1 group-hover:text-[#F06449] transition-colors">
                  Film & Video Production
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Blackmagic Cinema 6K, Sony FX3, wireless Hollyland video transmitters, and Aputure studio lights.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E4E7EC] flex items-center justify-between text-xs font-bold text-[#F06449] group-hover:underline">
                <span>Explore Cinema Gear</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => navigate('/browse?search=laptop')}
              className="p-5 rounded-2xl bg-[#F5F6F8] border border-[#E4E7EC] shadow-xs hover:border-[#F06449] hover:bg-white hover:shadow-card hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white text-[#F06449] border border-[#E4E7EC] flex items-center justify-center mb-3 group-hover:bg-[#F06449] group-hover:text-white transition-colors">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-sm text-[#202833] mb-1 group-hover:text-[#F06449] transition-colors">
                  College Hackathons & Fests
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed">
                  MacBook Pros, Arduino kits, high-lumen laser projectors, and displays for DA-IICT and Nirma students.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E4E7EC] flex items-center justify-between text-xs font-bold text-[#F06449] group-hover:underline">
                <span>Explore Student Tech</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => navigate('/browse?search=bosch')}
              className="p-5 rounded-2xl bg-[#F5F6F8] border border-[#E4E7EC] shadow-xs hover:border-[#F06449] hover:bg-white hover:shadow-card hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white text-[#2F6B65] border border-[#E4E7EC] flex items-center justify-center mb-3 group-hover:bg-[#2F6B65] group-hover:text-white transition-colors">
                  <Hammer className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-sm text-[#202833] mb-1 group-hover:text-[#F06449] transition-colors">
                  Home Renovations & DIY
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed">
                  Bosch rotary hammers, DeWalt laser levels, Kärcher pressure washers, and industrial vacuums.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E4E7EC] flex items-center justify-between text-xs font-bold text-[#F06449] group-hover:underline">
                <span>Explore Tools & DIY</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => navigate('/browse?search=tent')}
              className="p-5 rounded-2xl bg-[#F5F6F8] border border-[#E4E7EC] shadow-xs hover:border-[#F06449] hover:bg-white hover:shadow-card hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white text-[#172B46] border border-[#E4E7EC] flex items-center justify-center mb-3 group-hover:bg-[#172B46] group-hover:text-white transition-colors">
                  <Tent className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-sm text-[#202833] mb-1 group-hover:text-[#F06449] transition-colors">
                  Weekend Treks & Expeditions
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed">
                  GoPro action cams, waterproof 4-person dome tents, trekking backpacks, and silent portable generators.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E4E7EC] flex items-center justify-between text-xs font-bold text-[#F06449] group-hover:underline">
                <span>Explore Trekking Gear</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED GEAR SPOTLIGHT GRID (Top 6 listings) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-[#E4E7EC]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#F06449] uppercase tracking-wider mb-1 font-display">
              <Compass className="w-4 h-4 text-[#F06449]" />
              <span>Trending Equipment</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold text-[#172B46] tracking-tight">
              Featured Verified Gear
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('/browse')}
            className="text-xs font-bold text-[#F06449] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <span>Explore All 116 Listings in Catalog</span>
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
            className="px-8 py-3.5 bg-[#172B46] hover:bg-[#202833] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <span>Browse Full Catalog with Advanced Filters</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* HOW IT WORKS (3-STEP WORKFLOW) */}
      <section className="bg-white border-y border-[#E4E7EC] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-bold text-[#F06449] uppercase tracking-wider mb-2 font-display">
              Simple & Safe Process
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#172B46] tracking-tight">
              How Renting on BorrowBuy Works
            </h2>
            <p className="text-sm text-[#667085] mt-3 leading-relaxed font-medium">
              Designed for simple local handovers, transparent pricing, and complete peace of mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#F5F6F8] border border-[#E4E7EC] relative group hover:bg-white hover:border-[#172B46] hover:shadow-card transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#172B46] text-white font-display font-extrabold text-lg flex items-center justify-center mb-6 shadow-xs">
                1
              </div>
              <h3 className="font-display font-bold text-lg text-[#202833] mb-2">
                Find & Reserve Dates
              </h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Search equipment near you in Ahmedabad, Surat, or Gandhinagar. Pick your rental start and return dates with instant hold while you review.
              </p>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#172B46]">
                <Lock className="w-3.5 h-3.5" />
                <span>Instant date reservation</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#F5F6F8] border border-[#E4E7EC] relative group hover:bg-white hover:border-[#F06449] hover:shadow-card transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#F06449] text-white font-display font-extrabold text-lg flex items-center justify-center mb-6 shadow-xs">
                2
              </div>
              <h3 className="font-display font-bold text-lg text-[#202833] mb-2">
                Collect with Digital Pass
              </h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Meet the owner locally. Show your single-use QR pass on your phone, inspect the item together, and take it with you.
              </p>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#F06449]">
                <QrCode className="w-3.5 h-3.5" />
                <span>Fast, contactless check-in</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#F5F6F8] border border-[#E4E7EC] relative group hover:bg-white hover:border-[#2F6B65] hover:shadow-card transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#2F6B65] text-white font-display font-extrabold text-lg flex items-center justify-center mb-6 shadow-xs">
                3
              </div>
              <h3 className="font-display font-bold text-lg text-[#202833] mb-2">
                Return & Deposit Release
              </h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Return the item on the due date. The owner verifies the return pass and your security deposit is released back immediately.
              </p>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#2F6B65]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Immediate deposit release</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OWNER PASSIVE INCOME BANNER */}
      <section className="py-16 bg-[#F5F6F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#172B46] text-white rounded-3xl p-8 md:p-14 relative overflow-hidden border border-[#172B46] shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#2F6B65]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#F06449]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E4E7EC] text-xs font-bold mb-4 border border-white/15">
                <TrendingUp className="w-3.5 h-3.5 text-[#F2C66D]" />
                <span>Host With Confidence</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Turn your idle gear into monthly earnings.
              </h2>
              <p className="text-sm text-[#E4E7EC]/90 mt-4 leading-relaxed font-normal">
                High-value cameras, power tools, and audio systems often sit unused in cupboards for weeks. List them on BorrowBuy and earn predictable rental income backed by refundable deposits and ID-verified borrowers.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F2C66D]" />
                  <span className="text-white font-medium">Average owner earns ₹18,500/month</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F2C66D]" />
                  <span className="text-white font-medium">100% deposit coverage in escrow</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F2C66D]" />
                  <span className="text-white font-medium">₹0 listing fees</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      openAuth('register');
                    } else {
                      navigate('/dashboard');
                    }
                  }}
                  className="px-6 py-3 bg-[#F06449] hover:bg-[#D95339] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>List Your Equipment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={openHelp}
                  className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/20 transition cursor-pointer"
                >
                  Learn How Lending Works
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST & PLATFORM PROTECTION */}
      <section className="py-20 bg-white border-b border-[#E4E7EC] text-[#202833]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2F6B65]/10 text-[#2F6B65] text-xs font-bold mb-4 border border-[#2F6B65]/20 font-display">
                <ShieldCheck className="w-4 h-4 text-[#2F6B65]" />
                <span>Trusted Platform Protection</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-[#172B46]">
                Designed for Trust Between Neighbors & Creators.
              </h2>
              <p className="text-sm text-[#667085] mt-4 leading-relaxed font-normal">
                BorrowBuy replaces informal lending with secure verification, refundable deposit protection, and clear return policies.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-[#2F6B65]/10 text-[#2F6B65] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2F6B65]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172B46] font-display">Verified Local Members</div>
                    <div className="text-xs text-[#667085] mt-0.5">
                      Every lender and borrower is verified with phone confirmation and community ratings.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-[#2F6B65]/10 text-[#2F6B65] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2F6B65]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172B46] font-display">Condition Photos at Handover</div>
                    <div className="text-xs text-[#667085] mt-0.5">
                      Photos taken at pickup ensure clarity on existing condition and protect both parties.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-[#2F6B65]/10 text-[#2F6B65] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2F6B65]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172B46] font-display">
                      Transparent Pricing & Refundable Deposits
                    </div>
                    <div className="text-xs text-[#667085] mt-0.5">
                      No hidden charges. Daily rental fee, refundable security deposit, and exact return dates are agreed upfront.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#172B46] text-white border border-[#172B46] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/15">
                <div className="text-xs font-bold text-[#E4E7EC] uppercase tracking-wider font-display">
                  Refundable Security Deposit
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2F6B65]/40 text-white border border-[#2F6B65]/60">
                  PROTECTED IN ESCROW
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#E4E7EC]">Held in Escrow</div>
                  <div className="font-display text-2xl font-black text-white mt-0.5">{formatINR(2500)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#F2C66D] font-semibold">100% Refundable</div>
                  <div className="text-[10px] text-[#E4E7EC]/80">Released upon verified return</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2F6B65] text-white flex items-center justify-center font-bold">
                    QR
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-display">Digital Handover Pass</div>
                    <div className="text-[10px] text-[#E4E7EC]/80">Pass #BB-2026-GUJ • Verified for Handover</div>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#F2C66D]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
