import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Banknote, Lock, Truck } from 'lucide-react';
import { CartItem, Currency, Order } from '../types';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (response: any) => void) => void;
    };
  }
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  discountAmount: number;
  freeShippingThreshold: number;
  onOrderPlaced: (order: Order) => void;
}

type PaymentType = 'razorpay' | 'cod';
type DeliverySpeed = 'express' | 'standard';

async function loadRazorpayCheckout(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.Razorpay) return true;

  return new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean(window.Razorpay)));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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
  const [country] = useState('India');

  const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeed>('express');
  const [paymentType, setPaymentType] = useState<PaymentType>('razorpay');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isFreeStandard = subtotal >= freeShippingThreshold;
  const deliveryFee = deliverySpeed === 'express' ? 12 : (isFreeStandard ? 0 : 8);
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

  const buildOrderRecord = (paymentMethodLabel: string): Order => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderRef = `#HIM-${randomNum}`;
    const trackingCode = `HIM-EXP-${Math.floor(100000 + Math.random() * 900000)}`;

    return {
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
      deliveryMethod:
        deliverySpeed === 'express' ? 'Priority Express Dispatch' : 'Standard Ground Courier',
      paymentMethod: paymentMethodLabel,
      customer: {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || '+91 98201 44100',
        address: address.trim(),
        city: city.trim(),
        state: stateCode.trim() || 'Maharashtra',
        postalCode: postalCode.trim(),
        country,
      },
      events: [
        {
          timestamp: 'JUST NOW',
          title: 'ORDER CONFIRMED',
          description: `Payment verified via ${paymentMethodLabel}. Order received by logistics team.`,
          location: 'HIM CENTRAL LOGISTICS',
          done: true,
        },
        {
          timestamp: '+45 MINS (SCHEDULED)',
          title: 'QUALITY & ECO-PACKAGING INSPECTION',
          description: 'Recyclable carton packaging & batch sealing check.',
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
          location: `${city.trim().toUpperCase() || 'HOME'}, ${stateCode.trim() || 'IN'}`,
          done: false,
        },
      ],
    };
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !address.trim() || !city.trim() || !postalCode.trim()) {
      setErrorMsg('Please complete all required shipping fields.');
      return;
    }

    if (paymentType === 'cod') {
      setIsProcessing(true);
      setErrorMsg('');
      const codOrder = buildOrderRecord('Cash on Delivery');
      setIsProcessing(false);
      onOrderPlaced(codOrder);
      return;
    }

    // Razorpay Standard Web Checkout flow
    const displayedRounded = Math.round(totalAmount * currency.rate);
    const amountInPaise = Math.max(0, displayedRounded * 100);
    if (amountInPaise < 100) {
      setErrorMsg('Minimum payable amount is ₹1 (100 paise).');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const sdkReady = await loadRazorpayCheckout();
      if (!sdkReady || !window.Razorpay) {
        setIsProcessing(false);
        setErrorMsg('Unable to load Razorpay Checkout SDK. Please check your connection and retry.');
        return;
      }

      const createRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: currency.code,
          receipt: `him_${Date.now()}`,
        }),
      });

      const createData = await createRes.json().catch(() => ({}));
      if (!createRes.ok || !createData.order_id) {
        setIsProcessing(false);
        setErrorMsg(createData.error || 'Could not initiate payment order. Please try again.');
        return;
      }

      const envKeyId = (
        (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_RAZORPAY_KEY_ID || ''
      ).trim();
      const razorpayKeyId =
        createData.key_id || (/^rzp_(test|live)_/.test(envKeyId) ? envKeyId : '');

      if (!razorpayKeyId) {
        setIsProcessing(false);
        setErrorMsg('Razorpay public key is missing or invalid (must start with rzp_test_ or rzp_live_).');
        return;
      }

      const options = {
        key: razorpayKeyId,
        amount: createData.amount,
        currency: createData.currency,
        name: 'HIM — He Is Man',
        description: `Order (${items.reduce((s, i) => s + i.quantity, 0)} Soap Item${
          items.reduce((s, i) => s + i.quantity, 0) === 1 ? '' : 's'
        })`,
        order_id: createData.order_id,
        prefill: {
          name: fullName.trim(),
          email: email.trim(),
          contact: phone.trim(),
        },
        notes: {
          shipping_city: city.trim(),
          postal_code: postalCode.trim(),
        },
        theme: {
          color: '#FF4D00',
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json().catch(() => ({}));
            if (!verifyRes.ok || !verifyData.verified) {
              setIsProcessing(false);
              setErrorMsg(
                verifyData.error || 'Payment verification failed. Amount was not marked as paid.'
              );
              return;
            }

            const paidOrder = buildOrderRecord(`Razorpay (${response.razorpay_payment_id})`);
            setIsProcessing(false);
            onOrderPlaced(paidOrder);
          } catch {
            setIsProcessing(false);
            setErrorMsg('Network error verifying payment signature. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setErrorMsg('Payment cancelled. You can complete your payment anytime.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (failureResp: any) => {
        setIsProcessing(false);
        const reason =
          failureResp?.error?.description ||
          failureResp?.error?.reason ||
          'Payment declined by bank or gateway.';
        setErrorMsg(`Payment failed: ${reason}`);
      });

      rzp.open();
    } catch {
      setIsProcessing(false);
      setErrorMsg('Unable to reach payment gateway server. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 overflow-y-auto">
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
              <div className="font-mono text-xs font-bold text-[#FF4D00] uppercase tracking-wider border-b border-white/10 pb-1.5">
                01. Delivery Destination
              </div>

              <div>
                <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-[#111319] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none focus:border-[#FF4D00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#111319] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none focus:border-[#FF4D00]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98XXXXXXXX"
                    className="w-full bg-[#111319] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none focus:border-[#FF4D00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / Flat, Building, Street"
                  className="w-full bg-[#111319] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none focus:border-[#FF4D00]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">
                    City *
                  </label>
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
                  <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">
                    State
                  </label>
                  <input
                    type="text"
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full bg-[#111319] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-[#C8C4BC]/50 focus:outline-none focus:border-[#FF4D00]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1 font-semibold">
                    Postal Code *
                  </label>
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
                <label className="block text-[11px] text-[#C8C4BC] uppercase mb-1.5 font-semibold">
                  Delivery Speed
                </label>
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
                      <span>
                        {currency.symbol}
                        {(12 * currency.rate).toFixed(0)}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#C8C4BC] mt-1">
                      Next-Day Priority Courier
                    </div>
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
                      <span>
                        {isFreeStandard
                          ? 'FREE'
                          : `${currency.symbol}${(8 * currency.rate).toFixed(0)}`}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#C8C4BC] mt-1">
                      2-4 Days Ground Delivery
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment & Recap */}
            <div className="space-y-4">
              <div className="font-mono text-xs font-bold text-[#FF4D00] uppercase tracking-wider border-b border-white/10 pb-1.5 flex items-center justify-between">
                <span>02. Payment Method</span>
                <span className="text-[#22C55E] text-[10px] font-bold">
                  Razorpay Secured
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#111319] p-1.5 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setPaymentType('razorpay')}
                  className={`py-2.5 px-3 text-xs font-bold uppercase rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentType === 'razorpay'
                      ? 'bg-[#FF4D00] text-white'
                      : 'text-[#C8C4BC] hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Razorpay (UPI / Card)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('cod')}
                  className={`py-2.5 px-3 text-xs font-bold uppercase rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentType === 'cod'
                      ? 'bg-[#FF4D00] text-white'
                      : 'text-[#C8C4BC] hover:text-white'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Cash on Delivery</span>
                </button>
              </div>

              <div className="p-4 bg-[#111319] border border-white/10 rounded-lg space-y-2">
                {paymentType === 'razorpay' ? (
                  <>
                    <div className="text-xs text-white font-bold">
                      Razorpay Standard Checkout
                    </div>
                    <p className="text-[11px] text-[#C8C4BC] leading-relaxed">
                      Pay securely with UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, or Wallets. Your payment signature is verified server-side before confirming your order.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-xs text-white font-bold">
                      Cash on Delivery (COD)
                    </div>
                    <p className="text-[11px] text-[#C8C4BC] leading-relaxed">
                      Pay with cash or UPI scanner upon doorstep delivery.
                    </p>
                  </>
                )}
              </div>

              <div className="p-4 bg-[#111319] border border-white/10 rounded-lg space-y-2 text-xs tabular-nums">
                <div className="flex justify-between text-[#C8C4BC]">
                  <span>
                    Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items):
                  </span>
                  <span className="text-white font-semibold">
                    {currency.symbol}
                    {(subtotal * currency.rate).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between text-[#C8C4BC]">
                  <span>
                    Delivery ({deliverySpeed === 'express' ? 'Express' : 'Standard'}):
                  </span>
                  <span className="text-white">
                    {currency.symbol}
                    {(deliveryFee * currency.rate).toFixed(0)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#FF4D00] font-semibold">
                    <span>Discount applied:</span>
                    <span>
                      -{currency.symbol}
                      {(discountAmount * currency.rate).toFixed(0)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-editorial font-bold text-white pt-2 border-t border-white/10">
                  <span>Total:</span>
                  <span className="text-[#FF4D00]">
                    {currency.symbol}
                    {(totalAmount * currency.rate).toFixed(0)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-[#FF4D00] hover:bg-[#E03E1A] disabled:bg-white/20 text-white font-bold text-xs rounded-md transition-colors flex items-center justify-center cursor-pointer tabular-nums"
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {paymentType === 'razorpay'
                      ? 'Initializing Razorpay...'
                      : 'Confirming Order...'}
                  </span>
                ) : paymentType === 'razorpay' ? (
                  <span>
                    Pay {currency.symbol}
                    {(totalAmount * currency.rate).toFixed(0)} with Razorpay
                  </span>
                ) : (
                  <span>Confirm &amp; Place COD Order</span>
                )}
              </button>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-[#C8C4BC]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>256-Bit Encrypted · 30-Day Money-Back Guarantee</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
