import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, Camera, ArrowUpRight, Check } from 'lucide-react';
import { Product } from '../types';
import { isAIStudioEditMode } from '../utils/environment';
import { backendService } from '../services/api';

interface CustomerReviewsSectionProps {
  products?: Product[];
  onOpenProduct?: (product: Product) => void;
  onQuickBuy?: (product: Product) => void;
  isAdminActive?: boolean;
  customImages?: Record<string, string>;
  onUpdateImage?: (id: string, dataUrl: string) => void;
}

interface ReviewCardItem {
  id: string;
  name: string;
  location: string;
  role: string;
  defaultImage: string;
  rating: number;
  productId: string;
  productName: string;
  review: string;
}

const STORAGE_KEY = 'him_reviewer_photos_v1';

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({
  products = [],
  onOpenProduct,
  isAdminActive = false,
  customImages = {},
  onUpdateImage,
}) => {
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const canEdit = isAIStudioEditMode(isAdminActive);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCustomPhotos(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSavePhoto = async (reviewId: string, dataUrl: string, reviewerName: string) => {
    const updated = { ...customPhotos, [reviewId]: dataUrl };
    setCustomPhotos(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (onUpdateImage) {
      onUpdateImage(`rev-${reviewId}`, dataUrl);
    } else {
      void backendService.saveCustomImage(`rev-${reviewId}`, dataUrl, 'reviews');
    }
    showToast(`Updated photo for ${reviewerName}`);
  };

  const handleFileForCard = (reviewId: string, reviewerName: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (.png, .jpg, .jpeg, .webp)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      handleSavePhoto(reviewId, dataUrl, reviewerName);
    };
    reader.readAsDataURL(file);
  };

  const reviews: ReviewCardItem[] = [
    {
      id: 'rev-01',
      name: 'Arnav Singhal',
      location: 'DLF Phase 5, Gurugram',
      role: 'Tech Product Lead',
      defaultImage: '/assets/aistudio/Man_holding_body_scrub_bar_2K_20261015015720_9255140f.jpg',
      rating: 5,
      productId: 'prod-him-scrub-bar',
      productName: "Men's Deep Cleanse & Muscle Recovery Scrub Bar",
      review:
        'HIM Scrub Bar has transformed my post-commute shower in Delhi-NCR heat and pollution. Activated charcoal and Kasturi Manjal clear collar tan and sweat without any dry tightness. Fresh Santal scent lasts hours.',
    },
    {
      id: 'rev-02',
      name: 'Karanvir Rajput',
      location: 'Sector 9, Chandigarh',
      role: 'CrossFit Athlete & Coach',
      defaultImage: '/assets/aistudio/HIM_hair_oil_poster_bdee7e9c_4f187a4c.jpg',
      rating: 5,
      productId: 'prod-him-hair-oil',
      productName: 'HIM Hair Oil',
      review:
        'Almond and Rosemary Oil strengthened my roots against hard-water hair fall within three weeks—super lightweight, zero mineral oil, and washes clean in one rinse.',
    },
    {
      id: 'rev-03',
      name: 'Dhruv Nambiar',
      location: 'Indiranagar, Bengaluru',
      role: 'UI/UX Architect & Cyclist',
      defaultImage: '/assets/aistudio/Man_applying_beard_serum_dfe1531a_f57eb2d2.jpg',
      rating: 5,
      productId: 'prod-him-beard-serum',
      productName: 'HIM Beard Serum',
      review:
        'Just 3 drops warmed between palms softened my coarse beard immediately without oily grease or collar stains—completely cleared chin itch in Bengaluru traffic.',
    },
    {
      id: 'rev-04',
      name: 'Rishabh Sen',
      location: 'Bandra West, Mumbai',
      role: 'Creative Director',
      defaultImage: '/assets/aistudio/Man_applying_face_serum_0a6bdd49_d5dc3594.jpg',
      rating: 5,
      productId: 'prod-him-face-brightening-serum',
      productName: "Men's Face Brightening Serum",
      review:
        'Three drops after washing absorb in 10 seconds with zero greasy shine—Vitamin C and Niacinamide cleared stubborn dark spots even through humid Mumbai commutes.',
    },
  ];

  return (
    <section id="reviews-section" className="cv-section py-16 sm:py-24 bg-[#0B0D12] border-b border-white/10 text-[#F6F4F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 mb-10 border-b border-white/10 gap-6">
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-[#FF4D00]">
              Verified Indian Men · 4.9 / 5 Average Rating
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-white tracking-tight mt-1 text-balance">
              Tested in Indian heat, gym sweat &amp; hard water.
            </h2>
          </div>

          <div className="flex items-center gap-8 text-xs tabular-nums shrink-0">
            <div>
              <div className="font-editorial text-2xl font-semibold text-white">2,260+</div>
              <div className="text-[#C8C4BC]">Verified reviews</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="font-editorial text-2xl font-semibold text-[#FF4D00]">4.9 / 5</div>
              <div className="text-[#C8C4BC]">Customer rating</div>
            </div>
          </div>
        </div>

        {/* Admin Notification */}
        {isAdminActive && notification && (
          <div className="mb-6 max-w-md mx-auto p-3 bg-[#14171F] border border-white/15 text-white text-xs font-medium rounded-lg flex items-center justify-between">
            <span>{notification}</span>
            <Check className="w-4 h-4 text-[#22C55E]" />
          </div>
        )}

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev) => {
            const matchedProduct = products.find((p) => p.id === rev.productId);
            const activePhoto = customImages[`rev-${rev.id}`] || customPhotos[rev.id] || rev.defaultImage;
            const isDragging = draggingCardId === rev.id;

            return (
              <div
                key={rev.id}
                className={`relative bg-[#14171F] border rounded-xl p-5 transition-all flex flex-col justify-between group ${
                  isDragging ? 'border-[#FF4D00] ring-2 ring-[#FF4D00]/25' : 'border-white/10 hover:border-white/25'
                }`}
                onDragOver={
                  canEdit
                    ? (e) => {
                        e.preventDefault();
                        setDraggingCardId(rev.id);
                      }
                    : undefined
                }
                onDragLeave={canEdit ? () => setDraggingCardId(null) : undefined}
                onDrop={
                  canEdit
                    ? (e) => {
                        e.preventDefault();
                        setDraggingCardId(null);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileForCard(rev.id, rev.name, e.dataTransfer.files[0]);
                        }
                      }
                    : undefined
                }
              >
                <div>
                  {/* Reviewer Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden bg-[#1C202B] shrink-0 border border-white/15 group/avatar">
                      <img
                        src={activePhoto}
                        alt={rev.name}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {canEdit && (
                        <label
                          title="Upload reviewer photo"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white rounded-full"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileForCard(rev.id, rev.name, e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-white truncate">{rev.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                      </div>
                      <div className="text-[11px] text-[#C8C4BC] truncate">{rev.role} · {rev.location}</div>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center text-[#FF4D00] mb-2.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>

                  {/* Review Quote */}
                  <p className="text-xs sm:text-sm text-[#EDEAE4] leading-relaxed">
                    “{rev.review}”
                  </p>
                </div>

                {/* Purchased Product Link */}
                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] uppercase text-[#C8C4BC] block">Verified Product</span>
                    <button
                      type="button"
                      onClick={() => matchedProduct && onOpenProduct?.(matchedProduct)}
                      className="text-xs font-semibold text-white hover:text-[#FF4D00] truncate block text-left cursor-pointer transition-colors"
                    >
                      {rev.productName}
                    </button>
                  </div>

                  {matchedProduct && onOpenProduct && (
                    <button
                      type="button"
                      onClick={() => onOpenProduct(matchedProduct)}
                      className="text-xs font-semibold text-white hover:text-[#FF4D00] shrink-0 transition-colors cursor-pointer"
                      aria-label={`View ${rev.productName}`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
