import React from 'react';
import { Star, Plus, Check, Camera, Upload, Edit3 } from 'lucide-react';
import { Product, Currency } from '../types';
import { ProductArtwork } from './ProductArtwork';
import { formatPrice } from '../utils/locationCurrency';
import { isAIStudioEditMode } from '../utils/environment';

interface ProductCardProps {
  product: Product;
  currency: Currency;
  onAddToCart: (product: Product) => void;
  onQuickBuy: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
  isInCart: boolean;
  onOpenPhotoUpload?: (product: Product) => void;
  onSavePhoto?: (productId: string, dataUrl: string) => void;
  isPhotoGlobalMode?: boolean;
  isAdminActive?: boolean;
  onEditProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  onAddToCart,
  onOpenDetails,
  isInCart,
  onOpenPhotoUpload,
  onSavePhoto,
  isAdminActive,
  onEditProduct,
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const canEdit = isAIStudioEditMode(isAdminActive);
  const formattedPrice = formatPrice(product.price, currency);
  const formattedComparePrice = product.compareAtPrice
    ? formatPrice(product.compareAtPrice, currency)
    : null;
  const isOutOfStock = !product.inStock || product.stockUnits <= 0;
  const isLowStock = !isOutOfStock && product.stockUnits <= 8;

  const handleDirectFile = (file: File) => {
    if (!canEdit || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (onSavePhoto) {
        onSavePhoto(product.id, reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <article
      className={`group bg-[#14171F] border border-white/10 hover:border-white/25 rounded-xl overflow-hidden flex flex-col justify-between transition-colors duration-200 ${
        isOutOfStock ? 'opacity-75' : ''
      }`}
      onDragOver={
        canEdit
          ? (e) => {
              e.preventDefault();
              setIsDragOver(true);
            }
          : undefined
      }
      onDragLeave={canEdit ? () => setIsDragOver(false) : undefined}
      onDrop={
        canEdit
          ? (e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleDirectFile(e.dataTransfer.files[0]);
              }
            }
          : undefined
      }
    >
      {/* Packshot Visual Container */}
      <div
        onClick={() => onOpenDetails(product)}
        className="relative cursor-pointer overflow-hidden aspect-[4/3] bg-[#F5F3EF] border-b border-white/10"
      >
        {canEdit && isDragOver && (
          <div className="absolute inset-0 z-30 bg-[#0B0D12]/85 flex flex-col items-center justify-center text-white p-3 text-center">
            <Upload className="w-6 h-6 text-[#FF4D00] mb-1.5" />
            <span className="text-xs font-mono uppercase tracking-wider">Drop Product Photo</span>
          </div>
        )}

        {/* Single quiet top-left tag */}
        {product.badge && (
          <span className="absolute top-3.5 left-3.5 z-10 font-mono text-[10px] font-semibold uppercase tracking-wider text-white bg-[#0B0D12]/90 px-2 py-0.5 rounded-sm border border-white/15 pointer-events-none">
            {product.badge}
          </span>
        )}

        {/* Edit Controls (Admin / Edit Mode Only) */}
        {canEdit && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
            {isAdminActive && onEditProduct && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProduct(product);
                }}
                className="px-2 py-1 bg-[#FF4D00] text-white text-[10px] font-mono font-semibold rounded-sm cursor-pointer flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>EDIT</span>
              </button>
            )}
            {onOpenPhotoUpload && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPhotoUpload(product);
                }}
                className="p-1.5 bg-[#0B0D12]/85 text-white border border-white/20 rounded-sm cursor-pointer"
                title="Replace Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {product.fieldImg ? (
          <img
            src={product.fieldImg}
            alt={product.name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <ProductArtwork artType={product.artType} badge={product.badge} className="w-full h-full" />
        )}
      </div>

      {/* Product Metadata Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Clean Unboxed Metadata Line */}
          <div className="flex items-center justify-between gap-2 text-xs text-[#C8C4BC] mb-2">
            <span className="truncate font-mono text-[11px] uppercase tracking-wider">
              {product.category === 'GROOMING' ? 'FRAGRANCE' : product.category} · {product.volume.split('/')[0].trim()}
            </span>
            <span className="flex items-center gap-1 shrink-0 font-mono text-[11px] tabular-nums text-white">
              <Star className="w-3 h-3 fill-[#FF4D00] text-[#FF4D00]" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-[#C8C4BC]">({product.reviewsCount})</span>
            </span>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onOpenDetails(product)}
            className="font-editorial text-lg font-semibold text-white group-hover:text-[#FF4D00] leading-snug cursor-pointer line-clamp-1 transition-colors"
          >
            {product.name}
          </h3>

          {/* Concise Tagline */}
          <p className="mt-1.5 text-xs text-[#C8C4BC] line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>

          {/* Key Actives OR Calibrated Shade Dots */}
          {product.shades && product.shades.length > 0 ? (
            <div
              onClick={() => onOpenDetails(product)}
              className="mt-3 flex items-center gap-2 cursor-pointer"
              title="Click to open Shade Matcher & Before/After Slider"
            >
              <div className="flex items-center -space-x-1">
                {product.shades.slice(0, 6).map((s) => (
                  <span
                    key={s.id}
                    className="w-4 h-4 rounded-full border border-[#14171F] ring-1 ring-white/25"
                    style={{ backgroundColor: s.hex }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-medium text-white underline decoration-white/30 underline-offset-2">
                {product.shades.length} calibrated shades · Before/After
              </span>
            </div>
          ) : (
            <div className="mt-3 text-[11px] text-[#C8C4BC]/85 truncate">
              {product.keyActives
                .slice(0, 2)
                .map((a) => a.split('(')[0].trim())
                .join(' · ')}
            </div>
          )}
        </div>

        {/* Price & Action Footer */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2 tabular-nums">
              <span className="text-base font-bold text-white">{formattedPrice}</span>
              {formattedComparePrice && (
                <span className="text-xs text-[#C8C4BC] line-through">{formattedComparePrice}</span>
              )}
            </div>

            {isLowStock ? (
              <span className="text-[11px] font-mono text-[#FF4D00] font-medium tabular-nums">
                {product.stockUnits} units left
              </span>
            ) : (
              <span className="text-[11px] text-[#22C55E] font-medium">
                {product.naturalPercentage || 99}% natural
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {isOutOfStock ? (
              <div className="col-span-2 py-2.5 px-4 bg-[#1C202B] text-[#C8C4BC] text-xs font-semibold rounded-md text-center">
                Temporarily Sold Out
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onAddToCart(product)}
                  className={`py-2.5 px-3 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isInCart
                      ? 'bg-[#1F7A4C] text-white'
                      : 'bg-[#1C202B] hover:bg-white text-white hover:text-[#0B0D12] border border-white/15'
                  }`}
                >
                  {isInCart ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>In Bag</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onOpenDetails(product)}
                  className="py-2.5 px-3 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center whitespace-nowrap cursor-pointer"
                >
                  {product.beforeAfterEvidence ? 'Results & Spec' : 'View Spec'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
