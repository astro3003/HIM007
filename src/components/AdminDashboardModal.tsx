import React, { useState, useRef } from 'react';
import {
  X,
  Package,
  Tag,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  Save,
  Upload,
  Camera,
  Image as ImageIcon,
  DollarSign,
  Layers,
  Search,
  Truck,
  RotateCcw,
  Sparkles,
  Zap,
  Shield,
  FileText,
  Sliders,
  ExternalLink,
  ChevronDown,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { Product, Promotion, Order, OrderStatus, Currency } from '../types';
import { backendService } from '../services/api';
import { formatPrice } from '../utils/locationCurrency';
import { AdminProductEditModal } from './AdminProductEditModal';
import { AdminSecurityTab } from './AdminSecurityTab';

export type AdminTab = 'inventory' | 'promotions' | 'orders' | 'security' | 'settings';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLock?: () => void;
  products: Product[];
  promotions: Promotion[];
  orders: Order[];
  currency: Currency;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdatePromotion: (promo: Promotion) => void;
  onDeletePromotion: (promoId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, adminNotes?: string, trackingNum?: string) => void;
  onResetDefaults: () => void;
  flashBannerEnabled: boolean;
  flashBannerText: string;
  onUpdateFlashBanner: (enabled: boolean, text: string) => void;
  initialEditProductId?: string | null;
  onOpenMediaManager?: () => void;
  initialTab?: AdminTab;
  unreadSecurityAlerts?: number;
  onUnreadSecurityAlertsChange?: (count: number) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onLock,
  products,
  promotions,
  orders,
  currency,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onUpdatePromotion,
  onDeletePromotion,
  onUpdateOrderStatus,
  onResetDefaults,
  flashBannerEnabled,
  flashBannerText,
  onUpdateFlashBanner,
  initialEditProductId,
  onOpenMediaManager,
  initialTab,
  unreadSecurityAlerts = 0,
  onUnreadSecurityAlertsChange,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab || 'inventory');

  // Product Full Modal Editor state
  const [productEditorOpen, setProductEditorOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  React.useEffect(() => {
    if (initialEditProductId && isOpen) {
      const target = products.find((p) => p.id === initialEditProductId);
      if (target) {
        setProductToEdit(target);
        setProductEditorOpen(true);
      }
    }
  }, [initialEditProductId, isOpen, products]);

  // Inventory tab states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProductForm, setEditProductForm] = useState<Partial<Product>>({});
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);
  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    name: '',
    category: 'GROOMING',
    price: 24,
    compareAtPrice: 30,
    volume: '100ml Matte Flask',
    specCode: `SPEC 10 // PRD-${Math.floor(100 + Math.random() * 900)}`,
    badge: 'NEW FORMULATION',
    rating: 5.0,
    reviewsCount: 1,
    tagline: 'High-friction tactical defense formula.',
    description: 'Engineered for resilience and rigorous field performance.',
    technicalSpecs: [
      { label: 'Viscosity Grade', value: 'High Density Tactical' },
      { label: 'Chassis Material', value: 'Matte Gunmetal Alloy' },
    ],
    keyActives: ['Micronized Charcoal', 'Tea Tree Bio-Extract'],
    usageProtocol: ['Apply targeted dose to clean skin morning and evening.'],
    inStock: true,
    stockUnits: 50,
    sku: `HIM-MOD-${Math.floor(10 + Math.random() * 90)}`,
    artType: 'tube',
    fieldImg: '/assets/aistudio/Serum_bottle_and_box_packaging_fa6ed9b8_82a165c1.jpg',
  });

  // Promotions tab states
  const [promoForm, setPromoForm] = useState<Partial<Promotion>>({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 50,
    isActive: true,
    isFlashBanner: false,
  });
  const [bannerInputText, setBannerInputText] = useState(flashBannerText);
  const [bannerEnabledState, setBannerEnabledState] = useState(flashBannerEnabled);

  // Orders tab states
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('ALL');
  const [orderSearch, setOrderSearch] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Feedback notifications
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // KPIs
  const totalGrossRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalUnitsSold = orders.reduce((acc, o) => acc + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const lowStockCount = products.filter((p) => p.stockUnits <= (p.lowStockThreshold || 10)).length;
  const activePromoCount = promotions.filter((p) => p.isActive).length;

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderFilterStatus === 'ALL' || o.status === orderFilterStatus;
    const matchSearch =
      !orderSearch.trim() ||
      o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.trackingNumber.toLowerCase().includes(orderSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Handlers for Products
  const handleStartEditProduct = (p: Product) => {
    setProductToEdit(p);
    setProductEditorOpen(true);
  };

  const handleSaveProductEdit = () => {
    if (!editingProductId) return;
    const original = products.find((p) => p.id === editingProductId);
    if (!original) return;

    const updated: Product = {
      ...original,
      ...editProductForm,
      price: Number(editProductForm.price) || original.price,
      compareAtPrice: editProductForm.compareAtPrice ? Number(editProductForm.compareAtPrice) : undefined,
      stockUnits: Math.max(0, Number(editProductForm.stockUnits ?? original.stockUnits)),
      inStock: (editProductForm.stockUnits ?? original.stockUnits) > 0,
    };

    onUpdateProduct(updated);
    setEditingProductId(null);
    setEditProductForm({});
    showNotice(`SAVED SPEC [${updated.specCode}] // PRICE $${updated.price} // STOCK ${updated.stockUnits} UNITS`);
  };

  const handleQuickStockAdjust = (p: Product, delta: number) => {
    const nextUnits = Math.max(0, p.stockUnits + delta);
    const updated: Product = {
      ...p,
      stockUnits: nextUnits,
      inStock: nextUnits > 0,
    };
    onUpdateProduct(updated);
    showNotice(`STOCK UPDATED: ${p.specCode} -> ${nextUnits} UNITS`);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, targetProductId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await backendService.uploadImage(file);
      const prod = products.find((p) => p.id === targetProductId);
      if (prod) {
        const updated = { ...prod, fieldImg: imageUrl, customImg: imageUrl };
        onUpdateProduct(updated);
        showNotice(`CUSTOM PHOTO UPLOADED FOR ${prod.specCode}`);
      } else if (isAddingNewProduct) {
        setNewProductForm((prev) => ({ ...prev, fieldImg: imageUrl, customImg: imageUrl }));
        showNotice(`IMAGE ASSIGNED TO NEW SPEC`);
      }
    } catch {
      showNotice('IMAGE UPLOAD FAILED. TRY ANOTHER FORMAT.');
    }
  };

  const handleCreateNewProduct = () => {
    if (!newProductForm.name) {
      alert('Product name required');
      return;
    }

    const prodId = `prod-${Date.now()}`;
    const newProduct: Product = {
      id: prodId,
      name: newProductForm.name || 'Tactical Formula',
      category: (newProductForm.category as any) || 'GROOMING',
      price: Number(newProductForm.price) || 24,
      compareAtPrice: newProductForm.compareAtPrice ? Number(newProductForm.compareAtPrice) : undefined,
      volume: newProductForm.volume || '100ml Matte Tub',
      specCode: newProductForm.specCode || `SPEC ${products.length + 1} // PRD-${Math.floor(100 + Math.random() * 900)}`,
      badge: newProductForm.badge || 'NEW SPEC',
      rating: 5.0,
      reviewsCount: 1,
      tagline: newProductForm.tagline || 'Engineered for high friction utility.',
      description: newProductForm.description || 'Full-spectrum dermal defense formulation.',
      technicalSpecs: newProductForm.technicalSpecs || [
        { label: 'Chassis Material', value: 'Black Anodized Aluminum' },
      ],
      keyActives: newProductForm.keyActives || ['Activated Charcoal', 'Cold Smoked Cedar'],
      usageProtocol: ['Deploy as needed across designated zone.'],
      inStock: (newProductForm.stockUnits || 50) > 0,
      stockUnits: Number(newProductForm.stockUnits) || 50,
      sku: newProductForm.sku || `HIM-SPEC-${Date.now().toString().slice(-4)}`,
      artType: (newProductForm.artType as any) || 'tube',
      fieldImg:
        newProductForm.fieldImg ||
        '/assets/aistudio/Serum_bottle_and_box_packaging_fa6ed9b8_82a165c1.jpg',
      saleBadge: newProductForm.saleBadge,
    };

    onAddProduct(newProduct);
    setIsAddingNewProduct(false);
    showNotice(`NEW SPEC DEPLOYED: [${newProduct.specCode}] // ${newProduct.name}`);
  };

  // Handlers for Promotions
  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.code || !promoForm.discountValue) {
      alert('Code and discount value required');
      return;
    }

    const cleanCode = promoForm.code.trim().toUpperCase();
    const newPromo: Promotion = {
      id: `promo-${Date.now()}`,
      code: cleanCode,
      title: promoForm.title || `${cleanCode} Campaign`,
      description:
        promoForm.description ||
        `${promoForm.discountValue}${promoForm.discountType === 'percentage' ? '%' : '$'} tactical credit`,
      discountType: promoForm.discountType || 'percentage',
      discountValue: Number(promoForm.discountValue),
      minOrderValue: Number(promoForm.minOrderValue || 0),
      isActive: true,
      timesUsed: 0,
      isFlashBanner: !!promoForm.isFlashBanner,
    };

    onUpdatePromotion(newPromo);
    setPromoForm({
      code: '',
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: 15,
      minOrderValue: 50,
      isActive: true,
      isFlashBanner: false,
    });
    showNotice(`PROMOTION CREATED: [${cleanCode}] (${newPromo.discountValue}${newPromo.discountType === 'percentage' ? '%' : '$'} OFF)`);
  };

  const handleSaveFlashBanner = () => {
    onUpdateFlashBanner(bannerEnabledState, bannerInputText);
    showNotice(`STOREWIDE ANNOUNCEMENT BANNER ${bannerEnabledState ? 'ACTIVATED' : 'MUTED'}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-hidden font-mono">
      {/* Hidden File Input for Image Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => uploadTargetId && handleImageFileChange(e, uploadTargetId)}
      />

      {/* Main Admin Console Window */}
      <div className="relative w-full max-w-7xl h-[92vh] bg-[#0E0E11] border-2 border-[#111113] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#141418] border-b border-[#27272A] px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center px-2.5 py-1 bg-[#E31B23] text-white font-black text-xs tracking-wider">
              <Shield className="w-3.5 h-3.5 mr-1.5 fill-black" />
              <span>HIM HQ COMMAND</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-xs text-[#A1A1AA]">
              <span className="text-[#52525B]">/</span>
              <span className="text-emerald-400 flex items-center font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                API: CONNECTED (PORT 3000)
              </span>
              <span className="text-[#52525B]">/</span>
              <span className="font-semibold text-white">OPERATIONS DESK</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {statusNotice && (
              <div className="hidden md:flex items-center px-2 py-1 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold animate-pulse">
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                <span>{statusNotice}</span>
              </div>
            )}
            {onLock && (
              <button
                onClick={onLock}
                className="flex items-center space-x-1 px-2.5 py-1 bg-[#FF4D00]/15 hover:bg-[#FF4D00] border border-[#FF4D00]/40 text-white text-xs font-bold transition-colors cursor-pointer"
                title="Lock HQ Portal"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">LOCK & EXIT</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors rounded-xs"
              title="Minimize HQ Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 bg-[#0A0A0C] border-b border-[#202024] text-xs font-mono shrink-0">
          <div className="p-3 border-r border-[#202024] flex items-center space-x-3">
            <div className="p-2 bg-[#18181B] text-[#E31B23] border border-[#27272A]">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-[#71717A] uppercase">TOTAL REVENUE</div>
              <div className="text-base font-bold text-white tracking-tight">
                {formatPrice(totalGrossRevenue, currency)}
              </div>
            </div>
          </div>

          <div className="p-3 border-r border-[#202024] flex items-center space-x-3">
            <div className="p-2 bg-[#18181B] text-emerald-400 border border-[#27272A]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-[#71717A] uppercase">TOTAL ORDERS ({totalUnitsSold} UNITS)</div>
              <div className="text-base font-bold text-white">{orders.length} PROCESSED</div>
            </div>
          </div>

          <div className="p-3 border-r border-[#202024] flex items-center space-x-3">
            <div className={`p-2 border ${lowStockCount > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A]'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-[#71717A] uppercase">INVENTORY ALERTS</div>
              <div className="text-base font-bold text-white">
                {lowStockCount > 0 ? (
                  <span className="text-amber-400">{lowStockCount} LOW STOCK</span>
                ) : (
                  <span className="text-emerald-400">ALL STOCKED</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 flex items-center space-x-3">
            <div className="p-2 bg-[#18181B] text-[#E31B23] border border-[#27272A]">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-[#71717A] uppercase">ACTIVE PROMOTIONS</div>
              <div className="text-base font-bold text-white">{activePromoCount} CODES LIVE</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="bg-[#121215] border-b border-[#27272A] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-3 px-3 sm:px-4 text-xs font-mono font-bold flex items-center space-x-2 border-b-2 transition-all ${
                activeTab === 'inventory'
                  ? 'border-[#E31B23] text-[#E31B23] bg-[#18181D]'
                  : 'border-transparent text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>PRODUCTS & INVENTORY ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('promotions')}
              className={`py-3 px-3 sm:px-4 text-xs font-mono font-bold flex items-center space-x-2 border-b-2 transition-all ${
                activeTab === 'promotions'
                  ? 'border-[#E31B23] text-[#E31B23] bg-[#18181D]'
                  : 'border-transparent text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>PROMOTIONS & FLASH SALES ({promotions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`py-3 px-3 sm:px-4 text-xs font-mono font-bold flex items-center space-x-2 border-b-2 transition-all ${
                activeTab === 'orders'
                  ? 'border-[#E31B23] text-[#E31B23] bg-[#18181D]'
                  : 'border-transparent text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>ORDER DISPATCH ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`py-3 px-3 sm:px-4 text-xs font-mono font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'border-[#FF4D00] text-[#FF4D00] bg-[#18181D]'
                  : 'border-transparent text-[#A1A1AA] hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SECURITY SHIELD</span>
              {unreadSecurityAlerts > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#FF4D00] text-white rounded-sm">
                  {unreadSecurityAlerts}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-3 sm:px-4 text-xs font-mono font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-[#FF4D00] text-[#FF4D00] bg-[#18181D]'
                  : 'border-transparent text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>SYSTEM LOGS</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenMediaManager && (
              <button
                type="button"
                onClick={onOpenMediaManager}
                className="px-3 py-1.5 text-xs font-mono font-bold bg-[#E31B23] hover:bg-[#C4141B] text-white flex items-center shadow-xs transition-colors"
                title="Open Pre-Publish Media Hub for all image sections"
              >
                <Camera className="w-3.5 h-3.5 mr-1.5" />
                <span>PRE-PUBLISH MEDIA HUB</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="hidden sm:flex px-2.5 py-1 text-[11px] font-mono bg-[#1C1C20] hover:bg-[#27272A] border border-[#3F3F46] text-[#F5F5F5] items-center"
            >
              <ExternalLink className="w-3 h-3 mr-1 text-[#E31B23]" />
              <span>VIEW LIVE STORE</span>
            </button>
          </div>
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0E0E11]">
          {/* TAB 1: INVENTORY & PRODUCTS */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              {/* Action Bar: Search, Category Filter, Add Spec */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#141418] p-3 border border-[#27272A]">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-[#71717A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="SEARCH BY SPEC, SKU, OR NAME..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#0A0A0C] border border-[#27272A] pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#E31B23]"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-[#0A0A0C] border border-[#27272A] px-3 py-1.5 text-xs text-[#A1A1AA] focus:outline-none focus:border-[#E31B23]"
                  >
                    <option value="ALL">ALL CATEGORIES</option>
                    <option value="FACE">FACE</option>
                    <option value="BODY">BODY</option>
                    <option value="HAIR">HAIR</option>
                    <option value="BEARD & SHAVE">BEARD & SHAVE</option>
                    <option value="KITS">KITS</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setProductToEdit(null);
                    setProductEditorOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#E31B23] hover:bg-[#C4141B] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>ADD NEW PRODUCT</span>
                </button>
              </div>

              {/* Add New Product Form Drawer */}
              {isAddingNewProduct && (
                <div className="bg-[#141418] border-2 border-[#E31B23] p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
                    <span className="text-xs font-bold text-[#E31B23] flex items-center">
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      NEW PRODUCT LAB SPEC FORMULATION
                    </span>
                    <button
                      onClick={() => setIsAddingNewProduct(false)}
                      className="text-xs text-[#71717A] hover:text-white"
                    >
                      DISCARD
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block text-[10px] text-[#71717A] mb-1">SPEC NAME *</label>
                      <input
                        type="text"
                        value={newProductForm.name}
                        onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                        placeholder="e.g. Volcanic Pumice Body Bar"
                        className="w-full bg-[#0A0A0C] border border-[#27272A] p-2 text-white focus:border-[#E31B23]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#71717A] mb-1">CATEGORY</label>
                      <select
                        value={newProductForm.category}
                        onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value as any })}
                        className="w-full bg-[#0A0A0C] border border-[#27272A] p-2 text-white focus:border-[#E31B23]"
                      >
                        <option value="GROOMING">GROOMING</option>
                        <option value="ACCESSORIES">ACCESSORIES</option>
                        <option value="APPAREL / FUTURE">APPAREL / FUTURE</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#71717A] mb-1">BASE PRICE ($ USD) *</label>
                      <input
                        type="number"
                        value={newProductForm.price}
                        onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                        className="w-full bg-[#0A0A0C] border border-[#27272A] p-2 text-white focus:border-[#E31B23]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#71717A] mb-1">INITIAL STOCK UNITS *</label>
                      <input
                        type="number"
                        value={newProductForm.stockUnits}
                        onChange={(e) => setNewProductForm({ ...newProductForm, stockUnits: Number(e.target.value) })}
                        className="w-full bg-[#0A0A0C] border border-[#27272A] p-2 text-white focus:border-[#E31B23]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#71717A] mb-1">SPEC CODE</label>
                      <input
                        type="text"
                        value={newProductForm.specCode}
                        onChange={(e) => setNewProductForm({ ...newProductForm, specCode: e.target.value })}
                        className="w-full bg-[#0A0A0C] border border-[#27272A] p-2 text-white focus:border-[#E31B23]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#71717A] mb-1">CHASSIS / VOLUME</label>
                      <input
                        type="text"
                        value={newProductForm.volume}
                        onChange={(e) => setNewProductForm({ ...newProductForm, volume: e.target.value })}
                        placeholder="e.g. 180g Dense Matte Bar"
                        className="w-full bg-[#0A0A0C] border border-[#27272A] p-2 text-white focus:border-[#E31B23]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#71717A] mb-1">IMAGE URL OR UPLOAD</label>
                      <div className="flex space-x-1">
                        <input
                          type="text"
                          value={newProductForm.fieldImg}
                          onChange={(e) => setNewProductForm({ ...newProductForm, fieldImg: e.target.value })}
                          placeholder="/assets/aistudio/..."
                          className="w-full bg-[#0A0A0C] border border-[#27272A] p-2 text-white focus:border-[#E31B23]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setUploadTargetId('NEW_PRODUCT');
                            fileInputRef.current?.click();
                          }}
                          className="px-2 bg-[#27272A] hover:bg-[#E31B23] text-white hover:text-white transition-colors"
                          title="Upload Image File"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#71717A] mb-1">TAGLINE</label>
                      <input
                        type="text"
                        value={newProductForm.tagline}
                        onChange={(e) => setNewProductForm({ ...newProductForm, tagline: e.target.value })}
                        placeholder="Deep pore purge against urban friction"
                        className="w-full bg-[#0A0A0C] border border-[#27272A] p-2 text-white focus:border-[#E31B23]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-[#27272A]">
                    <button
                      onClick={handleCreateNewProduct}
                      className="px-4 py-2 bg-[#E31B23] hover:bg-[#C4141B] text-white font-bold text-xs flex items-center space-x-1"
                    >
                      <Save className="w-4 h-4" />
                      <span>DEPLOY SPEC TO STORE CATALOG</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Product Inventory Table / Cards */}
              <div className="border border-[#27272A] bg-[#111114]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#18181D] text-[#71717A] border-b border-[#27272A] uppercase text-[10px]">
                      <tr>
                        <th className="p-3">VISUAL</th>
                        <th className="p-3">SPEC / SKU</th>
                        <th className="p-3">NAME & CATEGORY</th>
                        <th className="p-3">PRICE ($ USD)</th>
                        <th className="p-3">AVAILABLE QUANTITY</th>
                        <th className="p-3">STOCK STATUS</th>
                        <th className="p-3 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#202024]">
                      {filteredProducts.map((p) => {
                        const isEditing = editingProductId === p.id;
                        const isLowStock = p.stockUnits <= (p.lowStockThreshold || 10) && p.stockUnits > 0;
                        const isDepleted = p.stockUnits === 0 || !p.inStock;

                        return (
                          <tr
                            key={p.id}
                            className={`hover:bg-[#151519] transition-colors ${
                              isDepleted ? 'bg-red-950/10' : isLowStock ? 'bg-amber-950/10' : ''
                            }`}
                          >
                            {/* Visual Thumbnail with Upload Trigger */}
                            <td className="p-3">
                              <div className="relative group/thumb w-14 h-14 bg-[#0A0A0C] border border-[#27272A] flex items-center justify-center overflow-hidden">
                                {p.fieldImg ? (
                                  <img
                                    src={p.fieldImg}
                                    alt={p.name}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="w-6 h-6 text-[#52525B]" />
                                )}
                                <button
                                  onClick={() => {
                                    setUploadTargetId(p.id);
                                    fileInputRef.current?.click();
                                  }}
                                  className="absolute inset-0 bg-black/70 opacity-0 group-hover/thumb:opacity-100 flex flex-col items-center justify-center text-[8px] text-[#E31B23] font-bold transition-opacity"
                                  title="Upload new photo"
                                >
                                  <Camera className="w-3.5 h-3.5 mb-0.5" />
                                  <span>REPLACE</span>
                                </button>
                              </div>
                            </td>

                            {/* Spec / SKU */}
                            <td className="p-3">
                              <div className="font-bold text-[#E31B23]">{p.specCode}</div>
                              <div className="text-[10px] text-[#71717A]">{p.sku}</div>
                              {p.saleBadge && (
                                <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#E31B23]/20 text-[#E31B23] text-[9px] border border-[#E31B23]/30 font-bold">
                                  {p.saleBadge}
                                </span>
                              )}
                            </td>

                            {/* Name & Category */}
                            <td className="p-3 max-w-xs">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editProductForm.name ?? p.name}
                                  onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })}
                                  className="w-full bg-[#0A0A0C] border border-[#E31B23] p-1 text-xs text-white"
                                />
                              ) : (
                                <div className="font-semibold text-white truncate">{p.name}</div>
                              )}
                              <div className="text-[10px] text-[#71717A]">{p.category} // {p.volume}</div>
                            </td>

                            {/* Price */}
                            <td className="p-3 whitespace-nowrap">
                              {isEditing ? (
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1">
                                    <span className="text-[#71717A] text-[10px]">REG:</span>
                                    <input
                                      type="number"
                                      value={editProductForm.price ?? p.price}
                                      onChange={(e) =>
                                        setEditProductForm({ ...editProductForm, price: Number(e.target.value) })
                                      }
                                      className="w-16 bg-[#0A0A0C] border border-[#E31B23] p-1 text-xs text-white"
                                    />
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-[#71717A] text-[10px]">COMP:</span>
                                    <input
                                      type="number"
                                      placeholder="Compare"
                                      value={editProductForm.compareAtPrice ?? p.compareAtPrice ?? ''}
                                      onChange={(e) =>
                                        setEditProductForm({
                                          ...editProductForm,
                                          compareAtPrice: Number(e.target.value),
                                        })
                                      }
                                      className="w-16 bg-[#0A0A0C] border border-[#27272A] p-1 text-xs text-white"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="font-bold text-white text-sm">
                                    ${p.price} USD
                                    {p.compareAtPrice && (
                                      <span className="ml-1.5 text-xs text-[#71717A] line-through">
                                        ${p.compareAtPrice}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-[#71717A]">
                                    ({formatPrice(p.price, currency)})
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Available Stock Quantity with Stepper */}
                            <td className="p-3">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editProductForm.stockUnits ?? p.stockUnits}
                                  onChange={(e) =>
                                    setEditProductForm({
                                      ...editProductForm,
                                      stockUnits: Number(e.target.value),
                                    })
                                  }
                                  className="w-20 bg-[#0A0A0C] border border-[#E31B23] p-1 text-xs text-white"
                                />
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center bg-[#0A0A0C] border border-[#27272A]">
                                    <button
                                      type="button"
                                      onClick={() => handleQuickStockAdjust(p, -1)}
                                      disabled={p.stockUnits <= 0}
                                      className="px-2 py-0.5 hover:bg-[#202024] text-[#A1A1AA] hover:text-white disabled:opacity-30"
                                      title="Decrease stock by 1"
                                    >
                                      -
                                    </button>
                                    <span className="px-2 text-xs font-bold text-white min-w-[2.5rem] text-center">
                                      {p.stockUnits}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickStockAdjust(p, 1)}
                                      className="px-2 py-0.5 hover:bg-[#202024] text-[#A1A1AA] hover:text-white"
                                      title="Increase stock by 1"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStockAdjust(p, 10)}
                                    className="px-1.5 py-0.5 text-[9px] bg-[#1A1A1E] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA]"
                                    title="Add 10 units"
                                  >
                                    +10
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Stock Status Badge */}
                            <td className="p-3 whitespace-nowrap">
                              {isDepleted ? (
                                <span className="inline-flex items-center px-2 py-0.5 bg-red-950/80 border border-red-500 text-red-300 text-[10px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-ping" />
                                  DEPLETED / 0
                                </span>
                              ) : isLowStock ? (
                                <span className="inline-flex items-center px-2 py-0.5 bg-amber-950/80 border border-amber-500 text-amber-300 text-[10px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                                  LOW STOCK ({p.stockUnits})
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-[10px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                                  IN STOCK ({p.stockUnits})
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right whitespace-nowrap">
                              {isEditing ? (
                                <div className="flex items-center justify-end space-x-1">
                                  <button
                                    onClick={handleSaveProductEdit}
                                    className="px-2 py-1 bg-[#E31B23] hover:bg-[#C4141B] text-white font-bold text-xs flex items-center space-x-1"
                                  >
                                    <Save className="w-3 h-3" />
                                    <span>SAVE</span>
                                  </button>
                                  <button
                                    onClick={() => setEditingProductId(null)}
                                    className="px-2 py-1 bg-[#202024] hover:bg-[#2A2A30] text-[#A1A1AA] text-xs"
                                  >
                                    CANCEL
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end space-x-1.5">
                                  <button
                                    onClick={() => handleStartEditProduct(p)}
                                    className="p-1.5 bg-[#18181D] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white"
                                    title="Edit Spec Details & Price"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setUploadTargetId(p.id);
                                      fileInputRef.current?.click();
                                    }}
                                    className="p-1.5 bg-[#18181D] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-[#E31B23]"
                                    title="Upload Custom High-Res Photo"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                  </button>
                                  {products.length > 3 && (
                                    <button
                                      onClick={() => {
                                        if (confirm(`Decommission product ${p.specCode}?`)) {
                                          onDeleteProduct(p.id);
                                          showNotice(`DELETED ${p.specCode}`);
                                        }
                                      }}
                                      className="p-1.5 bg-[#18181D] hover:bg-red-950/80 border border-[#27272A] hover:border-red-500 text-[#71717A] hover:text-red-400"
                                      title="Delete Spec"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROMOTIONS & FLASH SALES */}
          {activeTab === 'promotions' && (
            <div className="space-y-6">
              {/* Storewide Announcement Banner Configurator */}
              <div className="bg-[#141418] border border-[#27272A] p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-[#E31B23]" />
                    <span className="text-xs font-bold text-white">STOREWIDE PROMOTIONAL RADAR BANNER</span>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer text-xs">
                    <span className="text-[#71717A]">RADAR STATUS:</span>
                    <input
                      type="checkbox"
                      checked={bannerEnabledState}
                      onChange={(e) => setBannerEnabledState(e.target.checked)}
                      className="accent-[#E31B23] w-4 h-4"
                    />
                    <span className={bannerEnabledState ? 'text-emerald-400 font-bold' : 'text-[#71717A]'}>
                      {bannerEnabledState ? 'ACTIVE' : 'MUTED'}
                    </span>
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={bannerInputText}
                    onChange={(e) => setBannerInputText(e.target.value)}
                    placeholder="e.g. FLASH SALE: 20% OFF ORDERS OVER $60 WITH INTEL CODE WARFARE20"
                    className="flex-1 bg-[#0A0A0C] border border-[#27272A] p-2 text-xs text-white focus:border-[#E31B23]"
                  />
                  <button
                    onClick={handleSaveFlashBanner}
                    className="px-4 py-2 bg-[#E31B23] hover:bg-[#C4141B] text-white font-bold text-xs flex items-center space-x-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>UPDATE BANNER</span>
                  </button>
                </div>
                <div className="text-[10px] text-[#71717A]">
                  This banner appears across the top telemetry ticker of the live customer storefront.
                </div>
              </div>

              {/* Create New Promo Code */}
              <div className="bg-[#141418] border border-[#27272A] p-4 sm:p-5">
                <div className="text-xs font-bold text-[#E31B23] mb-3 flex items-center">
                  <Tag className="w-4 h-4 mr-1.5" />
                  CREATE CAMPAIGN PROMOTION CODE
                </div>
                <form onSubmit={handleCreatePromo} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-[#71717A] mb-1">PROMO CODE *</label>
                    <input
                      type="text"
                      placeholder="e.g. FLASH20"
                      value={promoForm.code}
                      onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })}
                      className="w-full bg-[#0A0A0C] border border-[#27272A] p-2 text-white uppercase focus:border-[#E31B23]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#71717A] mb-1">DISCOUNT TYPE</label>
                    <select
                      value={promoForm.discountType}
                      onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value as any })}
                      className="w-full bg-[#0A0A0C] border border-[#27272A] p-2 text-white focus:border-[#E31B23]"
                    >
                      <option value="percentage">PERCENTAGE (%)</option>
                      <option value="fixed">FIXED AMOUNT ($ USD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#71717A] mb-1">DISCOUNT VALUE *</label>
                    <input
                      type="number"
                      placeholder="15"
                      value={promoForm.discountValue}
                      onChange={(e) => setPromoForm({ ...promoForm, discountValue: Number(e.target.value) })}
                      className="w-full bg-[#0A0A0C] border border-[#27272A] p-2 text-white focus:border-[#E31B23]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#71717A] mb-1">MIN ORDER ($)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={promoForm.minOrderValue}
                      onChange={(e) => setPromoForm({ ...promoForm, minOrderValue: Number(e.target.value) })}
                      className="w-full bg-[#0A0A0C] border border-[#27272A] p-2 text-white focus:border-[#E31B23]"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#E31B23] hover:bg-[#C4141B] text-white font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>DEPLOY CODE</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Promotions List Table */}
              <div className="border border-[#27272A] bg-[#111114]">
                <div className="p-3 bg-[#18181D] border-b border-[#27272A] text-xs font-bold text-white flex items-center justify-between">
                  <span>ACTIVE DISCOUNT & PROMOTIONS MATRIX</span>
                  <span className="text-[#71717A]">{promotions.length} CODES CONFIGURED</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#141418] text-[#71717A] border-b border-[#27272A] text-[10px] uppercase">
                      <tr>
                        <th className="p-3">CODE</th>
                        <th className="p-3">DISCOUNT RATE</th>
                        <th className="p-3">MINIMUM ORDER</th>
                        <th className="p-3">TIMES USED</th>
                        <th className="p-3">STATUS</th>
                        <th className="p-3 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#202024]">
                      {promotions.map((p) => (
                        <tr key={p.id} className="hover:bg-[#151519]">
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-[#E31B23]/10 border border-[#E31B23]/40 text-[#E31B23] font-bold">
                              {p.code}
                            </span>
                            <div className="text-[10px] text-[#71717A] mt-1">{p.description}</div>
                          </td>
                          <td className="p-3 font-bold text-white">
                            {p.discountValue}
                            {p.discountType === 'percentage' ? '%' : '$'} OFF
                          </td>
                          <td className="p-3 text-[#A1A1AA]">
                            {p.minOrderValue > 0 ? `$${p.minOrderValue}` : 'NO MINIMUM'}
                          </td>
                          <td className="p-3 text-[#A1A1AA]">{p.timesUsed} REDEMPTIONS</td>
                          <td className="p-3">
                            <button
                              onClick={() => {
                                onUpdatePromotion({ ...p, isActive: !p.isActive });
                                showNotice(`CODE ${p.code} ${!p.isActive ? 'ACTIVATED' : 'DISABLED'}`);
                              }}
                              className={`px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                                p.isActive
                                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                                  : 'bg-zinc-900 border-zinc-700 text-zinc-500'
                              }`}
                            >
                              {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Remove promotion code ${p.code}?`)) {
                                  onDeletePromotion(p.id);
                                  showNotice(`PROMOTION ${p.code} REMOVED`);
                                }
                              }}
                              className="p-1 hover:text-red-400 text-[#71717A] transition-colors"
                              title="Delete Promo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORDER DISPATCH & FULFILLMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#141418] p-3 border border-[#27272A]">
                <div className="flex items-center space-x-2 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-[#71717A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="SEARCH ORDER ID, CUSTOMER, TRACKING..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full bg-[#0A0A0C] border border-[#27272A] pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#E31B23]"
                    />
                  </div>

                  <div className="flex items-center space-x-1 overflow-x-auto">
                    {(['ALL', 'deployed', 'inspected', 'transit', 'delivered', 'cancelled'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderFilterStatus(st)}
                        className={`px-2 py-1 text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                          orderFilterStatus === st
                            ? 'bg-[#E31B23] text-white'
                            : 'bg-[#18181D] text-[#A1A1AA] border border-[#27272A] hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-[#71717A] font-mono whitespace-nowrap">
                  SHOWING {filteredOrders.length} OF {orders.length} ORDERS
                </div>
              </div>

              {/* Order Cards List */}
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center bg-[#111114] border border-[#27272A] text-zinc-500 text-xs">
                  NO ORDERS FOUND MATCHING ACTIVE FILTER.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((ord) => {
                    const isExpanded = expandedOrderId === ord.orderId;
                    const itemsTotalCount = ord.items.reduce((s, i) => s + i.quantity, 0);

                    return (
                      <div
                        key={ord.orderId}
                        className="bg-[#121215] border border-[#27272A] hover:border-[#3F3F46] transition-all"
                      >
                        {/* Order Header Summary Row */}
                        <div
                          onClick={() => setExpandedOrderId(isExpanded ? null : ord.orderId)}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-[#E31B23] text-sm">{ord.orderId}</span>
                            <span className="text-[#52525B]">/</span>
                            <span className="text-xs text-white font-semibold">{ord.customer.fullName}</span>
                            <span className="text-[#52525B] hidden md:inline">/</span>
                            <span className="text-[11px] text-[#71717A] hidden md:inline">
                              {ord.customer.city}, {ord.customer.country}
                            </span>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="text-sm font-bold text-white">
                                {formatPrice(ord.total, currency)}
                              </div>
                              <div className="text-[10px] text-[#71717A]">
                                {itemsTotalCount} ITEMS // {ord.currency}
                              </div>
                            </div>

                            {/* Status Pill */}
                            <span
                              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                                ord.status === 'delivered'
                                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                                  : ord.status === 'transit'
                                  ? 'bg-indigo-950/80 border-indigo-500 text-indigo-400'
                                  : ord.status === 'inspected'
                                  ? 'bg-amber-950/80 border-amber-500 text-amber-400'
                                  : ord.status === 'cancelled'
                                  ? 'bg-red-950/80 border-red-500 text-red-400'
                                  : 'bg-zinc-800 border-zinc-600 text-zinc-300'
                              }`}
                            >
                              {ord.status}
                            </span>

                            <ChevronDown
                              className={`w-4 h-4 text-[#71717A] transition-transform ${
                                isExpanded ? 'rotate-180 text-white' : ''
                              }`}
                            />
                          </div>
                        </div>

                        {/* Order Expanded Details Drawer */}
                        {isExpanded && (
                          <div className="border-t border-[#202024] p-4 bg-[#0A0A0C] space-y-4 text-xs font-mono animate-in fade-in duration-150">
                            {/* Customer & Shipping Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-[#121215] border border-[#202024]">
                              <div>
                                <span className="text-[10px] text-[#71717A] uppercase block mb-1">
                                  CUSTOMER COORDINATES
                                </span>
                                <div className="text-white font-bold">{ord.customer.fullName}</div>
                                <div className="text-[#A1A1AA]">{ord.customer.email}</div>
                                <div className="text-[#A1A1AA]">{ord.customer.phone}</div>
                              </div>

                              <div>
                                <span className="text-[10px] text-[#71717A] uppercase block mb-1">
                                  DELIVERY DROP ZONE
                                </span>
                                <div className="text-[#E4E4E7]">{ord.customer.address}</div>
                                <div className="text-[#A1A1AA]">
                                  {ord.customer.city}, {ord.customer.state} {ord.customer.postalCode}
                                </div>
                                <div className="text-[#71717A]">{ord.customer.country}</div>
                              </div>

                              <div>
                                <span className="text-[10px] text-[#71717A] uppercase block mb-1">
                                  DISPATCH TELEMETRY
                                </span>
                                <div className="text-[#E31B23] font-bold">
                                  TRACKING: {ord.trackingNumber || 'TAC-AIR-PENDING'}
                                </div>
                                <div className="text-[#A1A1AA]">{ord.deliveryMethod}</div>
                                <div className="text-[#71717A]">PAYMENT: {ord.paymentMethod}</div>
                              </div>
                            </div>

                            {/* Ordered Items Itemized Breakdown */}
                            <div className="space-y-2">
                              <span className="text-[10px] text-[#71717A] uppercase block">
                                ALLOCATED ITEMS ({ord.items.length})
                              </span>
                              <div className="divide-y divide-[#1A1A1E] border border-[#202024] bg-[#121215]">
                                {ord.items.map((item, i) => (
                                  <div key={i} className="p-2.5 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-9 h-9 bg-[#0A0A0C] border border-[#27272A] overflow-hidden flex items-center justify-center">
                                        {item.product.fieldImg ? (
                                          <img
                                            src={item.product.fieldImg}
                                            alt={item.product.name}
                                            referrerPolicy="no-referrer"
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <Package className="w-4 h-4 text-[#71717A]" />
                                        )}
                                      </div>
                                      <div>
                                        <div className="font-bold text-white text-xs">{item.product.name}</div>
                                        <div className="text-[10px] text-[#71717A]">
                                          {item.product.specCode} // QTY: {item.quantity}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-white">
                                        {formatPrice(item.product.price * item.quantity, currency)}
                                      </div>
                                      <div className="text-[10px] text-[#71717A]">
                                        ${item.product.price} each
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Status Control & Admin Notes */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#202024]">
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] text-[#71717A] uppercase">ADVANCE STATUS:</span>
                                {(['deployed', 'inspected', 'transit', 'delivered', 'cancelled'] as OrderStatus[]).map(
                                  (st) => (
                                    <button
                                      key={st}
                                      type="button"
                                      onClick={() => {
                                        onUpdateOrderStatus(ord.orderId, st);
                                        showNotice(`ORDER ${ord.orderId} MARKED AS ${st.toUpperCase()}`);
                                      }}
                                      className={`px-2 py-1 text-[10px] font-mono uppercase transition-all ${
                                        ord.status === st
                                          ? 'bg-[#E31B23] text-white font-bold'
                                          : 'bg-[#18181D] hover:bg-[#222228] text-[#A1A1AA] border border-[#27272A]'
                                      }`}
                                    >
                                      {st}
                                    </button>
                                  )
                                )}
                              </div>

                              <div className="text-xs text-[#71717A]">
                                CREATED: {new Date(ord.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SECURITY SHIELD & INTRUSION ALERTS */}
          {activeTab === 'security' && (
            <AdminSecurityTab
              onUnreadCountChange={onUnreadSecurityAlertsChange}
              onNotice={showNotice}
            />
          )}

          {/* TAB 5: SYSTEM SETTINGS & DATA */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-[#141418] border border-[#27272A] p-5 space-y-3">
                <div className="text-xs font-bold text-white flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4 text-[#FF4D00]" />
                  <span>RESTORE FACTORY BLUEPRINT CATALOG</span>
                </div>
                <p className="text-xs text-[#8E8E93] leading-relaxed">
                  Resets the product catalog and promotion matrices to factory initial states (Drop 01 specs, initial
                  stock allocations, and standard promo codes).
                </p>
                <button
                  onClick={() => {
                    if (confirm('Reset entire catalog and inventory to default values?')) {
                      onResetDefaults();
                      showNotice('CATALOG RESET TO FACTORY SPECIFICATIONS');
                    }
                  }}
                  className="px-3 py-2 bg-red-950/80 hover:bg-red-900 border border-red-500 text-red-300 font-bold text-xs cursor-pointer"
                >
                  EXECUTE FACTORY RESET
                </button>
              </div>

              <div className="bg-[#141418] border border-[#27272A] p-5 space-y-2">
                <div className="text-xs font-bold text-white">SECURITY & BACKPLANE ARCHITECTURE</div>
                <div className="text-xs text-[#71717A] space-y-1 font-mono">
                  <div>AUTH PROTOCOL: Salted Scrypt PIN Hash + Signed HMAC-SHA256 Session Token</div>
                  <div>FIREWALL: Active WAF + Prototype-Pollution + XSS/SQLi + Magic-Byte Upload Guard</div>
                  <div>INTRUSION DETECTION: Real-time Audit Log (data/security-events.json) + Webhook Push</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Ribbon with Quick Stats */}
        <div className="bg-[#141418] border-t border-[#27272A] px-4 py-2.5 flex items-center justify-between text-[11px] font-mono text-[#71717A] shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-[#E31B23] font-bold">HIM HQ // v2.4.0</span>
            <span>CATALOG: {products.length} SPECS</span>
            <span>INVENTORY: {products.reduce((acc, p) => acc + p.stockUnits, 0)} TOTAL UNITS</span>
          </div>

          <div>
            <span>SYSTEM STATUS: 100% OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* Admin Product Full Editor Modal */}
      <AdminProductEditModal
        isOpen={productEditorOpen}
        onClose={() => {
          setProductEditorOpen(false);
          setProductToEdit(null);
        }}
        product={productToEdit}
        currency={currency}
        onSave={(updated) => {
          if (productToEdit) {
            onUpdateProduct(updated);
            showNotice(`UPDATED ${updated.specCode} // ${updated.name} // $${updated.price}`);
          } else {
            onAddProduct(updated);
            showNotice(`DEPLOYED NEW PRODUCT // ${updated.name}`);
          }
        }}
        onDelete={(prodId) => {
          onDeleteProduct(prodId);
          showNotice('PRODUCT SPEC DECOMMISSIONED');
        }}
      />
    </div>
  );
};
