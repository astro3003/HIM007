import React, { useState } from 'react';
import { ProductReview } from '../types';
import { Star, ShieldCheck, ThumbsUp, Filter, MessageSquare, Check } from 'lucide-react';

interface PDPReviewsSectionProps {
  reviews: ProductReview[];
  rating: number;
  totalReviewsCount: number;
  productName: string;
  onAddReview?: (newReview: ProductReview) => void;
}

export const PDPReviewsSection: React.FC<PDPReviewsSectionProps> = ({
  reviews: initialReviews,
  rating,
  totalReviewsCount,
  productName,
  onAddReview,
}) => {
  const [reviewsList, setReviewsList] = useState<ProductReview[]>(initialReviews);
  const [filter, setFilter] = useState<'all' | 'verified' | 'bearded' | '5stars'>('all');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

  const [authorName, setAuthorName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [selectedShade, setSelectedShade] = useState('04 Medium Olive');
  const [skinType, setSkinType] = useState('Combination / Oily T-Zone');
  const [beardType, setBeardType] = useState('2-3 Day Heavy Stubble');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleVoteHelpful = (id: string) => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewComment.trim()) return;

    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      author: authorName,
      rating: newRating,
      date: 'Just now',
      title: reviewTitle || 'Exceptional undetectable finish',
      comment: reviewComment,
      verified: true,
      shade: selectedShade,
      skinType,
      beardType,
      helpfulCount: 1,
    };

    setReviewsList([newRev, ...reviewsList]);
    if (onAddReview) onAddReview(newRev);

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsWriteReviewOpen(false);
      setAuthorName('');
      setReviewTitle('');
      setReviewComment('');
    }, 1500);
  };

  const filteredReviews = reviewsList.filter((r) => {
    if (filter === 'verified') return r.verified;
    if (filter === 'bearded') return Boolean(r.beardType && r.beardType.toLowerCase() !== 'clean shaven');
    if (filter === '5stars') return r.rating === 5;
    return true;
  });

  return (
    <div className="w-full bg-[#14171F] border border-white/10 rounded-2xl p-6 sm:p-8 my-8 text-[#F6F4F0]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-6 gap-4">
        <div>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#FF4D00]">
            Real Customer Insight
          </div>
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white mt-1">
            Customer Reviews &amp; Experiences
          </h3>
          <p className="text-xs sm:text-sm text-[#C8C4BC] mt-1">
            Unfiltered feedback from men who use {productName} in their daily routines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsWriteReviewOpen(true)}
          className="px-4 py-2.5 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-bold rounded-md transition-colors flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Aggregate Score */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-6 border-b border-white/10 items-center">
        <div className="md:col-span-4 flex items-center space-x-4 bg-[#111319] p-5 rounded-xl border border-white/10">
          <div className="text-center">
            <span className="font-editorial text-4xl sm:text-5xl font-bold text-white tabular-nums">
              {rating.toFixed(1)}
            </span>
            <div className="flex items-center justify-center text-[#FF4D00] mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <div className="text-[11px] text-[#C8C4BC] font-mono mt-1 tabular-nums">
              Based on {totalReviewsCount} reviews
            </div>
          </div>

          <div className="h-14 w-px bg-white/10" />

          <div className="text-xs text-[#C8C4BC] space-y-1">
            <div>
              <strong className="text-white font-bold">98%</strong> would recommend to a friend
            </div>
            <div>
              <strong className="text-white font-bold">96%</strong> reported zero stubble buildup
            </div>
          </div>
        </div>

        <div className="md:col-span-5 space-y-1.5 text-xs tabular-nums">
          {[
            { star: 5, pct: 92 },
            { star: 4, pct: 7 },
            { star: 3, pct: 1 },
            { star: 2, pct: 0 },
            { star: 1, pct: 0 },
          ].map((bar) => (
            <div key={bar.star} className="flex items-center space-x-2">
              <span className="w-10 text-[#C8C4BC] font-medium flex items-center">
                {bar.star} <Star className="w-3 h-3 fill-[#FF4D00] text-[#FF4D00] ml-1 inline" />
              </span>
              <div className="flex-1 h-2 bg-[#111319] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF4D00] rounded-full"
                  style={{ width: `${bar.pct}%` }}
                />
              </div>
              <span className="w-8 text-[11px] text-[#C8C4BC] font-mono text-right">
                {bar.pct}%
              </span>
            </div>
          ))}
        </div>

        <div className="md:col-span-3 bg-[#111319] p-4 rounded-xl border border-white/10 text-center text-xs text-[#C8C4BC] space-y-1.5">
          <ShieldCheck className="w-6 h-6 text-[#22C55E] mx-auto" />
          <div className="font-bold text-white">100% Verified Buyers</div>
          <p className="text-[11px] leading-relaxed">
            Reviews authenticated from genuine customer orders through Delhivery Air &amp; BlueDart.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 py-4 border-b border-white/10 overflow-x-auto text-xs font-semibold">
        <span className="text-[#C8C4BC] flex items-center mr-2 shrink-0">
          <Filter className="w-3.5 h-3.5 mr-1" />
          Filter:
        </span>
        {[
          { id: 'all', label: 'All Reviews' },
          { id: 'verified', label: 'Verified Buyers Only' },
          { id: 'bearded', label: 'With Facial Hair / Stubble' },
          { id: '5stars', label: '5-Star Rated' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-md transition-colors shrink-0 cursor-pointer ${
              filter === tab.id
                ? 'bg-[#FF4D00] text-white'
                : 'bg-[#111319] text-[#C8C4BC] hover:text-white border border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-white/10 mt-2">
        {filteredReviews.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#C8C4BC]">
            No reviews match the selected filter.
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const votes = (rev.helpfulCount || 0) + (helpfulVotes[rev.id] || 0);
            return (
              <div key={rev.id} className="py-5 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-editorial text-sm font-bold text-white">
                      {rev.author}
                    </span>
                    {rev.verified && (
                      <span className="inline-flex items-center text-[10px] font-semibold text-[#22C55E]">
                        <Check className="w-3 h-3 mr-0.5" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#C8C4BC] font-mono">
                    {rev.date}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#C8C4BC]">
                  <div className="flex items-center text-[#FF4D00]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-current' : 'text-white/20'
                        }`}
                      />
                    ))}
                  </div>

                  {rev.shade && <span>Shade: <strong className="text-white">{rev.shade}</strong></span>}
                  {rev.skinType && <span>· {rev.skinType}</span>}
                  {rev.beardType && <span>· {rev.beardType}</span>}
                </div>

                <h4 className="font-editorial text-base font-bold text-white">
                  {rev.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#EDEAE4] leading-relaxed">
                  {rev.comment}
                </p>

                <div className="pt-1 flex items-center space-x-3 text-xs text-[#C8C4BC]">
                  <span>Was this review helpful?</span>
                  <button
                    type="button"
                    onClick={() => handleVoteHelpful(rev.id)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-md border border-white/15 hover:border-[#FF4D00] text-[11px] font-medium text-white bg-[#111319] transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3 h-3 text-[#C8C4BC]" />
                    <span>Helpful ({votes})</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Write a Review Modal */}
      {isWriteReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div
            className="w-full max-w-lg bg-[#14171F] rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/15 relative max-h-[90vh] overflow-y-auto text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FF4D00]">
                  HIM Review Portal
                </span>
                <h4 className="font-editorial text-xl font-bold text-white">
                  Review {productName}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsWriteReviewOpen(false)}
                className="text-[#C8C4BC] hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {isSubmitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h5 className="font-editorial text-xl font-bold text-white">
                  Review Submitted!
                </h5>
                <p className="text-xs text-[#C8C4BC]">
                  Thank you for contributing your real experience to the HIM community.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-white mb-1">Your Rating *</label>
                  <div className="flex items-center space-x-1 text-[#FF4D00]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewRating(s)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${s <= newRating ? 'fill-current' : 'text-white/20'}`} />
                      </button>
                    ))}
                    <span className="ml-2 font-bold text-white text-sm">{newRating} of 5 Stars</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">Your Name or Handle *</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Vikram M."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#111319] border border-white/15 text-white focus:outline-none focus:border-[#FF4D00] text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-white mb-1">Shade Worn</label>
                    <select
                      value={selectedShade}
                      onChange={(e) => setSelectedShade(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#111319] border border-white/15 text-white text-xs"
                    >
                      <option value="01 Fair Warm">01 Fair Warm</option>
                      <option value="02 Light Neutral">02 Light Neutral</option>
                      <option value="03 Medium Wheatish">03 Medium Wheatish</option>
                      <option value="04 Medium Olive">04 Medium Olive</option>
                      <option value="05 Tan Warm">05 Tan Warm</option>
                      <option value="06 Deep Rich">06 Deep Rich</option>
                      <option value="07 Espresso Dark">07 Espresso Dark</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-white mb-1">Skin Type</label>
                    <select
                      value={skinType}
                      onChange={(e) => setSkinType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#111319] border border-white/15 text-white text-xs"
                    >
                      <option value="Combination / Oily T-Zone">Combination</option>
                      <option value="Normal / Balanced">Normal</option>
                      <option value="Dry / Dehydrated">Dry</option>
                      <option value="Sensitive / Prone to Redness">Sensitive</option>
                      <option value="Very Oily">Very Oily</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-white mb-1">Facial Hair</label>
                    <select
                      value={beardType}
                      onChange={(e) => setBeardType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#111319] border border-white/15 text-white text-xs"
                    >
                      <option value="2-3 Day Heavy Stubble">2-3 Day Stubble</option>
                      <option value="Clean Shaven">Clean Shaven</option>
                      <option value="Short Boxed Beard">Short Beard</option>
                      <option value="Full Majestic Beard">Full Beard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">Review Headline</label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Invisible coverage, does not turn stubble white"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#111319] border border-white/15 text-white focus:outline-none focus:border-[#FF4D00] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-white mb-1">Your Experience &amp; Notes *</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe how the finish looks in daylight, how it feels on skin, whether it affected your beard hair or pores..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#111319] border border-white/15 text-white focus:outline-none focus:border-[#FF4D00] text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsWriteReviewOpen(false)}
                    className="px-4 py-2.5 rounded-md border border-white/15 text-xs font-semibold text-[#C8C4BC] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
                  >
                    Publish Verified Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
