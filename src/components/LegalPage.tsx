import React, { useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Lock,
  Mail,
  Scale,
  Truck,
  Sparkles,
} from 'lucide-react';

export type LegalPageType = 'privacy' | 'terms';

interface LegalPageProps {
  page: LegalPageType;
  onSwitchPage: (page: LegalPageType) => void;
  onBack: () => void;
}

interface LegalSection {
  id: string;
  number: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: 'privacy-scope',
    number: '01.',
    title: 'Scope & Brand Commitment',
    paragraphs: [
      'HIM — He Is Man ("HIM", "we", "our", "us") respects your privacy and handles personal information with the same discipline we bring to our formulations. This Privacy Policy explains how we collect, use, store, and safeguard personal data when you browse our storefront, purchase our Soap Trio, request complimentary home samples, or contact customer care.',
      'This policy is aligned with the Digital Personal Data Protection Act, 2023 (DPDP Act, India), the Information Technology Act, 2000, and the Consumer Protection (E-Commerce) Rules, 2020.',
    ],
  },
  {
    id: 'privacy-data-collected',
    number: '02.',
    title: 'Information You Share & What We Collect',
    paragraphs: [
      'We collect only the information strictly required to fulfill your order, ship complimentary product samples, or respond to your request:',
    ],
    bullets: [
      'Order & Delivery Details: Full name, email address, phone number, street address, city, state, PIN code, country, delivery speed preference, and order reference history.',
      'Free Home Sample Requests: Full name, phone number, email address, and home delivery address when you reserve a free sample from our non-soap grooming range.',
      'Newsletter Dispatch: Email address when you opt in to receive The HIM Dispatch and your WELCOME15 first-order code.',
      'Storefront Preferences & Routine Quiz: Selected currency (INR or USD), skin/hair diagnostic quiz choices, and shopping bag items stored locally in your browser for a faster experience.',
      'Regional Detection: Approximate country/timezone lookup used strictly to set your default currency and delivery thresholds; we do not collect GPS coordinates or background device location.',
    ],
  },
  {
    id: 'privacy-payments',
    number: '03.',
    title: 'Payment Processing & Razorpay Security',
    paragraphs: [
      'Online payments via UPI, RuPay, Visa, Mastercard, NetBanking, and supported wallets are processed through Razorpay Software Private Limited using encrypted TLS connections and PCI-DSS compliant infrastructure.',
      'HIM never sees, collects, or stores your full debit/credit card numbers, CVV, UPI PIN, or net-banking credentials. After you authorize a payment in the Razorpay Checkout window, our server receives only a payment identifier, order identifier, and a cryptographic HMAC-SHA256 signature used strictly to verify transaction authenticity.',
      'If you choose Cash on Delivery (COD), your phone number and delivery address are shared solely with our courier partner to complete doorstep verification and collection.',
    ],
  },
  {
    id: 'privacy-purpose',
    number: '04.',
    title: 'How We Use Your Information',
    paragraphs: [
      'We process your personal information solely for legitimate operational and customer-requested purposes:',
    ],
    bullets: [
      'Fulfilling, packing, and dispatching Soap Trio orders and generating live shipment tracking updates.',
      'Verifying eligibility and delivering complimentary home samples across India.',
      'Providing order confirmations, GST invoices, return support, and customer care responses via care@heisman.in.',
      'Detecting duplicate sample requests, payment tampering, or automated abuse.',
      'Sending launch dispatches or promotional offers only if you actively subscribed (you may opt out at any time).',
    ],
  },
  {
    id: 'privacy-sharing',
    number: '05.',
    title: 'Data Sharing & Third-Party Service Providers',
    paragraphs: [
      'We never sell, rent, or trade your personal information to data brokers or third-party ad networks. Information is shared strictly on a need-to-know basis with:',
    ],
    bullets: [
      'Payment Gateways: Razorpay, strictly for processing and verifying prepaid orders.',
      'Logistics & Courier Partners: Domestic shipping carriers delivering your orders or complimentary samples.',
      'Legal & Regulatory Authorities: Only when required by applicable Indian law, court order, or statutory tax/compliance obligation.',
    ],
  },
  {
    id: 'privacy-storage',
    number: '06.',
    title: 'Browser Storage, Cookies & Security Safeguards',
    paragraphs: [
      'Our storefront uses essential browser storage (localStorage) to remember your shopping bag, currency selection, recent order tracking view, and newsletter opt-in status between page visits. During online checkout, Razorpay loads its official checkout script (checkout.razorpay.com) solely to render the secure payment interface.',
      'All data transmitted between your browser and our servers is encrypted over HTTPS, and server-side payment verification relies on constant-time HMAC signature checks. While no internet transmission is 100% immune to risk, we continuously audit our technical safeguards to protect customer records.',
    ],
  },
  {
    id: 'privacy-retention',
    number: '07.',
    title: 'Data Retention & Your Privacy Rights',
    paragraphs: [
      'We retain order and invoice records only for as long as necessary to fulfill deliveries, honor our 30-day return window, prevent sample abuse, and meet Indian tax and accounting laws. Local browser preferences can be cleared anytime from your browser settings.',
      'Under applicable data protection laws, you have the right to request access to the personal details we hold about you, ask for correction of inaccurate details, withdraw marketing consent, or request deletion of eligible records.',
    ],
    bullets: [
      'To exercise any privacy right or withdraw consent, email care@heisman.in from your registered email address.',
      'We acknowledge privacy requests within 24–48 hours and complete verified requests within 72 hours (or within statutory DPDP timelines).',
    ],
  },
  {
    id: 'privacy-grievance',
    number: '08.',
    title: 'Grievance Officer & Contact',
    paragraphs: [
      'In accordance with the Information Technology Act, 2000 and Consumer Protection (E-Commerce) Rules, 2020, questions, complaints, or data-deletion requests may be directed to our Customer Care & Grievance Desk:',
      'Email: care@heisman.in · Brand: HIM — He Is Man (India). Please include "Privacy Inquiry" in the subject line along with your order or sample reference ID if applicable.',
    ],
  },
];

