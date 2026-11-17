import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Activity, ShieldCheck, Lock } from 'lucide-react';
import { BorrowBuyLogo } from '../common/BorrowBuyLogo';
import { useModals } from '../../features/modal/ModalContext';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { openAuth, openAbout, openHelp, openCategoryExplorer } = useModals();

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#172B46] border-t border-[#172B46] pt-16 pb-12 text-[#E4E7EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-white/15">
          {/* Col 1: Brand Info */}
          <div className="col-span-2">
            <div className="mb-4">
              <BorrowBuyLogo size="md" variant="full" theme="dark" />
            </div>
            <p className="text-xs text-[#E4E7EC]/80 max-w-sm leading-relaxed mb-4">
              BorrowBuy is India's trusted peer-to-peer equipment rental platform connecting equipment owners with creators, students, and local professionals.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#E4E7EC] font-medium mb-3">
              <MapPin className="w-3.5 h-3.5 text-[#F06449] shrink-0" />
              <span>Serving Ahmedabad, Gandhinagar, Surat, Vadodara & across Gujarat</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-semibold border border-white/15">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>AWS Enterprise Architecture • ap-south-1 (Mumbai)</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-display">
              Rental Categories
            </div>
            <ul className="space-y-2 text-xs text-[#E4E7EC]">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('/browse')}
                  className="hover:text-white font-medium transition-colors text-left"
                >
                  Cameras & Photography
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('/browse')}
                  className="hover:text-white font-medium transition-colors text-left"
                >
                  Video Production Gear
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('/browse')}
                  className="hover:text-white font-medium transition-colors text-left"
                >
                  Laptops & Computers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('/browse')}
                  className="hover:text-white font-medium transition-colors text-left"
                >
                  Construction & Tools
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('/browse')}
                  className="hover:text-white font-medium transition-colors text-left"
                >
                  Sound & Audio Systems
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCategoryExplorer}
                  className="text-[#F06449] font-bold hover:underline"
                >
                  View All 25 Categories &rarr;
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Trust & Safety */}
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-display">
              Trust & Safety
            </div>
            <ul className="space-y-2 text-xs text-[#E4E7EC]">
              <li>
                <button
                  type="button"
                  onClick={openHelp}
                  className="hover:text-white font-medium transition-colors text-left flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2F6B65]" />
                  <span>Verified Owners</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openHelp}
                  className="hover:text-white font-medium transition-colors text-left flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-[#2F6B65]" />
                  <span>Refundable Deposits</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openHelp}
                  className="hover:text-white font-medium transition-colors text-left"
                >
                  Digital QR Passes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openHelp}
                  className="hover:text-white font-medium transition-colors text-left"
                >
                  Condition Handover Verification
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openHelp}
                  className="hover:text-white font-medium transition-colors text-left"
                >
                  Dispute Arbitration Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Cloud & Academic */}
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-display">
              Cloud Operations
            </div>
            <ul className="space-y-2 text-xs text-[#E4E7EC]">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('/cloud')}
                  className="text-emerald-400 font-bold hover:underline text-left flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Live Operations Console</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="hover:text-white font-medium transition-colors text-left"
                >
                  Sign In
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openAuth('register')}
                  className="hover:text-white font-medium transition-colors text-left"
                >
                  List Your Equipment
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openAbout}
                  className="hover:text-white font-medium transition-colors text-left"
                >
                  About BorrowBuy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openHelp}
                  className="hover:text-white font-medium transition-colors text-left"
                >
                  Help & FAQs
                </button>
              </li>
              <li>
                <span className="text-white/60 font-mono text-[11px]">support@borrowbuy.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E4E7EC]/70 gap-4">
          <div>
            BorrowBuy Platform &copy; 2026. All rights reserved. Good things are better shared.
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-[#E4E7EC]/70">Curated Equipment across Gujarat & India</span>
            <span className="text-[#E4E7EC]/70">Secure Digital Escrow</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white/90 text-[10px] font-mono">
              v3.0-cloud
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
