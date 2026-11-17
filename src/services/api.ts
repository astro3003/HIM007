import {
  Product,
  Promotion,
  Order,
  OrderStatus,
  SecuritySnapshot,
  SecuritySettings,
} from '../types';
import { PRODUCTS } from '../data/products';
import { INITIAL_PROMOTIONS } from '../data/promotions';

const STORAGE_KEYS = {
  PRODUCTS: 'him_products_db_real_v9',
  PROMOTIONS: 'him_promotions_db',
  ORDERS: 'him_orders_history',
  FLASH_BANNER: 'him_flash_banner_active',
  FLASH_TEXT: 'him_flash_banner_text',
  ADMIN_TOKEN: 'him_admin_token_v1',
};

// Safe local storage helpers
function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading localStorage key: ${key}`, err);
  }
  return fallback;
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing localStorage key: ${key}`, err);
  }
}

function getSessionToken(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token: string; expiresAt: number };
    if (!parsed.token || Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      return null;
    }
    return parsed.token;
  } catch {
    return null;
  }
}

function saveSessionToken(token: string, expiresAt: number): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, JSON.stringify({ token, expiresAt }));
  } catch {
    // ignore storage errors
  }
}

function clearSessionToken(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
  } catch {
    // ignore
  }
}

function buildAdminHeaders(includeJson = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (includeJson) headers['Content-Type'] = 'application/json';
  const token = getSessionToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export interface AdminLoginResult {
  success: boolean;
  error?: string;
  remainingAttempts?: number;
  lockedUntil?: number;
  retryAfterSeconds?: number;
  unreadAlertsCount?: number;
}

/**
 * HIM Backend & Storage Service
 * Enforces authenticated Admin API boundaries with safe local cache fallback.
 */
export const backendService = {
  // AUTH & SECURITY SESSION
  hasAdminSession(): boolean {
    return Boolean(getSessionToken());
  },

  async loginAdmin(pin: string): Promise<AdminLoginResult> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        saveSessionToken(data.token, data.expiresAt || Date.now() + 8 * 3600 * 1000);
        return {
          success: true,
          unreadAlertsCount: data.unreadAlertsCount || 0,
        };
      }
      return {
        success: false,
        error: data.error || 'Authentication failed',
        remainingAttempts: data.remainingAttempts,
        lockedUntil: data.lockedUntil,
        retryAfterSeconds: data.retryAfterSeconds,
      };
    } catch {
      return {
        success: false,
        error: 'Security gateway unreachable. Please check server status.',
      };
    }
  },

  async checkAdminSession(): Promise<{ authenticated: boolean; unreadAlertsCount: number }> {
    try {
      const res = await fetch('/api/auth/session', {
        headers: buildAdminHeaders(false),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (!data.authenticated) {
          clearSessionToken();
        }
        return {
          authenticated: Boolean(data.authenticated),
          unreadAlertsCount: data.unreadAlertsCount || 0,
        };
      }
    } catch {
      // offline fallback
    }
    return { authenticated: false, unreadAlertsCount: 0 };
  },

  async logoutAdmin(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: buildAdminHeaders(false),
        credentials: 'include',
      });
    } catch {
      // safe
    }
    clearSessionToken();
  },

  async changeAdminPin(currentPin: string, newPin: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/auth/change-pin', {
        method: 'POST',
        headers: buildAdminHeaders(true),
        credentials: 'include',
        body: JSON.stringify({ currentPin, newPin }),
      });
      const data = await res.json();
      return {
        success: Boolean(res.ok && data.success),
        message: data.message || data.error || 'Failed to update PIN',
      };
    } catch {
      return { success: false, message: 'Unable to reach security endpoint.' };
    }
  },

  // SECURITY ALERTS & FIREWALL CONTROLS (ADMIN ONLY)
  async getSecuritySnapshot(): Promise<SecuritySnapshot | null> {
    if (!getSessionToken()) return null;
    try {
      const res = await fetch('/api/security/events', {
        headers: buildAdminHeaders(false),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          return {
            events: data.events || [],
            stats: data.stats,
            settings: data.settings,
            activeLockouts: data.activeLockouts || [],
          };
        }
      }
    } catch {
      // safe
    }
    return null;
  },

  async acknowledgeSecurityEvents(): Promise<SecuritySnapshot | null> {
    if (!getSessionToken()) return null;
    try {
      const res = await fetch('/api/security/acknowledge', {
        method: 'POST',
        headers: buildAdminHeaders(false),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          return {
            events: data.events || [],
            stats: data.stats,
            settings: data.settings,
            activeLockouts: data.activeLockouts || [],
          };
        }
      }
    } catch {
      // safe
    }
    return null;
  },

  async updateSecuritySettings(updates: {
    webhookUrl?: string;
    alertEmail?: string;
    autoBlockCritical?: boolean;
    unblockIp?: string;
    blockIp?: string;
  }): Promise<SecuritySettings | null> {
    if (!getSessionToken()) return null;
    try {
      const res = await fetch('/api/security/settings', {
        method: 'PUT',
        headers: buildAdminHeaders(true),
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        return data.settings || null;
      }
    } catch {
      // safe
    }
    return null;
  },

  async sendTestSecurityAlert(): Promise<{ ok: boolean; webhookDelivered: boolean }> {
    if (!getSessionToken()) return { ok: false, webhookDelivered: false };
    try {
      const res = await fetch('/api/security/test-alert', {
        method: 'POST',
        headers: buildAdminHeaders(false),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        return { ok: true, webhookDelivered: Boolean(data.webhookDelivered) };
      }
    } catch {
      // safe
    }
    return { ok: false, webhookDelivered: false };
  },

  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    const local = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, PRODUCTS);

    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setLocal(STORAGE_KEYS.PRODUCTS, data.products);
          return data.products;
        }
      }
    } catch {
      // Backend offline fallback
    }
    return local;
  },

  async syncProductsToBackend(products: Product[]): Promise<void> {
    setLocal(STORAGE_KEYS.PRODUCTS, products);
    if (!getSessionToken()) return;
    try {
      await fetch('/api/products/sync', {
        method: 'POST',
        headers: buildAdminHeaders(true),
        credentials: 'include',
        body: JSON.stringify({ products }),
      });
    } catch {
      // safe fallback
    }
  },

  async saveProduct(product: Product): Promise<Product> {
    const current = await this.getProducts();
    const idx = current.findIndex((p) => p.id === product.id);
    const updated =
      idx >= 0
        ? current.map((p, i) => (i === idx ? { ...product } : p))
        : [product, ...current];
    setLocal(STORAGE_KEYS.PRODUCTS, updated);

    if (getSessionToken()) {
      try {
        await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: buildAdminHeaders(true),
          credentials: 'include',
          body: JSON.stringify(product),
        });
      } catch {
        // safe
      }
    }
    return product;
  },

  async deleteProduct(productId: string): Promise<void> {
    const current = await this.getProducts();
    const updated = current.filter((p) => p.id !== productId);
    setLocal(STORAGE_KEYS.PRODUCTS, updated);
    if (getSessionToken()) {
      try {
        await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
          headers: buildAdminHeaders(false),
          credentials: 'include',
        });
      } catch {
        // safe
      }
    }
  },

  // PROMOTIONS
  async getPromotions(): Promise<Promotion[]> {
    const local = getLocal<Promotion[]>(STORAGE_KEYS.PROMOTIONS, INITIAL_PROMOTIONS);
    try {
      const res = await fetch('/api/promotions');
      if (res.ok) {
        const data = await res.json();
        if (data.promotions && Array.isArray(data.promotions) && data.promotions.length > 0) {
          setLocal(STORAGE_KEYS.PROMOTIONS, data.promotions);
          return data.promotions;
        }
      }
    } catch {
      // safe
    }
    return local;
  },

  async syncPromotionsToBackend(promotions: Promotion[]): Promise<void> {
    setLocal(STORAGE_KEYS.PROMOTIONS, promotions);
    if (!getSessionToken()) return;
    try {
      await fetch('/api/promotions/sync', {
        method: 'POST',
        headers: buildAdminHeaders(true),
        credentials: 'include',
        body: JSON.stringify({ promotions }),
      });
    } catch {
      // safe
    }
  },

  async savePromotion(promo: Promotion): Promise<Promotion> {
    const current = await this.getPromotions();
    const cleanCode = promo.code.trim().toUpperCase();
    const idx = current.findIndex((p) => p.id === promo.id || p.code === cleanCode);
    const updated =
      idx >= 0
        ? current.map((p, i) => (i === idx ? { ...promo, code: cleanCode } : p))
        : [{ ...promo, code: cleanCode }, ...current];
    setLocal(STORAGE_KEYS.PROMOTIONS, updated);

    if (getSessionToken()) {
      try {
        await fetch('/api/promotions', {
          method: 'POST',
          headers: buildAdminHeaders(true),
          credentials: 'include',
          body: JSON.stringify({ ...promo, code: cleanCode }),
        });
      } catch {
        // safe
      }
    }
    return promo;
  },

  async deletePromotion(id: string): Promise<void> {
    const current = await this.getPromotions();
    const updated = current.filter((p) => p.id !== id);
    setLocal(STORAGE_KEYS.PROMOTIONS, updated);
    if (getSessionToken()) {
      try {
        await fetch(`/api/promotions/${id}`, {
          method: 'DELETE',
          headers: buildAdminHeaders(false),
          credentials: 'include',
        });
      } catch {
        // safe
      }
    }
  },

  // ORDERS
  async getOrders(): Promise<Order[]> {
    const local = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
    if (!getSessionToken()) {
      return local;
    }
    try {
      const res = await fetch('/api/orders', {
        headers: buildAdminHeaders(false),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
          setLocal(STORAGE_KEYS.ORDERS, data.orders);
          return data.orders;
        }
      }
    } catch {
      // safe
    }
    return local;
  },

  async trackOrderByQuery(query: string): Promise<Order | null> {
    const clean = query.trim();
    if (!clean) return null;
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(clean)}`, {
        headers: buildAdminHeaders(false),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        return data.order || null;
      }
    } catch {
      // safe
    }
    return null;
  },

  async placeOrder(newOrder: Order): Promise<{ order: Order; updatedProducts: Product[] }> {
    const products = await this.getProducts();
    let updatedProducts = products.map((prod) => {
      const matched = newOrder.items.find((item) => item.product.id === prod.id);
      if (matched) {
        const nextUnits = Math.max(0, prod.stockUnits - matched.quantity);
        return {
          ...prod,
          stockUnits: nextUnits,
          inStock: nextUnits > 0,
        };
      }
      return prod;
    });

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products)) {
          updatedProducts = data.products;
        }
      }
    } catch {
      // safe fallback
    }

    setLocal(STORAGE_KEYS.PRODUCTS, updatedProducts);
    const localOrders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
    setLocal(STORAGE_KEYS.ORDERS, [newOrder, ...localOrders]);

    return { order: newOrder, updatedProducts };
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    adminNotes?: string,
    trackingNumber?: string
  ): Promise<Order | null> {
    const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
    const idx = orders.findIndex((o) => o.orderId === orderId);
    if (idx === -1) return null;

    const ord = orders[idx];
    const updatedEvents = ord.events.map((ev, i) => {
      if (status === 'deployed') return { ...ev, done: i === 0 };
      if (status === 'inspected') return { ...ev, done: i <= 1 };
      if (status === 'transit') return { ...ev, done: i <= 2 };
      if (status === 'delivered') return { ...ev, done: true };
      return ev;
    });

    const updatedOrder: Order = {
      ...ord,
      status,
      events: updatedEvents,
      adminNotes: adminNotes !== undefined ? adminNotes : ord.adminNotes,
      trackingNumber: trackingNumber || ord.trackingNumber,
    };

    orders[idx] = updatedOrder;
    setLocal(STORAGE_KEYS.ORDERS, orders);

    if (getSessionToken()) {
      try {
        await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
          method: 'PUT',
          headers: buildAdminHeaders(true),
          credentials: 'include',
          body: JSON.stringify({ status, adminNotes, trackingNumber }),
        });
      } catch {
        // safe
      }
    }

    return updatedOrder;
  },

  // UPLOAD IMAGE HELPER
  async uploadImage(fileOrBase64: string | File): Promise<string> {
    let dataUrl: string;

    if (typeof fileOrBase64 === 'string') {
      dataUrl = fileOrBase64;
    } else {
      dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrBase64);
      });
    }

    if (getSessionToken()) {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: buildAdminHeaders(true),
          credentials: 'include',
          body: JSON.stringify({ image: dataUrl }),
        });
        if (res.ok) {
          const data = await res.json();
          return data.url;
        }
      } catch {
        // fallback to dataUrl
      }
    }
    return dataUrl;
  },

  // FLASH SALE BANNER SETTINGS
  getFlashBanner(): { enabled: boolean; text: string } {
    return {
      enabled: getLocal<boolean>(STORAGE_KEYS.FLASH_BANNER, true),
      text: getLocal<string>(
        STORAGE_KEYS.FLASH_TEXT,
        'FREE DELIVERY OVER ₹999 ACROSS INDIA // 100% MADE IN INDIA // 95% TO 100% NATURAL ORIGIN // USE CODE "WELCOME15"'
      ),
    };
  },

  setFlashBanner(enabled: boolean, text: string): void {
    setLocal(STORAGE_KEYS.FLASH_BANNER, enabled);
    setLocal(STORAGE_KEYS.FLASH_TEXT, text);
  },

  // RESET FACTORY SETTINGS
  async resetToDefaults(): Promise<{ products: Product[]; promotions: Promotion[] }> {
    setLocal(STORAGE_KEYS.PRODUCTS, PRODUCTS);
    setLocal(STORAGE_KEYS.PROMOTIONS, INITIAL_PROMOTIONS);
    await this.syncProductsToBackend(PRODUCTS);
    await this.syncPromotionsToBackend(INITIAL_PROMOTIONS);
    return { products: PRODUCTS, promotions: INITIAL_PROMOTIONS };
  },

  // UNIVERSAL CUSTOM IMAGES REGISTRY
  async getCustomImages(): Promise<Record<string, string>> {
    const local = getLocal<Record<string, string>>('him_custom_images_v1', {});
    try {
      const res = await fetch('/api/images/custom');
      if (res.ok) {
        const data = await res.json();
        if (data.images && typeof data.images === 'object') {
          const merged = { ...local, ...data.images };
          setLocal('him_custom_images_v1', merged);
          return merged;
        }
      }
    } catch {
      // offline fallback
    }
    return local;
  },

  async saveCustomImage(id: string, base64Data: string, section?: string): Promise<string> {
    const local = getLocal<Record<string, string>>('him_custom_images_v1', {});
    local[id] = base64Data;
    setLocal('him_custom_images_v1', local);

    if (getSessionToken()) {
      try {
        const res = await fetch('/api/images/custom', {
          method: 'POST',
          headers: buildAdminHeaders(true),
          credentials: 'include',
          body: JSON.stringify({ id, base64Data, section }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.imagePath) {
            local[id] = data.imagePath;
            setLocal('him_custom_images_v1', local);
            return data.imagePath;
          }
        }
      } catch {
        // fallback to dataUrl
      }
    }
    return base64Data;
  },

  async resetCustomImages(): Promise<void> {
    setLocal('him_custom_images_v1', {});
  },
};
