import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order, Currency, ProductCategory, OrderStatus, Promotion } from './types';
import { PRODUCTS, CURRENCIES } from './catalog/products';
import { INITIAL_PROMOTIONS } from './catalog/promotions';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CampaignBannersSection } from './components/CampaignBannersSection';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { ScienceAndEvidenceLab } from './components/ScienceAndEvidenceLab';
import { CustomerReviewsSection } from './components/CustomerReviewsSection';
import { FaqDealSection } from './components/FaqDealSection';
import { IngredientModal } from './components/IngredientModal';
import { SkinDiagnosticModal } from './components/SkinDiagnosticModal';
import { AdminDashboardModal, AdminTab } from './components/AdminDashboardModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { PrePublishMediaManagerModal } from './components/PrePublishMediaManagerModal';
import { SampleRequestModal } from './components/SampleRequestModal';
import { LegalPage, LegalPageType } from './components/LegalPage';
import { Footer } from './components/Footer';
import { 
  detectLocationAndCurrency, 
  LocationDetectionResult, 
  playLocationVoiceAnnouncement, 
  stopLocationVoiceAnnouncement 
} from './utils/locationCurrency';
import { backendService } from './services/api';
import { Zap, Camera, ShieldAlert } from 'lucide-react';
import { isAIStudioEditMode } from './utils/environment';
import { isSoapAvailableForSale, SELLABLE_SOAP_IDS } from './utils/sellable';
import { syncPageSeo } from './utils/seo';

const FREE_SHIPPING_THRESHOLD_BASE = 50; // USD

