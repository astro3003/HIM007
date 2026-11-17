import React from 'react';
import { Check, X, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface ComparisonSectionProps {
  onExploreProducts?: () => void;
}

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({ onExploreProducts }) => {
  const himAdvantages = [
    {
      title: '95% to 100% Natural Origin Ingredients',
      desc: 'Formulated with organic aloe vera, zinc PCA, shea butter, and essential plant oils.',
    },
    {
      title: '100% Sulfate, Paraben & Silicone Free',
      desc: 'Never strips your skin’s natural lipid barrier or clogs pores with artificial synthetic coatings.',
    },
    {
      title: 'Made & Tested in India',
      desc: 'Formulated in certified Indian cosmetic laboratories under the world’s strictest safety regulations.',
    },
    {
      title: 'Quick, Effortless 2-Minute Daily Routines',
      desc: 'Absorbs in 10 seconds with a zero-shine velvet matte finish. Easy to use every morning.',
    },
    {
      title: 'Eco-Designed & 100% Recyclable Packaging',
      desc: 'Tubes and bottles made from recycled plastics and recyclable amber glass.',
    },
  ];

  const othersDisadvantages = [
    {
      title: 'Harsh Petrochemical Surfactants',
      desc: 'Synthetic SLS and sulfates that leave skin feeling tight, dry, and irritated.',
    },
    {
      title: 'Synthetic Silicones & Microplastics',
      desc: 'Create an artificial smooth illusion while suffocating pores and harming waterways.',
    },
    {
      title: 'Overpowering Synthetic Fragrances',
      desc: 'Cheap chemical musks that trigger redness and flare up sensitive post-shave skin.',
    },
    {
      title: 'Greasy Residue & Forehead Shine',
      desc: 'Heavy textures that leave a shiny or sticky film on men’s naturally oilier skin.',
    },
    {
      title: 'Excessive Non-Recyclable Waste',
      desc: 'Multi-layer plastic packaging that ends up in landfills.',
    },
  ];

  return (
    <section id="comparison-section" className="py-16 sm:py-24 bg-[#F7F4F1] border-b border-[#E7E7E7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Headline */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-white border border-[#E7E7E7] rounded-full text-xs font-semibold text-[#E31B23] mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE HIM STANDARD</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#0A0029] tracking-tight">
            Why choose HIM?
          </h2>
          <p className="mt-2 text-base text-[#6C757D] leading-relaxed max-w-2xl mx-auto">
            Grooming shouldn't be complicated, full of chemicals, or leave your skin feeling worse. Here is how HIM compares to traditional brands.
          </p>
        </div>

        {/* Master Comparison Split Card */}
        <div className="bg-white border border-[#E7E7E7] rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          
          {/* LEFT SIDE: HIM */}
          <div className="p-8 sm:p-10 bg-[#F7F4F1]/60 border-b lg:border-b-0 lg:border-r border-[#E7E7E7] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E7E7E7]">
                <div className="flex items-center space-x-3">
                  <span className="font-editorial text-2xl font-black text-[#0A0029]">HIM</span>
                  <span className="text-xs px-2.5 py-0.5 bg-[#0A0029] text-white font-bold rounded-full">
                    CLEAN GROOMING
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#28A745] flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1" />
                  Indian Lab Certified
                </span>
              </div>

              <div className="space-y-6">
                {himAdvantages.map((adv, idx) => (
                  <div key={idx} className="flex items-start space-x-3.5">
                    <div className="w-6 h-6 rounded-full bg-[#28A745] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#0A0029]">{adv.title}</div>
                      <div className="text-xs text-[#6C757D] mt-0.5 leading-relaxed">{adv.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {onExploreProducts && (
              <div className="mt-8 pt-6 border-t border-[#E7E7E7]">
                <button
                  onClick={onExploreProducts}
                  className="px-6 py-3 bg-[#0A0029] hover:bg-[#E31B23] text-white text-xs font-bold rounded-full transition-all flex items-center space-x-2 shadow-xs"
                >
                  <span>Explore our clean formulas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: TRADITIONAL BRANDS */}
          <div className="p-8 sm:p-10 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E7E7E7]">
                <span className="font-editorial text-xl font-bold text-[#6C757D]">
                  Traditional Mass Market
                </span>
                <span className="text-xs px-2.5 py-0.5 bg-[#F4F4F7] text-[#6C757D] font-semibold rounded-full border border-[#E7E7E7]">
                  Conventional
                </span>
              </div>

              <div className="space-y-6">
                {othersDisadvantages.map((dis, idx) => (
                  <div key={idx} className="flex items-start space-x-3.5">
                    <div className="w-6 h-6 rounded-full bg-[#F4F4F7] text-[#6C757D] flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3.5 h-3.5 stroke-[2]" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[#6C757D]">{dis.title}</div>
                      <div className="text-xs text-[#6C757D] mt-0.5 leading-relaxed">{dis.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E7E7E7] text-xs text-[#6C757D]">
              We believe men deserve transparent, healthy skincare that feels good and actually works.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
