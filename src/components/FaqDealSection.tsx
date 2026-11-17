import React, { useState } from 'react';
import { Plus, Minus, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface FaqDealSectionProps {
  onAcquireKit?: () => void;
  onExploreProducts?: () => void;
  onOpenProduct?: (product: Product) => void;
  products?: Product[];
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const FaqDealSection: React.FC<FaqDealSectionProps> = ({
  onAcquireKit,
  onExploreProducts,
}) => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const faqs: FaqItem[] = [
    {
      id: 'faq-1',
      question: 'Which HIM cleanser fits me best: Scrub Bar, De-Tan, Anti-Acne, or Face Wash?',
      category: 'CLEANSE',
      answer:
        "Pick Men's Deep Cleanse & Muscle Recovery Scrub Bar (with Charcoal, Volcanic Pumice & Kasturi Manjal) for post-workout body showers and backne. Choose Ayurvedic De-Tan Soap (Saffron, Goat Milk & Red Sandalwood) to fade sun and helmet tan lines. Pick Men's Anti-Acne Soap (2% Salicylic Acid & Neem) for oily T-zone breakouts, or HIM Face Wash (2% Niacinamide gel) as your fast morning wash across clean-shaven skin and dense beards.",
    },
    {
      id: 'faq-2',
      question: 'Will Men’s Face Brightening Serum or HIM Hair Clay make me look shiny or greasy?',
      category: 'FINISH',
      answer:
        "Never. Our Face Brightening Serum combines 15% Ethyl Ascorbic Acid (Vitamin C) and 5% Niacinamide in a water-light formula that absorbs matte within 15 seconds. HIM Hair Clay uses Kaolin and Bentonite clays for reworkable dry volume with zero wax shine—so even after wearing a bike helmet, you can restyle without grease.",
    },
    {
      id: 'faq-3',
      question: 'How do HIM Hair Oil and Beard Serum perform against hard water and coarse beards?',
      category: 'HAIR & BEARD',
      answer:
        'HIM Hair Oil pairs Sweet Almond Oil, steam-distilled Rosemary Oil, and Bhringraj with zero liquid paraffin or mineral oil—strengthening weakened roots against metro hard-water hair fall while washing clean in one rinse. HIM Beard Serum blends Moroccan Argan, Golden Jojoba, and Vitamin E so 3–4 drops eliminate beardruff and jawline itch without collar stains.',
    },
    {
      id: 'faq-4',
      question: 'How long does HIM Eau De Parfum (100ml) last in Indian humidity?',
      category: 'FRAGRANCE',
      answer:
        'HIM Eau De Parfum (Pour Homme) is mixed at a high 22% oil concentration featuring Smoked Calabrian Bergamot, Black Pepper, Roasted Cardamom, Cedarwood, and Black Amber. Two sprays on warm neck pulse points and one on your collar project crisply for 10+ hours from evening commutes to late nights.',
    },
    {
      id: 'faq-5',
      question: 'Are HIM products free from harsh sulfates, parabens, and mineral oils?',
      category: 'PURITY',
      answer:
        'Yes. Every formula across all 9 HIM essentials is 95%–100% natural-origin or dermatologically balanced with zero SLS/SLES sulfates, zero parabens, zero mineral oils, and zero phthalates. All products are 100% cruelty-free and proudly formulated and made in India.',
    },
    {
      id: 'faq-6',
      question: 'What are your delivery timelines, returns, and active discount codes?',
      category: 'SHIPPING',
      answer:
        'Orders across India ship within 24 hours with free express air delivery above ₹999 (backed by 30-day easy returns). First-time shoppers get 15% off immediately with code WELCOME15, and repeat members save 10% on orders above ₹999 with code HEISMAN10.',
    },
  ];

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq-deal-section" className="cv-section py-16 sm:py-20 bg-[#111319] border-b border-white/10 text-[#F6F4F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 pb-6 border-b border-white/10">
          <p className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-[#FF4D00]">
            Straight Answers · Formulation &amp; Orders
          </p>
          <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-white tracking-tight mt-1 text-balance">
            Frequently asked questions
          </h2>
        </div>

        {/* Accordion List */}
        <div className="divide-y divide-white/10 border border-white/10 bg-[#14171F] rounded-xl px-6">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div key={faq.id}>
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full py-5 flex items-center justify-between text-left cursor-pointer group"
                >
                  <span className="font-editorial text-base sm:text-lg font-semibold text-white group-hover:text-[#FF4D00] transition-colors pr-4">
                    {faq.question}
                  </span>
                  <span className="w-7 h-7 rounded-md bg-[#1C202B] border border-white/15 flex items-center justify-center shrink-0 text-white">
                    {isOpen ? <Minus className="w-3.5 h-3.5 text-[#FF4D00]" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="pb-5 text-sm text-[#C8C4BC] leading-relaxed">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Clean Bottom CTA */}
        <div className="mt-10 pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-editorial text-xl font-semibold text-white">
              Ready to lock in your daily rotation?
            </h3>
            <p className="text-xs sm:text-sm text-[#C8C4BC] mt-0.5">
              Start your first order with code <strong className="text-white">WELCOME15</strong> for 15% off and free India shipping above ₹999.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onAcquireKit && (
              <button
                type="button"
                onClick={onAcquireKit}
                className="px-6 py-3 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>Shop Starter Rotation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {onExploreProducts && (
              <button
                type="button"
                onClick={onExploreProducts}
                className="px-5 py-3 bg-[#14171F] hover:bg-[#1C202B] border border-white/15 text-white text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                Browse Catalog
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
