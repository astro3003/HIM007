import React, { useState } from 'react';
import { ProductShade } from '../types';
import { Check, Sparkles, HelpCircle, ShieldCheck, RefreshCw } from 'lucide-react';

interface ShadeMatcherWidgetProps {
  shades: ProductShade[];
  selectedShadeId: string;
  onSelectShade: (shade: ProductShade) => void;
  productName?: string;
  isCompact?: boolean;
}

export const ShadeMatcherWidget: React.FC<ShadeMatcherWidgetProps> = ({
  shades,
  selectedShadeId,
  onSelectShade,
}) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const activeShade = shades.find((s) => s.id === selectedShadeId) || shades[0];

  const handleQuickMatch = (depth: 'fair' | 'light' | 'medium' | 'tan' | 'deep') => {
    let matchedId = 'shade-04';
    if (depth === 'fair') matchedId = 'shade-01';
    else if (depth === 'light') matchedId = 'shade-02';
    else if (depth === 'medium') matchedId = 'shade-03';
    else if (depth === 'tan') matchedId = 'shade-05';
    else if (depth === 'deep') matchedId = 'shade-06';

    const found = shades.find((s) => s.id === matchedId) || shades[0];
    if (found) {
      onSelectShade(found);
      setIsGuideOpen(false);
    }
  };

  return (
    <div className="w-full bg-[#14171F] border border-white/10 rounded-xl p-4 sm:p-5 text-[#F6F4F0]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white">
            Shade Matcher Widget
          </h4>
          <span className="text-[11px] text-[#C8C4BC]">
            · Calibrated for Men&apos;s Skin
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsGuideOpen(!isGuideOpen)}
          className="text-xs font-semibold text-[#FF4D00] hover:text-white flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Find My Shade</span>
        </button>
      </div>

      {/* Selected Shade Hero Strip */}
      {activeShade && (
        <div className="mb-4 p-3 bg-[#111319] border border-white/10 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-8 h-8 rounded-full border-2 border-white/30 shrink-0 flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: activeShade.hex }}
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-editorial text-sm font-bold text-white">
                  {activeShade.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#1C202B] text-[#F6F4F0] rounded-sm border border-white/10">
                  {activeShade.undertone}
                </span>
                <span className="text-[10px] text-[#C8C4BC] font-mono">
                  {activeShade.fitzpatrickScale}
                </span>
              </div>
              <p className="text-[11px] text-[#C8C4BC] mt-0.5 line-clamp-1">
                {activeShade.skinToneDesc}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center text-[10px] font-semibold text-[#22C55E] shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            <span>0% Stubble Cling</span>
          </div>
        </div>
      )}

      {/* Visual Calibrated Swatch Bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-[#C8C4BC] mb-2 font-medium">
          <span>Select Skin Tone Swatch:</span>
          <span>{shades.length} Calibrated Shades</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {shades.map((shade) => {
            const isSelected = shade.id === selectedShadeId;
            return (
              <button
                key={shade.id}
                type="button"
                onClick={() => onSelectShade(shade)}
                title={`${shade.name} - ${shade.skinToneDesc}`}
                className={`group relative flex flex-col items-center p-2 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#FF4D00] bg-[#1C202B] ring-1 ring-[#FF4D00]/40'
                    : 'border-white/10 bg-[#111319] hover:border-white/30'
                }`}
              >
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/25 relative flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{ backgroundColor: shade.hex }}
                >
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 text-[#0B0D12] stroke-[3]" />
                    </div>
                  )}
                </div>

                <span
                  className={`text-[10px] font-semibold mt-1.5 text-center leading-tight truncate w-full ${
                    isSelected ? 'text-white' : 'text-[#C8C4BC]'
                  }`}
                >
                  {shade.name.replace(/^\d+\s*/, '')}
                </span>
                <span className="text-[9px] text-[#C8C4BC]/70 font-mono mt-0.5">
                  {shade.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dermal Stubble & Formulation Guarantee Note */}
      <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#C8C4BC] gap-2">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FF4D00] shrink-0" />
          <span>
            <strong className="text-white">Self-Adjusting Micro-Pigments:</strong> Melts across pores &amp; 1-to-5-day stubble lines.
          </span>
        </div>
        <div className="flex items-center space-x-1 text-[10px] text-[#22C55E] font-semibold shrink-0">
          <RefreshCw className="w-3 h-3" />
          <span>Free 30-Day Shade Exchange</span>
        </div>
      </div>

      {/* Quick Interactive Shade Guide */}
      {isGuideOpen && (
        <div className="mt-4 p-4 bg-[#111319] border border-white/15 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-editorial text-sm font-bold text-white">
              How to pick your exact match in 10 seconds:
            </h5>
            <button
              type="button"
              onClick={() => setIsGuideOpen(false)}
              className="text-xs text-[#C8C4BC] hover:text-white font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-[#C8C4BC] mb-3">
            Click your predominant skin depth below. Our pigments self-adjust within 1 shade up or down.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'fair', label: 'Fair / Ivory', hint: 'Burns easily, razor redness', rec: '01 Fair Warm' },
              { id: 'light', label: 'Light Beige', hint: 'Tans slowly, dark circles', rec: '02 Light Neutral' },
              { id: 'medium', label: 'Medium Wheatish', hint: 'Classic South Asian wheat', rec: '03 Medium Wheat' },
              { id: 'tan', label: 'Medium Olive / Tan', hint: 'Indian golden, tans easily', rec: '04 Medium Olive' },
              { id: 'deep', label: 'Deep / Espresso', hint: 'Rich bronze to dark espresso', rec: '06 Deep Rich' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => handleQuickMatch(d.id as any)}
                className="p-2.5 bg-[#14171F] border border-white/10 hover:border-[#FF4D00] rounded-lg text-left transition-all group cursor-pointer"
              >
                <div className="font-bold text-xs text-white group-hover:text-[#FF4D00]">
                  {d.label}
                </div>
                <div className="text-[10px] text-[#C8C4BC] mt-0.5 line-clamp-1">{d.hint}</div>
                <div className="mt-1.5 text-[9px] font-mono font-bold text-[#FF4D00]">
                  → Pick {d.rec}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
