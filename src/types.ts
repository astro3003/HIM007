export type ProductCategory = 'ALL' | 'COSMETIC COVERAGE' | 'FACE' | 'BODY' | 'HAIR' | 'BEARD & SHAVE' | 'KITS' | 'GROOMING' | 'ACCESSORIES' | 'APPAREL / FUTURE';

export interface ProductShade {
  id: string;
  name: string;
  hex: string;
  undertone: 'Warm Golden' | 'Neutral' | 'Warm Olive' | 'Cool Peach' | 'Rich Caramel' | 'Deep Espresso';
  skinToneDesc: string;
  fitzpatrickScale: string;
  recommendedFor: string;
  modelPreviewImg?: string;
}

export interface EvidenceModuleData {
  title: string;
  subtitle: string;
  beforeImg: string;
  afterImg: string;
  beforeLabel?: string;
  afterLabel?: string;
  skinContext: string;
  poreInspectionNotes: string;
  beardFollicleNotes: string;
  evidencePoints: {
    title: string;
    description: string;
    tag: string;
  }[];
  clinicalStats: {
    percentage: number;
    claim: string;
    subtext: string;
  }[];
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  shade?: string;
  skinType?: string;
  beardType?: string;
  helpfulCount: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  volume: string;
  specCode: string;
  badge: string;
  rating: number;
  reviewsCount: number;
  tagline: string;
  description: string;
  naturalPercentage?: number;
  technicalSpecs: {
    label: string;
    value: string;
  }[];
  keyActives: string[];
  usageProtocol: string[];
  inStock: boolean;
  stockUnits: number;
  lowStockThreshold?: number;
  sku: string;
  artType: 'tube' | 'clay' | 'cologne' | 'deodorant' | 'pump' | 'comb' | 'carabiner' | 'scrub_bar' | 'beard_serum';
  fieldImg?: string;
  customImg?: string;
  saleBadge?: string;
  // Shade, Evidence & Formulation Specs
  isCosmeticCoverage?: boolean;
  coverageLevel?: 'Sheer / Undetectable' | 'Targeted Precision' | 'Invisible Translucent' | 'Natural Matte';
  finishType?: 'Invisible Natural Matte' | 'Soft Focus Skin-Real' | 'Zero-Glare True Matte' | 'Ultra-Light Hydrating';
  shades?: ProductShade[];
  selectedShadeId?: string;
  selectedShadeName?: string;
  beforeAfterEvidence?: EvidenceModuleData;
  reviewsList?: ProductReview[];
  gallery?: string[];
  dermatologyInsights?: {
    testedBy: string;
    comedogenicRating: string;
    waterResistance: string;
    stubbleCompatibility: string;
    inciHighlights: { name: string; role: string; source: string }[];
  };
}

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 10 for 10% or 15 for $15
  minOrderValue: number;
  isActive: boolean;
  timesUsed: number;
  maxUses?: number;
  expiresAt?: string;
  isFlashBanner?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedShade?: string;
}

export type OrderStatus = 'deployed' | 'inspected' | 'transit' | 'delivered' | 'cancelled';

export interface OrderEvent {
  timestamp: string;
  title: string;
  description: string;
  location: string;
  done: boolean;
}

export interface Order {
  orderId: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  trackingNumber: string;
  estimatedDelivery: string;
  deliveryMethod: string;
  paymentMethod: string;
  adminNotes?: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  events: OrderEvent[];
}

export interface Currency {
  code: string;
  symbol: string;
  rate: number;
  name: string;
}

export interface ReelItem {
  id: string;
  handle: string;
  title: string;
  location: string;
  views: string;
  likes: number;
  caption: string;
  duration: string;
  gradientBg: string;
  accentColor: string;
  taggedProductId: string;
  coverImg?: string;
  comments: { user: string; text: string; time: string }[];
}

export type SecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  severity: SecuritySeverity;
  type: string;
  title: string;
  detail: string;
  ip: string;
  userAgent: string;
  method: string;
  path: string;
  payloadPreview?: string;
  blocked: boolean;
  acknowledged: boolean;
}

export interface SecurityStats {
  totalEvents: number;
  blockedAttacks: number;
  unreadAlertsCount: number;
  criticalCount: number;
  highCount: number;
  activeLockoutsCount: number;
  blockedIpsCount: number;
}

export interface SecuritySettings {
  webhookUrl: string;
  alertEmail: string;
  autoBlockCritical: boolean;
  blockedIps: string[];
  updatedAt: string;
}

export interface SecuritySnapshot {
  events: SecurityEvent[];
  stats: SecurityStats;
  settings: SecuritySettings;
  activeLockouts: { ip: string; lockedUntil: number }[];
}

