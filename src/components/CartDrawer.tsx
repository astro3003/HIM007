import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, Truck, Sparkles } from 'lucide-react';
import { CartItem, Currency } from '../types';
import { ProductArtwork } from './ProductArtwork';
import { formatPrice } from '../utils/locationCurrency';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onOpenCheckout: () => void;
  discountCode: string;
  discountAmount: number;
  onApplyDiscount: (code: string) => boolean;
  freeShippingThreshold: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
  discountCode,
  discountAmount,
  onApplyDiscount,
  freeShippingThreshold,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingFee = subtotal > 0 ? (isFreeShipping ? 0 : 5) : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    if (!promoInput.trim()) return;

    const code = promoInput.trim().toUpperCase();
    const ok = onApplyDiscount(code);
    if (ok) {
      setPromoSuccess(`Code ${code} applied`);
      setPromoInput('');
    } else {
      setPromoError('Invalid code. Try "WELCOME15", "DROP01", or "HEISMAN10"');
    }
  };

  const totalItemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-[#F6F4F0]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-10">
        <div className="w-screen max-w-md bg-[#0B0D12] border-l border-white/15 shadow-2xl flex flex-col justify-between">
          {/* Drawer Top Header */}
          <div className="p-5 bg-[#111319] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <h2 className="font-editorial text-xl font-bold tracking-tight text-white">
                Your Bag
              </h2>
              <span className="px-2.5 py-0.5 bg-[#14171F] text-[#FF4D00] text-xs font-mono font-semibold rounded-sm border border-white/10 tabular-nums">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#C8C4BC] hover:text-white hover:bg-[#1C202B] transition-colors rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="p-4 bg-[#14171F] border-b border-white/10">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="flex items-center">
                <Truck className="w-4 h-4 mr-1.5 text-[#FF4D00]" />
                {isFreeShipping ? (
                  <span className="text-[#22C55E] font-bold">You&apos;ve unlocked Free Express Delivery!</span>
                ) : (
                  <span className="text-[#C8C4BC]">
                    Add <strong className="text-white tabular-nums">{formatPrice(amountNeededForFreeShipping, currency)}</strong> more for free delivery
                  </span>
                )}
              </span>
              <span className="font-mono font-bold text-white tabular-nums">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#0B0D12] border border-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#FF4D00] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#14171F] border border-white/15 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#FF4D00]" />
                </div>
                <h3 className="font-editorial text-lg font-bold text-white">Your bag is empty</h3>
                <p className="text-xs text-[#C8C4BC] max-w-xs">
                  Build your rotation with HIM Face Wash, De-Tan &amp; Anti-Acne bars, Hair Clay, Beard Serum, or Pour Homme Eau De Parfum.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 px-6 py-2.5 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedShade || 'default'}`}
                  className="bg-[#14171F] border border-white/10 rounded-xl p-3.5 flex space-x-3"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#F5F3EF] shrink-0 border border-white/10 flex items-center justify-center">
                    {item.product.fieldImg ? (
                      <img
                        src={item.product.fieldImg}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ProductArtwork artType={item.product.artType} className="w-full h-full" />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-editorial text-sm font-bold text-white truncate pr-2">
                          {item.product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-[#C8C4BC] hover:text-[#FF4D00] transition-colors p-0.5 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-[11px] text-[#C8C4BC]">
                        {item.product.volume} · {item.product.naturalPercentage || 99}% Natural
                      </div>
                      {item.selectedShade && (
                        <div className="inline-flex items-center space-x-1.5 mt-1 px-2 py-0.5 bg-[#111319] border border-white/10 rounded-sm text-[10px] font-semibold text-white w-fit">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/30 shrink-0"
                            style={{ backgroundColor: item.product.shades?.find((s) => s.name === item.selectedShade)?.hex || '#D0A278' }}
                          />
                          <span className="truncate">Shade: {item.selectedShade}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center bg-[#111319] border border-white/15 rounded-md p-0.5">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded-sm hover:bg-[#1C202B] flex items-center justify-center text-white transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded-sm hover:bg-[#1C202B] flex items-center justify-center text-white transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="font-bold text-sm text-white tabular-nums">
                        {formatPrice(item.product.price * item.quantity, currency)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-[#111319] border-t border-white/10 space-y-3">
              <form onSubmit={handleApplyPromo} className="space-y-1">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Promo code (e.g. WELCOME15)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="flex-1 bg-[#14171F] border border-white/15 rounded-md px-3.5 py-2 text-xs text-white uppercase placeholder-[#C8C4BC]/70 focus:outline-none focus:border-[#FF4D00]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1C202B] hover:bg-[#FF4D00] text-white border border-white/15 text-xs font-bold rounded-md transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoSuccess && <div className="text-[11px] text-[#22C55E] font-semibold px-1">{promoSuccess}</div>}
                {promoError && <div className="text-[11px] text-[#FF4D00] font-medium px-1">{promoError}</div>}
              </form>

              <div className="space-y-1.5 text-xs text-[#C8C4BC] pt-2 border-t border-white/10 tabular-nums">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">{formatPrice(subtotal, currency)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#22C55E] font-medium">
                    <span>Discount ({discountCode})</span>
                    <span>-{formatPrice(discountAmount, currency)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Standard Delivery</span>
                  <span>{shippingFee === 0 ? <strong className="text-[#22C55E]">FREE</strong> : formatPrice(shippingFee, currency)}</span>
                </div>

                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                  <span className="font-editorial">Total</span>
                  <span className="text-[#FF4D00]">{formatPrice(finalTotal, currency)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCheckout();
                }}
                className="w-full py-3.5 px-6 bg-[#FF4D00] hover:bg-[#E03E1A] text-white font-bold text-xs rounded-md transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-4 text-[11px] text-[#C8C4BC] pt-1">
                <span>Free 30-day returns</span>
                <span>•</span>
                <span>Secure SSL checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
