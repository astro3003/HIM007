import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Star, Check, Plus, Minus, Zap,
  Leaf, Camera, Edit3, Share2, RefreshCw, Truck
} from 'lucide-react';
import { Product, Currency, ProductShade } from '../types';
import { ProductArtwork } from './ProductArtwork';
import { ShadeMatcherWidget } from './ShadeMatcherWidget';
import { RealFinishEvidenceModule } from './RealFinishEvidenceModule';
import { PDPReviewsSection } from './PDPReviewsSection';
import { formatPrice } from '../utils/locationCurrency';
import { isAIStudioEditMode } from '../utils/environment';

interface ProductDetailPageProps {
  product: Product;
  currency: Currency;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number, selectedShade?: string) => void;
  onQuickBuy: (product: Product, quantity: number, selectedShade?: string) => void;
  onSelectProduct: (product: Product) => void;
  allProducts: Product[];
  isAdminActive?: boolean;
  onEditProduct?: (product: Product) => void;
  onOpenPhotoUpload?: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  currency,
  onBack,
  onAddToCart,
  onQuickBuy,
  onSelectProduct,
  allProducts,
  isAdminActive = false,
  onEditProduct,
  onOpenPhotoUpload,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedShade, setSelectedShade] = useState<ProductShade | null>(() => {
    if (product.shades && product.shades.length > 0) {
      if (product.selectedShadeId) {
        return product.shades.find((s) => s.id === product.selectedShadeId) || product.shades[0];
      }
      return product.shades[0];
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<'evidence' | 'actives' | 'specs' | 'how_to_use' | 'reviews'>('actives');
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const canEdit = isAIStudioEditMode(isAdminActive);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setQuantity(1);
    setActiveGalleryIdx(0);
    if (product.shades && product.shades.length > 0) {
      const match = product.selectedShadeId
        ? product.shades.find((s) => s.id === product.selectedShadeId) || product.shades[0]
        : product.shades[0];
      setSelectedShade(match);
    } else {
      setSelectedShade(null);
    }
  }, [product.id]);

  useEffect(() => {
    const handleScroll = () => {
      const next = window.scrollY > 450;
      setShowStickyBar((prev) => (prev === next ? prev : next));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedShade?.name);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 1800);
  };

  const handleInstantBuy = () => {
    onQuickBuy(product, quantity, selectedShade?.name);
  };

  const routineProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const formattedPrice = formatPrice(product.price * quantity, currency);
  const formattedComparePrice = product.compareAtPrice
    ? formatPrice(product.compareAtPrice * quantity, currency)
    : null;

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F6F4F0] pb-24">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="bg-[#111319] border-b border-white/10 sticky top-24 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-[#C8C4BC] truncate">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center space-x-1.5 font-semibold text-white hover:text-[#FF4D00] transition-colors shrink-0 group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Catalog</span>
            </button>
            <span>/</span>
            <span className="uppercase tracking-wider font-mono text-[11px] text-[#C8C4BC] shrink-0">
              {product.category}
            </span>
            <span>/</span>
            <span className="text-white font-semibold truncate max-w-xs sm:max-w-md">
              {product.name}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {canEdit && onEditProduct && (
              <button
                type="button"
                onClick={() => onEditProduct(product)}
                className="px-3 py-1 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-mono font-bold rounded-md transition-colors flex items-center space-x-1 cursor-pointer"
                title="Edit Product Specification (Admin)"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">EDIT SPEC</span>
              </button>
            )}
            {canEdit && onOpenPhotoUpload && (
              <button
                type="button"
                onClick={() => onOpenPhotoUpload(product)}
                className="p-1.5 text-[#C8C4BC] hover:text-white hover:bg-[#1C202B] rounded-md transition-colors cursor-pointer"
                title="Upload Photo (Admin)"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 text-[#C8C4BC] hover:text-white hover:bg-[#1C202B] rounded-md transition-colors relative cursor-pointer"
              title="Share Product"
            >
              <Share2 className="w-4 h-4" />
              {isCopied && (
                <span className="absolute -bottom-8 right-0 bg-[#FF4D00] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-md whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main PDP Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Packshot & Multi-Angle Gallery Stage */}
          <div className="lg:col-span-6 space-y-4">
            {(() => {
              const galleryList =
                product.gallery && product.gallery.length > 0
                  ? product.gallery
                  : product.fieldImg
                  ? [product.fieldImg]
                  : [];
              const activeImg = galleryList[activeGalleryIdx] || product.fieldImg;
              return (
                <>
                  <div className="relative aspect-square w-full bg-[#111319] rounded-2xl border border-white/15 overflow-hidden p-3 sm:p-4 flex items-center justify-center">
                    {activeImg ? (
                      <img
                        src={activeImg}
                        alt={`${product.name} view ${activeGalleryIdx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    ) : (
                      <ProductArtwork
                        artType={product.artType}
                        badge={product.badge}
                        className="w-full h-full"
                      />
                    )}

                    {/* Minimal Stamp */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                      {product.badge && (
                        <span className="px-2.5 py-1 bg-[#0B0D12]/90 text-white font-mono text-[10px] font-semibold uppercase tracking-wider rounded-sm border border-white/15">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4 font-mono text-[10px] text-white uppercase tracking-wider bg-[#0B0D12]/85 px-2.5 py-1 rounded-sm border border-white/15">
                      {product.specCode} · {product.naturalPercentage || 98}% Natural Origin
                    </div>

                    {galleryList.length > 1 && (
                      <div className="absolute bottom-4 right-4 font-mono text-[10px] text-white bg-[#0B0D12]/85 px-2.5 py-1 rounded-sm border border-white/15 tabular-nums">
                        {activeGalleryIdx + 1} / {galleryList.length}
                      </div>
                    )}
                  </div>

                  {galleryList.length > 1 && (
                    <div className="grid grid-cols-7 gap-2">
                      {galleryList.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveGalleryIdx(idx)}
                          className={`aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer bg-[#14171F] ${
                            activeGalleryIdx === idx
                              ? 'border-[#FF4D00] ring-2 ring-[#FF4D00]/40'
                              : 'border-white/15 opacity-70 hover:opacity-100'
                          }`}
                          aria-label={`View image ${idx + 1}`}
                        >
                          <img
                            src={imgUrl}
                            alt={`${product.name} thumbnail ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}

            {/* Formulation Markers */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-[#14171F] border border-white/10 rounded-xl">
                <strong className="block text-white font-semibold">100% In-House</strong>
                <span className="text-[11px] text-[#C8C4BC]">Formulated in India</span>
              </div>
              <div className="p-3 bg-[#14171F] border border-white/10 rounded-xl">
                <strong className="block text-white font-semibold">0% Stubble Cling</strong>
                <span className="text-[11px] text-[#C8C4BC]">Beard &amp; Pore Safe</span>
              </div>
              <div className="p-3 bg-[#14171F] border border-white/10 rounded-xl">
                <strong className="block text-white font-semibold">Zero Glare</strong>
                <span className="text-[11px] text-[#C8C4BC]">Natural Skin-Real</span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Shade Matcher & Actions */}
          <div className="lg:col-span-6 flex flex-col space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('reviews-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center text-[#FF4D00] hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-current mr-1" />
                  <span className="font-bold text-white text-sm mr-1 tabular-nums">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-[#C8C4BC] text-xs underline">
                    ({product.reviewsCount} reviews)
                  </span>
                </button>

                <span className="text-xs text-[#C8C4BC] font-mono font-semibold">
                  {product.volume}
                </span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-white leading-tight">
                {product.name}
              </h1>

              <p className="text-sm font-semibold text-[#FF4D00] mt-1.5">
                {product.tagline}
              </p>

              <p className="mt-3 text-xs sm:text-sm text-[#C8C4BC] leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price & Stock Strip */}
            <div className="p-4 bg-[#14171F] border border-white/10 rounded-xl flex items-baseline justify-between">
              <div className="flex items-baseline space-x-3 tabular-nums">
                <span className="font-editorial text-3xl font-bold text-white">
                  {formattedPrice}
                </span>
                {formattedComparePrice && (
                  <span className="text-sm text-[#C8C4BC] line-through">
                    {formattedComparePrice}
                  </span>
                )}
                {product.compareAtPrice && (
                  <span className="px-2 py-0.5 bg-[#FF4D00]/15 text-[#FF4D00] font-bold text-xs rounded-sm">
                    SAVE {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                  </span>
                )}
              </div>

              <div className="text-right text-[11px] text-[#C8C4BC]">
                <span>Taxes included</span>
                <span className="block text-[#22C55E] font-semibold">In Stock · Ready to Ship</span>
              </div>
            </div>

            {/* Shade Matcher Widget */}
            {product.shades && product.shades.length > 0 && (
              <ShadeMatcherWidget
                shades={product.shades}
                selectedShadeId={selectedShade?.id || product.shades[0].id}
                onSelectShade={(shade) => setSelectedShade(shade)}
                productName={product.name}
              />
            )}

            {/* Quantity Stepper & Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#C8C4BC]">
                  Select Quantity
                </span>
                <div className="flex items-center bg-[#14171F] border border-white/15 rounded-md p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-sm hover:bg-[#1C202B] flex items-center justify-center text-white transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-white tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-sm hover:bg-[#1C202B] flex items-center justify-center text-white transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAdd}
                  className={`py-3.5 px-6 rounded-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 cursor-pointer tabular-nums ${
                    isAddedFeedback
                      ? 'bg-[#1F7A4C] text-white'
                      : 'bg-[#FF4D00] hover:bg-[#E03E1A] text-white'
                  }`}
                >
                  {isAddedFeedback ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to Bag · {formattedPrice}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleInstantBuy}
                  className="py-3.5 px-6 bg-[#14171F] hover:bg-white text-white hover:text-[#0B0D12] border border-white/20 rounded-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Instant Checkout</span>
                </button>
              </div>
            </div>

            {/* Delivery & Assurance */}
            <div className="p-4 bg-[#14171F] border border-white/10 rounded-xl space-y-2.5 text-xs text-[#C8C4BC]">
              <div className="flex items-center space-x-2.5">
                <Truck className="w-4 h-4 text-[#FF4D00] shrink-0" />
                <span>
                  <strong className="text-white">Fast Dispatch:</strong> Orders placed before 14:00 ship today via Delhivery Air Priority.
                </span>
              </div>
              <div className="flex items-center space-x-2.5">
                <RefreshCw className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>
                  <strong className="text-white">30-Day Dermal Satisfaction:</strong> Free shade exchanges &amp; zero hassle returns.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Before & After Clinical Results Section */}
        {product.beforeAfterEvidence && (
          <div id="evidence-section" className="mt-12">
            <RealFinishEvidenceModule
              evidence={product.beforeAfterEvidence}
              productName={product.name}
            />
          </div>
        )}

        {/* Technical Specifications & Formulations Tabs */}
        <div className="my-10 bg-[#14171F] border border-white/10 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center border-b border-white/10 gap-8 text-xs font-bold uppercase tracking-wider overflow-x-auto">
            {[
              { id: 'actives', label: 'Key Actives & Science' },
              { id: 'specs', label: 'Technical Specifications' },
              { id: 'how_to_use', label: 'Barber & Usage Protocol' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 transition-colors border-b-2 shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#FF4D00] text-white'
                    : 'border-transparent text-[#C8C4BC] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === 'actives' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.keyActives.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-[#111319] border border-white/10 rounded-xl flex items-start space-x-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                      <Leaf className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-editorial text-sm font-semibold text-white">
                        {act.split('(')[0]}
                      </div>
                      {act.includes('(') && (
                        <div className="text-xs text-[#C8C4BC] mt-0.5">
                          {act.substring(act.indexOf('('))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.technicalSpecs.map((spec, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-[#111319] border border-white/10 rounded-lg text-xs"
                  >
                    <span className="text-[#C8C4BC] font-medium">{spec.label}</span>
                    <span className="font-semibold text-white text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'how_to_use' && (
              <div className="space-y-3 max-w-3xl">
                {product.usageProtocol.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3.5 p-4 bg-[#111319] border border-white/10 rounded-xl text-xs sm:text-sm"
                  >
                    <span className="w-6 h-6 rounded-md bg-[#FF4D00] text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      {idx + 1}
                    </span>
                    <span className="text-[#EDEAE4] mt-0.5 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div id="reviews-section">
          <PDPReviewsSection
            reviews={product.reviewsList || [
              {
                id: 'rev-default-01',
                author: 'Vikram M.',
                rating: 5,
                date: '3 days ago',
                title: 'Clean, effective, and completely non-greasy',
                comment: `Been using ${product.name} for three weeks. Absorbs fast and leaves no sticky feeling. Highly recommended for daily use.`,
                verified: true,
                helpfulCount: 18,
              },
            ]}
            rating={product.rating}
            totalReviewsCount={product.reviewsCount}
            productName={product.name}
          />
        </div>

        {/* Complete The Routine Recommendations (shown when 2+ products are live) */}
        {routineProducts.length > 0 && (
        <div className="my-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#FF4D00]">
                Synergistic Regimen
              </div>
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white mt-0.5">
                Complete The HIM Routine
              </h3>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-semibold text-[#FF4D00] hover:underline cursor-pointer"
            >
              View Full Catalog →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {routineProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="bg-[#14171F] border border-white/10 hover:border-[#FF4D00] rounded-xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="aspect-[4/3] w-full bg-[#F5F3EF] rounded-lg overflow-hidden mb-3 border border-white/10 flex items-center justify-center relative">
                    {p.fieldImg ? (
                      <img
                        src={p.fieldImg}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ProductArtwork artType={p.artType} className="w-full h-full" />
                    )}
                    {p.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#0B0D12]/90 text-white text-[9px] font-mono uppercase rounded-sm">
                        {p.badge}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-[#C8C4BC] font-mono">{p.volume}</div>
                  <h4 className="font-editorial text-sm font-bold text-white group-hover:text-[#FF4D00] transition-colors line-clamp-1 mt-0.5">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-[#C8C4BC] line-clamp-2 mt-1">
                    {p.tagline}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10">
                  <span className="font-bold text-sm text-white tabular-nums">
                    {formatPrice(p.price, currency)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(p, 1);
                    }}
                    className="px-3 py-1.5 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-[11px] font-bold rounded-md transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* Floating Sticky Purchase Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#111319]/95 backdrop-blur-md border-t border-white/15 px-4 py-3 shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 pr-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5F3EF] border border-white/15 shrink-0 flex items-center justify-center">
                {product.fieldImg ? (
                  <img
                    src={product.fieldImg}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <ProductArtwork artType={product.artType} className="w-full h-full" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-editorial text-sm font-bold text-white truncate">
                  {product.name}
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-[#C8C4BC] tabular-nums">
                  <span className="font-bold text-white">{formattedPrice}</span>
                  {selectedShade && (
                    <span className="inline-flex items-center space-x-1">
                      <span>•</span>
                      <span
                        className="w-2 h-2 rounded-full border border-white/30"
                        style={{ backgroundColor: selectedShade.hex }}
                      />
                      <span className="truncate">{selectedShade.name}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleAdd}
                className="py-2.5 px-5 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-bold rounded-md transition-colors flex items-center space-x-1.5 cursor-pointer tabular-nums"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add to Bag · </span>
                <span>{formattedPrice}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
