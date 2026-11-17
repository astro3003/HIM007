import React from 'react';
import { X, ShieldCheck, Check, Leaf } from 'lucide-react';

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IngredientModal: React.FC<IngredientModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const cleanCharterActives = [
    {
      name: '15% Ethyl Ascorbic Acid & 5% Niacinamide',
      origin: 'Brightening Vitamin Complex',
      purpose: 'Fades post-acne dark marks, tightens visible pores, and evens sun-tanned tone with 15-second matte absorption.',
    },
    {
      name: '2% Salicylic Acid (BHA) & Neem Extract',
      origin: 'Deep-Pore Clarifying Active',
      purpose: 'Unclogs trapped facial sebum, dissolves blackheads, and stops razor bumps and acne bacteria.',
    },
    {
      name: 'Kashmiri Saffron, Red Sandalwood & Goat Milk',
      origin: 'Ayurvedic De-Tan Botanicals',
      purpose: 'Brightens bike-commute neck and forehead tan lines while keeping skin barrier pH-balanced and hydrated.',
    },
    {
      name: 'Activated Bamboo Charcoal, Volcanic Pumice & Kasturi Manjal',
      origin: 'Detox & Muscle Reset Minerals',
      purpose: 'Pulls post-workout sweat and urban pollution from pores while gently exfoliating rough elbows and shoulders.',
    },
    {
      name: 'Rosemary Essential Oil, Sweet Almond & Bhringraj',
      origin: 'Cold-Pressed Scalp Nutrition',
      purpose: 'Fortifies hair roots against metro hard-water hair fall and rinses clean in a single wash with zero mineral oil.',
    },
    {
      name: 'Moroccan Argan, Golden Jojoba & Kaolin Clay',
      origin: 'Dry-Touch Hair & Beard Spec',
      purpose: 'Softens wire-coarse beard hair to prevent beardruff while sculpting reworkable, zero-shine hair volume.',
    },
  ];

  const bannedList = [
    '0% Sulfates (SLS / SLES)',
    '0% Synthetic Parabens',
    '0% Silicones & Microplastics',
    '0% Mineral Oils & Petrolatum',
    '0% Synthetic Dyes & Phthalates',
    '0% Animal Ingredients (100% Vegan)',
    '0% Harsh Drying Alcohols',
    '0% Endocrine Disruptors',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-[#14171F] border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-auto text-[#F6F4F0]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#111319] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Leaf className="w-5 h-5 text-[#22C55E]" />
            <div>
              <h3 className="font-editorial text-lg font-bold text-white leading-none">
                The HIM Clean Formulation Charter
              </h3>
              <p className="text-xs text-[#C8C4BC] mt-0.5">Formulated &amp; tested in India</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#C8C4BC] hover:text-white hover:bg-[#1C202B] rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="p-4 bg-[#111319] border border-white/10 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-[#FF4D00] uppercase tracking-wider">Our Pledge</div>
              <div className="text-base font-bold text-white mt-0.5 font-editorial">95% to 100% Natural Origin</div>
              <div className="text-xs text-[#C8C4BC] mt-0.5">Every ingredient has a clear purpose. No fillers, no harmful synthetics.</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#14171F] flex items-center justify-center shrink-0 border border-white/15">
              <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
            </div>
          </div>

          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#C8C4BC] mb-3">
              Key Botanical &amp; Clean Actives
            </h4>
            <div className="space-y-2.5">
              {cleanCharterActives.map((act, i) => (
                <div key={i} className="p-3.5 bg-[#111319] border border-white/10 rounded-xl">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-white">{act.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#1C202B] text-[#C8C4BC] rounded-sm border border-white/10">
                      {act.origin}
                    </span>
                  </div>
                  <p className="text-xs text-[#C8C4BC] mt-1">{act.purpose}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#C8C4BC] mb-3">
              Strictly Excluded (0% Tolerance)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {bannedList.map((item, i) => (
                <div key={i} className="p-2.5 bg-[#111319] border border-white/10 rounded-lg flex items-center space-x-2 text-xs text-white">
                  <Check className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                  <span className="font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#111319] border-t border-white/10 px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-[#C8C4BC]">
            Dermatologically &amp; clinically tested on all skin tones.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
