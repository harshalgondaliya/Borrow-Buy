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
        <div className="w-16 h-16 bg-[#172B46] text-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
          <Wrench className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-black text-[#172B46]">
          Sign In to Access Owner Portal
        </h2>
        <p className="text-xs text-[#667085] mt-2 max-w-md mx-auto leading-relaxed">
          Manage your equipment listings, approve rental requests, view payouts, and track active handovers.
        </p>
        <button
          type="button"
          onClick={() => openAuth('login')}
          className="mt-6 px-6 py-3 bg-[#F06449] hover:bg-[#D95339] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
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
