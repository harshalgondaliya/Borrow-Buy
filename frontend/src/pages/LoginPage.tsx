import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useToast } from '../features/toast/ToastContext';
import { BorrowBuyLogo } from '../components/common/BorrowBuyLogo';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const { success } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect immediately
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'OWNER') navigate('/owner');
      else navigate('/bookings');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loggedInUser = await login(email.trim().toLowerCase(), password);
      success('Welcome back to BorrowBuy!', 'Signed In Successfully');

      if (loggedInUser.role === 'ADMIN') {
        navigate('/admin');
      } else if (loggedInUser.role === 'OWNER') {
        navigate('/owner');
      } else {
        navigate('/bookings');
      }
    } catch (err: any) {
      const msg = err?.errors?.map((e: any) => e.message).join('. ') || err?.message || 'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E5E8EA] shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-3">
            <BorrowBuyLogo size="lg" variant="full" />
          </div>
          <h2 className="text-2xl font-bold text-[#17191C] tracking-tight">
            Sign in to your account
          </h2>
          <p className="text-xs text-[#66707A] mt-1.5 leading-relaxed">
            Access your equipment rentals, digital QR passes, and owner dashboard.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-[#FDF2F2] border border-[#FDE68A] text-[#C43838] rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C43838]" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#17191C] mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#66707A] absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@borrowbuy.in"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#E5E8EA] rounded-xl focus:border-[#315CF5] focus:ring-1 focus:ring-[#315CF5] focus:outline-none transition-colors text-[#17191C]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-[#17191C]">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#66707A] absolute left-3 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2.5 text-xs bg-white border border-[#E5E8EA] rounded-xl focus:border-[#315CF5] focus:ring-1 focus:ring-[#315CF5] focus:outline-none transition-colors text-[#17191C]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#66707A] hover:text-[#17191C] focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#315CF5] hover:bg-[#2447C9] text-white font-semibold rounded-xl text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer pt-3"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5E8EA] text-center text-xs text-[#66707A] space-y-2">
          <p>
            New to BorrowBuy?{' '}
            <Link to="/browse" className="text-[#315CF5] font-semibold hover:underline">
              Browse Equipment Catalog
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#66707A] mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Role automatically verified from database</span>
          </div>
        </div>
      </div>
    </div>
  );
};
