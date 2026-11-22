import React, { useState } from 'react';
import {
  User as UserIcon,
  MapPin,
  Save,
  Phone,
  Mail,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { useToast } from '../features/toast/ToastContext';
import { useModals } from '../features/modal/ModalContext';

const GUJARAT_CITIES = ['Ahmedabad', 'Gandhinagar', 'Surat', 'Vadodara', 'Rajkot'];

export const SettingsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { openAuth } = useModals();
  const { success } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [preferredCity, setPreferredCity] = useState('Ahmedabad');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-bb-surface-subtle text-bb-text-primary rounded-2xl flex items-center justify-center mx-auto mb-5 border border-bb-border shadow-sm">
          <UserIcon className="w-8 h-8 text-bb-accent" />
        </div>
        <h2 className="font-display text-2xl font-black text-bb-text-primary">
          Sign In to Access Your Settings
        </h2>
        <p className="text-xs text-bb-text-secondary mt-2 max-w-md mx-auto leading-relaxed">
          Manage your account profile, Gujarat hub preferences, and notification channels.
        </p>
        <button
          type="button"
          onClick={() => openAuth('login')}
          className="mt-6 px-6 py-2.5 bg-bb-accent hover:bg-bb-accent-hover text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      success('Settings updated successfully', 'Profile Saved');
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="pb-4 border-b border-bb-border">
        <div className="flex items-center gap-2 text-xs font-bold text-bb-accent uppercase tracking-wider mb-1 font-display">
          <UserIcon className="w-4 h-4 text-bb-accent" />
          <span>Account & Security</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-bb-text-primary tracking-tight">
          Profile & Preferences
        </h1>
        <p className="text-xs text-bb-text-secondary mt-1">
          Update your public profile, Gujarat pickup hub, and notification channels.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Verification & Trust Score Card */}
        <div className="bg-white p-6 rounded-2xl border border-bb-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-bb-text-primary text-white font-display font-black text-xl flex items-center justify-center shadow-sm">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="text-base font-bold text-bb-text-primary font-display flex items-center gap-2">
                <span>{user?.fullName || 'Member'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  VERIFIED LENDER
                </span>
              </div>
              <div className="text-xs text-bb-text-secondary mt-0.5">{user?.email}</div>
            </div>
          </div>

          <div className="p-3 bg-bb-surface-subtle rounded-xl border border-bb-border text-right">
            <div className="text-[11px] font-bold text-bb-text-secondary">COMMUNITY TRUST SCORE</div>
            <div className="text-xl font-black text-emerald-700 font-display">
              ★ {user?.trustScore ? user.trustScore.toFixed(1) : '5.0'} / 5.0
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white p-6 rounded-2xl border border-bb-border shadow-card space-y-4">
          <h2 className="font-display text-base font-bold text-bb-text-primary">Personal Information</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-bb-text-secondary mb-1.5">Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-bb-border rounded-xl focus:border-bb-accent focus:ring-2 focus:ring-bb-accent/10 focus:outline-none font-medium text-bb-text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-bb-text-secondary mb-1.5">Registered Email</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-bb-text-secondary absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-bb-surface-subtle border border-bb-border rounded-xl text-bb-text-secondary cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-bb-text-secondary mb-1.5">Phone Number (Verified)</label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-bb-text-secondary absolute left-3 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-bb-border rounded-xl focus:border-bb-accent focus:ring-2 focus:ring-bb-accent/10 focus:outline-none font-medium text-bb-text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-bb-text-secondary mb-1.5">Default Gujarat Pickup Hub</label>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-bb-text-secondary absolute left-3 pointer-events-none" />
                <select
                  value={preferredCity}
                  onChange={(e) => setPreferredCity(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-bb-border rounded-xl focus:border-bb-accent focus:ring-2 focus:ring-bb-accent/10 focus:outline-none font-medium text-bb-text-primary cursor-pointer bg-white"
                >
                  {GUJARAT_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-2xl border border-bb-border shadow-card space-y-4">
          <h2 className="font-display text-base font-bold text-bb-text-primary">Notification Channels</h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-bb-surface-subtle cursor-pointer">
              <span className="text-xs font-medium text-bb-text-primary">
                Email Notifications for Booking Confirmations & Escrow Updates
              </span>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 accent-bb-accent rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-bb-surface-subtle cursor-pointer">
              <span className="text-xs font-medium text-bb-text-primary">
                SMS / WhatsApp Alerts for QR Handover & Return Reminders
              </span>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                className="w-4 h-4 accent-bb-accent rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-bb-accent hover:bg-bb-accent-hover text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </form>
    </div>
  );
};
