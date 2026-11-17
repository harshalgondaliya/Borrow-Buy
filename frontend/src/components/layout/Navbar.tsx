import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Layers,
  CalendarDays,
  Heart,
  Wrench,
  Shield,
  Activity,
  LogOut,
  HelpCircle,
  Info,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { useModals } from '../../features/modal/ModalContext';
import { BorrowBuyLogo } from '../common/BorrowBuyLogo';
import { NotificationDropdown } from './NotificationDropdown';
import { UserProfileDropdown } from './UserProfileDropdown';

interface NavbarProps {
  categoryCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ categoryCount = 25 }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const {
    openAuth,
    openCategoryExplorer,
    openWishlist,
    openProfile,
    openHelp,
    openAbout,
  } = useModals();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
      isActive
        ? 'bg-[#F5F6F8] text-[#172B46] border border-[#E4E7EC] shadow-xs'
        : 'text-[#172B46] hover:text-[#F06449] hover:bg-[#F5F6F8] border border-transparent'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4E7EC] transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavigate('/')}
          className="cursor-pointer group flex items-center"
        >
          <BorrowBuyLogo size="md" variant="full" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1.5">
          <NavLink to="/" end className={navLinkClass}>
            <span>Explore</span>
          </NavLink>

          <NavLink to="/browse" className={navLinkClass}>
            <Compass className="w-3.5 h-3.5 text-[#172B46]" />
            <span>Browse Catalog</span>
          </NavLink>

          <button
            type="button"
            onClick={openCategoryExplorer}
            className="px-3.5 py-2 text-xs font-semibold text-[#172B46] hover:text-[#F06449] hover:bg-[#F5F6F8] border border-transparent rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#172B46]" />
            <span>Categories ({categoryCount})</span>
          </button>

          {/* Dedicated Phase 16 Cloud Operations Badge & Link */}
          <NavLink
            to="/cloud"
            className={({ isActive }) =>
              `px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#172B46] text-white shadow-xs'
                  : 'text-[#172B46] hover:text-[#2F6B65] hover:bg-[#2F6B65]/10 border border-transparent'
              }`
            }
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Activity className="w-3.5 h-3.5" />
            <span>Cloud Ops</span>
          </NavLink>

          {/* Bookings Link */}
          {isAuthenticated && (
            <NavLink to="/bookings" className={navLinkClass}>
              <CalendarDays className="w-3.5 h-3.5 text-[#172B46]" />
              <span>My Bookings</span>
            </NavLink>
          )}

          {/* Owner Portal Link */}
          {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
            <NavLink to="/dashboard" className={navLinkClass}>
              <Wrench className="w-3.5 h-3.5 text-[#172B46]" />
              <span>Owner Portal</span>
            </NavLink>
          )}

          {/* Admin Console Link */}
          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#F06449]/15 text-[#F06449] font-bold shadow-xs border border-[#F06449]/30'
                    : 'text-[#172B46] hover:text-[#F06449] hover:bg-[#F5F6F8] border border-transparent'
                }`
              }
            >
              <Shield className="w-3.5 h-3.5 text-[#F06449]" />
              <span>Admin Console</span>
            </NavLink>
          )}

          {/* Wishlist Pill */}
          <button
            type="button"
            onClick={openWishlist}
            className="p-2 text-[#172B46] hover:text-[#F06449] hover:bg-[#F5F6F8] border border-transparent rounded-xl transition cursor-pointer"
            title="Saved Wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>
        </nav>

        {/* Desktop Right Action Panel */}
        <div className="hidden lg:flex items-center space-x-3">
          {isAuthenticated && <NotificationDropdown />}

          {isAuthenticated && user ? (
            <UserProfileDropdown
              user={user}
              onLogout={logout}
              onOpenProfile={openProfile}
              onOpenBookings={() => handleNavigate('/bookings')}
              onOpenWishlist={openWishlist}
              onOpenHelp={openHelp}
              onOpenAbout={openAbout}
              onNavigateToView={(view) => {
                if (view === 'owner-dashboard') handleNavigate('/dashboard');
                else if (view === 'admin-dashboard') handleNavigate('/admin');
                else handleNavigate('/browse');
              }}
            />
          ) : (
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => openAuth('login')}
                className="px-4 py-2 text-xs font-bold text-[#172B46] bg-white hover:bg-[#F5F6F8] border border-[#172B46]/30 hover:border-[#172B46] rounded-xl transition shadow-xs cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openAuth('register')}
                className="px-5 py-2 text-xs font-bold text-white bg-[#F06449] hover:bg-[#D95339] rounded-xl shadow-xs transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                List Equipment
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          {isAuthenticated && <NotificationDropdown />}
          <button
            type="button"
            onClick={openWishlist}
            className="p-2 text-[#172B46] hover:bg-[#F5F6F8] rounded-xl transition cursor-pointer"
            title="Wishlist"
          >
            <Heart className="w-5 h-5 text-[#F06449]" />
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 text-[#172B46] hover:bg-[#F5F6F8] rounded-2xl transition cursor-pointer"
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
            className="lg:hidden border-t border-[#E4E7EC] bg-white px-5 py-5 space-y-3 shadow-xl font-sans"
          >
            {isAuthenticated && user && (
              <div className="p-3.5 bg-[#F5F6F8] border border-[#E4E7EC] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#172B46] text-white font-bold flex items-center justify-center text-sm shadow-xs font-display">
                    {user.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#202833] font-display">{user.fullName}</div>
                    <div className="text-[11px] text-[#2F6B65] font-semibold">
                      {user.role} • ★ {user.trustScore ? user.trustScore.toFixed(1) : '5.0'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    openProfile();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-[#F06449] hover:underline"
                >
                  Edit
                </button>
              </div>
            )}

            <div className="space-y-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleNavigate('/')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition ${
                  location.pathname === '/'
                    ? 'bg-[#172B46] text-white font-bold shadow-xs'
                    : 'text-[#202833] hover:bg-[#F5F6F8]'
                }`}
              >
                Explore Gear
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('/browse')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition ${
                  location.pathname === '/browse'
                    ? 'bg-[#172B46] text-white font-bold shadow-xs'
                    : 'text-[#202833] hover:bg-[#F5F6F8]'
                }`}
              >
                Browse All Listings
              </button>

              <button
                type="button"
                onClick={() => {
                  openCategoryExplorer();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-[#202833] hover:bg-[#F5F6F8] transition flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-[#172B46]" />
                <span>Browse All Categories ({categoryCount})</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('/cloud')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center gap-2 ${
                  location.pathname === '/cloud'
                    ? 'bg-[#172B46] text-white font-bold shadow-xs'
                    : 'text-[#172B46] hover:bg-[#F5F6F8]'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Activity className="w-4 h-4 text-[#2F6B65]" />
                <span>Cloud Operations Console</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  openWishlist();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-[#202833] hover:bg-[#F5F6F8] transition flex items-center gap-2"
              >
                <Heart className="w-4 h-4 text-[#F06449]" />
                <span>Saved Wishlist</span>
              </button>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => handleNavigate('/bookings')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center gap-2 ${
                    location.pathname === '/bookings'
                      ? 'bg-[#172B46] text-white font-bold shadow-xs'
                      : 'text-[#202833] hover:bg-[#F5F6F8]'
                  }`}
                >
                  <CalendarDays className="w-4 h-4 text-[#172B46]" />
                  <span>My Bookings & Passes</span>
                </button>
              )}

              {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
                <button
                  type="button"
                  onClick={() => handleNavigate('/dashboard')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center gap-2 ${
                    location.pathname === '/dashboard'
                      ? 'bg-[#E9EDF2] text-[#172B46] font-bold'
                      : 'text-[#202833] hover:bg-[#F5F6F8]'
                  }`}
                >
                  <Wrench className="w-4 h-4 text-[#172B46]" />
                  <span>Owner Portal</span>
                </button>
              )}

              {user?.role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => handleNavigate('/admin')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center gap-2 ${
                    location.pathname === '/admin'
                      ? 'bg-[#F06449]/15 text-[#F06449] font-bold'
                      : 'text-[#202833] hover:bg-[#F5F6F8]'
                  }`}
                >
                  <Shield className="w-4 h-4 text-[#F06449]" />
                  <span>Admin Console</span>
                </button>
              )}

              <div className="pt-2 border-t border-[#E4E7EC] space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    openHelp();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 rounded-xl text-[#667085] hover:text-[#202833] hover:bg-[#F5F6F8] transition flex items-center gap-2 text-xs font-medium"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#172B46]" />
                  <span>Help & FAQs</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openAbout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 rounded-xl text-[#667085] hover:text-[#202833] hover:bg-[#F5F6F8] transition flex items-center gap-2 text-xs font-medium"
                >
                  <Info className="w-3.5 h-3.5 text-[#172B46]" />
                  <span>About BorrowBuy</span>
                </button>
              </div>
            </div>

            {isAuthenticated ? (
              <div className="pt-3 border-t border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center justify-center gap-2 border border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-[#E4E7EC] flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    openAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2.5 text-xs font-bold text-[#172B46] bg-[#F5F6F8] border border-[#E4E7EC] rounded-xl hover:bg-white"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#F06449] hover:bg-[#D95339] rounded-xl shadow-xs"
                >
                  Get Started
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
