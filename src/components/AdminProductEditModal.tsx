import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Save,
  Trash2,
  Sparkles,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import { Product, Currency, ProductCategory } from '../types';
import { backendService } from '../services/api';
import { formatPrice } from '../utils/locationCurrency';

interface AdminProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  currency: Currency;
  onSave: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

const CATEGORIES: ProductCategory[] = ['FACE', 'BODY', 'HAIR', 'BEARD & SHAVE', 'KITS'];

const PRESET_IMAGES = [
  {
    label: 'HIM Scrub Bar (SVG Packshot)',
    url: '/images/products/him_scrub_bar.svg',
    category: 'BODY',
  },
  {
    label: 'HIM Anti-Acne Serum (SVG Dropper)',
    url: '/images/products/him_anti_acne_serum.svg',
    category: 'FACE',
  },
  {
    label: 'Brightening Serum (Vitamin C & Niacinamide)',
    url: '/assets/aistudio/Serum_bottle_and_box_packaging_fa6ed9b8_82a165c1.jpg',
    category: 'FACE',
  },
  {
    label: 'HIM Face Wash (Deep Cleanse)',
    url: '/assets/aistudio/Screenshot_2026-11-17_at_9.44.32_PM.png_8f280910_02484097.jpg',
    category: 'FACE',
  },
  {
    label: 'HIM Beard Serum (Argan & Jojoba)',
    url: '/assets/aistudio/Screenshot_2026-11-17_at_10.21.07_PM.png_0a07ea7b__1__ba44afe5.jpg',
    category: 'BEARD & SHAVE',
  },
];

