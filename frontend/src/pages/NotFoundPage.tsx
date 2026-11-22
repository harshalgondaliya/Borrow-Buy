import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home, Activity } from 'lucide-react';
import { BorrowBuyLogo } from '../components/common/BorrowBuyLogo';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-block p-4 rounded-3xl bg-white border border-bb-border shadow-card">
          <BorrowBuyLogo size="lg" variant="icon" />
        </div>

        <div>
          <div className="font-mono text-5xl font-black text-bb-accent">404</div>
          <h1 className="font-display text-2xl font-extrabold text-bb-text-primary mt-2">
            Page Not Found
          </h1>
          <p className="text-xs text-bb-text-secondary mt-1.5 leading-relaxed">
            The page you are looking for does not exist, has been moved, or is temporarily unavailable on the BorrowBuy network.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-bb-text-primary hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go Home</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/browse')}
            className="px-5 py-2.5 bg-white hover:bg-bb-surface-subtle text-bb-text-primary text-xs font-bold rounded-xl border border-bb-border shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Browse Catalog</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/cloud')}
            className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Cloud Ops</span>
          </button>
        </div>
      </div>
    </div>
  );
};