export default function App() {
  // Products state synced with backend API & localStorage
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('him_products_db_real_v9');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return PRODUCTS;
  });

  // Promotions state synced with backend API & localStorage
  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    try {
      const saved = localStorage.getItem('him_promotions_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PROMOTIONS;
  });

  // Flash Banner state
  const [flashBanner, setFlashBanner] = useState<{ enabled: boolean; text: string }>(() => {
    return backendService.getFlashBanner();
  });

  // Admin Dashboard Portal & Server-Verified Security Gate
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => backendService.hasAdminSession());
  const [adminInitialTab, setAdminInitialTab] = useState<AdminTab>('inventory');
  const [unreadSecurityAlerts, setUnreadSecurityAlerts] = useState<number>(0);

  // Cart state persisted to localStorage (currently restricted to the 3 sellable soaps)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('him_cart_items');
      const parsed = saved ? (JSON.parse(saved) as CartItem[]) : [];
      return Array.isArray(parsed)
        ? parsed.filter((item) => item?.product?.id && SELLABLE_SOAP_IDS.has(item.product.id))
        : [];
    } catch {
      return [];
    }
  });

  // Orders history persisted to localStorage
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('him_orders_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }

    // Default sample tracking order synced to active launch product
    const sampleOrder: Order = {
      orderId: '#HIM-IN-8924X',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      items: [
        { product: PRODUCTS[0], quantity: 2 },
      ],
      subtotal: Math.round(PRODUCTS[0].price * 2 * 100) / 100,
      shippingFee: 0,
      discount: 0,
      total: Math.round(PRODUCTS[0].price * 2 * 100) / 100,
      currency: 'INR',
      status: 'transit',
      trackingNumber: 'DELHIVERY-AIR-948102',
      estimatedDelivery: 'Tomorrow, 14:00 - 17:00 Express Dispatch',
      deliveryMethod: 'Express Air Courier (Cold-Chain)',
      paymentMethod: 'UPI / RuPay Card (•••• 8891)',
      customer: {
        fullName: 'Vikram Malhotra',
        email: 'v.malhotra@grooming.in',
        phone: '+91 98201 44100',
        address: 'Bandra West, Hill Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
        country: 'India',
      },
      events: [
        {
          timestamp: '08:30 IST',
          title: 'ORDER DISPATCHED & CONFIRMED',
          description: 'Payment authenticated via UPI. Order registered in Mumbai hub queue.',
          location: 'CENTRAL FULFILLMENT HUB (MUMBAI)',
          done: true,
        },
        {
          timestamp: '09:15 IST',
          title: 'CLEAN BOTANICAL INTEGRITY INSPECTION',
          description: 'Hermetic seal integrity & batch testing verified.',
          location: 'MUMBAI LOGISTICS DEPOT',
          done: true,
        },
        {
          timestamp: '11:45 IST',
          title: 'IN TRANSIT VIA PRIORITY EXPRESS COURIER',
          description: 'Consignment in express transit with live temperature control.',
          location: 'WESTERN EXPRESS AIR CORRIDOR',
          done: true,
        },
        {
          timestamp: 'TOMORROW 15:00 IST',
          title: 'OUT FOR DELIVERY',
          description: 'Final contactless handoff to designated customer address in Mumbai.',
          location: 'BANDRA DISPATCH CENTER, MUMBAI',
          done: false,
        },
      ],
    };
    return [sampleOrder];
  });

  // Active viewing order for the Order Tracker
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    return orders.length > 0 ? orders[0] : null;
  });

  // Modals visibility state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeLegalPage, setActiveLegalPage] = useState<LegalPageType | null>(null);
  const [sampleRequestProduct, setSampleRequestProduct] = useState<Product | null>(null);
  const [adminEditProductId, setAdminEditProductId] = useState<string | null>(null);

  // URL Path & Hash Synchronizer for Product Detail Pages (/product/:id) and Legal Pages (/privacy-policy, /terms-of-service)
  useEffect(() => {
    const handleRoute = () => {
      const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
      const hash = window.location.hash;

      if (pathname === '/privacy-policy' || hash === '#privacy-policy') {
        setActiveLegalPage('privacy');
        setSelectedProduct(null);
        return;
      }
      if (pathname === '/terms-of-service' || hash === '#terms-of-service') {
        setActiveLegalPage('terms');
        setSelectedProduct(null);
        return;
      }

      if (pathname.startsWith('/product/')) {
        const prodId = decodeURIComponent(pathname.replace('/product/', ''));
        const found = products.find((p) => p.id === prodId);
        if (found) {
          setSelectedProduct(found);
          setActiveLegalPage(null);
          return;
        }
      }

      if (hash && hash.startsWith('#product-')) {
        const prodId = hash.replace('#product-', '');
        const found = products.find((p) => p.id === prodId);
        if (found) {
          setSelectedProduct(found);
          setActiveLegalPage(null);
          return;
        }
      }

      setSelectedProduct(null);
      setActiveLegalPage(null);
      if (hash && hash.length > 1) {
        const targetId = hash.slice(1);
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      }
    };

    handleRoute();
    window.addEventListener('popstate', handleRoute);
    window.addEventListener('hashchange', handleRoute);
    return () => {
      window.removeEventListener('popstate', handleRoute);
      window.removeEventListener('hashchange', handleRoute);
    };
  }, [products]);

  // Keep Google canonical URL, page title, meta description & OpenGraph tags synced per view
  useEffect(() => {
    if (selectedProduct) {
      syncPageSeo({
        title: `${selectedProduct.name} | HIM — He Is Man`,
        description: `${selectedProduct.tagline} Formulated in India by HIM — He Is Man (HIM Men's Grooming Brand).`,
        path: `/product/${selectedProduct.id}`,
        image: selectedProduct.fieldImg,
        type: 'product',
      });
      return;
    }

    if (activeLegalPage === 'privacy') {
      syncPageSeo({
        title: 'Privacy Policy | HIM — He Is Man',
        description:
          'Read the HIM — He Is Man Privacy Policy covering DPDP Act 2023 compliance, Razorpay payment security, order fulfillment, and free home sample data handling.',
        path: '/privacy-policy',
        type: 'article',
      });
      return;
    }

    if (activeLegalPage === 'terms') {
      syncPageSeo({
        title: 'Terms of Service | HIM — He Is Man',
        description:
          'Review HIM — He Is Man Terms of Service covering our 3-soap storefront, free home sample program, Razorpay & COD checkout, India delivery, and 30-day returns.',
        path: '/terms-of-service',
        type: 'article',
      });
      return;
    }

    syncPageSeo({
      title: "HIM — He Is Man | Official Men's Grooming & Skincare Brand",
      description:
        "Official store of HIM (He Is Man / HIM Mard) — India's men's grooming & skincare brand. Shop scrub, de-tan & anti-acne soaps or claim free home samples.",
      path: '/',
      type: 'website',
    });
  }, [selectedProduct, activeLegalPage]);

  const handleOpenProduct = (product: Product) => {
    setActiveLegalPage(null);
    setSelectedProduct(product);
    window.history.pushState(null, '', `/product/${product.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLegalPage = (page: LegalPageType) => {
    setSelectedProduct(null);
    setActiveLegalPage(page);
    window.history.pushState(null, '', page === 'privacy' ? '/privacy-policy' : '/terms-of-service');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseSubViews = () => {
    setSelectedProduct(null);
    setActiveLegalPage(null);
    if (window.location.pathname !== '/' || window.location.hash) {
      window.history.pushState(null, '', '/');
    }
  };

  // Pre-Publish Custom Images State (Synced with localStorage and backend static disk)
  const [customImages, setCustomImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('him_custom_site_images');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const handleUpdateCustomImage = (slotId: string, dataUrl: string) => {
    setCustomImages((prev) => {
      const next = { ...prev, [slotId]: dataUrl };
      try {
        localStorage.setItem('him_custom_site_images', JSON.stringify(next));
      } catch {}
      return next;
    });

    // Persist via authenticated Admin endpoint if signed in
    void backendService.saveCustomImage(slotId, dataUrl, 'custom');

    // If it's a product slot, update product in products state
    if (slotId.startsWith('prod-') || slotId.startsWith('product-')) {
      const prodId = slotId.replace(/^prod-/, '').replace(/^product-/, '');
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === prodId || p.id === `prod-${prodId}`) {
            const updated = { ...p, fieldImg: dataUrl };
            backendService.saveProduct(updated).catch(() => {});
            return updated;
          }
          return p;
        })
      );
    }
  };

  const handleResetCustomImage = (slotId: string) => {
    setCustomImages((prev) => {
      const next = { ...prev };
      delete next[slotId];
      try {
        localStorage.setItem('him_custom_site_images', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('IMAGE RESET TO STORE DEFAULT');
  };

  const handleResetAllCustomImages = () => {
    setCustomImages({});
    try {
      localStorage.removeItem('him_custom_site_images');
      localStorage.removeItem('him_custom_ba_images');
      localStorage.removeItem('him_reviewer_photos_v1');
    } catch {}
    showToast('ALL IMAGES RESTORED TO BRAND DEFAULTS');
  };

  // Currency & Category Filtering - Defaults to INR (India)
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(() => {
    try {
      const savedCode = localStorage.getItem('him_selected_currency');
      if (savedCode && CURRENCIES[savedCode] && savedCode !== 'USD') {
        return CURRENCIES[savedCode];
      }
    } catch {
      // safe
    }
    return CURRENCIES.INR;
  });
  const [locationInfo, setLocationInfo] = useState<LocationDetectionResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('ALL');

  // Location Voice Guide Announcement State
  const [isVoicePlaying, setIsVoicePlaying] = useState<boolean>(false);

  const handleTriggerVoice = () => {
    if (isVoicePlaying) {
      stopLocationVoiceAnnouncement();
      setIsVoicePlaying(false);
      return;
    }
    setIsVoicePlaying(true);
    const country = locationInfo?.countryName || 'India';
    const currencyCode = currentCurrency.code;
    const ok = playLocationVoiceAnnouncement(country, currencyCode, () => {
      setIsVoicePlaying(false);
    });
    if (!ok) {
      setIsVoicePlaying(false);
    }
  };

  // Automatic Location Detection on Mount & Backend Hydration
  useEffect(() => {
    let isMounted = true;

    // Hydrate Products from backend
    backendService.getProducts().then((loadedProducts) => {
      if (isMounted && loadedProducts && loadedProducts.length > 0) {
        setProducts(loadedProducts);
      }
    });

    // Hydrate Promotions from backend
    backendService.getPromotions().then((loadedPromos) => {
      if (isMounted && loadedPromos && loadedPromos.length > 0) {
        setPromotions(loadedPromos);
      }
    });

    // Hydrate Orders from backend (admin session) or visitor cache
    backendService.getOrders().then((loadedOrders) => {
      if (isMounted && loadedOrders && loadedOrders.length > 0) {
        setOrders(loadedOrders);
        if (!activeOrder && loadedOrders.length > 0) {
          setActiveOrder(loadedOrders[0]);
        }
      }
    });

    // Verify existing Admin session & fetch unread security alerts if signed in
    backendService.checkAdminSession().then((sessionState) => {
      if (!isMounted) return;
      setIsAdminAuthenticated(sessionState.authenticated);
      setUnreadSecurityAlerts(sessionState.unreadAlertsCount || 0);
    });

    detectLocationAndCurrency().then((detected) => {
      if (isMounted && detected) {
        setLocationInfo(detected);
        const hasManualPref = localStorage.getItem('him_selected_currency');
        if (!hasManualPref && CURRENCIES[detected.currencyCode]) {
          setCurrentCurrency(CURRENCIES[detected.currencyCode]);
          showToast(`🇮🇳 LOCATION DETECTED: ${detected.countryName.toUpperCase()} // CURRENCY SET TO ${detected.currencyCode} (₹)`);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrentCurrency(newCurrency);
    try {
      localStorage.setItem('him_selected_currency', newCurrency.code);
    } catch {
      // safe
    }
    showToast(`CURRENCY SWITCHED TO ${newCurrency.code} (${newCurrency.symbol})`);
  };

  // Promo Code State
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('him_cart_items', JSON.stringify(cart));
    } catch {
      // safe
    }
  }, [cart]);

  // Cart operations (currently only the 3 soaps can be added to cart; other products open Free Sample Request)
  const handleAddToCart = (product: Product, quantity = 1, selectedShade?: string) => {
    if (!isSoapAvailableForSale(product)) {
      setSampleRequestProduct(product);
      return;
    }

    if (!product.inStock || product.stockUnits <= 0) {
      showToast(`SPEC ${product.specCode} IS CURRENTLY DEPLETED`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedShade === selectedShade
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedShade === selectedShade
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedShade }];
    });
    showToast(`ADDED [${product.name}${selectedShade ? ` • ${selectedShade}` : ''}] TO BAG`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const prod = products.find((p) => p.id === productId);
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            // Cap at available stock
            if (prod && nextQty > prod.stockUnits) {
              showToast(`MAX ALLOCATION REACHED: ${prod.stockUnits} UNITS AVAILABLE`);
              return item;
            }
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('SPEC REMOVED FROM LOADOUT');
  };

  // Quick Buy triggers instant add to cart for soaps, or Free Sample Request for other products
  const handleQuickBuy = (product: Product, quantity = 1, selectedShade?: string) => {
    if (!isSoapAvailableForSale(product)) {
      setSampleRequestProduct(product);
      return;
    }
    if (!product.inStock || product.stockUnits <= 0) {
      showToast(`SPEC ${product.specCode} IS CURRENTLY DEPLETED`);
      return;
    }
    handleAddToCart(product, quantity, selectedShade);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Acquire 3-Soap Collection
  const handleAcquireKit = () => {
    setCart((prev) => {
      const newItems: CartItem[] = [...prev];
      products.forEach((p) => {
        if (isSoapAvailableForSale(p) && p.inStock && p.stockUnits > 0) {
          const existing = newItems.find((i) => i.product.id === p.id);
          if (existing) {
            existing.quantity = Math.max(1, existing.quantity);
          } else {
            newItems.push({ product: p, quantity: 1 });
          }
        }
      });
      return newItems;
    });
    showToast('ALL 3 HIM SOAPS ADDED TO BAG');
    setIsCartOpen(true);
  };

  // Apply discount code verified against backend promotions
  const handleApplyDiscount = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    const promo = promotions.find((p) => p.code.toUpperCase() === clean && p.isActive);
    const sub = cart.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

    if (!promo) {
      showToast(`INTEL CODE [${clean}] NOT RECOGNIZED`);
      return false;
    }

    if (promo.minOrderValue && sub < promo.minOrderValue) {
      showToast(`MIN ORDER OF $${promo.minOrderValue} REQUIRED FOR CODE ${clean}`);
      return false;
    }

    let calculatedDiscount = 0;
    if (promo.discountType === 'percentage') {
      calculatedDiscount = Math.round(sub * (promo.discountValue / 100));
    } else {
      calculatedDiscount = promo.discountValue;
    }

    setDiscountCode(promo.code);
    setDiscountAmount(calculatedDiscount);
    showToast(`PROMO CODE APPLIED: ${promo.title} (-$${calculatedDiscount})`);
    return true;
  };

  // Order Placement - Atomically decrements product inventory on backend
  const handleOrderPlaced = async (newOrder: Order) => {
    try {
      const result = await backendService.placeOrder(newOrder);
      if (result && Array.isArray(result.updatedProducts)) {
        setProducts(result.updatedProducts);
      }
    } catch {
      // safe fallback
    }
    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    setCart([]);
    setDiscountCode('');
    setDiscountAmount(0);
    setIsCheckoutOpen(false);
    setIsTrackingOpen(true);
    showToast(`ORDER ${newOrder.orderId} CONFIRMED // RADAR DISPATCH LIVE`);
  };

  // Order Status Simulator / Admin Update
  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    adminNotes?: string,
    trackingNumber?: string
  ) => {
    await backendService.updateOrderStatus(orderId, newStatus, adminNotes, trackingNumber);

    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId === orderId) {
          const updatedEvents = o.events.map((ev, idx) => {
            if (newStatus === 'deployed') return { ...ev, done: idx === 0 };
            if (newStatus === 'inspected') return { ...ev, done: idx <= 1 };
            if (newStatus === 'transit') return { ...ev, done: idx <= 2 };
            if (newStatus === 'delivered') return { ...ev, done: true };
            return ev;
          });
          return {
            ...o,
            status: newStatus,
            events: updatedEvents,
            adminNotes: adminNotes !== undefined ? adminNotes : o.adminNotes,
            trackingNumber: trackingNumber || o.trackingNumber,
          };
        }
        return o;
      })
    );

    setActiveOrder((prev) => {
      if (prev && prev.orderId === orderId) {
        const updatedEvents = prev.events.map((ev, idx) => {
          if (newStatus === 'deployed') return { ...ev, done: idx === 0 };
          if (newStatus === 'inspected') return { ...ev, done: idx <= 1 };
          if (newStatus === 'transit') return { ...ev, done: idx <= 2 };
          if (newStatus === 'delivered') return { ...ev, done: true };
          return ev;
        });
        return {
          ...prev,
          status: newStatus,
          events: updatedEvents,
          adminNotes: adminNotes !== undefined ? adminNotes : prev.adminNotes,
          trackingNumber: trackingNumber || prev.trackingNumber,
        };
      }
      return prev;
    });

    showToast(`ORDER ${orderId} UPDATED: ${newStatus.toUpperCase()}`);
  };

  // Admin Product Operations
  const handleUpdateProduct = async (product: Product) => {
    await backendService.saveProduct(product);
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    if (selectedProduct && selectedProduct.id === product.id) {
      setSelectedProduct(product);
    }
    showToast(`SPEC [${product.specCode}] SAVED TO DATABASE`);
  };

  const handleAddProduct = async (product: Product) => {
    await backendService.saveProduct(product);
    setProducts((prev) => [product, ...prev]);
    showToast(`NEW SPEC [${product.specCode}] DEPLOYED TO STORE`);
  };

  const handleDeleteProduct = async (productId: string) => {
    await backendService.deleteProduct(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('SPEC DECOMMISSIONED FROM STORE');
  };

  // Admin Promotion Operations
  const handleUpdatePromotion = async (promo: Promotion) => {
    await backendService.savePromotion(promo);
    setPromotions((prev) => {
      const idx = prev.findIndex((p) => p.id === promo.id || p.code === promo.code);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = promo;
        return next;
      }
      return [promo, ...prev];
    });
    showToast(`PROMOTION [${promo.code}] ACTIVE`);
  };

  const handleDeletePromotion = async (promoId: string) => {
    await backendService.deletePromotion(promoId);
    setPromotions((prev) => prev.filter((p) => p.id !== promoId));
    showToast('PROMOTION REMOVED');
  };

  const handleResetDefaults = async () => {
    await backendService.resetToDefaults();
    setProducts([...PRODUCTS]);
    setPromotions([...INITIAL_PROMOTIONS]);
    showToast('SYSTEM RESTORED TO FACTORY SPECS');
  };

  const handleUpdateFlashBanner = (enabled: boolean, text: string) => {
    backendService.setFlashBanner(enabled, text);
    setFlashBanner({ enabled, text });
    showToast(`RADAR BANNER ${enabled ? 'ACTIVATED' : 'MUTED'}`);
  };

  // Admin Security Protocol: Server-Verified Access Gate
  const handleOpenAdminPortal = () => {
    if (isAdminAuthenticated) {
      setAdminInitialTab('inventory');
      setIsAdminOpen(true);
    } else {
      setIsAdminAuthOpen(true);
    }
  };

  const handleOpenSecurityShield = () => {
    setAdminInitialTab('security');
    if (isAdminAuthenticated) {
      setIsAdminOpen(true);
    } else {
      setIsAdminAuthOpen(true);
    }
  };

  const handleAdminAuthenticated = (alertsCount = 0) => {
    setIsAdminAuthenticated(true);
    setUnreadSecurityAlerts(alertsCount);
    setIsAdminAuthOpen(false);
    setAdminInitialTab(alertsCount > 0 ? 'security' : 'inventory');
    setIsAdminOpen(true);
    void backendService.getOrders().then((loadedOrders) => {
      if (loadedOrders && loadedOrders.length > 0) {
        setOrders(loadedOrders);
      }
    });
    if (alertsCount > 0) {
      showToast(`SECURITY ALERT: ${alertsCount} BLOCKED INTRUSION EVENT${alertsCount === 1 ? '' : 'S'} NEED REVIEW`);
    } else {
      showToast('VERIFIED // HIM HQ OPERATIONS DESK UNLOCKED');
    }
  };

  const handleAdminLock = async () => {
    await backendService.logoutAdmin();
    setIsAdminAuthenticated(false);
    setUnreadSecurityAlerts(0);
    setIsAdminOpen(false);
    showToast('HQ CONSOLE LOCKED // SESSION TERMINATED');
  };

  const cartProductIds = new Set(cart.map((i) => i.product.id));
  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F6F4F0] font-sans antialiased selection:bg-[#FF4D00] selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 bg-[#14171F] text-white font-sans font-medium text-xs shadow-xl rounded-md border border-[#FF4D00]/40">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        cartCount={cartItemCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        currentCurrency={currentCurrency}
        onSelectCurrency={handleCurrencyChange}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenIngredients={() => setIsIngredientsOpen(true)}
        locationInfo={locationInfo}
        onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
        onTriggerVoice={handleTriggerVoice}
        isVoicePlaying={isVoicePlaying}
        onNavigateHome={handleCloseSubViews}
      />

      {/* HIM Signal Orange Announcement Banner */}
      {flashBanner.enabled && (
        <div className="bg-[#FF4D00] text-white px-4 py-2 flex items-center justify-center text-xs font-semibold tracking-wide">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-center">
            <div className="flex items-center space-x-2 truncate">
              <Zap className="w-3.5 h-3.5 fill-white shrink-0" />
              <span className="truncate">{flashBanner.text}</span>
            </div>
          </div>
        </div>
      )}

      {selectedProduct ? (
        <ProductDetailPage
          product={selectedProduct}
          currency={currentCurrency}
          onBack={handleCloseSubViews}
          onAddToCart={(product, qty, shade) => handleAddToCart(product, qty, shade)}
          onQuickBuy={(product, qty, shade) => handleQuickBuy(product, qty, shade)}
          onSelectProduct={handleOpenProduct}
          allProducts={products}
        />
      ) : activeLegalPage ? (
        <LegalPage
          page={activeLegalPage}
          onSwitchPage={handleOpenLegalPage}
          onBack={handleCloseSubViews}
        />
      ) : (
        <main>
          {/* HIM Editorial Hero Banner */}
          <Hero
            onExploreClick={() => {
              const el = document.getElementById('products-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onAcquireKit={handleAcquireKit}
            currency={currentCurrency}
            bundlePrice={44}
            onSelectProduct={handleOpenProduct}
            onAddToCart={(product) => handleAddToCart(product, 1)}
            onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
            products={products}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            locationInfo={locationInfo}
            onTriggerVoice={handleTriggerVoice}
            isVoicePlaying={isVoicePlaying}
            customImages={customImages}
          />

          {/* The HIM Product Grid (All 9 Live Formulations) */}
          <ProductGrid
            products={products}
            currency={currentCurrency}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onAddToCart={(product) => handleAddToCart(product, 1)}
            onQuickBuy={(product) => handleQuickBuy(product, 1)}
            onOpenDetails={handleOpenProduct}
            onAcquireKit={handleAcquireKit}
            cartProductIds={cartProductIds}
          />

          {/* HIM — He Is Man Campaign Banners */}
          <CampaignBannersSection
            products={products}
            currency={currentCurrency}
            onOpenProduct={handleOpenProduct}
            onAddToCart={(product) => handleAddToCart(product, 1)}
            onSelectCategory={setSelectedCategory}
          />

          {/* Interactive Before/After Results & HIM Performance Lab */}
          <ScienceAndEvidenceLab
            products={products}
            currency={currentCurrency}
            onOpenProduct={handleOpenProduct}
            onAddToCart={(product) => handleAddToCart(product, 1)}
          />

          {/* Verified Indian Customer Reviews */}
          <CustomerReviewsSection
            products={products}
            onOpenProduct={handleOpenProduct}
            onQuickBuy={(product) => handleQuickBuy(product, 1)}
            customImages={customImages}
          />

          {/* SECTION 4: WE GET IT HERE'S THE DEAL (Interactive FAQ & Complete Range Showcase) */}
          <FaqDealSection
            onAcquireKit={handleAcquireKit}
            onExploreProducts={() => {
              const el = document.getElementById('products-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onOpenProduct={handleOpenProduct}
            products={products}
          />
        </main>
      )}

      {/* Technical Footer */}
      <Footer
        onOpenIngredients={() => setIsIngredientsOpen(true)}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenPrivacy={() => handleOpenLegalPage('privacy')}
        onOpenTerms={() => handleOpenLegalPage('terms')}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        currency={currentCurrency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        discountCode={discountCode}
        discountAmount={discountAmount}
        onApplyDiscount={handleApplyDiscount}
        freeShippingThreshold={currentCurrency.code === 'INR' ? (999 / currentCurrency.rate) : FREE_SHIPPING_THRESHOLD_BASE}
      />

      {/* 1-Click Fast Express Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        currency={currentCurrency}
        discountAmount={discountAmount}
        freeShippingThreshold={currentCurrency.code === 'INR' ? (999 / currentCurrency.rate) : FREE_SHIPPING_THRESHOLD_BASE}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Live Order Tracking Modal */}
      <OrderTrackerModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        activeOrder={activeOrder}
        orderHistory={orders}
        onSelectOrder={(orderId) => {
          const ord = orders.find((o) => o.orderId === orderId);
          if (ord) setActiveOrder(ord);
        }}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />

      {/* Skin Diagnostic Quiz Modal */}
      <SkinDiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        products={products}
        currency={currentCurrency}
        onAddToCart={(p) => handleAddToCart(p, 1)}
        onOpenProduct={handleOpenProduct}
      />

      {/* HIM Clean Ingredient Charter Modal */}
      <IngredientModal
        isOpen={isIngredientsOpen}
        onClose={() => setIsIngredientsOpen(false)}
      />

      {/* Free Home Sample Request Modal for Non-Soap Products */}
      <SampleRequestModal
        isOpen={Boolean(sampleRequestProduct)}
        product={sampleRequestProduct}
        onClose={() => setSampleRequestProduct(null)}
        onSubmitted={(productName) =>
          showToast(`FREE SAMPLE RESERVED FOR ${productName.toUpperCase()}`)
        }
      />
    </div>
  );
}
