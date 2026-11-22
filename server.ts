import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import Razorpay from 'razorpay';
import { createServer as createViteServer } from 'vite';
import { PRODUCTS } from './src/catalog/products';
import { INITIAL_PROMOTIONS } from './src/catalog/promotions';
import {
  initSecuritySubsystem,
  securityHeadersMiddleware,
  ipBlocklistMiddleware,
  scannerTrapMiddleware,
  wafPayloadMiddleware,
  createRateLimiter,
  requireAdmin,
  isRequestAdmin,
  handleAdminLogin,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  revokeAdminRequestToken,
  changeAdminPin,
  validateImageBase64Payload,
  sanitizeAndVerifyOrder,
  recordSecurityEvent,
  getSecuritySummaryAndEvents,
  acknowledgeAllSecurityEvents,
  updateSecuritySettings,
  sendTestSecurityAlert,
  stripHtmlTags,
} from './server/security';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_STATE_FILE = path.join(DATA_DIR, 'store-state.json');

async function startServer() {
  await initSecuritySubsystem();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Hardening: Disable Express stack fingerprinting & trust reverse proxy IP
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Global security headers & defense layers
  app.use(securityHeadersMiddleware);
  app.use(ipBlocklistMiddleware);
  app.use(scannerTrapMiddleware);

  // Bounded body parser (blocks oversized payload DoS while permitting validated image uploads)
  app.use(express.json({ limit: '8mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Handle malformed JSON gracefully without leaking stack traces
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      recordSecurityEvent({
        severity: 'MEDIUM',
        type: 'INJECTION_PROBE_BLOCKED',
        title: 'Malformed JSON Body Rejected',
        detail: `Invalid JSON payload received on ${req.method} ${req.originalUrl}`,
        req,
        blocked: true,
      }).catch(() => {});
      return res.status(400).json({ success: false, error: 'Malformed JSON request body.' });
    }
    if (err?.type === 'entity.too.large') {
      return res.status(413).json({ success: false, error: 'Request payload exceeds maximum allowed size.' });
    }
    next(err);
  });

  // Active WAF payload inspector on all API endpoints
  app.use('/api', wafPayloadMiddleware);

  // Rate limiters
  const apiGeneralLimiter = createRateLimiter({
    name: 'API_GENERAL',
    windowMs: 60 * 1000,
    maxRequests: 150,
  });
  const loginLimiter = createRateLimiter({
    name: 'ADMIN_LOGIN',
    windowMs: 5 * 60 * 1000,
    maxRequests: 25,
  });
  const checkoutLimiter = createRateLimiter({
    name: 'CHECKOUT_ORDER',
    windowMs: 10 * 60 * 1000,
    maxRequests: 25,
  });

  app.use('/api', apiGeneralLimiter);

  // Persistent store state (Products, Promotions, Orders) seeded with canonical catalog
  let productsDatabase: any[] = PRODUCTS.map((p) => ({ ...p }));
  let promotionsDatabase: any[] = INITIAL_PROMOTIONS.map((p) => ({ ...p }));
  let ordersDatabase: any[] = [];

  async function loadStoreState() {
    try {
      const raw = await fs.readFile(STORE_STATE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.products) && parsed.products.length > 0) {
        productsDatabase = parsed.products;
      }
      if (Array.isArray(parsed.promotions) && parsed.promotions.length > 0) {
        promotionsDatabase = parsed.promotions;
      }
      if (Array.isArray(parsed.orders)) {
        ordersDatabase = parsed.orders;
      }
    } catch {
      // Initial run: keep canonical seeds
    }
  }

  async function saveStoreState() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(
        STORE_STATE_FILE,
        JSON.stringify(
          {
            products: productsDatabase,
            promotions: promotionsDatabase,
            orders: ordersDatabase.slice(0, 500),
          },
          null,
          2
        ),
        'utf-8'
      );
    } catch (err) {
      console.error('Failed to persist store-state.json:', err);
    }
  }

  await loadStoreState();

  // ================= AUTHENTICATION ROUTES =================

  app.post('/api/auth/login', loginLimiter, async (req, res) => {
    if (process.env.ALLOW_LIVE_ADMIN !== 'true') {
      return res.status(403).json({
        success: false,
        error: 'Live storefront is locked in read-only mode.',
      });
    }
    const { pin } = req.body || {};
    const result = await handleAdminLogin(req, pin);
    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        error: result.message,
        remainingAttempts: result.remainingAttempts,
        lockedUntil: result.lockedUntil,
        retryAfterSeconds: result.retryAfterSeconds,
      });
    }

    if (result.token) {
      setAdminSessionCookie(res, result.token);
    }

    return res.json({
      success: true,
      token: result.token,
      expiresAt: result.expiresAt,
      unreadAlertsCount: result.unreadAlertsCount || 0,
    });
  });

  app.get('/api/auth/session', (req, res) => {
    const session = isRequestAdmin(req);
    if (!session) {
      return res.json({ authenticated: false, unreadAlertsCount: 0 });
    }
    const summary = getSecuritySummaryAndEvents();
    return res.json({
      authenticated: true,
      expiresAt: session.exp,
      unreadAlertsCount: summary.stats.unreadAlertsCount,
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    revokeAdminRequestToken(req);
    clearAdminSessionCookie(res);
    return res.json({ success: true });
  });

  app.post('/api/auth/change-pin', requireAdmin, async (req, res) => {
    const { currentPin, newPin } = req.body || {};
    const result = await changeAdminPin(req, currentPin, newPin);
    if (!result.ok) {
      return res.status(result.status).json({ success: false, error: result.message });
    }
    return res.json({ success: true, message: result.message });
  });

  // ================= SECURITY MONITORING & ALERTING (ADMIN ONLY) =================

  app.get('/api/security/events', requireAdmin, (_req, res) => {
    return res.json({
      success: true,
      ...getSecuritySummaryAndEvents(),
    });
  });

  app.post('/api/security/acknowledge', requireAdmin, async (_req, res) => {
    const acknowledgedCount = await acknowledgeAllSecurityEvents();
    return res.json({
      success: true,
      acknowledgedCount,
      ...getSecuritySummaryAndEvents(),
    });
  });

  app.put('/api/security/settings', requireAdmin, async (req, res) => {
    const { webhookUrl, alertEmail, autoBlockCritical, unblockIp, blockIp } = req.body || {};
    const settings = await updateSecuritySettings({
      webhookUrl,
      alertEmail,
      autoBlockCritical,
      unblockIp,
      blockIp,
    });
    return res.json({ success: true, settings });
  });

  app.post('/api/security/test-alert', requireAdmin, async (req, res) => {
    const result = await sendTestSecurityAlert(req);
    return res.json({
      success: true,
      event: result.event,
      webhookDelivered: result.webhookDelivered,
    });
  });

  // ================= PUBLIC STOREFRONT ROUTES =================

  // Minimal non-sensitive health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'HIM Storefront API',
      timestamp: new Date().toISOString(),
    });
  });

  // Public catalog read
  app.get('/api/products', (_req, res) => {
    res.json({ success: true, products: productsDatabase });
  });

  // Public active promotions read (no admin internals)
  app.get('/api/promotions', (_req, res) => {
    res.json({ success: true, promotions: promotionsDatabase });
  });

  // Public safe single-order lookup (prevents dumping entire order PII list)
  app.get('/api/orders/track/:query', (req, res) => {
    const query = stripHtmlTags(String(req.params.query || ''), 64).toUpperCase();
    if (!query || query.length < 4) {
      return res.status(400).json({ success: false, error: 'Valid order reference or tracking code required.' });
    }
    const found = ordersDatabase.find(
      (o) =>
        String(o.orderId || '').toUpperCase() === query ||
        String(o.trackingNumber || '').toUpperCase() === query
    );
    if (!found) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }
    // Redact sensitive street address/phone details unless admin
    const isAdmin = Boolean(isRequestAdmin(req));
    const safeOrder = isAdmin
      ? found
      : {
          ...found,
          customer: {
            fullName: found.customer?.fullName || 'Customer',
            email: found.customer?.email
              ? found.customer.email.replace(/(.{2}).*(@.*)/, '$1***$2')
              : '',
            phone: '***-***',
            address: 'Verified Delivery Address',
            city: found.customer?.city || '',
            state: found.customer?.state || '',
            postalCode: found.customer?.postalCode || '',
            country: found.customer?.country || 'India',
          },
        };
    return res.json({ success: true, order: safeOrder });
  });

  // Public Checkout Order Placement (validated + rate-limited + price-tamper checked)
  app.post('/api/orders', checkoutLimiter, async (req, res) => {
    const check = await sanitizeAndVerifyOrder(req.body, productsDatabase, req);
    if (!check.ok || !check.order) {
      return res.status(check.status).json({ success: false, error: check.error || 'Invalid order.' });
    }

    const verifiedOrder = check.order;
    ordersDatabase.unshift(verifiedOrder);

    // Atomically decrement product inventory
    for (const item of verifiedOrder.items) {
      const prodId = item.product?.id;
      const qty = item.quantity || 1;
      const prod = productsDatabase.find((p) => p.id === prodId);
      if (prod) {
        prod.stockUnits = Math.max(0, (prod.stockUnits || 0) - qty);
        if (prod.stockUnits === 0) {
          prod.inStock = false;
        }
      }
    }

    await saveStoreState();
    return res.json({
      success: true,
      order: verifiedOrder,
      products: productsDatabase,
    });
  });

  // ================= RAZORPAY STANDARD CHECKOUT ROUTES =================

  app.post('/api/create-order', checkoutLimiter, async (req, res) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(401).json({
        success: false,
        error: 'Razorpay credentials are not configured on the server.',
      });
    }

    const { amount, currency = 'INR', receipt } = req.body || {};
    const parsedAmount = Math.round(Number(amount));

    if (!Number.isFinite(parsedAmount) || parsedAmount < 100) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least 100 paise.',
      });
    }

    const cleanCurrency = stripHtmlTags(String(currency || 'INR'), 10).toUpperCase() || 'INR';
    const cleanReceipt = stripHtmlTags(String(receipt || `him_rcpt_${Date.now()}`), 40);

    try {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await razorpay.orders.create({
        amount: parsedAmount,
        currency: cleanCurrency,
        receipt: cleanReceipt,
      });

      return res.json({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: keyId,
      });
    } catch (err: any) {
      const statusCode = Number(err?.statusCode || err?.status || 500);
      const description =
        err?.error?.description || err?.message || 'Failed to create Razorpay order.';

      if (statusCode === 401) {
        return res.status(401).json({
          success: false,
          error: description,
        });
      }

      return res.status(500).json({
        success: false,
        error: description,
      });
    }
  });

  app.post('/api/verify-payment', checkoutLimiter, async (req, res) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(401).json({
        success: false,
        verified: false,
        error: 'Razorpay secret key is not configured on the server.',
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (
      typeof razorpay_order_id !== 'string' ||
      !razorpay_order_id.trim() ||
      typeof razorpay_payment_id !== 'string' ||
      !razorpay_payment_id.trim() ||
      typeof razorpay_signature !== 'string' ||
      !razorpay_signature.trim()
    ) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Missing required payment verification fields.',
      });
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const providedBuf = Buffer.from(razorpay_signature.trim(), 'utf8');
    const expectedBuf = Buffer.from(generatedSignature, 'utf8');

    const isValid =
      providedBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(providedBuf, expectedBuf);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Payment signature verification failed.',
      });
    }

    return res.json({
      success: true,
      verified: true,
      razorpay_order_id,
      razorpay_payment_id,
    });
  });

  // ================= ADMIN-PROTECTED ROUTES =================

  // Analytics / Operations Summary (Admin only)
  app.get('/api/analytics', requireAdmin, (_req, res) => {
    const totalRevenue = ordersDatabase.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = ordersDatabase.length;
    const pendingOrders = ordersDatabase.filter((o) => o.status === 'deployed' || o.status === 'inspected').length;
    const lowStockCount = productsDatabase.filter((p) => p.stockUnits <= (p.lowStockThreshold || 10)).length;

    res.json({
      totalRevenue,
      totalOrders,
      pendingOrders,
      lowStockCount,
      activePromosCount: promotionsDatabase.filter((p) => p.isActive).length,
      totalProducts: productsDatabase.length,
    });
  });

  // Sync / Bulk save products (Admin only)
  app.post('/api/products/sync', requireAdmin, async (req, res) => {
    const { products } = req.body || {};
    if (Array.isArray(products)) {
      productsDatabase = products;
      await saveStoreState();
      return res.json({ success: true, message: 'Products database synchronized', count: productsDatabase.length });
    }
    res.status(400).json({ success: false, error: 'Expected products array' });
  });

  // Create or Update Product (Admin only)
  app.post('/api/products', requireAdmin, async (req, res) => {
    const newProduct = req.body;
    if (!newProduct?.id || !newProduct?.name) {
      return res.status(400).json({ success: false, error: 'Product id and name required' });
    }
    const idx = productsDatabase.findIndex((p) => p.id === newProduct.id);
    if (idx >= 0) {
      productsDatabase[idx] = { ...productsDatabase[idx], ...newProduct };
      await saveStoreState();
      return res.json({ success: true, product: productsDatabase[idx], action: 'updated' });
    } else {
      productsDatabase.push(newProduct);
      await saveStoreState();
      return res.json({ success: true, product: newProduct, action: 'created' });
    }
  });

  // Update specific product (Admin only)
  app.put('/api/products/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const idx = productsDatabase.findIndex((p) => p.id === id);
    if (idx >= 0) {
      productsDatabase[idx] = { ...productsDatabase[idx], ...updates };
      await saveStoreState();
      return res.json({ success: true, product: productsDatabase[idx] });
    }
    const product = { id, ...updates };
    productsDatabase.push(product);
    await saveStoreState();
    res.json({ success: true, product });
  });

  // Delete product (Admin only)
  app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    productsDatabase = productsDatabase.filter((p) => p.id !== id);
    await saveStoreState();
    res.json({ success: true, message: `Product ${stripHtmlTags(id, 64)} deleted` });
  });

  // Image Upload endpoint (Admin only + validated magic bytes)
  app.post('/api/upload', requireAdmin, async (req, res) => {
    const { image, filename } = req.body || {};
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ success: false, error: 'Image data required' });
    }
    if (/^https?:\/\//i.test(image)) {
      return res.json({
        success: true,
        url: image,
        filename: stripHtmlTags(String(filename || `product_img_${Date.now()}`), 80),
        timestamp: new Date().toISOString(),
      });
    }

    const check = validateImageBase64Payload(image);
    if (!check.valid) {
      await recordSecurityEvent({
        severity: 'HIGH',
        type: 'INVALID_UPLOAD_BLOCKED',
        title: 'Unsafe File Upload Rejected',
        detail: check.reason || 'Invalid upload payload',
        req,
        blocked: true,
      });
      return res.status(400).json({ success: false, error: check.reason });
    }

    res.json({
      success: true,
      url: image,
      filename: stripHtmlTags(String(filename || `product_img_${Date.now()}.${check.ext}`), 80),
      timestamp: new Date().toISOString(),
    });
  });

  // Sync Promotions (Admin only)
  app.post('/api/promotions/sync', requireAdmin, async (req, res) => {
    const { promotions } = req.body || {};
    if (Array.isArray(promotions)) {
      promotionsDatabase = promotions;
      await saveStoreState();
      return res.json({ success: true, promotions: promotionsDatabase });
    }
    res.status(400).json({ success: false, error: 'Expected promotions array' });
  });

  // Create or Update Promotion (Admin only)
  app.post('/api/promotions', requireAdmin, async (req, res) => {
    const promo = req.body;
    if (!promo?.code) {
      return res.status(400).json({ success: false, error: 'Promotion code required' });
    }
    const cleanCode = stripHtmlTags(String(promo.code), 32).toUpperCase();
    const idx = promotionsDatabase.findIndex((p) => p.code === cleanCode || p.id === promo.id);
    if (idx >= 0) {
      promotionsDatabase[idx] = { ...promotionsDatabase[idx], ...promo, code: cleanCode };
      await saveStoreState();
      return res.json({ success: true, promotion: promotionsDatabase[idx], action: 'updated' });
    } else {
      const newPromo = {
        id: promo.id || `promo-${Date.now()}`,
        ...promo,
        code: cleanCode,
        timesUsed: promo.timesUsed || 0,
        isActive: promo.isActive !== false,
      };
      promotionsDatabase.push(newPromo);
      await saveStoreState();
      return res.json({ success: true, promotion: newPromo, action: 'created' });
    }
  });

  // Delete Promotion (Admin only)
  app.delete('/api/promotions/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    promotionsDatabase = promotionsDatabase.filter((p) => p.id !== id && p.code !== id);
    await saveStoreState();
    res.json({ success: true, message: `Promotion ${stripHtmlTags(id, 64)} deleted` });
  });

  // Get All Orders including PII (Admin only)
  app.get('/api/orders', requireAdmin, (_req, res) => {
    res.json({ success: true, orders: ordersDatabase });
  });

  // Sync Orders (Admin only)
  app.post('/api/orders/sync', requireAdmin, async (req, res) => {
    const { orders } = req.body || {};
    if (Array.isArray(orders)) {
      ordersDatabase = orders;
      await saveStoreState();
      return res.json({ success: true, count: ordersDatabase.length });
    }
    res.status(400).json({ success: false, error: 'Expected orders array' });
  });

  // Update Order Status (Admin only)
  app.put('/api/orders/:id/status', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status, trackingNumber, adminNotes, newEvent } = req.body || {};

    const ord = ordersDatabase.find((o) => o.orderId === id);
    if (!ord) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (status) ord.status = stripHtmlTags(String(status), 32);
    if (trackingNumber) ord.trackingNumber = stripHtmlTags(String(trackingNumber), 64);
    if (adminNotes !== undefined) ord.adminNotes = stripHtmlTags(String(adminNotes), 300);

    if (newEvent) {
      ord.events = ord.events || [];
      ord.events.push(newEvent);
    }

    await saveStoreState();
    res.json({ success: true, order: ord });
  });

  // Free Home Sample Requests for Non-Soap Formulations
  app.post('/api/sample-requests', checkoutLimiter, async (req, res) => {
    const body = req.body || {};
    const fullName = stripHtmlTags(String(body.fullName || ''), 120);
    const phone = stripHtmlTags(String(body.phone || ''), 40);
    const email = stripHtmlTags(String(body.email || ''), 120);
    const address = stripHtmlTags(String(body.address || ''), 280);
    const city = stripHtmlTags(String(body.city || ''), 80);
    const state = stripHtmlTags(String(body.state || ''), 80);
    const postalCode = stripHtmlTags(String(body.postalCode || ''), 20);
    const productId = stripHtmlTags(String(body.productId || ''), 80);
    const productName = stripHtmlTags(String(body.productName || ''), 140);
    const requestId = stripHtmlTags(String(body.requestId || `SMP-${Date.now()}`), 40);

    if (!fullName || !phone || !email || !address || !city || !postalCode) {
      return res.status(400).json({ success: false, error: 'All contact and home delivery address fields are required.' });
    }

    const entry = {
      requestId,
      productId,
      productName,
      fullName,
      phone,
      email,
      address,
      city,
      state,
      postalCode,
      createdAt: new Date().toISOString(),
    };

    try {
      const sampleFile = path.join(DATA_DIR, 'sample-requests.json');
      await fs.mkdir(DATA_DIR, { recursive: true });
      let list: any[] = [];
      try {
        const raw = await fs.readFile(sampleFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed;
      } catch {}
      list.unshift(entry);
      await fs.writeFile(sampleFile, JSON.stringify(list.slice(0, 1000), null, 2), 'utf-8');
    } catch {
      // Safe fallback on read-only serverless environments
    }

    res.json({ success: true, sampleRequest: entry });
  });

  // Persistent Custom Images Registry for All Sections
  const customImagesFilePath = path.join(DATA_DIR, 'custom-images.json');

  async function getStoredCustomImages(): Promise<Record<string, string>> {
    try {
      const data = await fs.readFile(customImagesFilePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  async function persistCustomImages(map: Record<string, string>): Promise<void> {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(customImagesFilePath, JSON.stringify(map, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save custom images to data/custom-images.json', err);
    }
  }

  // Public read for custom storefront images
  app.get('/api/images/custom', async (_req, res) => {
    try {
      const images = await getStoredCustomImages();
      res.json({ success: true, images });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to load custom images' });
    }
  });

  // Universal image upload (Admin only + validated magic bytes + sanitized path)
  app.post('/api/images/custom', requireAdmin, async (req, res) => {
    try {
      const { id, base64Data, dataUrl } = req.body || {};
      const payload = base64Data || dataUrl;
      if (!id || typeof id !== 'string' || !payload || typeof payload !== 'string') {
        return res.status(400).json({ success: false, error: 'Missing id or image data' });
      }

      const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
      if (!safeId) {
        return res.status(400).json({ success: false, error: 'Invalid slot identifier' });
      }

      const check = validateImageBase64Payload(payload);
      if (!check.valid || !check.buffer) {
        await recordSecurityEvent({
          severity: 'HIGH',
          type: 'INVALID_UPLOAD_BLOCKED',
          title: 'Malicious Custom Image Upload Blocked',
          detail: check.reason || 'Image failed verification',
          req,
          blocked: true,
        });
        return res.status(400).json({ success: false, error: check.reason || 'Invalid image format' });
      }

      const filename = `${safeId}.${check.ext || 'jpg'}`;
      const targetDir = path.join(process.cwd(), 'public', 'images', 'custom');
      await fs.mkdir(targetDir, { recursive: true });
      await fs.writeFile(path.join(targetDir, filename), check.buffer);

      try {
        const distDir = path.join(process.cwd(), 'dist', 'images', 'custom');
        await fs.mkdir(distDir, { recursive: true });
        await fs.writeFile(path.join(distDir, filename), check.buffer);
      } catch {}

      const imagePath = `/images/custom/${filename}?t=${Date.now()}`;
      const currentMap = await getStoredCustomImages();
      currentMap[safeId] = imagePath;
      await persistCustomImages(currentMap);

      res.json({ success: true, id: safeId, imagePath });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to save custom image' });
    }
  });

  // Save / Update Reviewer Photo (Admin only + validated magic bytes)
  app.post('/api/reviews/photo', requireAdmin, async (req, res) => {
    try {
      const { reviewId, base64Data } = req.body || {};
      if (!reviewId || typeof reviewId !== 'string' || !base64Data || typeof base64Data !== 'string') {
        return res.status(400).json({ success: false, error: 'Missing reviewId or base64Data' });
      }

      const safeReviewId = reviewId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
      const check = validateImageBase64Payload(base64Data);
      if (!check.valid || !check.buffer) {
        await recordSecurityEvent({
          severity: 'HIGH',
          type: 'INVALID_UPLOAD_BLOCKED',
          title: 'Invalid Review Photo Blocked',
          detail: check.reason || 'Upload failed verification',
          req,
          blocked: true,
        });
        return res.status(400).json({ success: false, error: check.reason || 'Invalid image file' });
      }

      const filenameMap: Record<string, string> = {
        'rev-01': 'rev_rohit.jpg',
        'rev-02': 'rev_aarav.jpg',
        'rev-03': 'rev_dhruv.jpg',
        'rev-04': 'rev_sushil.jpg',
      };

      const filename = filenameMap[safeReviewId] || `${safeReviewId}.${check.ext || 'jpg'}`;
      const targetDir = path.join(process.cwd(), 'public', 'images', 'models');
      await fs.mkdir(targetDir, { recursive: true });
      await fs.writeFile(path.join(targetDir, filename), check.buffer);

      try {
        const distDir = path.join(process.cwd(), 'dist', 'images', 'models');
        await fs.mkdir(distDir, { recursive: true });
        await fs.writeFile(path.join(distDir, filename), check.buffer);
      } catch {}

      const imagePath = `/images/models/${filename}?t=${Date.now()}`;
      const currentMap = await getStoredCustomImages();
      currentMap[safeReviewId] = imagePath;
      await persistCustomImages(currentMap);

      res.json({ success: true, imagePath });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to save review photo' });
    }
  });

  // Unknown API 404 handler (never leaks HTML index page on /api typos)
  app.use('/api/*', (_req, res) => {
    res.status(404).json({ success: false, error: 'API endpoint not found.' });
  });

  // Dynamic Google Search SEO endpoints (/robots.txt & /sitemap.xml) resolved to live domain origin
  const resolvePublicOrigin = (): string => {
    const configured = process.env.SITE_URL || process.env.PUBLIC_SITE_URL;
    if (configured && /^https?:\/\//i.test(configured.trim())) {
      return configured.trim().replace(/\/+$/, '');
    }
    return 'https://www.heismard.com';
  };

  const escapeXml = (value: string): string =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  app.get('/google156d214a8cf4099a.html', (_req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send('google-site-verification: google156d214a8cf4099a.html');
  });

  app.get('/robots.txt', (_req, res) => {
    const origin = resolvePublicOrigin();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(
      `# robots.txt for HIM — He Is Man (He Is Mard | Men's Grooming & Skincare Brand)\n` +
        `User-agent: Googlebot\nAllow: /\nDisallow: /api/\n\n` +
        `User-agent: *\nAllow: /\nDisallow: /api/\n\n` +
        `Sitemap: ${origin}/sitemap.xml\n`
    );
  });

  app.get('/sitemap.xml', (_req, res) => {
    const origin = resolvePublicOrigin();
    const lastmod = new Date().toISOString().split('T')[0];

    const productUrls = productsDatabase
      .map((p: any) => {
        const imgUrl = p.fieldImg
          ? p.fieldImg.startsWith('http')
            ? p.fieldImg
            : `${origin}${p.fieldImg.startsWith('/') ? p.fieldImg : `/${p.fieldImg}`}`
          : '';
        return `  <url>
    <loc>${escapeXml(`${origin}/product/${p.id}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>${
      imgUrl
        ? `
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(String(p.name || 'HIM Product'))}</image:title>
    </image:image>`
        : ''
    }
  </url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${escapeXml(`${origin}/`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${escapeXml(`${origin}/assets/aistudio/Men_posing_with_motorcycle_products_cb7d58eb_b75f4f77.jpg`)}</image:loc>
      <image:title>HIM — He Is Man | Official Men&apos;s Grooming &amp; Skincare Brand</image:title>
      <image:caption>HIM (He Is Man / HIM Mard) men&apos;s skincare, soap, hair, beard and fragrance range formulated in India</image:caption>
    </image:image>
  </url>
${productUrls}
  <url>
    <loc>${escapeXml(`${origin}/privacy-policy`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${escapeXml(`${origin}/terms-of-service`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  });

  // Static public assets (cached to prevent repeated full-res image re-fetches)
  app.use(express.static(path.join(process.cwd(), 'public'), { maxAge: '7d', etag: true }));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`HIM Dev Server ready on http://0.0.0.0:${PORT}`);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', async (_req, res) => {
      try {
        const indexPath = path.join(distPath, 'index.html');
        const verification = (process.env.GOOGLE_SITE_VERIFICATION || '').trim();
        if (verification) {
          let html = await fs.readFile(indexPath, 'utf-8');
          const safeToken = verification.replace(/"/g, '&quot;');
          if (!html.includes('google-site-verification')) {
            html = html.replace(
              '</head>',
              `    <meta name="google-site-verification" content="${safeToken}" />\n  </head>`
            );
          }
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.send(html);
        }
        return res.sendFile(indexPath);
      } catch {
        return res.sendFile(path.join(distPath, 'index.html'));
      }
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`HIM Production Server running securely on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer().catch((err) => {
  console.error('CRITICAL: HIM Server failed to initialize:', err);
  process.exit(1);
});
