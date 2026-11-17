import React, { useState } from 'react';
import {
  HelpCircle,
  ShieldCheck,
  Lock,
  QrCode,
  ChevronDown,
  ChevronUp,
  GraduationCap,
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'How does the refundable security deposit work?',
    a: 'When you confirm a booking, the security deposit is held securely in platform escrow. It is not paid to the owner until you return the equipment in verified working condition. Once the owner scans the return QR pass and confirms condition, the deposit is automatically refunded to your original payment method.',
  },
  {
    q: 'What is the Digital Handover Pass (QR Code)?',
    a: 'Every approved booking generates a unique, single-use digital pass with a dynamic QR code. During in-person handover in Ahmedabad, Surat, or Gandhinagar, the lender scans your pass to confirm equipment pickup and record the physical timestamp.',
  },
  {
    q: 'What happens if equipment is damaged during rental?',
    a: 'At pickup, both parties take condition verification photos via the app. In the rare event of damage, photos are compared against the return inspection. Repair costs are deducted from the escrow deposit with transparent arbitration, and remaining funds are returned.',
  },
  {
    q: 'Are owners verified before listing gear?',
    a: 'Yes. All equipment owners must verify their government ID, phone number, and local Gujarat residential address before listing high-value items. We maintain community trust ratings for every member.',
  },
  {
    q: 'Can I cancel my rental reservation?',
    a: 'Yes. You can cancel free of charge up to 24 hours prior to the scheduled pickup time. If cancelled after that window, a nominal cancellation fee may apply to compensate the owner for reserving the calendar slot.',
  },
  {
    q: 'How do volume discounts work on longer rentals?',
    a: 'Our serverless pricing engine automatically applies tiered discounts: 5% off for 3+ days, 15% off for 7+ days (weekly), 20% off for 14+ days, and 30% off for 30+ days (monthly rentals).',
  },
];

export const HelpPage: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="pb-4 border-b border-[#E4E7EC]">
        <div className="flex items-center gap-2 text-xs font-bold text-[#F06449] uppercase tracking-wider mb-1 font-display">
          <HelpCircle className="w-4 h-4 text-[#F06449]" />
          <span>Support & Knowledge Base</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-[#172B46] tracking-tight">
          Help & Frequently Asked Questions
        </h1>
        <p className="text-xs text-[#667085] mt-1">
          Everything you need to know about renting, escrow protection, digital passes, and dispute resolution.
        </p>
      </div>

      {/* 3 Pillars of Safety */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#E4E7EC] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#172B46] flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5 text-[#2F6B65]" />
          </div>
          <h3 className="font-display font-bold text-sm text-[#172B46] mb-1">
            Verified Members
          </h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            All borrowers and equipment owners verify their phone number and government credentials.
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E4E7EC] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="font-display font-bold text-sm text-[#172B46] mb-1">
            Escrow Protection
          </h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            Security deposits stay protected in escrow and are released back immediately upon verified return.
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E4E7EC] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <QrCode className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-display font-bold text-sm text-[#172B46] mb-1">
            Digital QR Pass
          </h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            Seamless contactless handover with condition logging and immutable audit trails in DynamoDB.
          </p>
        </div>
      </div>

      {/* FAQ Accordions */}
      <section className="bg-white rounded-3xl border border-[#E4E7EC] p-6 md:p-8 shadow-xs">
        <h2 className="font-display text-xl font-extrabold text-[#172B46] mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-[#E4E7EC] rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-display font-bold text-xs sm:text-sm text-[#172B46] flex items-center justify-between hover:bg-[#F5F6F8] transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#F06449] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#667085] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 pt-1 bg-[#F5F6F8] text-xs text-[#667085] leading-relaxed border-t border-[#E4E7EC]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Academic Project Disclaimer */}
      <div className="p-6 bg-[#172B46] text-white rounded-2xl border border-[#172B46] shadow-md flex items-start gap-4">
        <div className="p-3 bg-white/10 rounded-xl shrink-0 mt-0.5">
          <GraduationCap className="w-6 h-6 text-[#F2C66D]" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-display font-bold text-sm text-white">
            Academic Cloud Computing Project Statement
          </div>
          <p className="text-[#E4E7EC] leading-relaxed">
            BorrowBuy is engineered as a Master’s / Undergraduate Cloud Computing Capstone Project. It demonstrates a complete 16-service AWS Enterprise Architecture, dual-AZ VPC networking, Application Load Balancing, Horizontal Auto Scaling, Serverless Lambda computation, and Amazon DynamoDB immutable audit streams localized for Gujarat, India.
          </p>
          <div className="pt-2 text-[11px] text-white/70">
            For academic verification or faculty inquiries, contact <strong className="text-white">support@borrowbuy.in</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};
