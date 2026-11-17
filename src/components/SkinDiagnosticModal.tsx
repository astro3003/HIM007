import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { Product, Currency } from '../types';
import { formatPrice } from '../utils/locationCurrency';
import { ProductArtwork } from './ProductArtwork';

interface SkinDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currency: Currency;
  onAddToCart: (product: Product) => void;
  onOpenProduct?: (product: Product) => void;
}

export const SkinDiagnosticModal: React.FC<SkinDiagnosticModalProps> = ({
  isOpen,
  onClose,
  products,
  currency,
  onAddToCart,
  onOpenProduct,
}) => {
  const [step, setStep] = useState<number>(1);
  const [skinType, setSkinType] = useState<string>('combination');
  const [primaryConcern, setPrimaryConcern] = useState<string>('blemishes');
  const [groomingGoal, setGroomingGoal] = useState<string>('face');
  const [addedAll, setAddedAll] = useState<boolean>(false);

  if (!isOpen) return null;

  const getRecommendedProducts = (): Product[] => {
    const byId = (id: string) => products.find((p) => p.id === id);

    // Step 1: Match Cleanser to Skin Type & Primary Concern
    const step1 =
      primaryConcern === 'blemishes' || skinType === 'oily'
        ? byId('prod-him-anti-acne-soap')
        : primaryConcern === 'dullness'
        ? byId('prod-him-ayurvedic-detan-soap')
        : byId('prod-him-face-wash');

    // Step 2: Match Treatment / Body Reset
    const step2 =
      groomingGoal === 'body'
        ? byId('prod-him-scrub-bar')
        : byId('prod-him-face-brightening-serum');

    // Step 3: Match Priority Grooming Finish
    const step3 =
      groomingGoal === 'beard'
        ? byId('prod-him-beard-serum')
        : groomingGoal === 'hair'
        ? byId('prod-him-hair-oil')
        : groomingGoal === 'scent'
        ? byId('prod-him-eau-de-parfum')
        : byId('prod-him-hair-clay');

    const fallbacks = [
      step1,
      step2,
      step3,
      byId('prod-him-scrub-bar'),
      byId('prod-him-face-wash'),
      byId('prod-him-face-brightening-serum'),
      ...products,
    ];

    const seen = new Set<string>();
    const result: Product[] = [];
    for (const candidate of fallbacks) {
      if (candidate && !seen.has(candidate.id)) {
        seen.add(candidate.id);
        result.push(candidate);
        if (result.length === 3) break;
      }
    }
    return result;
  };

  const recommendedRoutine = getRecommendedProducts();
  const subtotal = recommendedRoutine.reduce((sum, p) => sum + p.price, 0);
  const bundleDiscount = 0.15;
  const bundleTotal = Math.round(subtotal * (1 - bundleDiscount));

  const handleAddAllToBag = () => {
    recommendedRoutine.forEach((p) => onAddToCart(p));
    setAddedAll(true);
    setTimeout(() => {
      onClose();
      setAddedAll(false);
      setStep(1);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div
        className="relative w-full max-w-2xl bg-[#14171F] border border-white/15 rounded-2xl shadow-2xl overflow-hidden text-[#F6F4F0] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#111319]">
          <div className="flex items-center space-x-2">
            <span className="font-editorial text-xl font-bold tracking-tight text-white">HIM</span>
            <span className="text-[#C8C4BC] text-sm">/</span>
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[#FF4D00]">
              {step <= 3 ? `Diagnostic Step 0${step} of 03` : 'Your Personalized Routine'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#C8C4BC] hover:text-white hover:bg-[#1C202B] rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#FF4D00]">Question 01</span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white mt-1">
                  How would you describe your skin?
                </h3>
                <p className="text-sm text-[#C8C4BC] mt-1">
                  This helps us select the exact texture and active botanical ingredients for your face.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'normal', title: 'Normal & Balanced', desc: 'Neither too oily nor too dry, comfortable all day.' },
                  { id: 'combination', title: 'Combination', desc: 'Shiny forehead/nose (T-zone), with normal or dry cheeks.' },
                  { id: 'oily', title: 'Oily & Prone to Shine', desc: 'Frequent excess oil, visible pores, prone to blemishes.' },
                  { id: 'dry', title: 'Dry or Tight', desc: 'Feels tight after washing, needs rich moisture and comfort.' },
                  { id: 'sensitive', title: 'Sensitive & Reactive', desc: 'Easily reddens, reacts to harsh water or shaving.' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSkinType(opt.id)}
                    className={`p-4 text-left rounded-xl border transition-all cursor-pointer ${
                      skinType === opt.id
                        ? 'border-[#FF4D00] bg-[#1C202B] ring-1 ring-[#FF4D00]/40'
                        : 'border-white/10 bg-[#111319] hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{opt.title}</span>
                      {skinType === opt.id && <Check className="w-4 h-4 text-[#FF4D00]" />}
                    </div>
                    <p className="text-xs text-[#C8C4BC] mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#FF4D00]">Question 02</span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white mt-1">
                  What is your primary skin goal?
                </h3>
                <p className="text-sm text-[#C8C4BC] mt-1">
                  Select what you would most like to improve or maintain.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'blemishes', title: 'Purify & Regulate Shine', desc: 'Clear clogged pores, prevent breakouts, keep skin matte.' },
                  { id: 'dullness', title: 'Radiance & Even Tone', desc: 'Boost healthy glow, fade dark marks, smooth texture.' },
                  { id: 'dark_circles', title: 'Tackle Dark Circles & Fatigue', desc: 'De-puff under-eyes, look fresh and awake.' },
                  { id: 'hydration', title: 'Deep Lasting Hydration', desc: 'Eliminate dryness, soothe tightness and environmental stress.' },
                  { id: 'shave', title: 'Prevent Razor Burn & Irritation', desc: 'Soothe post-shave redness and calm sensitive stubble.' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPrimaryConcern(opt.id)}
                    className={`p-4 text-left rounded-xl border transition-all cursor-pointer ${
                      primaryConcern === opt.id
                        ? 'border-[#FF4D00] bg-[#1C202B] ring-1 ring-[#FF4D00]/40'
                        : 'border-white/10 bg-[#111319] hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{opt.title}</span>
                      {primaryConcern === opt.id && <Check className="w-4 h-4 text-[#FF4D00]" />}
                    </div>
                    <p className="text-xs text-[#C8C4BC] mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#FF4D00]">Question 03</span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white mt-1">
                  Any specific grooming priority?
                </h3>
                <p className="text-sm text-[#C8C4BC] mt-1">
                  Customize the final step of your complete routine.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'face', title: 'Complete Face & Body', desc: 'Daily gel wash, brightening serum, and clay styling.' },
                    { id: 'beard', title: 'Beard & Stubble Care', desc: 'Argan & jojoba drops to stop itch and coarse frizz.' },
                    { id: 'hair', title: 'Hair Fall & Root Strength', desc: 'Rosemary & almond oil to shield against hard water.' },
                    { id: 'body', title: 'Gym Recovery & De-Tan', desc: 'Activated charcoal + volcanic pumice scrub bar.' },
                    { id: 'scent', title: 'Evening Signature Scent', desc: '22% Pour Homme Eau De Parfum with 10-hour trail.' },
                  ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setGroomingGoal(opt.id)}
                    className={`p-4 text-left rounded-xl border transition-all cursor-pointer ${
                      groomingGoal === opt.id
                        ? 'border-[#FF4D00] bg-[#1C202B] ring-1 ring-[#FF4D00]/40'
                        : 'border-white/10 bg-[#111319] hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{opt.title}</span>
                      {groomingGoal === opt.id && <Check className="w-4 h-4 text-[#FF4D00]" />}
                    </div>
                    <p className="text-xs text-[#C8C4BC] mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center max-w-lg mx-auto">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#FF4D00] mb-1">
                  Built for {skinType.toUpperCase()} Skin
                </p>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
                  Your Tailored 3-Step HIM Rotation
                </h3>
                <p className="text-sm text-[#C8C4BC] mt-1">
                  Clinical-Ayurvedic formulas tested for Indian heat &amp; hard water.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendedRoutine.map((prod, idx) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-[#111319] rounded-xl border border-white/10 flex flex-col justify-between"
                  >
                    <div>
                      <div
                        onClick={() => onOpenProduct && onOpenProduct(prod)}
                        className={`relative aspect-[4/3] w-full rounded-lg bg-[#F5F3EF] overflow-hidden mb-2 ${
                          onOpenProduct ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
                        }`}
                      >
                        {prod.fieldImg ? (
                          <img src={prod.fieldImg} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <ProductArtwork artType={prod.artType} className="w-full h-full p-1" />
                        )}
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#0B0D12]/90 text-[10px] font-mono font-bold rounded-sm text-white">
                          Step 0{idx + 1}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono font-semibold text-[#FF4D00] uppercase">{prod.category}</div>
                      <div
                        onClick={() => onOpenProduct && onOpenProduct(prod)}
                        className={`font-bold text-xs text-white line-clamp-1 ${
                          onOpenProduct ? 'cursor-pointer hover:text-[#FF4D00] transition-colors' : ''
                        }`}
                      >
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-[#C8C4BC] mt-0.5">
                        {prod.naturalPercentage || 99}% Natural origin
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between tabular-nums">
                      <span className="text-xs font-bold text-white">{formatPrice(prod.price, currency)}</span>
                      <button
                        type="button"
                        onClick={() => onAddToCart(prod)}
                        className="text-[11px] font-semibold text-[#FF4D00] hover:text-white transition-colors cursor-pointer"
                      >
                        + Add item
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[#111319] border border-white/15 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">Complete 3-Step Routine Bundle</span>
                    <span className="px-2 py-0.5 bg-[#FF4D00] text-white text-[10px] font-bold rounded-sm">
                      SAVE 15%
                    </span>
                  </div>
                  <div className="text-xs text-[#C8C4BC] mt-0.5 tabular-nums">
                    Individual: <span className="line-through">{formatPrice(subtotal, currency)}</span> · Bundle price:{' '}
                    <strong className="text-white text-sm">{formatPrice(bundleTotal, currency)}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddAllToBag}
                  disabled={addedAll}
                  className="px-5 py-2.5 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-bold rounded-md transition-colors flex items-center shrink-0 cursor-pointer"
                >
                  {addedAll ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" />
                      Added to Bag!
                    </>
                  ) : (
                    <>
                      Add Full Routine
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/10 bg-[#111319] flex items-center justify-between">
          {step > 1 && step <= 3 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-[#C8C4BC] hover:text-white flex items-center cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-bold rounded-md transition-colors flex items-center cursor-pointer"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          ) : step === 3 ? (
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 py-2.5 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-bold rounded-md transition-colors flex items-center cursor-pointer"
            >
              See My Routine
              <Sparkles className="w-3.5 h-3.5 ml-1.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setStep(1);
                onClose();
              }}
              className="text-xs font-semibold text-[#C8C4BC] hover:text-white cursor-pointer"
            >
              Retake quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
