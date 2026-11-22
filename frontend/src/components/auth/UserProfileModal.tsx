import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/auth';
import { useAuth } from '../../features/auth/AuthContext';
import { useToast } from '../../features/toast/ToastContext';
import { formatDateIN } from '../../utils/formatters';
import {
  X,
  User as UserIcon,
  Phone,
  MapPin,
  Star,
  Save,
  Lock
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [ownerAddress, setOwnerAddress] = useState(user?.ownerAddress || '');
  const [ownerBio, setOwnerBio] = useState(user?.ownerBio || '');
  const [saving, setSaving] = useState(false);

  // Sync state if user changes
  React.useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setOwnerAddress(user.ownerAddress || '');
      setOwnerBio(user.ownerBio || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateMe({
        fullName,
        phone,
        ownerAddress,
        ownerBio,
      });
      await refreshUser();
      success('Your profile details have been updated successfully.', 'Profile Saved');
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Failed to update profile.', 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-bb-border max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-bb-text-secondary hover:text-bb-text-primary p-2 rounded-xl hover:bg-bb-surface-subtle transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-bb-border">
            <div className="w-16 h-16 rounded-3xl bg-bb-accent text-white font-black font-display text-2xl flex items-center justify-center shadow-md">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-display font-extrabold text-bb-text-primary truncate">
                  {user.fullName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-bb-accent border border-blue-200">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-bb-text-secondary mt-0.5">{user.email}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-bb-text-secondary font-medium">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{user.trustScore ? user.trustScore.toFixed(1) : '5.0'} Trust Rating</span>
                </span>
                <span>•</span>
                <span className="text-[11px] text-bb-text-secondary">
                  Member since {formatDateIN(user.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="mt-6 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-bb-text-primary mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-bb-text-secondary absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-bb-border rounded-xl focus:ring-2 focus:ring-bb-accent focus:outline-none transition font-medium text-bb-text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-bb-text-primary mb-1.5">Registered Email (Verified)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-bb-text-secondary absolute left-3.5 top-3" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-bb-surface-subtle border border-bb-border rounded-xl text-bb-text-secondary cursor-not-allowed font-medium"
                />
              </div>
              <span className="text-[10px] text-bb-text-secondary mt-1 block">
                Email address is linked to your account security and cannot be changed here.
              </span>
            </div>

            <div>
              <label className="block font-bold text-bb-text-primary mb-1.5">Phone Number (+91)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-bb-text-secondary absolute left-3.5 top-3" />
                <input
                  type="tel"
                  placeholder="+91 98250 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-bb-border rounded-xl focus:ring-2 focus:ring-bb-accent focus:outline-none transition font-medium text-bb-text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-bb-text-primary mb-1.5">City & Locality Address (Gujarat / India)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-bb-text-secondary absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="E.g. Vastrapur, Ahmedabad, Gujarat"
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-bb-border rounded-xl focus:ring-2 focus:ring-bb-accent focus:outline-none transition font-medium text-bb-text-primary"
                />
              </div>
            </div>

            {user.role === 'OWNER' && (
              <div>
                <label className="block font-bold text-bb-text-primary mb-1.5">Lender Bio & Experience</label>
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="Tell borrowers about your rental guidelines, equipment care, and pickup availability..."
                    value={ownerBio}
                    onChange={(e) => setOwnerBio(e.target.value)}
                    className="w-full p-3 bg-white border border-bb-border rounded-xl focus:ring-2 focus:ring-bb-accent focus:outline-none transition font-medium text-bb-text-primary"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-bb-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-bb-text-secondary hover:text-bb-text-primary font-bold transition rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-bb-accent hover:bg-bb-accent-hover text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
