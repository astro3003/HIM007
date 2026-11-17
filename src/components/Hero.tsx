import React, { useState } from 'react';
import { ArrowRight, Camera, Upload } from 'lucide-react';
import { Currency, Product, ProductCategory } from '../types';
import { formatPrice, LocationDetectionResult } from '../utils/locationCurrency';
import { isAIStudioEditMode } from '../utils/environment';

interface HeroProps {
  onExploreClick: () => void;
  onAcquireKit: () => void;
  currency: Currency;
  bundlePrice: number;
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onOpenDiagnostic?: () => void;
  products?: Product[];
  selectedCategory?: ProductCategory;
  onSelectCategory?: (cat: ProductCategory) => void;
  isAdminActive?: boolean;
  customImages?: Record<string, string>;
  onUpdateImage?: (id: string, dataUrl: string) => void;
  locationInfo?: LocationDetectionResult | null;
  onTriggerVoice?: () => void;
  isVoicePlaying?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreClick,
  currency,
  onSelectProduct,
  onAddToCart,
  onOpenDiagnostic,
  products = [],
  onSelectCategory,
  isAdminActive = false,
  customImages = {},
  onUpdateImage,
}) => {
  const [isDraggingHero, setIsDraggingHero] = useState(false);
  const canEdit = isAIStudioEditMode(isAdminActive);

  const featuredHeroProduct =
    products.find((p) => p.id === 'prod-him-face-brightening-serum') ||
    products.find((p) => p.id === 'prod-him-face-wash') ||
    products[0];

  const DEFAULT_HERO_BANNER = '/assets/aistudio/Men_posing_with_motorcycle_products_cb7d58eb_b75f4f77.jpg';
  const customHero = customImages['hero-main'];
  const heroImageSrc =
    customHero && !customHero.startsWith('/images/custom/')
      ? customHero
      : DEFAULT_HERO_BANNER;

  return (
    <section className="w-full bg-[#0B0D12] text-[#F6F4F0] relative overflow-hidden">
      {/* Unobstructed Widescreen Uploaded Campaign Banner */}
      <div
        className="relative w-full bg-[#0B0D12] overflow-hidden"
        onDragOver={
          canEdit
            ? (e) => {
                e.preventDefault();
                setIsDraggingHero(true);
              }
            : undefined
        }
        onDragLeave={canEdit ? () => setIsDraggingHero(false) : undefined}
        onDrop={
          canEdit
            ? (e) => {
                e.preventDefault();
                setIsDraggingHero(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const file = e.dataTransfer.files[0];
                  const reader = new FileReader();
                  reader.onload = () => {
                    onUpdateImage?.('hero-main', reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }
            : undefined
        }
      >
        <div className="relative w-full max-w-[1600px] mx-auto aspect-video max-h-[760px] overflow-hidden">
          <img
            src={heroImageSrc}
            alt="HIM — He Is Man men's grooming campaign featuring matte hair clay, beard serum, hair oil, and face wash"
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle top & bottom edge melts into obsidian frame without obscuring baked-in HIM. artwork */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#0B0D12]/70 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/35 to-transparent"
          />
        </div>

        {isDraggingHero && (
          <div className="absolute inset-0 bg-[#0B0D12]/85 z-30 flex flex-col items-center justify-center text-white p-4">
            <Upload className="w-8 h-8 text-[#FF4D00] mb-2" />
            <span className="text-xs font-mono uppercase tracking-wider">
              Drop Hero Campaign Image
            </span>
          </div>
        )}

        {/* Edit Mode Upload */}
        {canEdit && (
          <label className="absolute top-5 right-5 z-30 px-3 py-1.5 bg-black/75 hover:bg-[#FF4D00] text-white border border-white/20 text-[11px] font-semibold rounded-md cursor-pointer flex items-center gap-1.5 transition-colors">
            <Camera className="w-3.5 h-3.5" />
            <span>Replace Banner</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onload = () => {
                    onUpdateImage?.('hero-main', reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
        )}
      </div>

      {/* Editorial Brand Action & Manifesto Dock Directly Below Banner */}
      <div className="bg-[#0B0D12] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Eyebrow + Primary SEO Headline + Copy */}
            <div className="lg:col-span-6 space-y-3">
              <div className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#FF4D00]">
                He Is Man · 09 Essentials Live
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[2.85rem] font-semibold text-[#F6F4F0] leading-[1.06] tracking-tight">
                Gear up for the{' '}
                <span className="italic font-normal text-[#FF4D00]">
                  daily grind.
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[#C8C4BC] leading-relaxed max-w-xl">
                Indian heat, hard water, and late nights hit harder. Zero shelf clutter — cleanse sweat and tan, tame coarse hair, hydrate stubble, and lock in an all-night scent in minutes.
              </p>
            </div>

            {/* Right: Circular Shop Drop CTA + Routine Quiz + Featured Quick Add */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row lg:justify-end items-start sm:items-center gap-6">
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory('ALL');
                    onExploreClick();
                  }}
                  className="w-[84px] h-[84px] sm:w-[92px] sm:h-[92px] rounded-full bg-[#FF4D00] hover:bg-[#E03E1A] text-[#0B0D12] hover:text-white font-bold text-xs tracking-wide flex flex-col items-center justify-center text-center shadow-[0_0_36px_rgba(255,77,0,0.42)] hover:scale-105 transition-all cursor-pointer shrink-0"
                >
                  <span>Shop</span>
                  <span>Drop</span>
                </button>

                <div className="space-y-2.5">
                  {onOpenDiagnostic && (
                    <button
                      type="button"
                      onClick={onOpenDiagnostic}
                      className="text-xs sm:text-sm font-medium text-[#EDEAE4] hover:text-[#FF4D00] transition-colors flex items-center gap-1.5 underline underline-offset-4 cursor-pointer"
                    >
                      <span>Build Your Routine</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {featuredHeroProduct && onSelectProduct && (
                    <button
                      type="button"
                      onClick={() => onSelectProduct(featuredHeroProduct)}
                      className="block font-mono text-[11px] uppercase tracking-wider text-[#FF4D00] hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Spotlight: {featuredHeroProduct.name} →
                    </button>
                  )}

                  {featuredHeroProduct && onAddToCart && (
                    <button
                      type="button"
                      onClick={() => onAddToCart(featuredHeroProduct)}
                      className="px-4 py-2 bg-white/10 hover:bg-[#FF4D00] border border-white/15 hover:border-[#FF4D00] text-white text-xs font-semibold rounded-md transition-colors tabular-nums cursor-pointer"
                    >
                      Quick Add · {featuredHeroProduct.name.replace("Men's ", '')} ({formatPrice(featuredHeroProduct.price, currency)})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sleek Dark Architectural 4-Column Performance Bar */}
      <div className="bg-[#111319] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="font-mono text-[11px] text-[#FF4D00] uppercase tracking-wider">
              01. Clinical + Ayurvedic
            </div>
            <div className="font-editorial text-lg font-semibold text-white mt-1">
              Engineered for Male Skin
            </div>
            <p className="text-xs text-[#C8C4BC] mt-1 leading-relaxed">
              2% Salicylic BHA, 15% Vitamin C, and Kasturi Manjal dosed for 25% thicker male skin.
            </p>
          </div>

          <div>
            <div className="font-mono text-[11px] text-[#FF4D00] uppercase tracking-wider">
              02. Dry-Touch Performance
            </div>
            <div className="font-editorial text-lg font-semibold text-white mt-1">
              0% Oil Slick or Flakes
            </div>
            <p className="text-xs text-[#C8C4BC] mt-1 leading-relaxed">
              Weightless serums sink in 10 seconds while Kaolin clay locks matte volume without crunch.
            </p>
          </div>

          <div>
            <div className="font-mono text-[11px] text-[#FF4D00] uppercase tracking-wider">
              03. Climate Built
            </div>
            <div className="font-editorial text-lg font-semibold text-white mt-1">
              42°C &amp; Hard-Water Tested
            </div>
            <p className="text-xs text-[#C8C4BC] mt-1 leading-relaxed">
              Fights helmet tan, humid breakout zones, and hard-water hair fall across Indian cities.
            </p>
          </div>

          <div>
            <div className="font-mono text-[11px] text-[#FF4D00] uppercase tracking-wider">
              04. Direct Dispatch
            </div>
            <div className="font-editorial text-lg font-semibold text-white mt-1">
              24-Hour India Fulfillment
            </div>
            <p className="text-xs text-[#C8C4BC] mt-1 leading-relaxed">
              Free express shipping over {currency.code === 'INR' ? '₹999' : formatPrice(50, currency)} · Code WELCOME15 for 15% off.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
