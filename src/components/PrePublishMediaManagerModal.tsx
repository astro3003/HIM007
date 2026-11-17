import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Check, 
  RefreshCw, 
  Image as ImageIcon, 
  Sparkles, 
  Search, 
  Link as LinkIcon, 
  Download, 
  Eye, 
  Trash2, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Product } from '../types';

export interface MediaSlot {
  id: string;
  category: 'hero' | 'products' | 'before_after' | 'reviews' | 'reels' | 'comparison';
  title: string;
  subtitle: string;
  recommendedRatio: string;
  defaultImg: string;
  description: string;
}

interface PrePublishMediaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customImages: Record<string, string>;
  onUpdateImage: (id: string, dataUrl: string) => void;
  onResetImage: (id: string) => void;
  onResetAll?: () => void;
  products: Product[];
}

export const PrePublishMediaManagerModal: React.FC<PrePublishMediaManagerModalProps> = ({
  isOpen,
  onClose,
  customImages,
  onUpdateImage,
  onResetImage,
  onResetAll,
  products,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [draggingSlotId, setDraggingSlotId] = useState<string | null>(null);
  const [urlInputId, setUrlInputId] = useState<string | null>(null);
  const [tempUrl, setTempUrl] = useState<string>('');
  const [zoomImg, setZoomImg] = useState<{ title: string; src: string } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Build Comprehensive List of All Customizable Media Slots
  const mediaSlots: MediaSlot[] = [
    // 1. HERO SECTION
    {
      id: 'hero-main',
      category: 'hero',
      title: 'Hero Main Grooming Showcase',
      subtitle: 'Primary above-the-fold motorcycle garage banner',
      recommendedRatio: '16:9 Widescreen Banner',
      defaultImg: '/assets/aistudio/Men_posing_with_motorcycle_products_cb7d58eb_b75f4f77.jpg',
      description: 'The premier widescreen banner showcasing HIM grooming essentials in action.',
    },
    {
      id: 'hero-model-rohan',
      category: 'hero',
      title: 'Campaign Model: Rohan (Mumbai)',
      subtitle: 'Preset 01 // Matte Skin & Recovery',
      recommendedRatio: '1:1 Square Avatar or 4:5 Portrait',
      defaultImg: '/assets/aistudio/Man_wiping_mirror_after_training_2K_20261015015711_e245a8bf.jpg',
      description: 'Post-workout recovery and matte skin showcase.',
    },
    {
      id: 'hero-model-dev',
      category: 'hero',
      title: 'Campaign Model: Dev (Bengaluru)',
      subtitle: 'Preset 02 // Hair Clay & Beard Routine',
      recommendedRatio: '1:1 Square Avatar or 4:5 Portrait',
      defaultImg: '/assets/aistudio/Model_posing_with_bread_mirror_f670125c_e3b1ecf7.jpg',
      description: 'Zero-shine matte hair texture and clean mirror finish.',
    },
    {
      id: 'hero-model-kabir',
      category: 'hero',
      title: 'Campaign Model: Kabir (New Delhi)',
      subtitle: 'Preset 03 // Urban Stubble & Acne Care',
      recommendedRatio: '1:1 Square Avatar or 4:5 Portrait',
      defaultImg: '/assets/aistudio/Man_applying_skincare_soap_2K_20261015013509_8c1368e5.jpg',
      description: 'Daily T-zone clarifying and de-tan routine.',
    },
    {
      id: 'hero-model-arjun',
      category: 'hero',
      title: 'Campaign Model: Arjun (Hyderabad)',
      subtitle: 'Preset 04 // Beard Serum Polish',
      recommendedRatio: '1:1 Square Avatar or 4:5 Portrait',
      defaultImg: '/assets/aistudio/Man_applying_beard_serum_dfe1531a_f57eb2d2.jpg',
      description: 'Lightweight Argan and Jojoba beard serum routine.',
    },
    {
      id: 'hero-product-beard',
      category: 'hero',
      title: 'Hero Featured: HIM Beard Serum',
      subtitle: 'Beard nourishment dropper',
      recommendedRatio: '1:1 Square Bottle Packshot',
      defaultImg: '/assets/aistudio/Screenshot_2026-11-17_at_10.21.07_PM.png_0a07ea7b__1__ba44afe5.jpg',
      description: 'Featured beard care quick-buy card.',
    },
    {
      id: 'hero-product-face',
      category: 'hero',
      title: 'Hero Featured: HIM Face Wash',
      subtitle: 'Daily purifying gel tube',
      recommendedRatio: '1:1 Square Tube Packshot',
      defaultImg: '/assets/aistudio/Screenshot_2026-11-17_at_9.44.32_PM.png_8f280910_02484097.jpg',
      description: 'Daily face cleanser spotlight card.',
    },

    // 2. BEFORE & AFTER TRANSFORMATIONS
    {
      id: 'ba-case-1',
      category: 'before_after',
      title: 'Case 1: Rohan S., 28',
      subtitle: 'Humid T-Zone, Pollution Buildup & Clogged Pores',
      recommendedRatio: '4:3 Landscape or Square',
      defaultImg: '/assets/aistudio/Skincare_product_skin_transforma__2K_20261015013810_ca0f1ea3.jpg',
      description: 'Day 01 vs Day 28 unretouched results portrait in Indian tropical weather.',
    },
    {
      id: 'ba-case-2',
      category: 'before_after',
      title: 'Case 2: Arjun K., 33',
      subtitle: 'Sun Tan, Uneven Tone & Commute Dullness',
      recommendedRatio: '4:3 Landscape or Square',
      defaultImg: '/assets/aistudio/Man_applying_face_serum_0a6bdd49_d5dc3594.jpg',
      description: 'Vitamin C & Niacinamide brightening serum results study.',
    },
    {
      id: 'ba-case-3',
      category: 'before_after',
      title: 'Case 3: Vikram M., 31',
      subtitle: 'Coarse Beard, Itch & Razor Bumps',
      recommendedRatio: '4:3 Landscape or Square',
      defaultImg: '/assets/aistudio/Man_applying_beard_serum_c503784e_1142e7b0.jpg',
      description: 'Beard skin folliculitis and hydration transformation study.',
    },

    // 3. PRODUCT CATALOG (Dynamically derived from products)
    ...products.map((p) => ({
      id: `prod-${p.id}`,
      category: 'products' as const,
      title: p.name,
      subtitle: `SKU: ${p.sku} // ${p.badge}`,
      recommendedRatio: '1:1 Square Packshot (Neutral / Matte background)',
      defaultImg: p.fieldImg || '/assets/aistudio/Serum_bottle_and_box_packaging_fa6ed9b8_82a165c1.jpg',
      description: `${p.volume} - ${p.category} formulation packshot.`,
    })),

    // 4. CUSTOMER REVIEWS AVATARS
    {
      id: 'rev-rev-01',
      category: 'reviews',
      title: 'Customer: Rohit S. (Mumbai)',
      subtitle: 'Reviewer for HIM Face Wash',
      recommendedRatio: '1:1 Square Headshot',
      defaultImg: '/assets/aistudio/Man_using_mirror_in_washroom_20ddcbaf_9c3206a0.jpg',
      description: 'Verified buyer avatar thumbnail in review testimonials card.',
    },
    {
      id: 'rev-rev-02',
      category: 'reviews',
      title: 'Customer: Aarav M. (Bengaluru)',
      subtitle: "Reviewer for Men's Face Brightening Serum",
      recommendedRatio: '1:1 Square Headshot',
      defaultImg: '/assets/aistudio/Man_applying_face_serum_0115c3b5_fac133d9.jpg',
      description: 'Verified buyer avatar thumbnail in review testimonials card.',
    },
    {
      id: 'rev-rev-03',
      category: 'reviews',
      title: 'Customer: Sushil K. (Bengaluru)',
      subtitle: 'Reviewer for HIM Beard Serum',
      recommendedRatio: '1:1 Square Headshot',
      defaultImg: '/assets/aistudio/Man_applying_beard_serum_1d126a56_59a5068f.jpg',
      description: 'Verified buyer avatar thumbnail in review testimonials card.',
    },
    {
      id: 'rev-rev-04',
      category: 'reviews',
      title: 'Customer: Dhruv P. (New Delhi)',
      subtitle: 'Reviewer for HIM Hair Clay',
      recommendedRatio: '1:1 Square Headshot',
      defaultImg: '/assets/aistudio/Models_posing_with_beard_mirror_ede1fc8e_a5958a6a.jpg',
      description: 'Verified buyer avatar thumbnail in review testimonials card.',
    },

    // 5. COMMUNITY REELS & SHORTS
    {
      id: 'reel-reel-01',
      category: 'reels',
      title: 'Reel 01: Post-Workout Recovery Shower',
      subtitle: 'Mumbai // @aditya_lifts',
      recommendedRatio: '9:16 Vertical Video Poster',
      defaultImg: '/assets/aistudio/Man_wiping_mirror_after_training_2K_20261015015711_e245a8bf.jpg',
      description: 'Vertical thumbnail poster for community reel playback.',
    },
    {
      id: 'reel-reel-02',
      category: 'reels',
      title: 'Reel 02: Clear Skin in 14 Days // BHA + Neem',
      subtitle: 'New Delhi // @kabir_grooming',
      recommendedRatio: '9:16 Vertical Video Poster',
      defaultImg: '/assets/aistudio/Man_applying_skincare_soap_2K_20261015013509_8c1368e5.jpg',
      description: 'Vertical thumbnail poster for community reel playback.',
    },
    {
      id: 'reel-reel-03',
      category: 'reels',
      title: 'Reel 03: Beard Softening & Clean Routine',
      subtitle: 'Mumbai // @vikram_m',
      recommendedRatio: '9:16 Vertical Video Poster',
      defaultImg: '/assets/aistudio/Man_applying_beard_serum_dfe1531a_f57eb2d2.jpg',
      description: 'Vertical thumbnail poster for community reel playback.',
    },
    {
      id: 'reel-reel-04',
      category: 'reels',
      title: 'Reel 04: 12H Freshness in 40 Degree Heat',
      subtitle: 'Jaipur // @rahul_travel',
      recommendedRatio: '9:16 Vertical Video Poster',
      defaultImg: '/assets/aistudio/Applying_hair_oil_guide_21e9cb4b_885966e4.jpg',
      description: 'Vertical thumbnail poster for community reel playback.',
    },

    // 6. COMPARISON & BRAND TEXTURES
    {
      id: 'comp-traditional',
      category: 'comparison',
      title: 'Comparison: Standard Cleanser vs Scrub Bar',
      subtitle: 'Ingredient transparency & pH comparison',
      recommendedRatio: '4:3 or 16:9 Landscape',
      defaultImg: '/assets/aistudio/Skincare_ingredient_infographic___2K_20261015013141_62ff0668.jpg',
      description: 'Visual comparison of botanical and active concentrations.',
    },
    {
      id: 'comp-him',
      category: 'comparison',
      title: 'Comparison: HIM Engineered Formulation',
      subtitle: 'Full HIM motorcycle garage lineup',
      recommendedRatio: '4:3 or 16:9 Landscape',
      defaultImg: '/assets/aistudio/Men_posing_with_motorcycle_products_cb7d58eb_b75f4f77.jpg',
      description: 'Complete HIM active grooming ecosystem.',
    },
  ];

  // Process File Upload
  const handleFileProcess = (slotId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (.jpg, .png, .webp, .svg, .jpeg)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onUpdateImage(slotId, dataUrl);
      showNotification(`Updated image for ${slotId.toUpperCase()}`);
    };
    reader.readAsDataURL(file);
  };

  // Process URL Submit
  const handleUrlSubmit = (slotId: string) => {
    if (!tempUrl.trim()) return;
    onUpdateImage(slotId, tempUrl.trim());
    setUrlInputId(null);
    setTempUrl('');
    showNotification(`URL applied for ${slotId.toUpperCase()}`);
  };

  // Filter slots
  const filteredSlots = mediaSlots.filter((slot) => {
    const matchesCat = activeCategory === 'all' || slot.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      slot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const customCount = Object.keys(customImages).length;
  const totalSlots = mediaSlots.length;
  const progressPercent = Math.round((customCount / totalSlots) * 100);

  // Export JSON Manifest
  const handleExportManifest = () => {
    const manifest = {
      timestamp: new Date().toISOString(),
      totalCustomImages: customCount,
      images: customImages,
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `him-images-manifest-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Manifest downloaded successfully');
  };

  const categories = [
    { id: 'all', label: 'All Images', count: mediaSlots.length },
    { id: 'hero', label: 'Hero & Models', count: mediaSlots.filter((s) => s.category === 'hero').length },
    { id: 'products', label: 'Products', count: mediaSlots.filter((s) => s.category === 'products').length },
    { id: 'before_after', label: 'Before & After', count: mediaSlots.filter((s) => s.category === 'before_after').length },
    { id: 'reviews', label: 'Customer Reviews', count: mediaSlots.filter((s) => s.category === 'reviews').length },
    { id: 'reels', label: 'Reels & Videos', count: mediaSlots.filter((s) => s.category === 'reels').length },
    { id: 'comparison', label: 'Formulations', count: mediaSlots.filter((s) => s.category === 'comparison').length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-6xl max-h-[92vh] bg-[#F7F4F1] border border-[#E7E7E7] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#0A0029]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#0A0029] text-white px-6 py-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E31B23] flex items-center justify-center shadow-md">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-editorial text-lg sm:text-xl font-bold tracking-tight">
                  Pre-Publish Image & Media Hub
                </h2>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold rounded-full">
                  LIVE SYNC ACTIVE
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                Upload and replace every image section before publishing. Changes save permanently.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleExportManifest}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-semibold transition-all border border-white/15"
              title="Download backup manifest of your custom images"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Manifest</span>
            </button>

            {onResetAll && customCount > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset all custom images back to defaults?')) {
                    onResetAll();
                    showNotification('All images restored to defaults');
                  }
                }}
                className="hidden sm:flex items-center space-x-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-full text-xs font-semibold transition-all border border-red-500/30"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress & Quick Stats Ribbon */}
        <div className="bg-white border-b border-[#E7E7E7] px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-[#6C757D]">Launch Readiness:</span>
              <strong className="text-[#0A0029] font-mono font-bold">
                {customCount} / {totalSlots} Customized ({progressPercent}%)
              </strong>
            </div>

            <div className="w-32 sm:w-48 h-2 bg-[#E7E7E7] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0A0029] via-[#E31B23] to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
          </div>

          {notification && (
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-[#0A0029] text-white text-xs rounded-full shadow-sm animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{notification}</span>
            </div>
          )}

          <div className="text-[11px] text-[#6C757D] hidden md:block">
            Supports direct drag & drop, file selection, and custom image URLs
          </div>
        </div>

        {/* Search & Category Filter Navigation */}
        <div className="bg-white border-b border-[#E7E7E7] px-6 py-3 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-[#0A0029] text-white shadow-xs'
                    : 'bg-[#F4F4F7] text-[#6C757D] hover:text-[#0A0029] hover:bg-[#E7E7E7]'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-white text-[#6C757D]'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6C757D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search section or product..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#F4F4F7] border border-[#E7E7E7] rounded-full text-xs text-[#0A0029] placeholder-[#6C757D] focus:outline-hidden focus:border-[#E31B23]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#0A0029]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Media Slots Grid Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F7F4F1]">
          {filteredSlots.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-full bg-white border border-[#E7E7E7] flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Search className="w-5 h-5 text-[#6C757D]" />
              </div>
              <p className="text-sm font-bold text-[#0A0029]">No media slots found matching "{searchQuery}"</p>
              <p className="text-xs text-[#6C757D] mt-1">Try switching categories or clearing search filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSlots.map((slot) => {
                const activeImg = customImages[slot.id] || slot.defaultImg;
                const isCustom = Boolean(customImages[slot.id]);
                const isDragging = draggingSlotId === slot.id;
                const isUrlActive = urlInputId === slot.id;

                return (
                  <div
                    key={slot.id}
                    className={`bg-white border rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md ${
                      isCustom ? 'border-emerald-300 ring-1 ring-emerald-400/30' : 'border-[#E7E7E7]'
                    } ${isDragging ? 'border-[#E31B23] ring-2 ring-[#E31B23]/30 bg-red-50/20' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDraggingSlotId(slot.id);
                    }}
                    onDragLeave={() => setDraggingSlotId(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDraggingSlotId(null);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileProcess(slot.id, e.dataTransfer.files[0]);
                      }
                    }}
                  >
                    <div>
                      {/* Card Header Info */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-[#0A0029] text-white text-[9px] font-mono font-bold uppercase rounded-md">
                              {slot.category.replace('_', ' ')}
                            </span>
                            {isCustom ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full flex items-center space-x-1">
                                <Check className="w-2.5 h-2.5" />
                                <span>CUSTOM UPLOAD</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-[#F4F4F7] text-[#6C757D] text-[9px] font-bold rounded-full">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <h3 className="text-xs sm:text-sm font-bold text-[#0A0029] mt-1 line-clamp-1">
                            {slot.title}
                          </h3>
                          <p className="text-[11px] text-[#6C757D] line-clamp-1">{slot.subtitle}</p>
                        </div>

                        {/* Direct Preview Zoom */}
                        <button
                          onClick={() => setZoomImg({ title: slot.title, src: activeImg })}
                          className="p-1.5 text-[#6C757D] hover:text-[#0A0029] hover:bg-[#F4F4F7] rounded-lg transition-colors"
                          title="Preview full size"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Image Preview & Dropzone */}
                      <div
                        onClick={() => fileInputsRef.current[slot.id]?.click()}
                        className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#FAFAFA] border border-[#E7E7E7] cursor-pointer group mb-3 flex items-center justify-center"
                      >
                        <img
                          src={activeImg}
                          alt={slot.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-[#0A0029]/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-3 text-center">
                          <Upload className="w-6 h-6 text-[#E31B23] mb-1.5 animate-bounce" />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Click or Drop Image
                          </span>
                          <span className="text-[10px] text-white/80 mt-0.5">
                            {slot.recommendedRatio}
                          </span>
                        </div>

                        {/* Dragging Active State */}
                        {isDragging && (
                          <div className="absolute inset-0 bg-[#0A0029]/90 z-20 flex flex-col items-center justify-center text-white p-3">
                            <Upload className="w-8 h-8 text-[#E31B23] animate-bounce mb-2" />
                            <span className="text-xs font-bold uppercase">Drop Image Here</span>
                          </div>
                        )}

                        {/* Ratio Pill */}
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-mono rounded-md pointer-events-none">
                          {slot.recommendedRatio.split(' ')[0]}
                        </div>
                      </div>

                      {/* URL Input Form (if toggled) */}
                      {isUrlActive && (
                        <div className="mb-3 p-2 bg-[#F4F4F7] rounded-xl border border-[#E7E7E7] space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-[#6C757D]">
                            <span>Paste Web Image Link:</span>
                            <button
                              onClick={() => setUrlInputId(null)}
                              className="text-[#6C757D] hover:text-[#0A0029]"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <input
                            type="url"
                            value={tempUrl}
                            onChange={(e) => setTempUrl(e.target.value)}
                            placeholder="/assets/aistudio/..."
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E7E7E7] rounded-lg text-xs text-[#0A0029] focus:outline-hidden focus:border-[#E31B23]"
                          />
                          <button
                            onClick={() => handleUrlSubmit(slot.id)}
                            className="w-full py-1 bg-[#0A0029] hover:bg-[#E31B23] text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            Apply Link
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bottom Card Controls */}
                    <div className="pt-2 border-t border-[#E7E7E7] flex items-center justify-between gap-2">
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={(el) => {
                          fileInputsRef.current[slot.id] = el;
                        }}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileProcess(slot.id, e.target.files[0]);
                          }
                        }}
                      />

                      {/* Choose File Button */}
                      <button
                        type="button"
                        onClick={() => fileInputsRef.current[slot.id]?.click()}
                        className="flex-1 py-1.5 px-3 bg-[#0A0029] hover:bg-[#E31B23] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>

                      {/* Paste URL Trigger */}
                      <button
                        type="button"
                        onClick={() => {
                          setUrlInputId(urlInputId === slot.id ? null : slot.id);
                          setTempUrl('');
                        }}
                        className={`p-2 border rounded-xl transition-colors ${
                          isUrlActive
                            ? 'bg-[#0A0029] text-white border-[#0A0029]'
                            : 'bg-white hover:bg-[#F4F4F7] text-[#6C757D] hover:text-[#0A0029] border-[#E7E7E7]'
                        }`}
                        title="Enter image URL"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                      </button>

                      {/* Reset to Default */}
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => {
                            onResetImage(slot.id);
                            showNotification(`Reset ${slot.title} to default`);
                          }}
                          className="p-2 bg-white hover:bg-red-50 text-[#6C757D] hover:text-[#E31B23] border border-[#E7E7E7] rounded-xl transition-colors"
                          title="Restore original image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-[#E7E7E7] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-xs text-[#6C757D]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>All uploads are preserved in client storage and synchronized with server storage.</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#0A0029] hover:bg-[#E31B23] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-md active:scale-95"
            >
              Done & Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Preview Zoom Modal */}
      {zoomImg && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomImg(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#E7E7E7]">
              <span className="text-xs font-bold text-[#0A0029]">{zoomImg.title}</span>
              <button onClick={() => setZoomImg(null)} className="p-1 hover:bg-[#F4F4F7] rounded-full">
                <X className="w-4 h-4 text-[#6C757D]" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-hidden flex items-center justify-center p-2 bg-[#F4F4F7]">
              <img
                src={zoomImg.src}
                alt={zoomImg.title}
                className="max-h-[70vh] object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
