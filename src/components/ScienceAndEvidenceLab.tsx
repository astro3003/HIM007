import React, { useState, useRef, useCallback } from 'react';
import { ArrowRight, Check, Minus, ZoomIn, ZoomOut } from 'lucide-react';
import { Product, Currency } from '../types';
import { formatPrice } from '../utils/locationCurrency';
import { isSoapAvailableForSale } from '../utils/sellable';

interface ScienceAndEvidenceLabProps {
  products: Product[];
  currency: Currency;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

type LabTabId = string;

export const ScienceAndEvidenceLab: React.FC<ScienceAndEvidenceLabProps> = ({
  products,
  currency,
  onOpenProduct,
  onAddToCart,
}) => {
  const [activeTab, setActiveTab] = useState<string>('product-0');
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const evidenceProducts = products.filter((p) => Boolean(p.beforeAfterEvidence)).slice(0, 12);
  const activeEvidenceIdx = activeTab.startsWith('product-')
    ? Math.min(Number(activeTab.replace('product-', '')) || 0, Math.max(0, evidenceProducts.length - 1))
    : 0;
  const activeEvidenceProduct = evidenceProducts[activeEvidenceIdx] || products[0];
  const evidence = activeEvidenceProduct?.beforeAfterEvidence;

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clamped = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(clamped);
  }, []);

  const formulaComparison = [
    {
      metric: 'Male Epidermal Penetration',
      him: 'Calibrated actives like 2% Salicylic & 15% Vitamin C absorb in 10s with zero tackiness',
      traditional: 'Thick cream bases sit above surface oil and trap post-commute grime',
    },
    {
      metric: 'Sun Tan & Pollution Defense',
      him: 'Kasturi Manjal, Kashmiri Saffron & Charcoal lift helmet tan lines and city dust',
      traditional: 'Harsh foaming detergents strip barrier lipids and leave tight dry patches',
    },
    {
      metric: '42°C & Hard-Water Resilience',
      him: 'Kaolin hair clay and Rosemary-Almond oil hold volume and shield brittle roots',
      traditional: 'Greasy waxes melt by afternoon and mineral oils clog scalp follicles',
    },
    {
      metric: 'Clean Formulation Spec',
      him: '0% sulfates, parabens, mineral oil, or phthalates across every HIM formula',
      traditional: 'Cheap surfactants and heavy synthetic fragrances that trigger razor burn',
    },
  ];

  const labTabs = [
    ...evidenceProducts.map((p, idx) => ({
      id: `product-${idx}`,
      label: `0${idx + 1}. ${p.name.length > 26 ? `${p.name.slice(0, 26)}…` : p.name}`,
    })),
    { id: 'comparison', label: `0${evidenceProducts.length + 1}. HIM vs Ordinary` },
  ];

  return (
    <section id="science-lab-section" className="cv-section py-16 sm:py-24 bg-[#111319] border-b border-white/10 text-[#F6F4F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-8 border-b border-white/10 gap-6">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-[#FF4D00]">
              HIM — He Is Man · Performance Lab
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight mt-1.5 text-balance">
              Unfiltered results. Proven on Indian skin.
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-[#C8C4BC] leading-relaxed">
              Drag the split-slider across real Before &amp; After routines or compare how HIM clinical-Ayurvedic formulations outperform generic grooming.
            </p>
          </div>

          {/* Interactive Module Switcher */}
          <div className="flex items-center gap-1 bg-[#14171F] p-1 rounded-lg border border-white/10 overflow-x-auto no-scrollbar shrink-0">
            {labTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSliderPos(50);
                  setIsZoomed(false);
                }}
                className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#FF4D00] text-white font-semibold'
                    : 'text-[#C8C4BC] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Canvas */}
        {activeTab === 'comparison' ? (
          <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-12 border border-white/10 rounded-xl overflow-hidden bg-[#14171F]">
              <div className="md:col-span-4 bg-[#0B0D12] p-6 sm:p-8 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#FF4D00] font-semibold">
                    He Is Man Biology
                  </p>
                  <h3 className="font-editorial text-2xl font-semibold text-white mt-2">
                    Why Indian male skin needs HIM
                  </h3>
                  <p className="text-xs sm:text-sm text-[#C8C4BC] mt-3 leading-relaxed">
                    Men&apos;s facial dermis is structurally denser, richer in collagen, and exposed to higher sebum oxidation and hard-water mineral residue. Standard creams sit above the pore opening. HIM delivers targeted botanical actives beneath the surface without heavy occlusion.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 tabular-nums">
                  <div>
                    <div className="font-editorial text-3xl font-semibold text-[#FF4D00]">+25%</div>
                    <div className="text-[11px] text-[#C8C4BC] mt-0.5">Thicker male skin density addressed</div>
                  </div>
                  <div>
                    <div className="font-editorial text-3xl font-semibold text-[#FF4D00]">10s</div>
                    <div className="text-[11px] text-[#C8C4BC] mt-0.5">Surface absorption to zero-glare matte</div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 bg-[#14171F] divide-y divide-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-12 px-6 py-4 bg-[#111319] text-[11px] font-mono uppercase tracking-wider text-[#C8C4BC]">
                  <div className="sm:col-span-3">Parameter</div>
                  <div className="sm:col-span-5 text-[#FF4D00] font-semibold">HIM (He Is Man)</div>
                  <div className="sm:col-span-4 hidden sm:block">Conventional Brands</div>
                </div>
                {formulaComparison.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 px-6 py-5 gap-3 sm:gap-4 items-start">
                    <div className="sm:col-span-3 text-xs font-semibold text-white">
                      {row.metric}
                    </div>
                    <div className="sm:col-span-5 flex items-start gap-2 text-xs text-[#F6F4F0]">
                      <Check className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{row.him}</span>
                    </div>
                    <div className="sm:col-span-4 flex items-start gap-2 text-xs text-[#C8C4BC]">
                      <Minus className="w-4 h-4 text-[#57534E] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{row.traditional}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          evidence &&
          activeEvidenceProduct && (
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left: Draggable Before/After Split-Slider */}
              <div className="lg:col-span-7">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#C8C4BC]">
                    Drag divider · Unretouched male skin
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsZoomed(!isZoomed)}
                    className={`px-3 py-1.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isZoomed
                        ? 'bg-[#FF4D00] text-white border-[#FF4D00]'
                        : 'bg-[#14171F] text-white border-white/15 hover:border-white/30'
                    }`}
                  >
                    {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                    <span>{isZoomed ? 'Reset Zoom' : 'Inspect Pores (1.5x)'}</span>
                  </button>
                </div>

                <div
                  ref={containerRef}
                  onMouseDown={(e) => {
                    setIsDragging(true);
                    handleMove(e.clientX);
                  }}
                  onMouseMove={(e) => {
                    if (isDragging) handleMove(e.clientX);
                  }}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                  onTouchStart={(e) => {
                    setIsDragging(true);
                    if (e.touches[0]) handleMove(e.touches[0].clientX);
                  }}
                  onTouchMove={(e) => {
                    if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX);
                  }}
                  onTouchEnd={() => setIsDragging(false)}
                  className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-white/15 bg-[#0B0D12] select-none cursor-ew-resize"
                >
                  {/* Right Layer: After */}
                  <img
                    src={evidence.afterImg}
                    alt={`After applying ${activeEvidenceProduct.name}`}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className={`absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 ${
                      isZoomed ? 'scale-150' : 'scale-100'
                    }`}
                  />

                  {/* Left Clipped Layer: Before */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                  >
                    <img
                      src={evidence.beforeImg}
                      alt={`Before applying ${activeEvidenceProduct.name}`}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover object-top transition-transform duration-300 ${
                        isZoomed ? 'scale-150' : 'scale-100'
                      }`}
                    />
                  </div>

                  {/* Labels */}
                  <span className="absolute top-3.5 left-3.5 z-20 px-2.5 py-1 bg-[#0B0D12]/90 text-white text-[11px] font-mono uppercase tracking-wider rounded-sm pointer-events-none border border-white/15">
                    Before
                  </span>
                  <span className="absolute top-3.5 right-3.5 z-20 px-2.5 py-1 bg-[#FF4D00] text-white text-[11px] font-mono uppercase tracking-wider rounded-sm pointer-events-none">
                    After · HIM Result
                  </span>

                  {/* Vertical Split Handle */}
                  <div
                    className="absolute top-0 bottom-0 z-30 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.45)] pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#FF4D00] border-2 border-white text-white flex items-center justify-center shadow-lg text-xs font-mono">
                      ↔
                    </div>
                  </div>
                </div>

                {/* Accessible Slider Control */}
                <div className="mt-3 flex items-center justify-between gap-4 text-xs text-[#C8C4BC]">
                  <span className="truncate">{evidence.beforeLabel}</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(sliderPos)}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    aria-label="Before and after comparison position"
                    className="w-28 accent-[#FF4D00] cursor-pointer shrink-0"
                  />
                  <span className="truncate text-right">{evidence.afterLabel}</span>
                </div>
              </div>

              {/* Right: Clinical Stats & Direct PDP Launch */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#FF4D00] font-semibold">
                    {activeEvidenceProduct.coverageLevel || 'Clinical-Ayurvedic Spec'} ·{' '}
                    {activeEvidenceProduct.finishType || 'Zero-Greasy Matte Finish'}
                  </p>
                  <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-white mt-1.5">
                    {activeEvidenceProduct.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#C8C4BC] mt-2 leading-relaxed">
                    {evidence.skinContext}
                  </p>
                </div>

                {/* Tabular Clinical Stats */}
                <div className="border-t border-b border-white/10 divide-y divide-white/10">
                  {evidence.clinicalStats.map((stat, idx) => (
                    <div key={idx} className="py-3.5 flex items-baseline gap-4">
                      <span className="font-editorial text-2xl font-semibold text-[#FF4D00] tabular-nums w-16 shrink-0">
                        {stat.percentage}%
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-white">{stat.claim}</div>
                        <div className="text-[11px] text-[#C8C4BC] mt-0.5 leading-snug">
                          {stat.subtext}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shade Range Preview + Actions */}
                <div className="space-y-4">
                  {activeEvidenceProduct.shades && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#C8C4BC]">Calibrated Indian &amp; global skin tones</span>
                      <div className="flex items-center -space-x-1">
                        {activeEvidenceProduct.shades.map((s) => (
                          <span
                            key={s.id}
                            title={s.name}
                            className="w-5 h-5 rounded-full border-2 border-[#111319] ring-1 ring-white/25"
                            style={{ backgroundColor: s.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenProduct(activeEvidenceProduct)}
                      className="flex-1 py-3 px-5 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                    >
                      <span>Open Shade Matcher &amp; Full Spec</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddToCart(activeEvidenceProduct)}
                      className="py-3 px-5 bg-[#14171F] hover:bg-[#1C202B] border border-white/15 text-white text-xs font-semibold rounded-md transition-colors whitespace-nowrap tabular-nums cursor-pointer"
                    >
                      {isSoapAvailableForSale(activeEvidenceProduct)
                        ? `Add · ${formatPrice(activeEvidenceProduct.price, currency)}`
                        : 'Request Free Sample'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};
