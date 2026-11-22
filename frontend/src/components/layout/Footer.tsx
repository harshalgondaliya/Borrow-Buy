import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShieldCheck, ExternalLink } from 'lucide-react';
import { BorrowBuyLogo } from '../common/BorrowBuyLogo';
import { useModals } from '../../features/modal/ModalContext';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { openAbout, openHelp, openCategoryExplorer } = useModals();

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-[#E5E8EA] pt-14 pb-10 text-[#66707A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b border-[#E5E8EA]">
          {/* Col 1 & 2: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <BorrowBuyLogo size="md" variant="full" />
            <p className="text-xs text-[#66707A] max-w-sm leading-relaxed">
              India&apos;s trusted peer-to-peer equipment rental marketplace. Connect equipment owners with filmmakers, creators, builders, and students with verified digital escrow protection.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#17191C] font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#315CF5] shrink-0" />
              <span>Serving Ahmedabad, Gandhinagar, Surat, Vadodara & Rajkot</span>
            </div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F1F3F3] text-[#17191C] text-[11px] font-medium border border-[#E5E8EA]">
              <span className="w-2 h-2 rounded-full bg-[#13795B]"></span>
              <span>AWS Infrastructure • ap-south-1 (Mumbai)</span>
            </div>
          </div>

          {/* Col 3: Rental Categories */}
          <div>
            <div className="text-xs font-semibold text-[#17191C] uppercase tracking-wider mb-3">
              Popular Gear
            </div>
            <ul className="space-y-2 text-xs text-[#66707A]">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('/browse?category=cat-cameras')}
                  className="hover:text-[#17191C] transition-colors text-left"
                >
                  Cameras & Photography
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('/browse?category=cat-video')}
                  className="hover:text-[#17191C] transition-colors text-left"
                >
                  Cinema & Lighting Gear
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('/browse?category=cat-audio')}
                  className="hover:text-[#17191C] transition-colors text-left"
                >
                  Pro Audio & Mics
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('/browse?category=cat-construction')}
                  className="hover:text-[#17191C] transition-colors text-left"
                >
                  Power Tools & Workshop
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCategoryExplorer}
                  className="text-[#315CF5] font-semibold hover:underline"
                >
                  View All 25 Categories &rarr;
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Security */}
          <div>
            <div className="text-xs font-semibold text-[#17191C] uppercase tracking-wider mb-3">
              Platform & Trust
            </div>
            <ul className="space-y-2 text-xs text-[#66707A]">
              <li>
                <button
                  type="button"
                  onClick={openAbout}
                  className="hover:text-[#17191C] transition-colors text-left"
                >
                  About BorrowBuy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openHelp}
                  className="hover:text-[#17191C] transition-colors text-left"
                >
                  Escrow & Deposit Guarantee
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openHelp}
                  className="hover:text-[#17191C] transition-colors text-left"
                >
                  Digital QR Handover Passes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openHelp}
                  className="hover:text-[#17191C] transition-colors text-left"
                >
                  Damage & Dispute Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openHelp}
                  className="hover:text-[#17191C] transition-colors text-left"
                >
                  FAQ & Knowledge Base
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: AWS Cloud Operations */}
          <div>
            <div className="text-xs font-semibold text-[#17191C] uppercase tracking-wider mb-3">
              Cloud & DevOps
            </div>
            <ul className="space-y-2 text-xs text-[#66707A]">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('/cloud')}
                  className="hover:text-[#17191C] font-medium text-[#315CF5] transition-colors text-left flex items-center gap-1"
                >
                  <span>Cloud Operations Console</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
              <li>
                <span className="text-[#66707A]">EC2 + EBS Persistent DB</span>
              </li>
              <li>
                <span className="text-[#66707A]">S3 Media Asset Store</span>
              </li>
              <li>
                <span className="text-[#66707A]">SQS Event Notification Pipeline</span>
              </li>
              <li>
                <span className="text-[#66707A]">Lambda Serverless Engine</span>
              </li>
              <li>
                <span className="text-[#66707A]">CloudWatch Active Telemetry</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & status row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#66707A] gap-4">
          <div>
            &copy; {new Date().getFullYear()} BorrowBuy Technologies. All rights reserved. Peer-to-peer equipment rental.
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#13795B]">
              <ShieldCheck className="w-4 h-4" />
              <span>TLS / AES-256 Encrypted</span>
            </span>
            <span>•</span>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
