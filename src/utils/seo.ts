export interface SeoConfig {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
}

const DEFAULT_SITE_URL = 'https://www.heismard.com';
const DEFAULT_IMAGE = '/og-thumbnail.jpg?v=2';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  if (typeof document === 'undefined') return;
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export function syncPageSeo({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = 'website',
}: SeoConfig) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const configuredOrigin = (import.meta as any).env?.VITE_SITE_URL;
  const origin =
    typeof configuredOrigin === 'string' && /^https?:\/\//i.test(configuredOrigin.trim())
      ? configuredOrigin.trim().replace(/\/+$/, '')
      : DEFAULT_SITE_URL;
  const cleanPath = path ?? window.location.pathname ?? '/';
  const canonicalUrl = `${origin}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
  const absoluteImage = image.startsWith('http')
    ? image
    : `${origin}${image.startsWith('/') ? image : `/${image}`}`;

  document.title = title;
  upsertCanonical(canonicalUrl);

  upsertMeta('name', 'description', description);
  upsertMeta('property', 'og:type', type);
  upsertMeta('property', 'og:url', canonicalUrl);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:image', absoluteImage);
  upsertMeta('property', 'og:image:secure_url', absoluteImage);

  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', absoluteImage);

  const verificationCode = (import.meta as any).env?.VITE_GOOGLE_SITE_VERIFICATION;
  if (typeof verificationCode === 'string' && verificationCode.trim()) {
    upsertMeta('name', 'google-site-verification', verificationCode.trim());
  }
}
