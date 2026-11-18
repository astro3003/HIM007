import React, { useState } from 'react';
import { Mail, Check, ShieldCheck, Globe, ArrowRight, Instagram, Linkedin, Facebook } from 'lucide-react';

interface FooterProps {
  onOpenIngredients: () => void;
  onOpenTracking: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenAdmin?: () => void;
  isAdminActive?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenIngredients,
  onOpenTracking,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;

    try {
      const stored = JSON.parse(localStorage.getItem('him_newsletter_enlisted') || '[]');
      stored.push({ email: emailInput, time: new Date().toISOString() });
      localStorage.setItem('him_newsletter_enlisted', JSON.stringify(stored));
    } catch {
      // safe fallback
    }

    setSubscribed(true);
  };

  return (
    <footer className="cv-section w-full bg-[#0B0D12] border-t border-white/10 text-[#F6F4F0]">
      {/* Newsletter / Gazette Subscription Banner */}
      <div className="border-b border-white/10 py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <p className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-[#FF4D00] mb-2">
              The HIM Dispatch
            </p>
            <h3 className="font-editorial text-2xl sm:text-4xl font-semibold text-white tracking-tight">
              Take 15% off your first drop.
            </h3>
            <p className="mt-2 text-sm text-[#C8C4BC] max-w-lg leading-relaxed">
              Early access to new HIM launches, seasonal routine guides for Indian weather, and member-only drops. Zero spam.
            </p>
          </div>

          <div className="lg:col-span-5">
            {subscribed ? (
              <div className="p-4 bg-[#14171F] border border-[#22C55E]/30 rounded-lg text-[#22C55E] flex items-center space-x-3">
                <Check className="w-5 h-5 shrink-0" />
                <div>
                  <div className="font-semibold text-sm text-white">Welcome to HIM — He Is Man</div>
                  <div className="text-xs text-[#C8C4BC]">Use code <strong className="text-white">WELCOME15</strong> at checkout for 15% off.</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      placeholder="Your email address..."
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-[#14171F] border border-white/15 rounded-md px-4 py-3 text-xs text-white placeholder-[#C8C4BC]/70 focus:outline-none focus:border-[#FF4D00]"
                    />
                    <Mail className="w-4 h-4 absolute right-3.5 top-3 text-[#C8C4BC]" />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#FF4D00] hover:bg-[#E03E1A] text-white font-semibold text-xs rounded-md transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Unlock 15% Off</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[11px] text-[#C8C4BC]">
                  Zero spam. Formulated &amp; manufactured in India.
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Brand Column */}
        <div className="col-span-2 space-y-4">
          <div className="font-editorial text-2xl font-bold tracking-tight text-white">
            HIM <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-[#FF4D00] ml-1.5">He Is Man</span>
          </div>

          <p className="text-xs sm:text-sm text-[#C8C4BC] max-w-sm leading-relaxed">
            Nine-piece men&apos;s skincare, hair styling, beard conditioning, and Pour Homme Eau De Parfum range calibrated for Indian heat, sweat, and hard water.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#C8C4BC]">
            <span className="flex items-center">
              <ShieldCheck className="w-4 h-4 text-[#22C55E] mr-1.5" />
              0% Sulfates &amp; Parabens
            </span>
            <span className="flex items-center">
              <Globe className="w-4 h-4 text-[#FF4D00] mr-1.5" />
              Made in India
            </span>
          </div>

          <div className="pt-1 flex flex-wrap items-center gap-3">
            <a
              href="https://www.instagram.com/him.mard/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow HIM on Instagram @him.mard"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#14171F] hover:bg-[#FF4D00] border border-white/15 hover:border-[#FF4D00] text-white text-xs font-semibold rounded-md transition-colors"
            >
              <Instagram className="w-4 h-4" />
              <span>@him.mard</span>
            </a>
            <a
              href="https://www.linkedin.com/company/himhim/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow HIM on LinkedIn"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#14171F] hover:bg-[#FF4D00] border border-white/15 hover:border-[#FF4D00] text-white text-xs font-semibold rounded-md transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://www.facebook.com/share/1dRYMb3x8G/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow HIM on Facebook"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#14171F] hover:bg-[#FF4D00] border border-white/15 hover:border-[#FF4D00] text-white text-xs font-semibold rounded-md transition-colors"
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </a>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="font-mono font-semibold text-[11px] uppercase tracking-wider text-white">The Lineup</h4>
          <ul className="space-y-2 text-xs text-[#C8C4BC]">
            <li><a href="#products-section" className="hover:text-[#FF4D00] transition-colors">Face Wash &amp; Serum</a></li>
            <li><a href="#products-section" className="hover:text-[#FF4D00] transition-colors">De-Tan &amp; Anti-Acne Bars</a></li>
            <li><a href="#products-section" className="hover:text-[#FF4D00] transition-colors">Gym Body Scrub Bar</a></li>
            <li><a href="#products-section" className="hover:text-[#FF4D00] transition-colors">Hair Oil &amp; Hair Clay</a></li>
            <li><a href="#products-section" className="hover:text-[#FF4D00] transition-colors">Beard Serum &amp; EDP</a></li>
          </ul>
        </div>

        {/* Brand & Values */}
        <div className="space-y-3">
          <h4 className="font-mono font-semibold text-[11px] uppercase tracking-wider text-white">About HIM</h4>
          <ul className="space-y-2 text-xs text-[#C8C4BC]">
            <li>
              <button type="button" onClick={onOpenIngredients} className="hover:text-[#FF4D00] transition-colors text-left cursor-pointer">
                Actives &amp; Purity Charter
              </button>
            </li>
            <li><span>Made in India</span></li>
            <li><a href="#reviews-section" className="hover:text-[#FF4D00] transition-colors">2,260+ Verified Reviews</a></li>
            <li><span>Cruelty-Free &amp; Vegan</span></li>
            <li><span>Zero Mineral Oil</span></li>
          </ul>
        </div>

        {/* Customer Care & Legal */}
        <div className="space-y-3">
          <h4 className="font-mono font-semibold text-[11px] uppercase tracking-wider text-white">Customer Care</h4>
          <ul className="space-y-2 text-xs text-[#C8C4BC]">
            <li>
              <button type="button" onClick={onOpenTracking} className="hover:text-[#FF4D00] transition-colors text-left cursor-pointer">
                Track My Order
              </button>
            </li>
            <li><a href="#faq-deal-section" className="hover:text-[#FF4D00] transition-colors">FAQs</a></li>
            <li>
              <button type="button" onClick={onOpenTerms} className="hover:text-[#FF4D00] transition-colors text-left cursor-pointer">
                30-Day Returns &amp; Terms
              </button>
            </li>
            <li>
              <button type="button" onClick={onOpenPrivacy} className="hover:text-[#FF4D00] transition-colors text-left cursor-pointer">
                Privacy Policy
              </button>
            </li>
            <li>
              <a href="mailto:care@heisman.in" className="hover:text-[#FF4D00] transition-colors">
                care@heisman.in
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Sub-Footer with Admin and Legal */}
      <div className="border-t border-white/10 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#C8C4BC] gap-4">
        <div>
          © {new Date().getFullYear()} HIM — He Is Man. Formulated and crafted in India. All rights reserved.
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a
            href="https://www.instagram.com/him.mard/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-white hover:text-[#FF4D00] transition-colors font-medium"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Instagram</span>
          </a>
          <span>•</span>
          <a
            href="https://www.linkedin.com/company/himhim/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-white hover:text-[#FF4D00] transition-colors font-medium"
          >
            <Linkedin className="w-3.5 h-3.5" />
            <span>LinkedIn</span>
          </a>
          <span>•</span>
          <a
            href="https://www.facebook.com/share/1dRYMb3x8G/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-white hover:text-[#FF4D00] transition-colors font-medium"
          >
            <Facebook className="w-3.5 h-3.5" />
            <span>Facebook</span>
          </a>
          <span>•</span>
          <span>100% Secure Checkout</span>
          <span>•</span>
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="text-white hover:text-[#FF4D00] transition-colors font-medium cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={onOpenTerms}
            className="text-white hover:text-[#FF4D00] transition-colors font-medium cursor-pointer"
          >
            Terms of Service
          </button>
        </div>
      </div>
    </footer>
  );
};
