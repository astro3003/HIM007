import { Currency } from '../types';
import { CURRENCIES } from '../catalog/products';

export interface LocationDetectionResult {
  countryName: string;
  countryCode: string;
  currencyCode: 'INR' | 'USD' | 'AED' | 'EUR' | 'GBP' | 'CAD' | 'JPY';
  source: 'ip_api' | 'timezone_heuristic' | 'cached_preference';
  city?: string;
  flag: string;
}

// Map Country codes to appropriate default currencies
const COUNTRY_TO_CURRENCY: Record<string, 'INR' | 'USD' | 'AED' | 'EUR' | 'GBP' | 'CAD' | 'JPY'> = {
  // India (Primary)
  IN: 'INR',
  // UAE & Gulf region
  AE: 'AED',
  SA: 'AED',
  QA: 'AED',
  KW: 'AED',
  OM: 'AED',
  BH: 'AED',
  // North America
  US: 'USD',
  CA: 'CAD',
  // Europe
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  CH: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
  SE: 'EUR',
  NO: 'EUR',
  // Asia
  JP: 'JPY',
};

// Flags for visual display
const COUNTRY_FLAGS: Record<string, string> = {
  IN: '🇮🇳',
  AE: '🇦🇪',
  US: '🇺🇸',
  GB: '🇬🇧',
  EU: '🇪🇺',
  CA: '🇨🇦',
  JP: '🇯🇵',
};

/**
 * Speech synthesis announcement for Location & Currency Voice
 */
export function playLocationVoiceAnnouncement(
  countryName: string = 'India',
  currencyCode: string = 'INR',
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  try {
    window.speechSynthesis.cancel();
    const currencyName = currencyCode === 'INR' ? 'Indian Rupees' : currencyCode;
    const text = `Namaste! You are currently accessing HIM from ${countryName}. All catalog prices are displayed in ${currencyName}. Free express delivery across India on orders over 999 Rupees. Proudly made in India.`;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    // Pick optimal English voice
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(
      v => v.lang === 'en-IN' || v.name.toLowerCase().includes('india') || v.lang.startsWith('en')
    );
    if (indianVoice) {
      utterance.voice = indianVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Voice announcement error:', err);
    if (onEnd) onEnd();
    return false;
  }
}

export function stopLocationVoiceAnnouncement() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Detect user's location and suggested currency:
 * Defaults to India (INR) unless manually overridden or specific IP.
 */
export async function detectLocationAndCurrency(): Promise<LocationDetectionResult> {
  // 1. Check if user explicitly picked a preferred currency in localStorage
  try {
    const savedCurrency = localStorage.getItem('him_selected_currency');
    const savedCountry = localStorage.getItem('him_detected_country');
    const savedCode = localStorage.getItem('him_detected_country_code');
    if (savedCurrency && CURRENCIES[savedCurrency]) {
      return {
        countryName: savedCountry || (savedCurrency === 'INR' ? 'India' : 'Selected Region'),
        countryCode: savedCode || (savedCurrency === 'INR' ? 'IN' : 'GL'),
        currencyCode: savedCurrency as any,
        source: 'cached_preference',
        flag: COUNTRY_FLAGS[savedCode || ''] || (savedCurrency === 'INR' ? '🇮🇳' : '🌐'),
        city: savedCurrency === 'INR' ? 'Mumbai' : undefined,
      };
    }
  } catch {
    // ignore
  }

  // 2. Try fast IP-based geolocation
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2200);

    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const countryCode = (data.country_code || '').toUpperCase();
      const countryName = data.country_name || 'India';
      const city = data.city || 'Mumbai';
      
      let matchedCurrency = COUNTRY_TO_CURRENCY[countryCode] || 'INR';
      
      if (countryCode === 'IN') matchedCurrency = 'INR';

      return {
        countryName: countryCode === 'IN' ? 'India' : countryName,
        countryCode: countryCode || 'IN',
        currencyCode: matchedCurrency,
        source: 'ip_api',
        city,
        flag: COUNTRY_FLAGS[countryCode] || '🇮🇳',
      };
    }
  } catch {
    // API failed or timed out, proceed to browser heuristic
  }

  // 3. Fallback: Default to India / INR
  return {
    countryName: 'India',
    countryCode: 'IN',
    currencyCode: 'INR',
    source: 'timezone_heuristic',
    flag: '🇮🇳',
    city: 'Mumbai',
  };
}

/**
 * Format currency price accurately with proper locale grouping (e.g. Indian Lakhs/thousands or standard).
 */
export function formatPrice(amountInUSD: number, currency: Currency): string {
  const converted = amountInUSD * currency.rate;

  if (currency.code === 'INR') {
    // Indian Rupee formatting (e.g., ₹2,016)
    return `₹${Math.round(converted).toLocaleString('en-IN')}`;
  }

  if (currency.code === 'AED') {
    // UAE Dirham formatting (e.g., AED 88)
    return `AED ${Math.round(converted).toLocaleString('en-US')}`;
  }

  if (currency.code === 'JPY') {
    return `¥${Math.round(converted).toLocaleString('ja-JP')}`;
  }

  // Standard USD, EUR, GBP, CAD
  return `${currency.symbol}${converted.toFixed(0)}`;
}
