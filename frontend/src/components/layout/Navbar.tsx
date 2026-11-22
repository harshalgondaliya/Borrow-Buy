import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Layers,
  CalendarDays,
  Heart,
  Wrench,
  Activity,
  Compass,
  Search,
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
    openHelp,
    openProfile,
  } = useModals();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
      isActive
        ? 'bg-[#F1F3F3] text-[#17191C] font-semibold'
        : 'text-[#66707A] hover:text-[#17191C] hover:bg-[#F1F3F3]/60'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E8EA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavigate('/')}
          className="cursor-pointer group flex items-center"
        >
          <BorrowBuyLogo size="md" variant="full" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          <NavLink to="/" end className={navLinkClass}>
            <span>Explore</span>
          </NavLink>

          <NavLink to="/browse" className={navLinkClass}>
            <Compass className="w-4 h-4 text-[#66707A]" />
            <span>Browse Catalog</span>
          </NavLink>

          <button
            type="button"
            onClick={openCategoryExplorer}
            className="px-3 py-1.5 text-sm font-medium text-[#66707A] hover:text-[#17191C] hover:bg-[#F1F3F3]/60 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-[#66707A]" />
            <span>Categories ({categoryCount})</span>
          </button>

          {/* Cloud Operations Badge & Link */}
          <NavLink
            to="/cloud"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#EFF3FE] text-[#315CF5] font-semibold'
                  : 'text-[#66707A] hover:text-[#315CF5] hover:bg-[#EFF3FE]/50'
              }`
            }
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#13795B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#13795B]"></span>
            </span>
            <Activity className="w-4 h-4 text-[#13795B]" />
            <span>Cloud Ops</span>
          </NavLink>

          {/* Bookings Link */}
          {isAuthenticated && (
            <NavLink to="/bookings" className={navLinkClass}>
              <CalendarDays className="w-4 h-4 text-[#66707A]" />
              <span>My Bookings</span>
            </NavLink>
          )}

          {/* Owner Portal Link */}
          {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
            <NavLink to="/dashboard" className={navLinkClass}>
              <Wrench className="w-4 h-4 text-[#66707A]" />
              <span>Owner Portal</span>
            </NavLink>
          )}

          {/* Admin Link */}
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin" className={navLinkClass}>
              <span>Admin</span>
            </NavLink>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Search trigger button */}
          <button
            type="button"
            onClick={() => handleNavigate('/browse')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5E8EA] bg-[#F1F3F3]/50 text-xs text-[#66707A] hover:border-[#D0D5DD] hover:bg-white transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search gear...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded bg-white text-[10px] text-[#66707A] border border-[#E5E8EA]">⌘K</kbd>
          </button>

          {/* Saved Wishlist */}
          <button
            type="button"
            onClick={openWishlist}
            className="p-2 rounded-lg text-[#66707A] hover:text-[#17191C] hover:bg-[#F1F3F3] transition-colors relative cursor-pointer"
            aria-label="View Saved Gear"
            title="Saved Gear"
          >
            <Heart className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown (when authenticated) */}
          {isAuthenticated && <NotificationDropdown />}

          {/* User Profile or Sign In */}
          {isAuthenticated && user ? (
            <UserProfileDropdown
              user={user}
              onLogout={logout}
              onOpenProfile={openProfile}
              onOpenBookings={() => handleNavigate('/bookings')}
              onOpenWishlist={openWishlist}
              onOpenHelp={openHelp}
              onOpenAbout={() => handleNavigate('/help')}
              onNavigateToView={(view) => {
                if (view === 'marketplace') handleNavigate('/browse');
                else if (view === 'owner-dashboard') handleNavigate('/dashboard');
                else if (view === 'admin-dashboard') handleNavigate('/admin');
              }}
            />
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAuth('login')}
                className="px-3.5 py-1.5 text-sm font-medium text-[#17191C] hover:bg-[#F1F3F3] rounded-lg transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openAuth('register')}
                className="px-3.5 py-1.5 text-sm font-medium text-white bg-[#315CF5] hover:bg-[#2447C9] rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile menu hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#66707A] hover:text-[#17191C] hover:bg-[#F1F3F3] lg:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5E8EA] bg-white px-4 pt-3 pb-6 space-y-2">
          <button
            type="button"
            onClick={() => handleNavigate('/')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#17191C] hover:bg-[#F1F3F3]"
          >
            Explore
          </button>
          <button
            type="button"
            onClick={() => handleNavigate('/browse')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#17191C] hover:bg-[#F1F3F3]"
          >
            Browse Catalog
          </button>
          <button
            type="button"
            onClick={() => {
              openCategoryExplorer();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#17191C] hover:bg-[#F1F3F3]"
          >
            Categories ({categoryCount})
          </button>
          <button
            type="button"
            onClick={() => handleNavigate('/cloud')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#315CF5] hover:bg-[#EFF3FE] flex items-center justify-between"
          >
            <span>Cloud Operations (AWS)</span>
            <span className="w-2 h-2 rounded-full bg-[#13795B]"></span>
          </button>

          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => handleNavigate('/bookings')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#17191C] hover:bg-[#F1F3F3]"
              >
                My Bookings
              </button>
              {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
                <button
                  type="button"
                  onClick={() => handleNavigate('/dashboard')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#17191C] hover:bg-[#F1F3F3]"
                >
                  Owner Portal
                </button>
              )}
            </>
          ) : (
            <div className="pt-2 border-t border-[#E5E8EA] flex gap-2">
              <button
                type="button"
                onClick={() => {
                  openAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center text-sm font-medium text-[#17191C] border border-[#E5E8EA] rounded-lg"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  openAuth('register');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center text-sm font-medium text-white bg-[#315CF5] rounded-lg"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
