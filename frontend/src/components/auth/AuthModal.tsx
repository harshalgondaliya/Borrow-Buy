import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../features/auth/AuthContext';
import { useToast } from '../../features/toast/ToastContext';
import { authService } from '../../services/auth';
import { BorrowBuyLogo } from '../common/BorrowBuyLogo';
import {
  X,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  Zap,
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
  const [showPassword, setShowPassword] = useState(false);
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

  const handleDemoFill = (demoRole: 'CUSTOMER' | 'OWNER' | 'ADMIN') => {
    if (demoRole === 'CUSTOMER') {
      setEmail('customer@borrowbuy.com');
      setPassword('Password123!');
    } else if (demoRole === 'OWNER') {
      setEmail('owner@borrowbuy.com');
      setPassword('Password123!');
    } else if (demoRole === 'ADMIN') {
      setEmail('admin@borrowbuy.com');
      setPassword('Password123!');
    }
    setTab('login');
    resetForm();
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
      setError(err.message || 'Login failed. Please check your email and password.');
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
      success('Your BorrowBuy account is ready. Welcome!', 'Registration Complete');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-elevated border border-[#E5E8EA] max-w-md w-full p-6 sm:p-7 overflow-hidden z-10 text-[#17191C]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#66707A] hover:text-[#17191C] p-2 rounded-lg hover:bg-[#F1F3F3] transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Brand Logo & Header */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center mb-2">
                <BorrowBuyLogo size="md" variant="icon" />
              </div>
              <h2 className="text-xl font-semibold text-[#17191C] tracking-tight">
                {tab === 'login' && 'Sign in to BorrowBuy'}
                {tab === 'register' && 'Create your account'}
                {tab === 'forgot' && 'Reset your password'}
              </h2>
              <p className="text-xs text-[#66707A] mt-1 max-w-xs mx-auto leading-relaxed">
                {tab === 'login' && 'Access equipment rentals, digital passes, and owner listings.'}
                {tab === 'register' && 'Borrow equipment from verified local owners or earn by renting your own.'}
                {tab === 'forgot' && 'Enter your email to receive a password reset token.'}
              </p>
            </div>

            {/* Tab Navigation Pill */}
            {tab !== 'forgot' && (
              <div className="flex p-1 bg-[#F1F3F3] rounded-lg mb-5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    resetForm();
                  }}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    tab === 'login'
                      ? 'bg-white text-[#17191C] font-semibold shadow-xs'
                      : 'text-[#66707A] hover:text-[#17191C]'
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
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    tab === 'register'
                      ? 'bg-white text-[#17191C] font-semibold shadow-xs'
                      : 'text-[#66707A] hover:text-[#17191C]'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Demo Quick-Fill Bar */}
            {tab === 'login' && (
              <div className="mb-4 p-2.5 bg-[#FAFAF8] rounded-xl border border-[#E5E8EA]">
                <div className="flex items-center justify-between mb-1.5 text-[11px] font-semibold text-[#66707A]">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-[#315CF5]" />
                    <span>Quick Demo Sign In:</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDemoFill('CUSTOMER')}
                    className="py-1 px-2 text-[11px] font-medium rounded-md bg-white border border-[#E5E8EA] hover:border-[#315CF5] hover:text-[#315CF5] transition-colors text-center cursor-pointer"
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoFill('OWNER')}
                    className="py-1 px-2 text-[11px] font-medium rounded-md bg-white border border-[#E5E8EA] hover:border-[#315CF5] hover:text-[#315CF5] transition-colors text-center cursor-pointer"
                  >
                    Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoFill('ADMIN')}
                    className="py-1 px-2 text-[11px] font-medium rounded-md bg-white border border-[#E5E8EA] hover:border-[#315CF5] hover:text-[#315CF5] transition-colors text-center cursor-pointer"
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}

            {/* Error / Alert Messages */}
            {error && (
              <div className="mb-4 p-3 bg-[#FDF2F2] border border-[#FDE68A] text-[#C43838] rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C43838]" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-[#EBF5F1] border border-[#13795B]/20 text-[#13795B] rounded-xl text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#13795B]" />
                <span className="font-medium leading-relaxed">{successMsg}</span>
              </div>
            )}

            {/* Tab: LOGIN */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#17191C] mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#66707A] absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors text-[#17191C] placeholder:text-[#66707A]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-[#17191C]">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('forgot');
                        resetForm();
                      }}
                      className="text-xs text-[#315CF5] hover:underline font-medium cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#66707A] absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors text-[#17191C] placeholder:text-[#66707A]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#66707A] hover:text-[#17191C] focus:outline-none cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-[#315CF5] hover:bg-[#2447C9] text-white font-semibold rounded-lg text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Tab: REGISTER */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                {/* Role Switcher Cards */}
                <div>
                  <label className="block text-xs font-semibold text-[#17191C] mb-1">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('CUSTOMER')}
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        role === 'CUSTOMER'
                          ? 'border-[#315CF5] bg-[#EFF3FE]'
                          : 'border-[#E5E8EA] hover:border-[#D0D5DD] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-[#17191C]">Customer / Renter</span>
                        {role === 'CUSTOMER' && (
                          <div className="w-2 h-2 rounded-full bg-[#315CF5]" />
                        )}
                      </div>
                      <div className="text-[10px] text-[#66707A] leading-tight">
                        Rent cameras, tools & electronics
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('OWNER')}
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        role === 'OWNER'
                          ? 'border-[#315CF5] bg-[#EFF3FE]'
                          : 'border-[#E5E8EA] hover:border-[#D0D5DD] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-[#17191C]">Owner / Lender</span>
                        {role === 'OWNER' && (
                          <div className="w-2 h-2 rounded-full bg-[#315CF5]" />
                        )}
                      </div>
                      <div className="text-[10px] text-[#66707A] leading-tight">
                        List gear & earn monthly revenue
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17191C] mb-1">Full name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#66707A] absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Hardik Patel"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors text-[#17191C] placeholder:text-[#66707A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17191C] mb-1">Email address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#66707A] absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors text-[#17191C] placeholder:text-[#66707A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17191C] mb-1">
                    Phone number <span className="text-[#66707A] font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#66707A] absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors text-[#17191C] placeholder:text-[#66707A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17191C] mb-1">
                    Password <span className="text-[#66707A] font-normal">(8+ chars, 1 uppercase, 1 digit)</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#66707A] absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors text-[#17191C] placeholder:text-[#66707A]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#66707A] hover:text-[#17191C] focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-[#315CF5] hover:bg-[#2447C9] text-white font-semibold rounded-lg text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Tab: FORGOT */}
            {tab === 'forgot' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#17191C] mb-1">
                    Registered email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#66707A] absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E5E8EA] rounded-lg focus:border-[#315CF5] focus:outline-none transition-colors text-[#17191C] placeholder:text-[#66707A]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    try {
                      const res = await authService.forgotPassword(email);
                      setSuccessMsg(`Reset token created: ${res.devResetToken || 'Sent'}`);
                    } catch (err: any) {
                      setError(err.message || 'Request failed. Please verify your email.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-[#315CF5] hover:bg-[#2447C9] text-white font-semibold rounded-lg text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    resetForm();
                  }}
                  className="w-full text-center text-xs font-medium text-[#66707A] hover:text-[#17191C] transition-colors cursor-pointer"
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
