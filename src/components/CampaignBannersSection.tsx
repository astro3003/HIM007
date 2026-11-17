import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Currency, Product, ProductCategory } from '../types';
import { formatPrice } from '../utils/locationCurrency';
import { ProductArtwork } from './ProductArtwork';
import { isSoapAvailableForSale } from '../utils/sellable';

interface CampaignBannersSectionProps {
  products: Product[];
  currency: Currency;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectCategory: (cat: ProductCategory) => void;
}

export const CampaignBannersSection: React.FC<CampaignBannersSectionProps> = ({
  products,
  currency,
  onOpenProduct,
  onAddToCart,
  onSelectCategory,
}) => {
  // Dynamically list all live launched products in Campaign 02 ledger
  const gearItems = products.slice(0, 12).map((prod, idx) => ({
    label: prod.name,
    role: `Drop 0${idx + 1} · ${prod.category}`,
    product: prod,
  }));

  const scrollToCatalog = (cat: ProductCategory) => {
    onSelectCategory(cat);
    setTimeout(() => {
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  return (
    <section
      id="campaign-banners-section"
      className="cv-section py-16 sm:py-24 bg-[#0B0D12] text-[#F6F4F0] border-y border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-white/10 gap-4">
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-[#FF4D00]">
              HIM — He Is Man · Campaign Series
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight mt-1.5">
              Own the morning. Command the night.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#C8C4BC] max-w-md leading-relaxed">
            Zero guesswork grooming built for heavy gym sessions, helmet commutes, thick beards, and Indian evening presence.
          </p>
        </div>

        {/* Widescreen Banner 1: HIM · BUILD YOUR DAILY EDGE */}
        <div className="group relative rounded-xl overflow-hidden border border-white/15 bg-[#14171F]">
          <div className="relative aspect-[1376/768] w-full overflow-hidden">
            <img
              src="/assets/aistudio/Designing_album_cover_inspired_b__604cce79_8881370b.jpg"
              alt="HIM He Is Man — Build Your Daily Edge beard, hair and body care campaign banner"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0B0D12]/90 via-[#0B0D12]/40 to-transparent pointer-events-none" />
          </div>

          {/* Sleek Action Bar Anchored Beneath Widescreen Banner */}
          <div className="px-5 sm:px-8 py-5 bg-[#111319] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#FF4D00]">
                Campaign 01 · Beard Strength, Scalp Care &amp; Body Reset
              </div>
              <div className="font-editorial text-xl sm:text-2xl font-semibold text-white mt-0.5">
                HIM — Build Your Daily Edge
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => scrollToCatalog('BEARD & SHAVE')}
                className="px-5 py-2.5 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>Shop Beard Serum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollToCatalog('HAIR')}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                Explore Hair Oil &amp; Clay
              </button>
            </div>
          </div>
        </div>

        {/* Poster Split Banner 2: HIM. GEAR FOR YOUR FACE. + Shoppable Gear Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Full Uncropped Vertical Campaign Poster */}
          <div className="lg:col-span-5 rounded-xl overflow-hidden border border-white/15 bg-[#111319] flex items-center justify-center">
            <img
              src="/assets/aistudio/Gemini_Generated_Image_s464lds464lds464_34cda814.jpeg"
              alt="HIM. Gear For Your Face — Complete men's grooming lineup banner"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Right: Interactive Shoppable Gear Breakdown */}
          <div className="lg:col-span-7 bg-[#14171F] border border-white/10 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-[#FF4D00]">
                Campaign 02 · Gear For Your Face &amp; Presence
              </p>
              <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-white mt-2">
                From first cold splash to dusk cologne.
              </h3>
              <p className="text-xs sm:text-sm text-[#C8C4BC] mt-2 leading-relaxed max-w-xl">
                Every charcoal-and-orange bottle in the HIM rotation has one job: cut oil, fade sun tan, lock dry volume, soften wire beard, and carry your scent late into the night.
              </p>

              {/* Spec Ledger */}
              <div className="mt-8 divide-y divide-white/10 border-t border-b border-white/10">
                {gearItems.map((entry, idx) => (
                  <div
                    key={entry.product.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div
                      onClick={() => onOpenProduct(entry.product)}
                      className="flex items-center gap-4 min-w-0 cursor-pointer group"
                    >
                      <span className="font-mono text-xs text-[#FF4D00] font-semibold w-6 shrink-0">
                        0{idx + 1}
                      </span>
                      <div className="w-14 h-14 rounded-lg bg-[#F5F3EF] overflow-hidden shrink-0 border border-white/10">
                        {entry.product.fieldImg ? (
                          <img
                            src={entry.product.fieldImg}
                            alt={entry.product.name}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <ProductArtwork artType={entry.product.artType} className="w-full h-full p-1" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-[#C8C4BC]">
                          {entry.role}
                        </div>
                        <div className="text-sm font-semibold text-white group-hover:text-[#FF4D00] transition-colors truncate mt-0.5">
                          {entry.product.name}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#C8C4BC] mt-0.5 tabular-nums">
                          <span className="inline-flex items-center gap-1 text-white font-medium">
                            <Star className="w-3 h-3 fill-[#FF4D00] text-[#FF4D00]" />
                            {entry.product.rating.toFixed(1)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{entry.product.volume}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-10 sm:pl-0">
                      <span className="text-sm font-bold text-white tabular-nums">
                        {formatPrice(entry.product.price, currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenProduct(entry.product)}
                        className="px-3 py-2 text-xs font-medium text-[#C8C4BC] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Spec
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddToCart(entry.product)}
                        className="px-4 py-2 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {isSoapAvailableForSale(entry.product) ? 'Add' : 'Free Sample'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#C8C4BC]">
              <span>Formulated in India · 0% Parabens · 0% Mineral Oil</span>
              <button
                type="button"
                onClick={() => scrollToCatalog('ALL')}
                className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-[#FF4D00] transition-colors cursor-pointer"
              >
                <span>View All {products.length} Formulations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
