import React, { useEffect, useState } from 'react';
import { MessageCircle, X, ArrowRight, CheckCircle2 } from 'lucide-react';

const WHATSAPP_MESSAGE =
  'Take another look at HIM — just 7 products made for the Indian Man. Explore now: https://www.heismard.com/';

const DISMISS_KEY = 'him_mobile_wa_prompt_dismissed_v1';

function isMobileVisitor(): boolean {
  if (typeof window === 'undefined') return false;
  const smallViewport = window.innerWidth < 768;
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent || ''
  );
  return smallViewport || mobileUA;
}

export const MobileWhatsAppPrompt: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'ready' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const checkMobile = () => setIsMobile(isMobileVisitor());
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show prompt only on mobile AFTER >= 12s dwell + genuine scroll interaction (no arrival popups)
  useEffect(() => {
    if (!isMobile) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === 'true') {
        setHasDismissed(true);
        return;
      }
    } catch {
      // safe fallback
    }

    let dwelled = false;
    let interacted = false;
    let opened = false;

    const tryOpen = () => {
      if (!opened && dwelled && interacted) {
        opened = true;
        setIsOpen(true);
      }
    };

    const timer = window.setTimeout(() => {
      dwelled = true;
      tryOpen();
    }, 12000);

    const onScroll = () => {
      if (window.scrollY > 240) {
        interacted = true;
        tryOpen();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [isMobile]);

  if (!isMobile) return null;

  const businessNumber = (
    ((import.meta as unknown as { env?: Record<string, string> })?.env
      ?.VITE_WHATSAPP_BUSINESS_NUMBER || '')
  )
    .replace(/\D/g, '')
    .trim();

  const directWhatsAppHref = businessNumber
    ? `https://wa.me/${businessNumber}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  const handleDismiss = () => {
    setIsOpen(false);
    setHasDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // safe fallback
    }
  };

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setStatus('error');
      setFeedback('Enter a valid 10-digit WhatsApp number.');
      return;
    }

    setStatus('sending');
    setFeedback('');

    try {
      const res = await fetch('/api/whatsapp-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: digits,
          source: 'mobile_visitor_prompt',
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setStatus('error');
        setFeedback(data.error || 'Could not send message right now. Use Open WhatsApp below.');
        return;
      }

      if (data.delivered) {
        setStatus('sent');
        setFeedback('WhatsApp message sent! Check your WhatsApp.');
      } else {
        setStatus('ready');
        setFeedback('Saved! Tap below to open the message directly in WhatsApp.');
      }
    } catch {
      setStatus('error');
      setFeedback('Network error. Tap Open in WhatsApp below.');
    }
  };

  // Compact floating mobile WhatsApp pill when collapsed (keeps mobile sticky footprint minimal)
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-40 md:hidden">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            if (hasDismissed) setHasDismissed(false);
          }}
          aria-label="Get HIM WhatsApp reminder"
          className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#14171F] hover:bg-[#1C202B] text-white border border-white/15 rounded-lg shadow-xl text-xs font-semibold cursor-pointer transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
          <span className="whitespace-nowrap">HIM on WhatsApp</span>
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="HIM Mobile WhatsApp Reminder"
      className="fixed inset-x-3 bottom-3 z-50 md:hidden bg-[#14171F] border border-white/15 rounded-xl shadow-2xl p-4 text-[#F6F4F0]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
          <span>HIM — He Is Man</span>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close WhatsApp reminder"
          className="p-1 text-[#C8C4BC] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-2 text-sm font-medium text-white leading-snug">
        Take another look at HIM — just 7 products made for the Indian Man.
      </p>
      <p className="mt-1 text-xs text-[#C8C4BC] leading-relaxed">
        Get this HIM quick-link straight on WhatsApp so you can come back anytime.
      </p>

      {status === 'sent' ? (
        <div className="mt-3 p-3 bg-[#0B0D12] border border-[#22C55E]/30 rounded-lg flex items-center gap-2 text-xs text-[#22C55E]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      ) : (
        <form onSubmit={handleSendWhatsApp} className="mt-3 space-y-2.5">
          <div className="flex items-center gap-2">
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="+91 WhatsApp number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 min-w-0 bg-[#0B0D12] border border-white/15 rounded-md px-3 py-2 text-xs text-white placeholder-[#C8C4BC]/60 focus:outline-none focus:border-[#FF4D00]"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="px-3.5 py-2 bg-[#FF4D00] hover:bg-[#E03E1A] disabled:opacity-60 text-white text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {status === 'sending' ? 'Sending...' : 'Send'}
            </button>
          </div>

          {feedback && (
            <p
              className={`text-[11px] leading-snug ${
                status === 'error' ? 'text-[#FF4D00]' : 'text-[#22C55E]'
              }`}
            >
              {feedback}
            </p>
          )}

          <a
            href={directWhatsAppHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-[#0B0D12] hover:bg-[#1C202B] border border-[#25D366]/40 text-white text-xs font-semibold rounded-md transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>Open Message in WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </form>
      )}
    </aside>
  );
};