export const AdminProductEditModal: React.FC<AdminProductEditModalProps> = ({
  isOpen,
  onClose,
  product,
  currency,
  onSave,
  onDelete,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isNew = !product;

  // Local form state
  const [form, setForm] = useState<Partial<Product>>(() => {
    if (product) return { ...product };
    return {
      name: '',
      category: 'BODY',
      price: 14,
      compareAtPrice: 18,
      volume: '150g / 5.3 oz Exfoliant Bar',
      specCode: `SPEC ${Math.floor(10 + Math.random() * 90)} // FORMULATION`,
      badge: 'FLAGSHIP FORMULATION',
      rating: 5.0,
      reviewsCount: 120,
      naturalPercentage: 99,
      tagline: 'Deep cleanse botanical formula engineered for men.',
      description: 'Crafted with potent botanical extracts and minerals to purify, invigorate, and protect skin against urban pollution.',
      fieldImg: '/images/products/him_scrub_bar.svg',
      inStock: true,
      stockUnits: 100,
      sku: `HIM-${Date.now().toString().slice(-4)}`,
      artType: 'clay',
      keyActives: ['Volcanic Mineral Ash', 'Activated Charcoal', 'Peppermint Essential Oil'],
      usageProtocol: ['Apply to damp skin.', 'Lather thoroughly.', 'Rinse clean.'],
    };
  });

  // Re-sync when product changes
  React.useEffect(() => {
    if (product) {
      setForm({ ...product });
    } else {
      setForm({
        name: '',
        category: 'BODY',
        price: 14,
        compareAtPrice: 18,
        volume: '150g / 5.3 oz Exfoliant Bar',
        specCode: `SPEC ${Math.floor(10 + Math.random() * 90)} // FORMULATION`,
        badge: 'FLAGSHIP FORMULATION',
        rating: 5.0,
        reviewsCount: 120,
        naturalPercentage: 99,
        tagline: 'Deep cleanse botanical formula engineered for men.',
        description: 'Crafted with potent botanical extracts and minerals to purify, invigorate, and protect skin against urban pollution.',
        fieldImg: '/images/products/him_scrub_bar.svg',
        inStock: true,
        stockUnits: 100,
        sku: `HIM-${Date.now().toString().slice(-4)}`,
        artType: 'clay',
        keyActives: ['Volcanic Mineral Ash', 'Activated Charcoal', 'Peppermint Essential Oil'],
        usageProtocol: ['Apply to damp skin.', 'Lather thoroughly.', 'Rinse clean.'],
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);
    try {
      const dataUrl = await backendService.uploadImage(file);
      setForm((prev) => ({ ...prev, fieldImg: dataUrl, customImg: dataUrl }));
    } catch {
      setErrorMessage('Failed to upload image. Please try another image file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!form.name?.trim()) {
      setErrorMessage('Product Name is required.');
      return;
    }

    const price = Number(form.price);
    if (isNaN(price) || price <= 0) {
      setErrorMessage('Please enter a valid price greater than 0.');
      return;
    }

    const stockUnits = Math.max(0, Number(form.stockUnits ?? 50));
    const prodId = product?.id || `prod-${Date.now()}`;

    const completeProduct: Product = {
      id: prodId,
      name: form.name.trim(),
      category: (form.category as any) || 'BODY',
      price: price,
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      volume: form.volume || '100ml',
      specCode: form.specCode || `SPEC // ${prodId}`,
      badge: form.badge || 'FLAGSHIP FORMULATION',
      rating: form.rating || 5.0,
      reviewsCount: form.reviewsCount || 10,
      naturalPercentage: Number(form.naturalPercentage) || 99,
      tagline: form.tagline || 'High-performance men’s formula.',
      description: form.description || 'Gentle, potent, clean botanical formulation.',
      technicalSpecs: form.technicalSpecs || [
        { label: 'Origin', value: 'Crafted in India' },
        { label: 'Purity', value: `${form.naturalPercentage || 99}% Natural Origin` },
      ],
      keyActives: form.keyActives || ['Botanical Extracts'],
      usageProtocol: form.usageProtocol || ['Apply as directed.'],
      inStock: form.inStock ?? (stockUnits > 0),
      stockUnits: stockUnits,
      sku: form.sku || `HIM-${Date.now().toString().slice(-4)}`,
      artType: form.artType || 'clay',
      fieldImg: form.fieldImg || '/images/products/him_scrub_bar.svg',
      customImg: form.customImg,
    };

    onSave(completeProduct);
    onClose();
  };

  const inrCurrency: Currency = { code: 'INR', symbol: '₹', rate: 84, name: 'Indian Rupee' };
  const currentPriceINR = formatPrice(Number(form.price) || 0, inrCurrency);
  const currentCompareINR = form.compareAtPrice
    ? formatPrice(Number(form.compareAtPrice) || 0, inrCurrency)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl bg-[#111114] border-2 border-[#E31B23] rounded-2xl shadow-2xl overflow-hidden my-auto text-white flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#18181D] border-b border-[#27272A] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="px-2 py-0.5 bg-[#E31B23] text-white text-[10px] font-mono font-bold tracking-widest uppercase">
              ADMIN ONLY
            </span>
            <h2 className="text-base sm:text-lg font-mono font-bold text-white tracking-tight flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-[#E31B23]" />
              {isNew ? 'CREATE NEW PRODUCT SPECIFICATION' : `EDIT PRODUCT // ${form.specCode || form.name}`}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#71717A] hover:text-white hover:bg-[#27272A] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="bg-red-950/90 border-b border-red-500 px-6 py-2.5 text-xs text-red-200 flex items-center space-x-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body: Two-Column Editor */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0E0E11]">
          {/* Left Column (5 cols): Visual Image Management & Live Card Preview */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#141418] border border-[#27272A] p-4 rounded-xl space-y-4">
              <label className="block text-xs font-mono font-bold text-[#E31B23] uppercase tracking-wider">
                1. Product Image & Packaging
              </label>

              {/* Main Photo Preview */}
              <div className="relative aspect-square w-full max-w-xs mx-auto bg-[#0A0A0C] border-2 border-dashed border-[#3F3F46] rounded-xl overflow-hidden flex items-center justify-center p-3 group">
                {form.fieldImg ? (
                  <img
                    src={form.fieldImg}
                    alt={form.name || 'Product Preview'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-10 h-10 mx-auto text-[#52525B] mb-2" />
                    <span className="text-xs text-[#71717A]">No Image Selected</span>
                  </div>
                )}

                {/* Upload overlay trigger */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-xs font-mono text-white font-bold transition-opacity cursor-pointer"
                >
                  <Camera className="w-6 h-6 mb-1 text-[#E31B23]" />
                  <span>{isUploading ? 'UPLOADING...' : 'CHANGE PHOTO'}</span>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Upload & Direct URL Controls */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-2.5 px-3 bg-[#1F1F24] hover:bg-[#2A2A30] border border-[#3F3F46] hover:border-[#E31B23] text-white font-mono text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition-all"
                >
                  <Upload className="w-4 h-4 text-[#E31B23]" />
                  <span>{isUploading ? 'PROCESSING IMAGE...' : 'UPLOAD NEW IMAGE FILE'}</span>
                </button>

                <div>
                  <label className="block text-[10px] font-mono text-[#A1A1AA] mb-1">
                    OR PASTE IMAGE URL DIRECTLY:
                  </label>
                  <input
                    type="text"
                    value={form.fieldImg || ''}
                    onChange={(e) => setForm({ ...form, fieldImg: e.target.value })}
                    placeholder="https://... or /images/..."
                    className="w-full bg-[#0A0A0C] border border-[#27272A] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#E31B23] font-mono"
                  />
                </div>
              </div>

              {/* Flagship Imagery Presets */}
              <div className="pt-2 border-t border-[#27272A] space-y-2">
                <span className="block text-[10px] font-mono font-bold text-[#A1A1AA] uppercase">
                  Flagship Artwork Presets:
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, fieldImg: preset.url }))}
                      className={`text-left px-2.5 py-1.5 rounded text-[11px] font-mono flex items-center justify-between border transition-all ${
                        form.fieldImg === preset.url
                          ? 'bg-[#E31B23]/20 border-[#E31B23] text-white'
                          : 'bg-[#0A0A0C] border-[#27272A] text-[#A1A1AA] hover:text-white hover:border-[#3F3F46]'
                      }`}
                    >
                      <span className="truncate">{preset.label}</span>
                      <span className="text-[9px] text-[#71717A] shrink-0 ml-2">{preset.category}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Storefront Preview Card */}
            <div className="bg-[#141418] border border-[#27272A] p-4 rounded-xl space-y-2">
              <span className="block text-[10px] font-mono font-bold text-[#28A745] uppercase flex items-center">
                <Eye className="w-3.5 h-3.5 mr-1" />
                Live Storefront Card Preview
              </span>
              <div className="bg-white rounded-xl p-3 text-[#0A0029] shadow-sm flex items-center space-x-3">
                <div className="w-16 h-16 bg-[#FAFAFA] rounded-lg border border-[#E7E7E7] overflow-hidden shrink-0 flex items-center justify-center">
                  {form.fieldImg ? (
                    <img src={form.fieldImg} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-gray-400">Photo</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold text-[#E31B23] uppercase tracking-wider block">
                    {form.category} • {form.badge || 'FLAGSHIP'}
                  </span>
                  <h4 className="font-bold text-xs text-[#0A0029] truncate">{form.name || 'Untitled Spec'}</h4>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-bold text-sm text-[#0A0029]">${form.price || 0} USD</span>
                    <span className="text-xs text-[#28A745] font-semibold">({currentPriceINR})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Product Details & Pricing */}
          <div className="lg:col-span-7 space-y-5">
            {/* Section: Name & Category */}
            <div className="bg-[#141418] border border-[#27272A] p-4 rounded-xl space-y-4">
              <label className="block text-xs font-mono font-bold text-[#E31B23] uppercase tracking-wider">
                2. Product Identification
              </label>

              <div>
                <label className="block text-xs text-[#A1A1AA] mb-1 font-mono">PRODUCT NAME *</label>
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. HIM Men's Deep Cleanse & Muscle Recovery Scrub Bar"
                  className="w-full bg-[#0A0A0C] border border-[#27272A] rounded-lg p-2.5 text-sm text-white font-medium focus:border-[#E31B23] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#A1A1AA] mb-1 font-mono">STORE CATEGORY *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                    className="w-full bg-[#0A0A0C] border border-[#27272A] rounded-lg p-2 text-xs text-white focus:border-[#E31B23] focus:outline-none font-mono"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#A1A1AA] mb-1 font-mono">VOLUME / NET WEIGHT</label>
                  <input
                    type="text"
                    value={form.volume || ''}
                    onChange={(e) => setForm({ ...form, volume: e.target.value })}
                    placeholder="e.g. 150g / 5.3 oz Exfoliant Bar"
                    className="w-full bg-[#0A0A0C] border border-[#27272A] rounded-lg p-2 text-xs text-white focus:border-[#E31B23] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#A1A1AA] mb-1 font-mono">SPEC CODE</label>
                  <input
                    type="text"
                    value={form.specCode || ''}
                    onChange={(e) => setForm({ ...form, specCode: e.target.value })}
                    placeholder="SPEC 01 // DEEP CLEANSE"
                    className="w-full bg-[#0A0A0C] border border-[#27272A] rounded-lg p-2 text-xs text-white focus:border-[#E31B23] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#A1A1AA] mb-1 font-mono">BADGE / CALLOUT</label>
                  <input
                    type="text"
                    value={form.badge || ''}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="FLAGSHIP FORMULATION"
                    className="w-full bg-[#0A0A0C] border border-[#27272A] rounded-lg p-2 text-xs text-white focus:border-[#E31B23] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#A1A1AA] mb-1 font-mono">NATURAL ORIGIN %</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={form.naturalPercentage || 99}
                    onChange={(e) => setForm({ ...form, naturalPercentage: Number(e.target.value) })}
                    className="w-full bg-[#0A0A0C] border border-[#27272A] rounded-lg p-2 text-xs text-white focus:border-[#E31B23] focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section: Price & Currency Calculation */}
            <div className="bg-[#141418] border border-[#27272A] p-4 rounded-xl space-y-4">
              <label className="block text-xs font-mono font-bold text-[#E31B23] uppercase tracking-wider">
                3. Pricing & Currency Localization
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#A1A1AA] mb-1 font-mono">BASE PRICE ($ USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] text-sm font-mono">$</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={form.price ?? 14}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      className="w-full bg-[#0A0A0C] border border-[#27272A] rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono font-bold focus:border-[#E31B23] focus:outline-none"
                    />
                  </div>
                  {/* Live India Price preview */}
                  <div className="mt-1.5 flex items-center text-[11px] text-[#28A745] font-mono">
                    <span className="font-bold">Live India Storefront: {currentPriceINR}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#A1A1AA] mb-1 font-mono">COMPARE AT MSRP ($ USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] text-sm font-mono">$</span>
                    <input
                      type="number"
                      step="0.5"
                      value={form.compareAtPrice ?? ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          compareAtPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="e.g. 18"
                      className="w-full bg-[#0A0A0C] border border-[#27272A] rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono focus:border-[#E31B23] focus:outline-none"
                    />
                  </div>
                  {currentCompareINR && (
                    <div className="mt-1.5 text-[11px] text-[#71717A] font-mono line-through">
                      MSRP: {currentCompareINR}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Stock Inventory & Availability */}
            <div className="bg-[#141418] border border-[#27272A] p-4 rounded-xl space-y-4">
              <label className="block text-xs font-mono font-bold text-[#E31B23] uppercase tracking-wider">
                4. Inventory & Dispatch Status
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#A1A1AA] mb-1 font-mono">AVAILABLE UNITS IN STOCK</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stockUnits ?? 50}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setForm({
                        ...form,
                        stockUnits: val,
                        inStock: val > 0,
                      });
                    }}
                    className="w-full bg-[#0A0A0C] border border-[#27272A] rounded-lg p-2 text-xs text-white font-mono focus:border-[#E31B23] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#A1A1AA] mb-1 font-mono">STATUS OVERRIDE</label>
                  <select
                    value={form.inStock ? 'true' : 'false'}
                    onChange={(e) => setForm({ ...form, inStock: e.target.value === 'true' })}
                    className="w-full bg-[#0A0A0C] border border-[#27272A] rounded-lg p-2 text-xs text-white font-mono focus:border-[#E31B23] focus:outline-none"
                  >
                    <option value="true">ACTIVE / AVAILABLE TO ORDER</option>
                    <option value="false">MARK AS DEPLETED / OUT OF STOCK</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Product Copywriting & Key Actives */}
            <div className="bg-[#141418] border border-[#27272A] p-4 rounded-xl space-y-4">
              <label className="block text-xs font-mono font-bold text-[#E31B23] uppercase tracking-wider">
                5. Formulation Copywriting & Actives
              </label>

              <div>
                <label className="block text-xs text-[#A1A1AA] mb-1 font-mono">TAGLINE (ONE LINE HOOK)</label>
                <input
                  type="text"
                  value={form.tagline || ''}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  placeholder="e.g. Master formulation revitalizing exfoliant bar for intense dermal purge."
                  className="w-full bg-[#0A0A0C] border border-[#27272A] rounded-lg p-2 text-xs text-white focus:border-[#E31B23] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-[#A1A1AA] mb-1 font-mono">FULL CLINICAL DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Engineered specifically for men's skin..."
                  className="w-full bg-[#0A0A0C] border border-[#27272A] rounded-lg p-2 text-xs text-white focus:border-[#E31B23] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-[#A1A1AA] mb-1 font-mono">
                  KEY ACTIVES (COMMA SEPARATED)
                </label>
                <input
                  type="text"
                  value={form.keyActives?.join(', ') || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      keyActives: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Volcanic Pumice, Activated Charcoal, Magnesium Sulfate"
                  className="w-full bg-[#0A0A0C] border border-[#27272A] rounded-lg p-2 text-xs text-white focus:border-[#E31B23] focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer: Save, Delete, Cancel */}
        <div className="bg-[#18181D] border-t border-[#27272A] px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            {!isNew && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to decommission [${form.name}] from the store?`)) {
                    onDelete(product.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 hover:border-red-500 text-red-400 text-xs font-mono font-bold rounded-lg flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>DELETE SPEC</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#27272A] hover:bg-[#323238] text-[#A1A1AA] hover:text-white text-xs font-mono font-bold rounded-lg transition-colors"
            >
              DISCARD
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-[#E31B23] hover:bg-[#C4141B] text-white text-xs font-mono font-bold rounded-lg flex items-center space-x-2 shadow-lg shadow-red-900/30 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isNew ? 'DEPLOY TO STORE' : 'SAVE CHANGES (ADMIN)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
