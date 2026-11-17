import React, { useState, useRef, useCallback } from 'react';
import { EvidenceModuleData } from '../types';
import { Sparkles, ZoomIn, ZoomOut, ShieldCheck, Check, Eye } from 'lucide-react';

interface RealFinishEvidenceModuleProps {
  evidence: EvidenceModuleData;
  productName: string;
}

export const RealFinishEvidenceModule: React.FC<RealFinishEvidenceModuleProps> = ({
  evidence,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'before' | 'after'>('slider');

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(clampedPercent);
  }, []);

  return (
    <div className="w-full bg-[#14171F] border border-white/10 rounded-2xl p-6 sm:p-8 my-8 text-[#F6F4F0]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#FF4D00]">
            <Sparkles className="w-4 h-4" />
            <span>HIM Before &amp; After Results</span>
          </div>
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white mt-1">
            {evidence.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#C8C4BC] mt-1 max-w-2xl">
            {evidence.subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#111319] border border-white/15 rounded-md text-xs font-semibold text-white">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            <span>Unretouched Male Skin</span>
          </span>
        </div>
      </div>

      {/* Main Evidence Canvas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-start">
        {/* Left: Interactive Split-Slider Visual Canvas */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center bg-[#111319] p-1 rounded-lg text-xs font-semibold border border-white/10">
              {(['slider', 'before', 'after'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    viewMode === mode
                      ? 'bg-[#FF4D00] text-white'
                      : 'text-[#C8C4BC] hover:text-white'
                  }`}
                >
                  {mode === 'slider' ? 'Split-Slider' : mode === 'before' ? 'Raw Before' : 'Finished After'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                isZoomed
                  ? 'bg-[#FF4D00] text-white border-[#FF4D00]'
                  : 'bg-[#111319] text-white border-white/15 hover:border-white/30'
              }`}
            >
              {isZoomed ? (
                <>
                  <ZoomOut className="w-3.5 h-3.5" />
                  <span>Reset Zoom</span>
                </>
              ) : (
                <>
                  <ZoomIn className="w-3.5 h-3.5 text-[#FF4D00]" />
                  <span>2x Stubble &amp; Pore Inspection</span>
                </>
              )}
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
            className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#0B0D12] select-none cursor-ew-resize border border-white/15"
          >
            {viewMode === 'slider' && (
              <>
                <img
                  src={evidence.afterImg}
                  alt="After: Subtle undetectable coverage"
                  className={`absolute inset-0 w-full h-full object-cover object-top pointer-events-none transition-transform duration-300 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3.5 right-3.5 bg-[#FF4D00]/90 text-white text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-sm pointer-events-none">
                  AFTER: HIM Result
                </span>

                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <img
                    src={evidence.beforeImg}
                    alt="Before: Unretouched skin with pores and stubble"
                    className={`w-full h-full object-cover object-top pointer-events-none transition-transform duration-300 ${
                      isZoomed ? 'scale-150' : 'scale-100'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-3.5 left-3.5 bg-[#0B0D12]/85 text-white text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-sm border border-white/15 pointer-events-none">
                    BEFORE: Raw Unretouched
                  </span>
                </div>

                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.6)] z-20 pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#FF4D00] text-white shadow-2xl flex items-center justify-center border-2 border-white font-mono text-xs">
                    ↔
                  </div>
                </div>
              </>
            )}

            {viewMode === 'before' && (
              <div className="relative w-full h-full">
                <img
                  src={evidence.beforeImg}
                  alt="Raw Before"
                  className={`w-full h-full object-cover object-top transition-transform duration-300 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3.5 left-3.5 bg-[#0B0D12]/85 text-white text-xs font-mono px-3 py-1 rounded-sm border border-white/15">
                  BEFORE: Visible pores, redness &amp; facial stubble
                </span>
              </div>
            )}

            {viewMode === 'after' && (
              <div className="relative w-full h-full">
                <img
                  src={evidence.afterImg}
                  alt="Finished After"
                  className={`w-full h-full object-cover object-top transition-transform duration-300 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3.5 right-3.5 bg-[#FF4D00]/90 text-white text-xs font-mono px-3 py-1 rounded-sm">
                  AFTER: Seamless natural matte finish
                </span>
              </div>
            )}
          </div>

          {/* Skin Context Caption */}
          <div className="mt-3 p-3.5 bg-[#111319] border border-white/10 rounded-lg flex items-start space-x-2.5 text-xs text-[#C8C4BC]">
            <Eye className="w-4 h-4 text-[#FF4D00] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Clinical Case Context: </strong>
              <span>{evidence.skinContext}</span>
            </div>
          </div>
        </div>

        {/* Right: Technical Evidence & Inspection Metrics */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#C8C4BC]">
              Evidence Inspection Points
            </h4>

            {evidence.evidencePoints.map((point, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-[#111319] border border-white/10 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-editorial text-sm font-bold text-white">
                    {point.title}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#1C202B] border border-white/10 text-[#FF4D00] rounded-sm">
                    {point.tag}
                  </span>
                </div>
                <p className="text-xs text-[#C8C4BC] leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#111319] border border-white/10 rounded-xl space-y-3">
            <div className="flex items-start space-x-2.5">
              <div className="w-5 h-5 rounded-full bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <strong className="block text-white font-semibold">Visible Pore Integrity</strong>
                <span className="text-[#C8C4BC]">{evidence.poreInspectionNotes}</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 pt-2 border-t border-white/10">
              <div className="w-5 h-5 rounded-full bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <strong className="block text-white font-semibold">Beard Follicle Non-Adhesion</strong>
                <span className="text-[#C8C4BC]">{evidence.beardFollicleNotes}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#0B0D12] border border-white/10 text-white rounded-xl space-y-3">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#FF4D00]">
              Dermatological Trial Results (n=120 Men)
            </div>

            <div className="space-y-2.5">
              {evidence.clinicalStats.map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-baseline justify-between text-xs tabular-nums">
                    <span className="font-medium text-white/90">{stat.claim}</span>
                    <span className="font-mono text-sm font-bold text-[#FF4D00]">
                      {stat.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF4D00] rounded-full transition-all duration-1000"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#C8C4BC] leading-tight">
                    {stat.subtext}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