const TERMS_SECTIONS: LegalSection[] = [
  {
    id: 'terms-acceptance',
    number: '01.',
    title: 'Acceptance of Terms & Eligibility',
    paragraphs: [
      'Welcome to HIM — He Is Man ("HIM", "we", "our", "us"). By accessing our website, placing an order, or requesting a complimentary home sample, you agree to be bound by these Terms of Service and our Privacy Policy.',
      'To place an order or request a sample, you confirm that you are at least 18 years of age (or using the storefront with the consent and supervision of a parent or legal guardian) and capable of entering into a binding agreement under the Indian Contract Act, 1872.',
    ],
  },
  {
    id: 'terms-catalog',
    number: '02.',
    title: 'Current Direct-Sale Products & Free Home Samples',
    paragraphs: [
      'HIM curates a nine-piece grooming and skincare lineup engineered for Indian heat, humidity, sweat, and hard water. Please note our current fulfillment structure:',
    ],
    bullets: [
      'Direct Cart & Checkout: Currently, direct online purchase is enabled exclusively for our three cleansing bars — HIM Exfoliating Scrub Bar, HIM Ayurvedic De-Tan Soap, and HIM Anti-Acne Soap (individually or as the 3-Soap Collection).',
      'Free Home Sample Program: All other HIM formulations (Face Wash, Vitamin C + Niacinamide Serum, Hair Oil, Hair Clay, Beard Serum, and Pour Homme Eau De Parfum) are currently available to reserve as complimentary home samples while batch allocations last.',
      'Sample Allocation Rules: Complimentary samples are limited to one trial per household per product, require verified contact and Indian delivery address details, and are strictly not for resale or commercial redistribution.',
    ],
  },
  {
    id: 'terms-pricing',
    number: '03.',
    title: 'Pricing, Currency & Promotional Codes',
    paragraphs: [
      'All product prices displayed in Indian Rupees (INR ₹) are inclusive of applicable Goods and Services Tax (GST) unless expressly stated otherwise. An indicative USD ($) toggle is provided for international reference; final payment settlement is computed cleanly from verified catalog pricing at checkout.',
      'Free standard India delivery applies on qualifying orders of ₹999 or more (or equivalent threshold shown in your bag). Priority Express Dispatch carries the separate delivery charge displayed prior to payment confirmation.',
      'Promotional codes (such as WELCOME15 for 15% off your first drop) apply only to eligible direct-sale soap orders, may carry minimum order thresholds, cannot be redeemed for cash, and cannot be stacked unless explicitly stated.',
    ],
  },
  {
    id: 'terms-payments',
    number: '04.',
    title: 'Orders, Razorpay Payments & Cash on Delivery',
    paragraphs: [
      'You may complete payment via Razorpay (UPI, credit/debit cards, NetBanking, wallets) or Cash on Delivery (COD) where available. Prepaid orders are confirmed only upon successful Razorpay payment authorization and server-side signature verification.',
      'We reserve the right to verify, limit quantities on, or cancel any order if stock is unexpectedly depleted, a typographical pricing error occurs, payment verification fails, or a delivery PIN code is unserviceable. Any amount debited for a cancelled prepaid order will be refunded in full to the original payment method.',
    ],
  },
  {
    id: 'terms-shipping',
    number: '05.',
    title: 'Shipping, Dispatch & Order Tracking',
    paragraphs: [
      'Orders are dispatched from our fulfillment hub in India. Delivery timelines displayed at checkout (such as Priority Express Dispatch or Standard Ground Courier) are good-faith estimates and may vary due to regional logistics, weather, public holidays, or force majeure events.',
      'Once dispatched, you can monitor shipment milestones directly using the Track Order portal with your #HIM-XXXX order ID.',
    ],
  },
  {
    id: 'terms-returns',
    number: '06.',
    title: '30-Day Returns, Replacements & Refunds',
    paragraphs: [
      'We stand behind every HIM formulation with a straightforward 30-day return window from the date of delivery:',
    ],
    bullets: [
      'Eligible Returns: Unopened, unused soap bars in original sealed packaging with intact batch seals, or items delivered damaged, incorrect, or defective.',
      'Damaged or Wrong Item Claims: Please email care@heisman.in within 48 hours of delivery with your #HIM-XXXX order ID and clear photos of the outer parcel and product.',
      'Hygiene Exception: For personal hygiene and safety reasons, opened or used bath bars cannot be returned unless verified to be defective, expired, or accompanied by a documented adverse reaction.',
      'Refund Processing: Approved refunds for prepaid orders are initiated via Razorpay back to your original UPI account, card, or bank within 5–7 business days after inspection.',
    ],
  },
  {
    id: 'terms-disclaimer',
    number: '07.',
    title: 'Cosmetic Usage & Patch-Test Disclaimer',
    paragraphs: [
      'All HIM soaps, serums, hair products, and fragrances are formulated strictly for external cosmetic and personal grooming use. Always read the active ingredient list before application and perform a 24-hour patch test on your inner forearm, especially if you have sensitive or reactive skin.',
      'Discontinue use immediately and consult a qualified dermatologist if redness or irritation occurs. Routine Quiz recommendations and Results Lab metrics reflect typical user outcomes and educational guidance — they do not constitute medical diagnosis or dermatological treatment.',
    ],
  },
  {
    id: 'terms-ip',
    number: '08.',
    title: 'Intellectual Property',
    paragraphs: [
      'The HIM — He Is Man name, geometric monogram, product names, packaging designs, formulations, photography, editorial copy, and website code are the exclusive intellectual property of HIM — He Is Man. No material from this site may be copied, reproduced, framed, scraped, or commercially exploited without prior written authorization.',
    ],
  },
  {
    id: 'terms-liability-law',
    number: '09.',
    title: 'Limitation of Liability & Governing Law',
    paragraphs: [
      'To the fullest extent permitted by law, HIM — He Is Man shall not be liable for any indirect, incidental, or consequential damages arising from use of the storefront or products. Our total aggregate liability for any claim related to a purchase shall not exceed the actual amount paid by you for that order.',
      'These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra, without limiting your mandatory statutory rights under the Consumer Protection Act, 2019.',
    ],
  },
];

