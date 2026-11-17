import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowRight } from 'lucide-react';
import { Product, Currency, ProductCategory } from '../types';
import { ProductCard } from './ProductCard';
import { formatPrice } from '../utils/locationCurrency';

interface ProductGridProps {
  products: Product[];
  currency: Currency;
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  onAddToCart: (product: Product) => void;
  onQuickBuy: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
  onAcquireKit: () => void;
  cartProductIds: Set<string>;
  onOpenPhotoUpload?: (product: Product) => void;
  onSaveCustomPhoto?: (productId: string, dataUrl: string) => void;
  isAdminActive?: boolean;
  onEditProduct?: (product: Product) => void;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating';

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  currency,
  selectedCategory,
  onSelectCategory,
  onAddToCart,
  onQuickBuy,
  onOpenDetails,
  onAcquireKit,
  cartProductIds,
  onOpenPhotoUpload,
  onSaveCustomPhoto,
  isAdminActive = false,
  onEditProduct,
}) => {
  const [sortOption, setSortOption] = useState<SortOption>('featured');

  const categories: { id: ProductCategory; label: string }[] = [
    { id: 'ALL', label: 'All Drops' },
    { id: 'FACE', label: 'Face Care' },
    { id: 'BODY', label: 'Body & Gym' },
    { id: 'HAIR', label: 'Hair Care' },
    { id: 'BEARD & SHAVE', label: 'Beard' },
    { id: 'GROOMING', label: 'Fragrance' },
  ];

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (selectedCategory !== 'ALL') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    switch (sortOption) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        break;
    }
    return list;
  }, [products, selectedCategory, sortOption]);

  return (
    <section id="products-section" className="py-16 sm:py-20 bg-[#0B0D12] border-b border-white/10 text-[#F6F4F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Segmented Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-6 mb-8 border-b border-white/10 gap-5">
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-[#FF4D00]">
              HIM Lineup · {filteredProducts.length} Active Formulations
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-white tracking-tight mt-1 text-balance">
              Nine essentials. Zero shelf clutter.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Segmented Filter Control */}
            <div className="flex items-center gap-1 bg-[#14171F] border border-white/10 p-1 rounded-lg overflow-x-auto no-scrollbar max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#FF4D00] text-white font-semibold'
                      : 'text-[#C8C4BC] hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Clean Sort Select */}
            <div className="flex items-center gap-2 bg-[#14171F] px-3 py-1.5 rounded-lg border border-white/10 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#C8C4BC]" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-[#14171F] text-white font-medium focus:outline-none cursor-pointer"
                aria-label="Sort products"
              >
                <option value="featured">Featured Order</option>
                <option value="rating">Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Featured Collection Banner */}
        {products[0] && (
          <div className="mb-10 bg-[#14171F] border border-white/10 rounded-xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#FF4D00] font-semibold">
                3 Soap Bars Now On Sale · Save 15% With Code WELCOME15
              </div>
              <h3 className="font-editorial text-xl sm:text-2xl font-semibold text-white">
                The 3-Soap HIM Shower Rotation
              </h3>
              <p className="text-xs sm:text-sm text-[#C8C4BC] max-w-2xl">
                Currently selling our Scrub Bar, Ayurvedic De-Tan Soap, and Anti-Acne Clarifying Soap directly. Request a free home sample on any of our other 6 formulas below.
              </p>
            </div>

            <div className="flex items-center gap-5 shrink-0">
              <div className="text-right tabular-nums">
                {products[0].compareAtPrice && (
                  <div className="text-xs text-[#C8C4BC] line-through">
                    Starts at {formatPrice(products[0].compareAtPrice, currency)}
                  </div>
                )}
                <div className="text-xl font-bold text-white">
                  From {formatPrice(products[0].price, currency)}
                </div>
              </div>
              <button
                type="button"
                onClick={onAcquireKit}
                className="px-5 py-3 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>Add All 3 Soaps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="p-10 bg-[#14171F] border border-white/10 rounded-xl text-center space-y-2">
            <p className="font-editorial text-lg text-white font-semibold">
              No items found under “{selectedCategory}”
            </p>
            <p className="text-xs text-[#C8C4BC]">
              Explore all {products.length} live HIM formulations across face, body, hair, beard, and fragrance.
            </p>
            <button
              type="button"
              onClick={() => onSelectCategory('ALL')}
              className="mt-2 px-4 py-2 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
            >
              View All Drops ({products.length})
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                onAddToCart={onAddToCart}
                onQuickBuy={onQuickBuy}
                onOpenDetails={onOpenDetails}
                isInCart={cartProductIds.has(product.id)}
                isAdminActive={isAdminActive}
                onEditProduct={isAdminActive ? onEditProduct : undefined}
                onOpenPhotoUpload={onOpenPhotoUpload}
                onSavePhoto={onSaveCustomPhoto}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
