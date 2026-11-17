import React, { useState } from 'react';
import { X, ShieldCheck, Check, Plus, Minus, Star, Zap, Info, Leaf, Camera, Edit3 } from 'lucide-react';
import { Product, Currency } from '../types';
import { ProductArtwork } from './ProductArtwork';
import { formatPrice } from '../utils/locationCurrency';

interface ProductDetailModalProps {
  product: Product | null;
  currency: Currency;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onQuickBuy: (product: Product, quantity: number) => void;
  onOpenPhotoUpload?: (product: Product) => void;
  isAdminActive?: boolean;
  onEditProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  onClose,
  onAddToCart,
  onQuickBuy,
  onOpenPhotoUpload,
  isAdminActive,
  onEditProduct,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'benefits' | 'actives' | 'how_to_use'>('benefits');

  if (!product) return null;

  const formattedPrice = formatPrice(product.price * quantity, currency);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-4xl bg-[#F7F4F1] border border-[#E7E7E7] rounded-3xl shadow-2xl overflow-hidden my-auto text-[#0A0029]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-white border-b border-[#E7E7E7] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="font-editorial text-xl font-bold tracking-tight text-[#0A0029]">HIM</span>
            <span className="text-[#6C757D]">/</span>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#6C757D]">
              {product.category}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {isAdminActive && onEditProduct && (
              <button
                type="button"
                onClick={() => onEditProduct(product)}
                className="px-3 py-1 bg-[#E31B23] hover:bg-[#C4141B] text-white text-xs font-mono font-bold rounded-full transition-all shadow-xs flex items-center space-x-1.5"
                title="Edit Product Details & Price (Admin)"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>EDIT SPEC (ADMIN)</span>
              </button>
            )}
            {isAdminActive && onOpenPhotoUpload && (
              <button
                type="button"
                onClick={() => onOpenPhotoUpload(product)}
                className="p-1.5 text-[#6C757D] hover:text-[#0A0029] hover:bg-[#F4F4F7] rounded-full transition-colors"
                title="Upload Photo (Admin)"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#6C757D] hover:text-[#0A0029] hover:bg-[#F4F4F7] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Grid: Left Artwork, Right Details */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Product Visual */}
          <div className="p-8 bg-white border-b md:border-b-0 md:border-r border-[#E7E7E7] flex flex-col justify-between items-center">
            <div className="relative w-full aspect-square max-w-sm rounded-2xl overflow-hidden bg-[#F7F4F1] flex items-center justify-center p-6 border border-[#E7E7E7]">
              {product.fieldImg ? (
                <img
                  src={product.fieldImg}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <ProductArtwork artType={product.artType} badge={product.badge} className="w-full h-full" />
              )}

              {/* Natural percentage pill */}
              <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 text-[#28A745] border border-[#E7E7E7] text-[11px] font-bold rounded-full shadow-xs">
                {product.naturalPercentage || 99}% Natural origin
              </div>
            </div>

            {/* Quick Guarantees Under Image */}
            <div className="w-full grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-[#F4F4F7] text-center text-[11px] text-[#6C757D]">
              <div>
                <strong className="block text-[#0A0029]">Made in India</strong>
                <span>Clinical Lab</span>
              </div>
              <div>
                <strong className="block text-[#0A0029]">0% Sulfates</strong>
                <span>Gentle formula</span>
              </div>
              <div>
                <strong className="block text-[#0A0029]">100% Recyclable</strong>
                <span>Eco packaging</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between bg-[#F7F4F1] max-h-[80vh] overflow-y-auto">
            <div>
              {/* Rating & Volume */}
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  <span className="font-bold text-[#0A0029]">{product.rating.toFixed(1)}</span>
                  <span className="text-[#6C757D] ml-1">({product.reviewsCount} reviews)</span>
                </div>
                <span className="text-[#6C757D] font-semibold">{product.volume}</span>
              </div>

              {/* Title & Tagline */}
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0A0029] leading-tight">
                {product.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#E31B23] font-semibold mt-1">
                {product.tagline}
              </p>

              <p className="mt-3 text-xs sm:text-sm text-[#6C757D] leading-relaxed">
                {product.description}
              </p>

              {/* Tabs Navigation */}
              <div className="flex items-center border-b border-[#E7E7E7] mt-6 gap-6 text-xs font-semibold">
                {[
                  { id: 'benefits', label: 'Benefits' },
                  { id: 'actives', label: 'Key Actives' },
                  { id: 'how_to_use', label: 'How to Use' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-2.5 transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'border-[#0A0029] text-[#0A0029] font-bold'
                        : 'border-transparent text-[#6C757D] hover:text-[#0A0029]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="py-4">
                {activeTab === 'benefits' && (
                  <div className="space-y-2">
                    {product.technicalSpecs.map((spec, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#E7E7E7] text-xs">
                        <span className="text-[#6C757D] font-medium">{spec.label}</span>
                        <span className="font-bold text-[#0A0029] text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'actives' && (
                  <div className="space-y-2">
                    {product.keyActives.map((act, i) => (
                      <div key={i} className="flex items-start space-x-2.5 p-2.5 bg-white rounded-xl border border-[#E7E7E7] text-xs">
                        <Leaf className="w-4 h-4 text-[#28A745] shrink-0 mt-0.5" />
                        <span className="font-semibold text-[#0A0029]">{act}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'how_to_use' && (
                  <div className="space-y-2.5">
                    {product.usageProtocol.map((step, i) => (
                      <div key={i} className="flex items-start space-x-3 p-2.5 bg-white rounded-xl border border-[#E7E7E7] text-xs">
                        <span className="w-5 h-5 rounded-full bg-[#F7F4F1] text-[#0A0029] font-bold flex items-center justify-center shrink-0 border border-[#E7E7E7]">
                          {i + 1}
                        </span>
                        <span className="text-[#6C757D] mt-0.5 leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Price, Quantity, and Actions */}
            <div className="pt-4 border-t border-[#E7E7E7]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-[#0A0029]">
                    {formattedPrice}
                  </span>
                  <span className="text-xs text-[#6C757D]">
                    ({formatPrice(product.price, currency)} each)
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center bg-white border border-[#E7E7E7] rounded-full p-1 shadow-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-full hover:bg-[#F4F4F7] flex items-center justify-center text-[#0A0029] transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-[#0A0029]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 rounded-full hover:bg-[#F4F4F7] flex items-center justify-center text-[#0A0029] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  className="py-3.5 px-4 bg-[#0A0029] hover:bg-[#E31B23] text-white text-xs font-bold rounded-full transition-all shadow-xs flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add to Bag
                </button>

                <button
                  onClick={() => {
                    onQuickBuy(product, quantity);
                    onClose();
                  }}
                  className="py-3.5 px-4 bg-white hover:bg-[#F4F4F7] text-[#0A0029] border border-[#0A0029] hover:border-[#E31B23] hover:text-[#E31B23] text-xs font-bold rounded-full transition-all flex items-center justify-center"
                >
                  Instant Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