export const LegalPage: React.FC<LegalPageProps> = ({
  page,
  onSwitchPage,
  onBack,
}) => {
  const isPrivacy = page === 'privacy';
  const sections = isPrivacy ? PRIVACY_SECTIONS : TERMS_SECTIONS;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <article className="min-h-screen bg-[#0B0D12] text-[#F6F4F0] pb-24">
      {/* Top Editorial Navigation & Document Switcher */}
      <div className="border-b border-white/10 bg-[#14171F]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#C8C4BC] hover:text-[#FF4D00] transition-colors w-fit cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to HIM Storefront</span>
          </button>

          <div
            role="tablist"
            aria-label="Legal Documents"
            className="inline-flex items-center gap-1 p-1 bg-[#0B0D12] border border-white/15 rounded-lg w-fit"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isPrivacy}
              onClick={() => onSwitchPage('privacy')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isPrivacy
                  ? 'bg-[#FF4D00] text-white'
                  : 'text-[#C8C4BC] hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isPrivacy}
              onClick={() => onSwitchPage('terms')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                !isPrivacy
                  ? 'bg-[#FF4D00] text-white'
                  : 'text-[#C8C4BC] hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms of Service</span>
            </button>
          </div>
        </div>
      </div>

      {/* Document Hero Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 border-b border-white/10">
        <div className="max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#C8C4BC]">
            <span className="text-[#FF4D00] font-semibold">HIM — He Is Man</span>
            <span aria-hidden="true">·</span>
            <span>Effective November 18, 2026</span>
            <span aria-hidden="true">·</span>
            <span>Jurisdiction: India</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl font-semibold text-white tracking-tight text-balance">
            {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
          </h1>

          <p className="text-base sm:text-lg text-[#C8C4BC] leading-relaxed">
            {isPrivacy
              ? 'How HIM — He Is Man collects, safeguards, and processes your order, Razorpay payment verification, and free home sample details in plain, transparent language.'
              : 'Clear rules governing purchases of the HIM Soap Trio, Free Home Sample reservations, Razorpay & Cash on Delivery checkout, shipping across India, and our 30-day return guarantee.'}
          </p>
        </div>

        {/* Key Facts Strip (Clean 4-column unboxed summary grid) */}
        <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
              <span>{isPrivacy ? 'Zero Card Data Stored' : '3 Soaps + Free Samples'}</span>
            </div>
            <p className="text-xs text-[#C8C4BC] leading-relaxed">
              {isPrivacy
                ? 'UPI, card & banking details stay exclusively inside PCI-DSS certified Razorpay checkout.'
                : '3 bath bars open for instant order; all other formulations available via Free Home Sample.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Sparkles className="w-4 h-4 text-[#FF4D00]" />
              <span>{isPrivacy ? 'No Data Broker Sales' : '30-Day Return Guarantee'}</span>
            </div>
            <p className="text-xs text-[#C8C4BC] leading-relaxed">
              {isPrivacy
                ? 'Customer phone numbers, addresses, and emails are never sold or rented for ad targeting.'
                : 'Unopened sealed bars & transit-damaged items qualify for replacement or 5–7 day refund.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Truck className="w-4 h-4 text-[#FF4D00]" />
              <span>{isPrivacy ? 'DPDP Act 2023 Ready' : 'Free Shipping Over ₹999'}</span>
            </div>
            <p className="text-xs text-[#C8C4BC] leading-relaxed">
              {isPrivacy
                ? 'Access, correct, or request deletion of your personal details anytime via email.'
                : 'Complimentary standard delivery over ₹999 across India, plus optional Priority Express.'}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Scale className="w-4 h-4 text-[#C8C4BC]" />
              <span>Grievance &amp; Care Desk</span>
            </div>
            <p className="text-xs text-[#C8C4BC] leading-relaxed">
              Direct human support at{' '}
              <a
                href="mailto:care@heisman.in"
                className="text-white underline decoration-white/30 hover:text-[#FF4D00] transition-colors"
              >
                care@heisman.in
              </a>
              .
            </p>
          </div>
        </div>
      </header>

      {/* Main 2-Column Editorial Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Sticky Table of Contents */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-28 space-y-6">
            <div className="bg-[#14171F] border border-white/10 rounded-xl p-6 space-y-4">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                Contents
              </h2>
              <nav aria-label="Section Navigation" className="space-y-1.5">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    className="w-full text-left flex items-baseline gap-2.5 py-1.5 text-xs text-[#C8C4BC] hover:text-[#FF4D00] transition-colors cursor-pointer"
                  >
                    <span className="font-mono text-[11px] text-[#FF4D00] tabular-nums shrink-0">
                      {section.number}
                    </span>
                    <span className="leading-snug">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-[#14171F] border border-white/10 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Mail className="w-4 h-4 text-[#FF4D00]" />
                <span>Need Clarification?</span>
              </div>
              <p className="text-xs text-[#C8C4BC] leading-relaxed">
                For order adjustments, privacy requests, returns, or grievance redressal under Indian E-Commerce Rules, write directly to our care team.
              </p>
              <a
                href="mailto:care@heisman.in"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B0D12] hover:bg-[#FF4D00] border border-white/15 hover:border-[#FF4D00] text-white text-xs font-semibold rounded-md transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>care@heisman.in</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Right Readable Prose Column */}
        <div className="lg:col-span-8 space-y-10 max-w-3xl">
          {sections.map((section, idx) => (
            <section
              key={section.id}
              id={section.id}
              className={`scroll-mt-28 ${idx > 0 ? 'pt-10 border-t border-white/10' : ''} space-y-4`}
            >
              <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-white tracking-tight flex items-baseline gap-3">
                <span className="font-mono text-sm text-[#FF4D00] tabular-nums shrink-0">
                  {section.number}
                </span>
                <span>{section.title}</span>
              </h2>

              <div className="space-y-3.5 text-[15px] text-[#C8C4BC] leading-[1.7]">
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>

              {section.bullets && section.bullets.length > 0 && (
                <ul className="space-y-3 pt-1">
                  {section.bullets.map((bullet, bIdx) => {
                    const colonIndex = bullet.indexOf(':');
                    const hasLabel = colonIndex > 0 && colonIndex < 40;
                    return (
                      <li
                        key={bIdx}
                        className="flex items-start gap-3 text-[15px] text-[#C8C4BC] leading-[1.65]"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#FF4D00] shrink-0"
                        />
                        <span>
                          {hasLabel ? (
                            <>
                              <strong className="text-white font-semibold">
                                {bullet.slice(0, colonIndex + 1)}
                              </strong>
                              {bullet.slice(colonIndex + 1)}
                            </>
                          ) : (
                            bullet
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}

          {/* Bottom Cross-Navigation Banner */}
          <div className="pt-10 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-mono text-[#C8C4BC]">
                HIM — He Is Man Legal Documentation
              </div>
              <div className="text-sm font-semibold text-white">
                {isPrivacy
                  ? 'Also review our Terms of Service for returns, samples & shipping rules.'
                  : 'Also review our Privacy Policy for data protection & Razorpay security.'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSwitchPage(isPrivacy ? 'terms' : 'privacy')}
              className="px-5 py-2.5 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isPrivacy ? 'Read Terms of Service' : 'Read Privacy Policy'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
