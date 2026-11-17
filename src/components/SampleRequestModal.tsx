import React, { useState, useEffect } from 'react';
import { X, Gift, CheckCircle2, ArrowRight, ArrowLeft, MapPin, User, Phone, Mail, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { ProductArtwork } from './ProductArtwork';

interface SampleRequestModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSubmitted?: (productName: string) => void;
}

export const SampleRequestModal: React.FC<SampleRequestModalProps> = ({
  isOpen,
  product,
  onClose,
  onSubmitted,
}) => {
  const [step, setStep] = useState<'contact' | 'address' | 'done'>('contact');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('contact');
      setErrorMsg('');
      setIsSubmitting(false);
      setRequestId('');
    }
  }, [isOpen, product?.id]);

  if (!isOpen || !product) return null;

  const handleContactNext = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    if (cleanName.length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (cleanPhone.replace(/\D/g, '').length < 7) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setErrorMsg('');
    setStep('address');
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !city.trim() || !stateName.trim() || !postalCode.trim()) {
      setErrorMsg('Please fill in your complete home delivery address, city, state, and PIN code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const generatedId = `SMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const payload = {
      requestId: generatedId,
      productId: product.id,
      productName: product.name,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      state: stateName.trim(),
      postalCode: postalCode.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('him_sample_requests') || '[]');
      localStorage.setItem('him_sample_requests', JSON.stringify([payload, ...existing].slice(0, 50)));
    } catch {
      // safe local fallback
    }

    try {
      await fetch('/api/sample-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // safe fallback when hosted statically
    }

    setRequestId(generatedId);
    setIsSubmitting(false);
    setStep('done');
    if (onSubmitted) {
      onSubmitted(product.name);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#14171F] border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-auto text-[#F6F4F0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#111319] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Gift className="w-4 h-4 text-[#FF4D00]" />
            <span className="font-editorial text-base font-bold text-white">
              Free Home Sample Request
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sample request modal"
            className="p-1.5 hover:bg-[#1C202B] text-[#C8C4BC] hover:text-white transition-colors rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Product Strip */}
        <div className="px-6 py-3.5 bg-[#0B0D12] border-b border-white/10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5F3EF] border border-white/10 shrink-0 flex items-center justify-center">
            {product.fieldImg ? (
              <img
                src={product.fieldImg}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ProductArtwork artType={product.artType} className="w-full h-full" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#FF4D00] font-semibold">
              Only Soaps On Direct Sale Right Now · Free Trial Sample
            </div>
            <div className="text-sm font-bold text-white truncate">{product.name}</div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-[#FF4D00]/15 border border-[#FF4D00]/40 text-[#FF4D00] text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {step === 'contact' && (
            <form onSubmit={handleContactNext} className="space-y-4">
              <div className="p-3.5 bg-[#111319] border border-white/10 rounded-lg text-xs text-[#C8C4BC] leading-relaxed">
                Currently we only sell our <strong className="text-white">3 HIM Soap Bars</strong> directly. Share your details below—we will send a <strong className="text-[#FF4D00]">free sample</strong> of <strong className="text-white">{product.name}</strong> to your home.
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C8C4BC] mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#C8C4BC] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0B0D12] border border-white/15 focus:border-[#FF4D00] rounded-lg text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C8C4BC] mb-1.5">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#C8C4BC] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0B0D12] border border-white/15 focus:border-[#FF4D00] rounded-lg text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C8C4BC] mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#C8C4BC] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0B0D12] border border-white/15 focus:border-[#FF4D00] rounded-lg text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Home Address</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'address' && (
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="p-3.5 bg-[#FF4D00]/12 border border-[#FF4D00]/40 rounded-lg flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#FF4D00] shrink-0 mt-0.5" />
                <p className="text-xs text-white leading-relaxed">
                  <strong>We will send your free sample to your home!</strong> Please provide your delivery address below so we can dispatch it to you.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C8C4BC] mb-1.5">
                  Home Delivery Address *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#C8C4BC] absolute left-3 top-3" />
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / Flat No., Building, Street, Landmark"
                    className="w-full pl-9 pr-3 py-2 bg-[#0B0D12] border border-white/15 focus:border-[#FF4D00] rounded-lg text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C8C4BC] mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full px-3 py-2.5 bg-[#0B0D12] border border-white/15 focus:border-[#FF4D00] rounded-lg text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C8C4BC] mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full px-3 py-2.5 bg-[#0B0D12] border border-white/15 focus:border-[#FF4D00] rounded-lg text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#C8C4BC] mb-1.5">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="400050"
                    className="w-full px-3 py-2.5 bg-[#0B0D12] border border-white/15 focus:border-[#FF4D00] rounded-lg text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setStep('contact');
                  }}
                  className="px-4 py-3 bg-[#1C202B] hover:bg-[#252A38] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-[#FF4D00] hover:bg-[#E03E1A] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Submitting Request...' : 'Send Free Sample to My Home'}
                </button>
              </div>
            </form>
          )}

          {step === 'done' && (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-[#22C55E]" />
              </div>

              <div className="space-y-1.5">
                <div className="font-mono text-[11px] uppercase tracking-wider text-[#22C55E] font-semibold">
                  Sample Reserved · {requestId}
                </div>
                <h3 className="font-editorial text-xl font-bold text-white">
                  We Will Send Your Free Sample Home!
                </h3>
                <p className="text-xs text-[#C8C4BC] leading-relaxed">
                  Thank you, <strong className="text-white">{fullName}</strong>. Your free sample of{' '}
                  <strong className="text-white">{product.name}</strong> will be dispatched to:
                </p>
              </div>

              <div className="p-3.5 bg-[#0B0D12] border border-white/10 rounded-lg text-left text-xs text-[#EDEAE4] space-y-1">
                <div>{address}</div>
                <div>
                  {city}, {stateName} — {postalCode}
                </div>
                <div className="text-[#C8C4BC] pt-1 border-t border-white/10 mt-2">
                  Updates: {phone} · {email}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-[#FF4D00] hover:bg-[#E03E1A] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Continue Exploring Soaps
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
