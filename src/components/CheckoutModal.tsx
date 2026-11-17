import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Smartphone, Banknote, QrCode, Lock, Zap, Truck } from 'lucide-react';
import { CartItem, Currency, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  discountAmount: number;
  freeShippingThreshold: number;
  onOrderPlaced: (order: Order) => void;
}

type PaymentType = 'card' | 'applepay' | 'upi' | 'cod';
type DeliverySpeed = 'express' | 'standard';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  discountAmount,
  freeShippingThreshold,
  onOrderPlaced,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');

  const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeed>('express');
  const [paymentType, setPaymentType] = useState<PaymentType>('upi');

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 8891');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvc, setCardCvc] = useState('409');
  const [upiId, setUpiId] = useState('operator@okaxis');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isFreeStandard = subtotal >= freeShippingThreshold;
  const deliveryFee = deliverySpeed === 'express' ? 12 : (isFreeStandard ? 0 : 8);
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !address || !city || !postalCode) {
      setErrorMsg('Please complete all required shipping fields.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    setTimeout(() => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const orderRef = `#HIM-${randomNum}`;
      const trackingCode = `HIM-EXP-${Math.floor(100000 + Math.random() * 900000)}`;

      const newOrder: Order = {
        orderId: orderRef,
        createdAt: new Date().toISOString(),
        items: [...items],
        subtotal,
        shippingFee: deliveryFee,
        discount: discountAmount,
        total: totalAmount,
        currency: currency.code,
        status: 'deployed',
        trackingNumber: trackingCode,
        estimatedDelivery: 'Tomorrow, 14:00 - 17:00 Priority Express',
        deliveryMethod: deliverySpeed === 'express' ? 'Priority Express Dispatch' : 'Standard Ground Courier',
        paymentMethod:
          paymentType === 'card'
            ? 'Encrypted Credit Card'
            : paymentType === 'applepay'
            ? 'Apple Pay 1-Tap'
            : paymentType === 'upi'
            ? `UPI (${upiId})`
            : 'Cash on Delivery',
        customer: {
          fullName,
          email,
          phone: phone || '+91 98201 44100',
          address,
          city,
          state: stateCode || 'Maharashtra',
          postalCode,
          country,
        },
        events: [
          {
            timestamp: 'JUST NOW',
            title: 'ORDER CONFIRMED',
            description: `Payment authenticated via ${paymentType.toUpperCase()}. Order received by logistics team.`,
            location: 'HIM CENTRAL LOGISTICS',
            done: true,
          },
          {
            timestamp: '+45 MINS (SCHEDULED)',
            title: 'QUALITY & ECO-PACKAGING INSPECTION',
            description: 'Recyclable carton packaging & bottle sealing check.',
            location: 'MUMBAI QUALITY & LAB HUB',
            done: false,
          },
          {
            timestamp: '+2.5 HOURS',
            title: 'DISPATCHED VIA EXPRESS COURIER',
            description: 'Order handed to priority delivery partner.',
            location: 'MUMBAI FULFILLMENT HUB',
            done: false,
          },
          {
            timestamp: 'TOMORROW 15:00',
            title: 'DELIVERED',
            description: 'Direct delivery to your doorstep.',
            location: `${city.toUpperCase() || 'HOME'}, ${stateCode || 'IN'}`,
            done: false,
          },
        ],
      };

      setIsProcessing(false);
      onOrderPlaced(newOrder);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-[#14171F] border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-auto text-[#F6F4F0]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#111319] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Lock className="w-4 h-4 text-[#FF4D00]" />
            <span className="font-editorial text-base font-bold text-white">
              Secure Express Checkout
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-[#1C202B] text-[#C8C4BC] hover:text-white transition-colors rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="p-6 sm:p-8 space-y-6 bg-[#14171F]">
          {errorMsg && (
            <div className="p-3 bg-[#FF4D00]/15 border border-[#FF4D00]/40 text-[#FF4D00] text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Delivery Address */}
            <div className="space-y-4">
              <div className="font-mono text-xs font-bold text-[#FF4D00] uppercase tracking-wider border-b border-white/10 pb-1.5 flex items-center justify-between">
                <span>01. Delivery Address</span>
                <span className="text-[10px] text-[#C8C4BC] font-normal">256-bit encrypted</span>
              </div>

              <div>
                <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full bg-[#111319] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none focus:border-[#FF4D00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="v.malhotra@grooming.in"
                    className="w-full bg-[#111319] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none focus:border-[#FF4D00]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98201 44100"
                    className="w-full bg-[#111319] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none focus:border-[#FF4D00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">Street Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Bandra West, Linking Road"
                  className="w-full bg-[#111319] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none focus:border-[#FF4D00]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full bg-[#111319] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none focus:border-[#FF4D00]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">State</label>
                  <input
                    type="text"
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full bg-[#111319] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none focus:border-[#FF4D00]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="400050"
                    className="w-full bg-[#111319] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none focus:border-[#FF4D00]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1.5 font-semibold">Delivery Speed</label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setDeliverySpeed('express')}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      deliverySpeed === 'express'
                        ? 'bg-[#1C202B] border-[#FF4D00] text-white'
                        : 'bg-[#111319] border-white/10 text-[#C8C4BC] hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold tabular-nums">
                      <span className="flex items-center text-white">
                        <Truck className="w-3.5 h-3.5 mr-1 text-[#FF4D00]" />
                        Express
                      </span>
                      <span>{currency.symbol}{(12 * currency.rate).toFixed(0)}</span>
                    </div>
                    <div className="text-[11px] text-[#C8C4BC] mt-1">Next-Day Priority Courier</div>
                  </div>

                  <div
                    onClick={() => setDeliverySpeed('standard')}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      deliverySpeed === 'standard'
                        ? 'bg-[#1C202B] border-[#FF4D00] text-white'
                        : 'bg-[#111319] border-white/10 text-[#C8C4BC] hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold tabular-nums">
                      <span className="text-white">Standard</span>
                      <span>{isFreeStandard ? 'FREE' : `${currency.symbol}${(8 * currency.rate).toFixed(0)}`}</span>
                    </div>
                    <div className="text-[11px] text-[#C8C4BC] mt-1">2-4 Days Ground Delivery</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment & Recap */}
            <div className="space-y-4">
              <div className="font-mono text-xs font-bold text-[#FF4D00] uppercase tracking-wider border-b border-white/10 pb-1.5 flex items-center justify-between">
                <span>02. Payment Method</span>
                <span className="text-[#22C55E] text-[10px] font-bold">Instant Checkout</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 bg-[#111319] p-1 rounded-lg border border-white/10">
                {[
                  { id: 'card', label: 'Card', Icon: CreditCard },
                  { id: 'applepay', label: 'Apple Pay', Icon: Smartphone },
                  { id: 'upi', label: 'UPI / QR', Icon: QrCode },
                  { id: 'cod', label: 'COD', Icon: Banknote },
                ].map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentType(id as PaymentType)}
                    className={`py-2 text-[11px] font-bold uppercase rounded-md transition-colors flex flex-col items-center justify-center cursor-pointer ${
                      paymentType === id
                        ? 'bg-[#FF4D00] text-white'
                        : 'text-[#C8C4BC] hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mb-0.5" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-[#111319] border border-white/10 rounded-lg space-y-3">
                {paymentType === 'card' && (
                  <>
                    <div>
                      <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-[#14171F] border border-white/15 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF4D00]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-[#14171F] border border-white/15 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF4D00]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">CVC / CVV</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-[#14171F] border border-white/15 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF4D00]"
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentType === 'applepay' && (
                  <div className="p-3 text-center space-y-2">
                    <div className="w-10 h-10 mx-auto bg-white text-[#0B0D12] rounded-full flex items-center justify-center font-bold text-lg">
                      
                    </div>
                    <div className="text-xs text-white font-bold">Apple Pay Biometric Pass Ready</div>
                    <p className="text-[11px] text-[#C8C4BC]">One-tap instant payment.</p>
                  </div>
                )}

                {paymentType === 'upi' && (
                  <div className="space-y-2">
                    <label className="block text-[11px] text-[#C8C4BC] uppercase font-semibold">Virtual Payment Address (UPI ID)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-[#14171F] border border-white/15 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF4D00]"
                    />
                    <div className="text-[11px] text-[#22C55E]">Instant auto-approval simulated on submit.</div>
                  </div>
                )}

                {paymentType === 'cod' && (
                  <div className="p-2 text-xs text-[#C8C4BC] space-y-1">
                    <div className="text-white font-bold">Cash on Delivery (COD)</div>
                    <div>Pay with cash or UPI upon delivery.</div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-[#111319] border border-white/10 rounded-lg space-y-2 text-xs tabular-nums">
                <div className="flex justify-between text-[#C8C4BC]">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items):</span>
                  <span className="text-white font-semibold">{currency.symbol}{(subtotal * currency.rate).toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-[#C8C4BC]">
                  <span>Delivery ({deliverySpeed === 'express' ? 'Express' : 'Standard'}):</span>
                  <span className="text-white">{currency.symbol}{(deliveryFee * currency.rate).toFixed(0)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#FF4D00] font-semibold">
                    <span>Discount applied:</span>
                    <span>-{currency.symbol}{(discountAmount * currency.rate).toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-editorial font-bold text-white pt-2 border-t border-white/10">
                  <span>Total:</span>
                  <span className="text-[#FF4D00]">{currency.symbol}{(totalAmount * currency.rate).toFixed(0)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-[#FF4D00] hover:bg-[#E03E1A] disabled:bg-white/20 text-white font-bold text-xs rounded-md transition-colors flex items-center justify-center cursor-pointer"
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Confirming Order...
                  </span>
                ) : (
                  <span>Confirm &amp; Place Order</span>
                )}
              </button>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-[#C8C4BC]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>30-Day Money-Back Guarantee</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
