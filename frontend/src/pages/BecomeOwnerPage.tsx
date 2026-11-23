import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useToast } from '../features/toast/ToastContext';
import { useModals } from '../features/modal/ModalContext';
import { ShieldCheck, Sparkles, Wrench, CheckCircle2, ArrowRight, MapPin, Phone, FileText } from 'lucide-react';

export const BecomeOwnerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, upgradeToOwner } = useAuth();
  const { success, error: toastError } = useToast();
  const { openAuth } = useModals();

  const [ownerBio, setOwnerBio] = useState(user?.ownerBio || '');
  const [ownerAddress, setOwnerAddress] = useState(user?.ownerAddress || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  // If already an owner, redirect to owner portal
  React.useEffect(() => {
    if (user?.role === 'OWNER' || user?.role === 'ADMIN') {
      navigate('/owner');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }

    if (!ownerBio || ownerBio.trim().length < 10) {
      toastError('Please provide a bio of at least 10 characters describing your gear.', 'Validation');
      return;
    }
    if (!ownerAddress || ownerAddress.trim().length < 5) {
      toastError('Please provide your Gujarat locality or city pickup address.', 'Validation');
      return;
    }
    if (!phone || phone.trim().length < 5) {
      toastError('Please provide a valid contact phone number.', 'Validation');
      return;
    }

    setLoading(true);
    try {
      await upgradeToOwner({
        ownerBio: ownerBio.trim(),
        ownerAddress: ownerAddress.trim(),
        phone: phone.trim(),
      });
      success('Congratulations! Your account has been upgraded to Verified Equipment Owner.', 'Owner Portal Unlocked');
      navigate('/owner');
    } catch (err: any) {
      toastError(err.message || 'Failed to complete owner onboarding.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Lender Onboarding Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#17191C] tracking-tight">
          List Your Equipment on BorrowBuy
        </h1>
        <p className="mt-2 text-sm text-[#66707A] max-w-xl mx-auto leading-relaxed">
          Turn your idle cameras, video rigs, power tools, and audiovisual electronics into passive monthly income across Gujarat. Protected by platform escrow and QR verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-5 bg-white rounded-2xl border border-[#E5E8EA] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#17191C]">Escrow Protection</h3>
          <p className="text-xs text-[#66707A] mt-1 leading-relaxed">
            Every booking holds a mandatory security deposit in escrow before equipment is handed over.
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E5E8EA] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#17191C]">Encrypted QR Passes</h3>
          <p className="text-xs text-[#66707A] mt-1 leading-relaxed">
            Secure pickup and return state transitions are authorized via single-use encrypted cryptographic QR passes.
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E5E8EA] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Wrench className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#17191C]">Dedicated Owner Portal</h3>
          <p className="text-xs text-[#66707A] mt-1 leading-relaxed">
            Manage your inventory, review booking requests, track earnings, and inspect equipment from your owner dashboard.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E8EA] shadow-lg p-6 sm:p-8 max-w-2xl mx-auto">
        <h2 className="text-lg font-bold text-[#17191C] mb-1">Owner Verification Application</h2>
        <p className="text-xs text-[#66707A] mb-6">
          Provide your local pickup details to activate your equipment owner permissions.
        </p>

        {!isAuthenticated ? (
          <div className="text-center py-6">
            <p className="text-xs text-[#66707A] mb-4">Please sign in to your BorrowBuy account to apply as an equipment owner.</p>
            <button
              onClick={() => openAuth('login')}
              className="px-6 py-2.5 bg-[#315CF5] hover:bg-[#2447C9] text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow-xs"
            >
              Sign In to Continue
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#17191C] mb-1.5">
                Lender Bio & Experience
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-[#66707A] absolute left-3 top-3 pointer-events-none" />
                <textarea
                  required
                  rows={3}
                  value={ownerBio}
                  onChange={(e) => setOwnerBio(e.target.value)}
                  placeholder="E.g. Professional wedding filmmaker renting Sony cinema bodies, GM lenses, and DJI gimbals. All equipment is calibrated and serviced regularly."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E5E8EA] rounded-xl focus:border-[#315CF5] focus:ring-1 focus:ring-[#315CF5] focus:outline-none transition-colors text-[#17191C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17191C] mb-1.5">
                Locality / Pickup Hub Address (Gujarat)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#66707A] absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  placeholder="E.g. Vastrapur, Ahmedabad, Gujarat"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#E5E8EA] rounded-xl focus:border-[#315CF5] focus:ring-1 focus:ring-[#315CF5] focus:outline-none transition-colors text-[#17191C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17191C] mb-1.5">
                Contact Phone (+91)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#66707A] absolute left-3 top-3 pointer-events-none" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98250 12345"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#E5E8EA] rounded-xl focus:border-[#315CF5] focus:ring-1 focus:ring-[#315CF5] focus:outline-none transition-colors text-[#17191C]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#315CF5] hover:bg-[#2447C9] text-white font-semibold rounded-xl text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Complete Owner Onboarding</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
