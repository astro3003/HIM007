import React from 'react';
import { ShoppingBag, Camera } from 'lucide-react';
import { Currency, ProductCategory } from '../types';
import { CURRENCIES } from '../catalog/products';
import { LocationDetectionResult } from '../utils/locationCurrency';
import { isAIStudioEditMode } from '../utils/environment';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenTracking: () => void;
  currentCurrency: Currency;
  onSelectCurrency: (c: Currency) => void;
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  onOpenIngredients: () => void;
  locationInfo?: LocationDetectionResult | null;
  onOpenAdmin?: () => void;
  isAdminActive?: boolean;
  lowStockCount?: number;
  onOpenDiagnostic?: () => void;
  onTriggerVoice?: () => void;
  isVoicePlaying?: boolean;
  onOpenMediaManager?: () => void;
  customImagesCount?: number;
  onNavigateHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenTracking,
  currentCurrency,
  onSelectCurrency,
  selectedCategory,
  onSelectCategory,
  onOpenIngredients,
  isAdminActive = false,
  onOpenDiagnostic,
  onOpenMediaManager,
  customImagesCount = 0,
  onNavigateHome,
}) => {
  const canEdit = isAIStudioEditMode(isAdminActive);

  const scrollToSection = (sectionId: string, cat?: ProductCategory) => {
    if (cat) {
      onSelectCategory(cat);
    }
    if (onNavigateHome) {
      onNavigateHome();
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0D12] border-b border-white/10 text-[#F6F4F0]">
      {/* Slim single-line top strip (<= 32px) */}
      <div className="bg-[#14171F] text-[#C8C4BC] px-4 h-8 flex items-center justify-center text-[11px] tracking-wide border-b border-white/10">
        <p className="truncate">
          Free express India delivery over {currentCurrency.code === 'INR' ? '₹999' : `${currentCurrency.symbol}50`} · Use code <span className="text-[#FF4D00] font-semibold">WELCOME15</span> · HIM — He Is Man
        </p>
      </div>

      {/* Strict 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => {
            if (onNavigateHome) onNavigateHome();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="HIM — He Is Man"
          className="flex items-baseline gap-2.5 text-white hover:text-[#FF4D00] transition-colors whitespace-nowrap shrink-0 cursor-pointer group"
        >
          <span className="inline-flex items-center text-[#FF4500] group-hover:text-[#FF621F] transition-colors">
            <svg
              viewBox="0 0 90 32"
              className="h-6 sm:h-[26px] w-auto overflow-visible"
              fill="currentColor"
              aria-hidden="true"
            >
              {/* H */}
              <rect x="0" y="2" width="6" height="28" />
              <rect x="18" y="2" width="6" height="28" />
              <rect x="6" y="13" width="12" height="5.5" />
              {/* I */}
              <rect x="31" y="2" width="6" height="28" />
              {/* M */}
              <path d="M44 30V2H53L59 20L65 2H74V30H68V11L61.6 30H56.4L50 11V30Z" />
              {/* . */}
              <circle cx="85" cy="26.4" r="3.6" />
            </svg>
          </span>
          <span className="hidden lg:inline font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-[#C8C4BC] group-hover:text-white transition-colors">
            He Is Man
          </span>
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#C8C4BC]">
          <button
            type="button"
            onClick={() => scrollToSection('products-section', 'ALL')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'border-[#FF4D00] text-white'
                : 'border-transparent hover:border-[#FF4D00] hover:text-white'
            }`}
          >
            All Drops
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('products-section', 'FACE')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              selectedCategory === 'FACE'
                ? 'border-[#FF4D00] text-white'
                : 'border-transparent hover:border-[#FF4D00] hover:text-white'
            }`}
          >
            Face Care
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('science-lab-section')}
            className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#FF4D00] hover:text-white transition-colors cursor-pointer"
          >
            Results Lab
          </button>
          {onOpenDiagnostic && (
            <button
              type="button"
              onClick={onOpenDiagnostic}
              className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#FF4D00] hover:text-white transition-colors cursor-pointer"
            >
              Routine Quiz
            </button>
          )}
          <button
            type="button"
            onClick={onOpenIngredients}
            className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#FF4D00] hover:text-white transition-colors cursor-pointer"
          >
            Actives
          </button>
          <button
            type="button"
            onClick={onOpenTracking}
            className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#FF4D00] hover:text-white transition-colors cursor-pointer"
          >
            Track Order
          </button>
        </nav>

        {/* Zone 3: Compact utility + Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center border border-white/15 bg-[#14171F] rounded-md p-0.5 text-[11px] font-mono">
            {(['INR', 'USD'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => CURRENCIES[code] && onSelectCurrency(CURRENCIES[code])}
                className={`px-2 py-1 rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currentCurrency.code === code
                    ? 'bg-white text-[#0B0D12] font-semibold'
                    : 'text-[#C8C4BC] hover:text-white'
                }`}
              >
                {code === 'INR' ? '₹ INR' : '$ USD'}
              </button>
            ))}
          </div>

          {canEdit && onOpenMediaManager && (
            <button
              type="button"
              onClick={onOpenMediaManager}
              className="p-2 bg-[#14171F] hover:bg-[#1E222D] text-white border border-white/15 rounded-md transition-colors cursor-pointer relative"
              title="Manage Site Photography"
            >
              <Camera className="w-4 h-4" />
              {customImagesCount > 0 && (
                <span className="sr-only">{customImagesCount} custom images</span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCart}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Bag</span>
            <span className="font-mono tabular-nums text-[11px] bg-black/25 px-1.5 py-0.5 rounded-sm">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
