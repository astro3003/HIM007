import React, { useState } from 'react';
import { Play, Pause, Heart, Eye, Volume2, VolumeX, ShoppingBag, X, Share2, Sparkles, ArrowRight, Camera, Upload } from 'lucide-react';
import { ReelItem, Product, Currency } from '../types';
import { formatPrice } from '../utils/locationCurrency';
import { isAIStudioEditMode } from '../utils/environment';

interface ReelsFeedProps {
  reels: ReelItem[];
  products: Product[];
  currency: Currency;
  onAddToCart: (product: Product) => void;
  onOpenProduct: (product: Product) => void;
  isAdminActive?: boolean;
  customImages?: Record<string, string>;
  onUpdateImage?: (id: string, dataUrl: string) => void;
}

export const ReelsFeed: React.FC<ReelsFeedProps> = ({
  reels,
  products,
  currency,
  onAddToCart,
  onOpenProduct,
  isAdminActive = false,
  customImages = {},
  onUpdateImage,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [draggingReelId, setDraggingReelId] = useState<string | null>(null);
  const canEdit = isAIStudioEditMode(isAdminActive);
  const [likesState, setLikesState] = useState<Record<string, { count: number; liked: boolean }>>(() => {
    const map: Record<string, { count: number; liked: boolean }> = {};
    reels.forEach((r) => {
      map[r.id] = { count: r.likes, liked: false };
    });
    return map;
  });
  const [activeTheaterReel, setActiveTheaterReel] = useState<ReelItem | null>(null);

  const getTaggedProduct = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  const handleToggleLike = (e: React.MouseEvent, reelId: string) => {
    e.stopPropagation();
    setLikesState((prev) => {
      const current = prev[reelId] || { count: 1000, liked: false };
      return {
        ...prev,
        [reelId]: {
          count: current.liked ? current.count - 1 : current.count + 1,
          liked: !current.liked,
        },
      };
    });
  };

  return (
    <section className="py-16 sm:py-20 bg-[#F7F4F1] border-b border-[#E7E7E7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-[#E7E7E7] gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#E31B23] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMMUNITY IN ACTION</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0A0029] tracking-tight">
              As seen on our community
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6C757D]">
              Real morning routines and grooming tutorials from men across the world.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="px-4 py-2 bg-white border border-[#E7E7E7] rounded-full text-[#0A0029] font-semibold shadow-xs">
              Tag <strong className="text-[#E31B23]">@him.mard</strong> to be featured
            </span>
          </div>
        </div>

        {/* 9:16 Vertical Video / Reel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reels.map((reel) => {
            const isPlaying = playingId === reel.id;
            const likeInfo = likesState[reel.id] || { count: reel.likes, liked: false };
            const taggedProduct = getTaggedProduct(reel.taggedProductId);
            const activeCover = customImages[`reel-${reel.id}`] || reel.coverImg || '/assets/aistudio/Men_posing_with_motorcycle_products_cb7d58eb_b75f4f77.jpg';
            const isDragging = draggingReelId === reel.id;

            return (
              <div
                key={reel.id}
                onClick={() => setActiveTheaterReel(reel)}
                onDragOver={canEdit ? (e) => {
                  e.preventDefault();
                  setDraggingReelId(reel.id);
                } : undefined}
                onDragLeave={canEdit ? () => setDraggingReelId(null) : undefined}
                onDrop={canEdit ? (e) => {
                  e.preventDefault();
                  setDraggingReelId(null);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        onUpdateImage?.(`reel-${reel.id}`, reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }
                } : undefined}
                className={`group relative aspect-[9/16] bg-[#0A0029] rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-lg transition-all border ${
                  isDragging ? 'border-[#E31B23] ring-2 ring-[#E31B23]/40' : 'border-[#E7E7E7]'
                }`}
              >
                {/* Custom Video Cover Poster or Simulated Video Backdrop */}
                {activeCover ? (
                  <img
                    src={activeCover}
                    alt={reel.caption}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-b ${reel.gradientBg} opacity-90`} />
                )}

                {/* Dragging Drop Overlay */}
                {isDragging && (
                  <div className="absolute inset-0 z-30 bg-[#0A0029]/85 flex flex-col items-center justify-center text-white p-3 text-center">
                    <Upload className="w-8 h-8 text-[#E31B23] animate-bounce mb-1" />
                    <span className="text-xs font-bold uppercase">Drop Video Cover</span>
                  </div>
                )}

                {/* Top Overlay Bar */}
                <div className="relative z-10 p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full text-white text-[11px] font-semibold">
                    <span>{reel.handle}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* Change Reel Cover Button (AI Studio Edit Mode Only) */}
                    {canEdit && (
                      <label
                        title="Upload or change reel video cover"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 bg-white/90 hover:bg-white text-[#0A0029] hover:text-[#E31B23] rounded-full transition-all shadow-xs cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const reader = new FileReader();
                              reader.onload = () => {
                                onUpdateImage?.(`reel-${reel.id}`, reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                    <span className="text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded-full">
                      {reel.duration}
                    </span>
                  </div>
                </div>

                {/* Center Play Button Overlay */}
                <div className="relative z-10 self-center">
                  <div className="w-12 h-12 rounded-full bg-white/95 text-[#0A0029] flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#E31B23] group-hover:text-white transition-all">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Bottom Card Content */}
                <div className="relative z-10 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent space-y-2.5 text-white">
                  <p className="text-xs font-medium line-clamp-2 leading-snug">
                    {reel.caption}
                  </p>

                  {/* Tagged Product Link */}
                  {taggedProduct && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProduct(taggedProduct);
                      }}
                      className="bg-white/15 backdrop-blur-md rounded-xl p-2 flex items-center justify-between text-xs hover:bg-white/25 transition-colors"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#E31B23] shrink-0" />
                        <span className="truncate font-semibold text-[11px]">{taggedProduct.name}</span>
                      </div>
                      <span className="font-bold text-[11px] ml-2 shrink-0">
                        {formatPrice(taggedProduct.price, currency)}
                      </span>
                    </div>
                  )}

                  {/* Bottom Stats */}
                  <div className="flex items-center justify-between text-[11px] text-white/80 pt-1">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{reel.views.toLocaleString()}</span>
                    </div>

                    <button
                      onClick={(e) => handleToggleLike(e, reel.id)}
                      className="flex items-center space-x-1 hover:text-red-400 transition-colors"
                    >
                      <Heart className={`w-3.5 h-3.5 ${likeInfo.liked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span>{likeInfo.count.toLocaleString()}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Theater Modal */}
      {activeTheaterReel && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveTheaterReel(null)}
        >
          <div
            className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden bg-[#0A0029] shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${activeTheaterReel.gradientBg}`} />

            {/* Header */}
            <div className="relative z-10 p-5 flex items-center justify-between text-white">
              <span className="font-bold text-sm">{activeTheaterReel.handle}</span>
              <button
                onClick={() => setActiveTheaterReel(null)}
                className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="relative z-10 p-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white space-y-3">
              <p className="text-sm font-medium">{activeTheaterReel.caption}</p>

              {getTaggedProduct(activeTheaterReel.taggedProductId) && (
                <button
                  onClick={() => {
                    const prod = getTaggedProduct(activeTheaterReel.taggedProductId);
                    if (prod) {
                      setActiveTheaterReel(null);
                      onOpenProduct(prod);
                    }
                  }}
                  className="w-full py-3 px-4 bg-white text-[#0A0029] hover:bg-[#E31B23] hover:text-white transition-colors text-xs font-bold rounded-full flex items-center justify-between shadow-md"
                >
                  <span>Shop Featured Product</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
