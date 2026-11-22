import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight } from 'lucide-react';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { useAuth } from '../features/auth/AuthContext';
import { useModals } from '../features/modal/ModalContext';

export const AdminPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { openAuth } = useModals();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-bb-surface-subtle text-bb-text-primary rounded-2xl flex items-center justify-center mx-auto mb-5 border border-bb-border shadow-sm">
          <Shield className="w-8 h-8 text-bb-accent" />
        </div>
        <h2 className="font-display text-2xl font-black text-bb-text-primary">
          Admin Authentication Required
        </h2>
        <p className="text-xs text-bb-text-secondary mt-2 max-w-md mx-auto leading-relaxed">
          The Admin Console is restricted to platform operators with governance privileges.
        </p>
        <button
          type="button"
          onClick={() => openAuth('login')}
          className="mt-6 px-6 py-2.5 bg-bb-accent hover:bg-bb-accent-hover text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-200 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-black text-bb-text-primary">
          Access Denied
        </h2>
        <p className="text-xs text-bb-text-secondary mt-2 max-w-md mx-auto leading-relaxed">
          Your current account does not have administrator privileges. Please switch to an admin account or return to the marketplace.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-2.5 bg-bb-text-primary hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Return to Marketplace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminDashboard />
    </div>
  );
};
