import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Check, Camera, Upload, Star } from 'lucide-react';
import { Product } from '../types';
import { isAIStudioEditMode } from '../utils/environment';

interface BeforeAfterSectionProps {
  onQuickBuy?: (product: Product) => void;
  onOpenProduct?: (product: Product) => void;
  products?: Product[];
  isAdminActive?: boolean;
  customImages?: Record<string, string>;
  onUpdateImage?: (id: string, dataUrl: string) => void;
}

interface TransformationItem {
  id: string;
  cardTitle: string;
  name: string;
  age: number;
  concern: string;
  routine: string;
  productId: string;
  stats: string;
  beforeImg: string;
  afterImg: string;
  beforeFilter: string;
  afterFilter: string;
  points: string[];
}

export const BeforeAfterSection: React.FC<BeforeAfterSectionProps> = ({
  onQuickBuy,
  onOpenProduct,
  products = [],
  isAdminActive = false,
  customImages = {},
  onUpdateImage,
}) => {
  const [activeViewMode, setActiveViewMode] = useState<Record<string, 'split' | 'before' | 'after'>>({
    'case-1': 'split',
    'case-2': 'split',
    'case-3': 'split',
  });
  const [draggingCaseId, setDraggingCaseId] = useState<string | null>(null);
  const [localCustomImages, setLocalCustomImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('him_custom_ba_images');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleFileForCase = (caseId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (.jpg, .png, .webp)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (dataUrl) {
        setLocalCustomImages((prev) => {
          const next = { ...prev, [`ba-${caseId}`]: dataUrl };
          try {
            localStorage.setItem('him_custom_ba_images', JSON.stringify(next));
          } catch {}
          return next;
        });

        // Sync with backend API
        fetch('/api/images/custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `ba-${caseId}`,
            base64Data: dataUrl,
            section: 'before-after',
          }),
        }).catch(() => {});

        if (onUpdateImage) {
          onUpdateImage(`ba-${caseId}`, dataUrl);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const canEdit = isAIStudioEditMode(isAdminActive);

  const cases: TransformationItem[] = [
    {
      id: 'case-1',
      cardTitle: 'Pollution, Humid T-Zone & Active Breakouts',
      name: 'Rohan S.',
      age: 28,
      concern: 'Humid T-Zone, Pollution Buildup & Clogged Pores',
      routine: 'HIM Face Wash + Anti-Acne & Deep Pore Clarifying Soap',
      productId: 'prod-him-anti-acne-soap',
      stats: '94% LESS OIL & SHINE',
      beforeImg: '/assets/aistudio/Skincare_product_skin_transforma__2K_20261015013810_ca0f1ea3.jpg',
      afterImg: '/assets/aistudio/Man_applying_skincare_soap_2K_20261015013509_8c1368e5.jpg',
      beforeFilter: 'contrast-115 saturate-120 brightness-90',
      afterFilter: 'contrast-100 brightness-105 saturate-100',
      points: [
        'Controls excess sebum in high-humidity weather without stripping moisture',
        'Clears active micro-dust and urban pollution from deep within pores',
        'Matte, non-greasy finish that holds up through 8+ hour workdays',
      ],
    },
    {
      id: 'case-2',
      cardTitle: 'Sun Tan, Commute Dullness & Uneven Tone',
      name: 'Arjun K.',
      age: 33,
      concern: 'Sun Tan, Dark Spots & Tired Post-Commute Skin',
      routine: "Men's Face Brightening Serum (Vitamin C + Niacinamide)",
      productId: 'prod-him-face-brightening-serum',
      stats: '89% BRIGHTER & EVEN TONE',
      beforeImg: '/assets/aistudio/Man_applying_face_serum_0115c3b5_fac133d9.jpg',
      afterImg: '/assets/aistudio/Man_applying_face_serum_0a6bdd49_d5dc3594.jpg',
      beforeFilter: 'contrast-120 brightness-85 saturate-90',
      afterFilter: 'contrast-100 brightness-110 saturate-100',
      points: [
        'Infused with 15% Vitamin C & 5% Niacinamide to target dull skin and sun spots',
        'Water-light texture absorbs matte in 15 seconds across humid days',
        'Zero greasy film or white cast on clean-shaven skin or stubble',
      ],
    },
    {
      id: 'case-3',
      cardTitle: 'Coarse Beard, Itch & Dry Under-Beard',
      name: 'Vikram M.',
      age: 31,
      concern: 'Coarse Beard Frizz, Shaving Rash & Dry Under-Beard',
      routine: 'HIM Beard Serum (Argan & Jojoba)',
      productId: 'prod-him-beard-serum',
      stats: '98% SOFTER BEARD',
      beforeImg: '/assets/aistudio/Man_applying_beard_serum_c503784e_1142e7b0.jpg',
      afterImg: '/assets/aistudio/Man_applying_beard_serum_dfe1531a_f57eb2d2.jpg',
      beforeFilter: 'contrast-115 brightness-90 saturate-90',
      afterFilter: 'contrast-100 brightness-105 saturate-100',
      points: [
        'Light Moroccan Argan and Golden Jojoba oils tame dense, wiry beard hair',
        'Calms post-trim irritation and stops persistent beard-dandruff (*beardruff*)',
        'Non-sticky, fast-absorbing texture that won’t stain formal shirt collars',
      ],
    },
  ];

  const handleToggleMode = (caseId: string, mode: 'split' | 'before' | 'after') => {
    setActiveViewMode((prev) => ({ ...prev, [caseId]: mode }));
  };

  return (
    <section className="relative py-16 sm:py-24 bg-[#F7F4F1] border-b border-[#E7E7E7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-white border border-[#E7E7E7] rounded-full text-xs font-semibold text-[#E31B23] mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>REAL MEN • REAL RESULTS</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#0A0029] tracking-tight">
            Visible improvements in 28 days.
          </h2>
          <p className="mt-2 text-base text-[#6C757D]">
            Formulated for Indian climate conditions and melanin-rich skin. Unretouched results from genuine customers who made HIM their daily ritual.
          </p>
        </div>

        {/* 3 Case Study Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cases.map((item) => {
            const mode = activeViewMode[item.id] || 'split';
            const matchedProduct = products.find((p) => p.id === item.productId) || products[0];
            const activeBaseImg = customImages[`ba-${item.id}`] || localCustomImages[`ba-${item.id}`] || item.beforeImg;
            const isDragging = draggingCaseId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white border border-[#E7E7E7] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group focus:outline-hidden"
                tabIndex={0}
                onDragOver={canEdit ? (e) => {
                  e.preventDefault();
                  setDraggingCaseId(item.id);
                } : undefined}
                onDragLeave={canEdit ? () => setDraggingCaseId(null) : undefined}
                onDrop={canEdit ? (e) => {
                  e.preventDefault();
                  setDraggingCaseId(null);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileForCase(item.id, e.dataTransfer.files[0]);
                  }
                } : undefined}
                onPaste={canEdit ? (e) => {
                  const items = e.clipboardData?.items;
                  if (items) {
                    for (let i = 0; i < items.length; i++) {
                      if (items[i].type.startsWith('image/')) {
                        const file = items[i].getAsFile();
                        if (file) {
                          handleFileForCase(item.id, file);
                          break;
                        }
                      }
                    }
                  }
                } : undefined}
              >
                {/* Visual Before/After Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F4F4F7] border-b border-[#E7E7E7]">
                  {/* Drop Overlay */}
                  {isDragging && (
                    <div className="absolute inset-0 bg-[#0A0029]/85 z-30 flex flex-col items-center justify-center text-white p-4 backdrop-blur-xs">
                      <Upload className="w-8 h-8 text-[#E31B23] animate-bounce mb-2" />
                      <span className="text-xs font-bold uppercase tracking-wider">Drop Image for {item.name}</span>
                    </div>
                  )}

                  {mode === 'split' ? (
                    <div className="relative w-full h-full flex">
                      {/* Left Before Half */}
                      <div className="w-1/2 h-full overflow-hidden relative border-r border-white/60">
                        <img
                          src={activeBaseImg}
                          alt={`${item.name} Before`}
                          className={`w-[200%] max-w-none h-full object-cover object-center ${item.beforeFilter}`}
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded-full">
                          Day 01
                        </span>
                      </div>
                      {/* Right After Half */}
                      <div className="w-1/2 h-full overflow-hidden relative">
                        <img
                          src={activeBaseImg}
                          alt={`${item.name} After`}
                          className={`w-[200%] max-w-none h-full object-cover object-center -ml-[100%] ${item.afterFilter}`}
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#0A0029] text-white text-[10px] font-bold rounded-full">
                          Day 28
                        </span>
                      </div>
                    </div>
                  ) : mode === 'before' ? (
                    <div className="relative w-full h-full">
                      <img
                        src={activeBaseImg}
                        alt={`${item.name} Before`}
                        className={`w-full h-full object-cover object-center ${item.beforeFilter}`}
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded-full">
                        Day 01 (Initial)
                      </span>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={activeBaseImg}
                        alt={`${item.name} After`}
                        className={`w-full h-full object-cover object-center ${item.afterFilter}`}
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#0A0029] text-white text-[10px] font-bold rounded-full">
                        Day 28 (After HIM)
                      </span>
                    </div>
                  )}

                  {/* Mode Selector Pill Buttons */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center bg-white/90 backdrop-blur-xs p-0.5 rounded-full border border-[#E7E7E7] text-[11px] font-semibold text-[#6C757D] shadow-xs z-10">
                    {(['before', 'split', 'after'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => handleToggleMode(item.id, m)}
                        className={`px-2.5 py-0.5 rounded-full capitalize transition-colors ${
                          mode === m ? 'bg-[#0A0029] text-white' : 'hover:text-[#0A0029]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* Photo Upload / Replace Trigger (AI Studio Edit Mode Only) */}
                  {canEdit && (
                    <label
                      title={`Upload custom photo for ${item.name} (or drag & drop)`}
                      className="absolute top-3 right-3 z-20 px-2.5 py-1 bg-white/90 hover:bg-white text-[#0A0029] text-[10px] font-semibold rounded-full cursor-pointer flex items-center space-x-1 shadow-xs border border-[#E7E7E7] transition-all hover:scale-105"
                    >
                      <Camera className="w-3 h-3 text-[#E31B23]" />
                      <span>{localCustomImages[`ba-${item.id}`] || customImages[`ba-${item.id}`] ? 'Replace' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileForCase(item.id, e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Case Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Card Title */}
                    <div className="mb-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E31B23]">
                        {item.cardTitle}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-sm text-[#0A0029]">
                        {item.name}, {item.age}
                      </div>
                      <span className="px-2 py-0.5 bg-[#F4F4F7] text-[#E31B23] text-[10px] font-bold rounded-full">
                        {item.stats}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-[#6C757D] mb-3">
                      Target: <span className="text-[#0A0029] font-medium">{item.concern}</span>
                    </div>

                    <ul className="space-y-1.5 text-xs text-[#6C757D] mb-4">
                      {item.points.map((pt, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-3.5 h-3.5 text-[#28A745] mr-2 shrink-0 mt-0.5" />
                          <span>
                            {pt.includes('(*beardruff*)') ? (
                              <>
                                {pt.split('(*beardruff*)')[0]}
                                <em>(beardruff)</em>
                                {pt.split('(*beardruff*)')[1]}
                              </>
                            ) : (
                              pt
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Routine Link & Quick Action */}
                  <div className="pt-3 border-t border-[#F4F4F7] flex items-center justify-between">
                    <div className="text-[11px] text-[#6C757D]">
                      Routine: <strong className="text-[#0A0029] block truncate max-w-[170px]">{item.routine}</strong>
                    </div>

                    {matchedProduct && onOpenProduct && (
                      <button
                        onClick={() => onOpenProduct(matchedProduct)}
                        className="text-xs font-bold text-[#0A0029] hover:text-[#E31B23] flex items-center space-x-1 transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
