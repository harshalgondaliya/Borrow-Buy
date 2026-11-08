import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../../services/auth';
import {
  User as UserIcon,
  CalendarDays,
  Heart,
  Wrench,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  ChevronDown,
  ArrowRight
} from 'lucide-react';

interface UserProfileDropdownProps {
  user: User;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenBookings: () => void;
  onOpenWishlist: () => void;
  onOpenHelp: () => void;
  onOpenAbout: () => void;
  onNavigateToView: (view: 'marketplace' | 'owner-dashboard' | 'admin-dashboard') => void;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  user,
  onLogout,
  onOpenProfile,
  onOpenBookings,
  onOpenWishlist,
  onOpenHelp,
  onOpenAbout,
  onNavigateToView,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Close on Escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'OWNER':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User Account Menu"
        className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-2xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all duration-200 shadow-xs group"
      >
        {/* Avatar or Initials */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-xs"
          />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold font-display flex items-center justify-center text-xs shadow-xs group-hover:scale-105 transition-transform">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* User Info (Desktop) */}
        <div className="hidden sm:flex flex-col text-left pr-1">
          <div className="text-xs font-bold text-slate-900 font-display leading-tight truncate max-w-[130px]">
            {user.fullName}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider border ${getRoleBadge(
                user.role
              )}`}
            >
              {user.role}
            </span>
            <span className="text-[10px] text-amber-500 font-bold">
              ★ {user.trustScore ? user.trustScore.toFixed(1) : '5.0'}
            </span>
          </div>
        </div>

        {/* Dropdown Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-72 sm:w-80 rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-2.5 z-50 overflow-hidden divide-y divide-slate-100 font-sans"
          >
            {/* User Profile Header Card */}
            <div className="p-3.5 bg-slate-50/70 rounded-2xl mb-1.5 border border-slate-100">
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold font-display flex items-center justify-center text-sm shadow-xs">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 font-display truncate">
                    {user.fullName}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{user.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Trust Rating: <strong className="text-slate-800">★ {user.trustScore ? user.trustScore.toFixed(1) : '5.0'}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role-Specific Actions */}
            <div className="py-1.5 space-y-0.5">
              {/* Profile Dialog */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenProfile();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <span>My Profile & Contact</span>
              </button>

              {/* Bookings */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenBookings();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CalendarDays className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 text-left flex items-center justify-between">
                  <span>My Bookings & Passes</span>
                  <span className="text-[10px] text-slate-400 font-normal">QR Passes</span>
                </div>
              </button>

              {/* Wishlist */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenWishlist();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Heart className="w-3.5 h-3.5" />
                </div>
                <span>Saved Wishlist</span>
              </button>

              {/* OWNER specific options */}
              {(user.role === 'OWNER' || user.role === 'ADMIN') && (
                <>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onNavigateToView('owner-dashboard');
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-50/80 rounded-xl transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Wrench className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-left flex items-center justify-between">
                      <span className="font-bold">Owner Portal</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                  </button>
                </>
              )}

              {/* ADMIN specific options */}
              {user.role === 'ADMIN' && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateToView('admin-dashboard');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 text-left flex items-center justify-between">
                    <span className="font-bold">Admin Console</span>
                    <ArrowRight className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                </button>
              )}
            </div>

            {/* Information & Support Links */}
            <div className="py-1.5 space-y-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenHelp();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <span>Help & FAQs</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAbout();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <span>About BorrowBuy</span>
              </button>
            </div>

            {/* Logout Action (Prominent & Clear at bottom) */}
            <div className="pt-2 mt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4 text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Sign Out</span>
                </div>
                <span className="text-[10px] text-rose-400 font-normal">End Session</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
