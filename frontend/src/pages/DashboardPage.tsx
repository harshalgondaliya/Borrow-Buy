import React, { useEffect, useState } from 'react';
import { Wrench } from 'lucide-react';
import { OwnerDashboard } from '../components/dashboard/OwnerDashboard';
import { Category, productsService } from '../services/products';
import { useAuth } from '../features/auth/AuthContext';
import { useModals } from '../features/modal/ModalContext';

export const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { openAuth } = useModals();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    productsService
      .getCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-bb-surface-subtle text-bb-text-primary rounded-2xl flex items-center justify-center mx-auto mb-5 border border-bb-border shadow-sm">
          <Wrench className="w-8 h-8 text-bb-accent" />
        </div>
        <h2 className="font-display text-2xl font-black text-bb-text-primary">
          Sign In to Access Owner Portal
        </h2>
        <p className="text-xs text-bb-text-secondary mt-2 max-w-md mx-auto leading-relaxed">
          Manage your equipment listings, approve rental requests, view payouts, and track active handovers.
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <OwnerDashboard
        categories={categories}
        onRefreshProducts={() => {}}
      />
    </div>
  );
};
