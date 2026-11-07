import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../features/auth/AuthContext';
import { useToast } from '../../features/toast/ToastContext';
import { authService } from '../../services/auth';
import {
  X,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Phone,
  KeyRound,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { login, register } = useAuth();
  const { success } = useToast();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'OWNER'>('CUSTOMER');

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      success('Welcome back to BorrowBuy!', 'Signed In Successfully');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ email, password, fullName, phone, role });
      success('Your BorrowBuy account has been created!', 'Registration Complete');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal-950/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-3xl shadow-elevated border border-charcoal-100 max-w-md w-full p-6 sm:p-8 overflow-hidden z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-charcoal-400 hover:text-charcoal-700 p-2 rounded-xl hover:bg-charcoal-100/70 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Brand Logo & Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 mb-3 border border-brand-100 shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-display font-extrabold text-charcoal-900 tracking-tight">
                {tab === 'login' && 'Welcome back'}
                {tab === 'register' && 'Create your account'}
                {tab === 'forgot' && 'Reset password'}
              </h2>
              <p className="text-xs text-charcoal-500 mt-1 max-w-xs mx-auto">
                {tab === 'login' && 'Sign in to access your rentals, listings, and digital passes.'}
                {tab === 'register' && 'Join BorrowBuy to discover premium gear or earn by sharing equipment.'}
                {tab === 'forgot' && 'Enter your registered email to generate a development password token.'}
              </p>
            </div>

            {/* Tab Navigation Pill */}
            {tab !== 'forgot' && (
              <div className="flex p-1 bg-charcoal-100/80 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    resetForm();
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    tab === 'login'
                      ? 'bg-white text-charcoal-900 shadow-sm'
                      : 'text-charcoal-500 hover:text-charcoal-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    resetForm();
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    tab === 'register'
                      ? 'bg-white text-charcoal-900 shadow-sm'
                      : 'text-charcoal-500 hover:text-charcoal-800'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Error / Alert Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-medium leading-relaxed">{error}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="font-medium leading-relaxed">{successMsg}</span>
              </motion.div>
            )}

            {/* Tab: LOGIN */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all placeholder:text-charcoal-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-charcoal-700">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('forgot');
                        resetForm();
                      }}
                      className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all placeholder:text-charcoal-400"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold rounded-xl text-sm shadow-card transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign in to account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>

                {/* Quick Demo Accounts */}
                <div className="pt-5 border-t border-charcoal-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider">
                      Demo Personas
                    </span>
                    <span className="text-[10px] text-charcoal-400 font-mono">1-click fill</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => fillDemoAccount('admin@borrowbuy.com', 'AdminPassword123!')}
                      className="p-2 text-left bg-charcoal-50 hover:bg-charcoal-100 rounded-xl border border-charcoal-200/80 transition-all group"
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-xs font-bold text-charcoal-900">Admin</span>
                      </div>
                      <span className="text-[10px] text-charcoal-500 block leading-tight">Governance</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemoAccount('alex.owner@borrowbuy.com', 'Password123!')}
                      className="p-2 text-left bg-brand-50/60 hover:bg-brand-50 rounded-xl border border-brand-200/80 transition-all group"
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-2 h-2 rounded-full bg-brand-600" />
                        <span className="text-xs font-bold text-charcoal-900">Alex</span>
                      </div>
                      <span className="text-[10px] text-brand-700 block leading-tight">Equipment Owner</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fillDemoAccount('emma.customer@borrowbuy.com', 'Password123!')}
                      className="p-2 text-left bg-emerald-50/60 hover:bg-emerald-50 rounded-xl border border-emerald-200/80 transition-all group"
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span className="text-xs font-bold text-charcoal-900">Emma</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 block leading-tight">Customer Renter</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Tab: REGISTER */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Role Switcher Cards */}
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                    Select your primary role
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRole('CUSTOMER')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        role === 'CUSTOMER'
                          ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                          : 'border-charcoal-200 hover:border-charcoal-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">🎒</span>
                        {role === 'CUSTOMER' && (
                          <div className="w-2 h-2 rounded-full bg-brand-600" />
                        )}
                      </div>
                      <div className="font-bold text-xs text-charcoal-900">Customer Renter</div>
                      <div className="text-[10px] text-charcoal-500 leading-tight mt-0.5">
                        Rent cameras, tools & equipment
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('OWNER')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        role === 'OWNER'
                          ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                          : 'border-charcoal-200 hover:border-charcoal-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">🛠️</span>
                        {role === 'OWNER' && (
                          <div className="w-2 h-2 rounded-full bg-brand-600" />
                        )}
                      </div>
                      <div className="font-bold text-xs text-charcoal-900">Gear Owner</div>
                      <div className="text-[10px] text-charcoal-500 leading-tight mt-0.5">
                        List equipment & earn passive income
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">Full name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all placeholder:text-charcoal-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">Email address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all placeholder:text-charcoal-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Phone <span className="text-charcoal-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 012-3456"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all placeholder:text-charcoal-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Password <span className="text-charcoal-400 font-normal">(8+ chars, 1 uppercase, 1 number)</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all placeholder:text-charcoal-400"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold rounded-xl text-sm shadow-card transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>
            )}

            {/* Tab: FORGOT */}
            {tab === 'forgot' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                    Registered email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-charcoal-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    try {
                      const res = await authService.forgotPassword(email);
                      setSuccessMsg(`Reset token created: ${res.devResetToken || 'Dispatched'}`);
                    } catch (err: any) {
                      setError(err.message || 'Request failed');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold rounded-xl text-sm shadow-card transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Generate Reset Token</span>
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    resetForm();
                  }}
                  className="w-full text-center text-xs font-semibold text-charcoal-500 hover:text-charcoal-800 transition-colors"
                >
                  ← Back to Sign In
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
