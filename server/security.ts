import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import type { Request, Response, NextFunction } from 'express';

export type SecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SecurityEventType =
  | 'FAILED_ADMIN_LOGIN'
  | 'BRUTE_FORCE_LOCKOUT'
  | 'UNAUTHORIZED_API_ACCESS'
  | 'XSS_INJECTION_BLOCKED'
  | 'INJECTION_PROBE_BLOCKED'
  | 'PROTOTYPE_POLLUTION_BLOCKED'
  | 'PATH_TRAVERSAL_BLOCKED'
  | 'SCANNER_PROBE_DETECTED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_UPLOAD_BLOCKED'
  | 'PRICE_TAMPER_BLOCKED'
  | 'IP_BLOCKED_ACCESS'
  | 'ADMIN_LOGIN_SUCCESS'
  | 'PIN_CHANGED'
  | 'SECURITY_ALERT_TEST';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  severity: SecuritySeverity;
  type: SecurityEventType;
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

export interface SecurityConfig {
  pinHash: string; // format: saltHex:derivedHex
  sessionSecret: string;
  webhookUrl: string;
  alertEmail: string;
  autoBlockCritical: boolean;
  blockedIps: string[];
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'security-config.json');
const EVENTS_FILE = path.join(DATA_DIR, 'security-events.json');
const ADMIN_COOKIE_NAME = 'him_admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_STORED_EVENTS = 500;

const WEAK_PINS = new Set([
  '000000',
  '111111',
  '222222',
  '333333',
  '444444',
  '555555',
  '666666',
  '777777',
  '888888',
  '999999',
  '123456',
  '654321',
  '123123',
  '010101',
]);

let cachedConfig: SecurityConfig | null = null;
let cachedEvents: SecurityEvent[] = [];
let initialized = false;

interface LoginAttemptRecord {
  failures: number;
  firstFailureAt: number;
  lockedUntil: number;
}
const loginAttemptsByIp = new Map<string, LoginAttemptRecord>();
const revokedTokens = new Map<string, number>(); // tokenId -> expiryMs
const alertCooldowns = new Map<string, number>();

function hashPinWithSalt(pin: string, existingSaltHex?: string): string {
  const saltHex = existingSaltHex || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(pin, saltHex, 64).toString('hex');
  return `${saltHex}:${derived}`;
}

function verifyPinHash(pin: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [saltHex, expectedHex] = parts;
  const derived = crypto.scryptSync(pin, saltHex, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  let raw = '';
  if (typeof forwarded === 'string' && forwarded.trim()) {
    raw = forwarded.split(',')[0].trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    raw = String(forwarded[0]).trim();
  } else {
    raw = req.ip || req.socket?.remoteAddress || 'unknown';
  }
  return raw.replace(/[^a-fA-F0-9.:_-]/g, '').slice(0, 64) || 'unknown';
}

function sanitizeTextPreview(input: string, maxLen = 180): string {
  return input
    .replace(/[\x00-\x1f\x7f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export function stripHtmlTags(val: string, maxLen = 400): string {
  return val
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
    .trim()
    .slice(0, maxLen);
}

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function persistConfig(cfg: SecurityConfig): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(CONFIG_FILE, JSON.stringify(cfg, null, 2), { encoding: 'utf-8', mode: 0o600 });
  } catch (err) {
    console.error('Failed to persist security-config.json:', err);
  }
}

async function persistEvents(): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(EVENTS_FILE, JSON.stringify(cachedEvents.slice(0, MAX_STORED_EVENTS), null, 2), {
      encoding: 'utf-8',
      mode: 0o600,
    });
  } catch (err) {
    console.error('Failed to persist security-events.json:', err);
  }
}

export async function initSecuritySubsystem(): Promise<void> {
  if (initialized) return;
  await ensureDataDir();

  // Load or initialize security config
  try {
    const raw = await fs.readFile(CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<SecurityConfig>;
    cachedConfig = {
      pinHash: parsed.pinHash || hashPinWithSalt(process.env.HIM_ADMIN_PIN || '300519'),
      sessionSecret: parsed.sessionSecret || process.env.HIM_SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
      webhookUrl: parsed.webhookUrl || process.env.HIM_SECURITY_WEBHOOK_URL || '',
      alertEmail: parsed.alertEmail || process.env.HIM_ALERT_EMAIL || 'guru.chelaforex@gmail.com',
      autoBlockCritical: parsed.autoBlockCritical !== false,
      blockedIps: Array.isArray(parsed.blockedIps) ? parsed.blockedIps : [],
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    const initialPin = process.env.HIM_ADMIN_PIN && /^\d{6,12}$/.test(process.env.HIM_ADMIN_PIN)
      ? process.env.HIM_ADMIN_PIN
      : '300519';
    cachedConfig = {
      pinHash: hashPinWithSalt(initialPin),
      sessionSecret: process.env.HIM_SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
      webhookUrl: process.env.HIM_SECURITY_WEBHOOK_URL || '',
      alertEmail: process.env.HIM_ALERT_EMAIL || 'guru.chelaforex@gmail.com',
      autoBlockCritical: true,
      blockedIps: [],
      updatedAt: new Date().toISOString(),
    };
    await persistConfig(cachedConfig);
  }

  // If HIM_ADMIN_PIN is explicitly injected in environment at startup, honor it without rewriting if same
  if (process.env.HIM_ADMIN_PIN && /^\d{6,12}$/.test(process.env.HIM_ADMIN_PIN)) {
    if (!verifyPinHash(process.env.HIM_ADMIN_PIN, cachedConfig.pinHash)) {
      cachedConfig.pinHash = hashPinWithSalt(process.env.HIM_ADMIN_PIN);
      cachedConfig.updatedAt = new Date().toISOString();
      await persistConfig(cachedConfig);
    }
  }

  // Load persisted security events
  try {
    const rawEvents = await fs.readFile(EVENTS_FILE, 'utf-8');
    const parsed = JSON.parse(rawEvents);
    if (Array.isArray(parsed)) {
      cachedEvents = parsed.slice(0, MAX_STORED_EVENTS);
    }
  } catch {
    cachedEvents = [];
  }

  initialized = true;
}

function getConfigSync(): SecurityConfig {
  if (!cachedConfig) {
    cachedConfig = {
      pinHash: hashPinWithSalt(process.env.HIM_ADMIN_PIN || '300519'),
      sessionSecret: process.env.HIM_SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
      webhookUrl: process.env.HIM_SECURITY_WEBHOOK_URL || '',
      alertEmail: process.env.HIM_ALERT_EMAIL || 'guru.chelaforex@gmail.com',
      autoBlockCritical: true,
      blockedIps: [],
      updatedAt: new Date().toISOString(),
    };
  }
  return cachedConfig;
}

async function dispatchWebhookAlert(event: SecurityEvent): Promise<boolean> {
  const cfg = getConfigSync();
  if (!cfg.webhookUrl || !/^https?:\/\//i.test(cfg.webhookUrl)) {
    return false;
  }

  try {
    const summaryText = `[HIM SECURITY ALERT // ${event.severity}] ${event.title}\nType: ${event.type}\nIP: ${event.ip} | Route: ${event.method} ${event.path}\nDetail: ${event.detail}\nOwner: ${cfg.alertEmail}\nTime: ${event.timestamp}`;

    const body = JSON.stringify({
      // Slack / generic format
      text: summaryText,
      // Discord format
      content: summaryText,
      // Structured metadata for Make / Zapier / n8n / Telegram bridges
      brand: 'HIM — He Is Man',
      alertEmail: cfg.alertEmail,
      event,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch(cfg.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return resp.ok;
  } catch {
    return false;
  }
}

export async function recordSecurityEvent(params: {
  severity: SecuritySeverity;
  type: SecurityEventType;
  title: string;
  detail: string;
  req?: Request;
  ip?: string;
  path?: string;
  method?: string;
  userAgent?: string;
  payloadPreview?: string;
  blocked?: boolean;
  dedupKey?: string;
}): Promise<SecurityEvent> {
  const ip = params.ip || (params.req ? getClientIp(params.req) : 'unknown');
  const reqPath = params.path || params.req?.originalUrl || params.req?.url || '/';
  const method = params.method || params.req?.method || 'SYSTEM';
  const userAgent = sanitizeTextPreview(
    params.userAgent || String(params.req?.headers['user-agent'] || 'Unknown Client'),
    140
  );

  // Deduplicate rapid repeated flood logs from same IP+type within 20s (except login failures)
  if (params.dedupKey) {
    const lastSeen = alertCooldowns.get(params.dedupKey);
    const now = Date.now();
    if (lastSeen && now - lastSeen < 20000) {
      return cachedEvents[0] || {
        id: `sec-${now}`,
        timestamp: new Date().toISOString(),
        severity: params.severity,
        type: params.type,
        title: params.title,
        detail: params.detail,
        ip,
        userAgent,
        method,
        path: sanitizeTextPreview(reqPath, 160),
        payloadPreview: params.payloadPreview ? sanitizeTextPreview(params.payloadPreview, 180) : undefined,
        blocked: params.blocked !== false,
        acknowledged: false,
      };
    }
    alertCooldowns.set(params.dedupKey, now);
  }

  const event: SecurityEvent = {
    id: `sec-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    timestamp: new Date().toISOString(),
    severity: params.severity,
    type: params.type,
    title: params.title,
    detail: params.detail,
    ip,
    userAgent,
    method,
    path: sanitizeTextPreview(reqPath, 160),
    payloadPreview: params.payloadPreview ? sanitizeTextPreview(params.payloadPreview, 180) : undefined,
    blocked: params.blocked !== false,
    acknowledged: params.type === 'ADMIN_LOGIN_SUCCESS',
  };

  cachedEvents.unshift(event);
  if (cachedEvents.length > MAX_STORED_EVENTS) {
    cachedEvents = cachedEvents.slice(0, MAX_STORED_EVENTS);
  }

  // Auto-block external attacker IPs on CRITICAL exploits (excluding localhost dev)
  const cfg = getConfigSync();
  const isLocal = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'unknown';
  if (
    cfg.autoBlockCritical &&
    params.severity === 'CRITICAL' &&
    params.type !== 'BRUTE_FORCE_LOCKOUT' &&
    !isLocal &&
    !cfg.blockedIps.includes(ip)
  ) {
    cfg.blockedIps.push(ip);
    cfg.updatedAt = new Date().toISOString();
    await persistConfig(cfg);
  }

  await persistEvents();

  if (params.severity === 'HIGH' || params.severity === 'CRITICAL' || params.type === 'SECURITY_ALERT_TEST') {
    console.warn(`[HIM SECURITY SHIELD] [${event.severity}] ${event.type} from ${event.ip} on ${event.method} ${event.path}: ${event.detail}`);
    // Dispatch webhook asynchronously
    dispatchWebhookAlert(event).catch(() => {});
  }

  return event;
}

// ---------- SESSION TOKEN HELPERS ----------
interface TokenPayload {
  jti: string;
  role: 'admin';
  iat: number;
  exp: number;
}

export function issueAdminToken(): { token: string; expiresAt: number } {
  const cfg = getConfigSync();
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;
  const payload: TokenPayload = {
    jti: crypto.randomBytes(12).toString('hex'),
    role: 'admin',
    iat: now,
    exp: expiresAt,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', cfg.sessionSecret).update(encoded).digest('base64url');
  return { token: `${encoded}.${sig}`, expiresAt };
}

export function verifyAdminToken(token: string | undefined | null): TokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const cfg = getConfigSync();

  const expectedSig = crypto.createHmac('sha256', cfg.sessionSecret).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as TokenPayload;
    if (payload.role !== 'admin' || !payload.exp || Date.now() > payload.exp) {
      return null;
    }
    const revokedExp = revokedTokens.get(payload.jti);
    if (revokedExp && Date.now() <= revokedExp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = req.headers.cookie;
  if (typeof cookieHeader === 'string') {
    const cookies = cookieHeader.split(';');
    for (const part of cookies) {
      const [name, ...rest] = part.trim().split('=');
      if (name === ADMIN_COOKIE_NAME) {
        return decodeURIComponent(rest.join('='));
      }
    }
  }
  return null;
}

export function setAdminSessionCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  const flags = [
    `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (isProd) flags.push('Secure');
  res.setHeader('Set-Cookie', flags.join('; '));
}

export function clearAdminSessionCookie(res: Response): void {
  res.setHeader('Set-Cookie', `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

export function revokeAdminRequestToken(req: Request): void {
  const token = extractTokenFromRequest(req);
  const payload = verifyAdminToken(token);
  if (payload) {
    revokedTokens.set(payload.jti, payload.exp);
  }
}

export function isRequestAdmin(req: Request): TokenPayload | null {
  const token = extractTokenFromRequest(req);
  return verifyAdminToken(token);
}

// ---------- EXPRESS MIDDLEWARES ----------

export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Never expose server stack
  res.removeHeader('X-Powered-By');
  // Clickjacking-safe while still allowing AI Studio iframe preview: NO X-Frame-Options: DENY
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https: wss: ws:; object-src 'none'; base-uri 'self';"
  );
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
}

export async function ipBlocklistMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const ip = getClientIp(req);
  const cfg = getConfigSync();
  if (cfg.blockedIps.includes(ip)) {
    await recordSecurityEvent({
      severity: 'HIGH',
      type: 'IP_BLOCKED_ACCESS',
      title: 'Blocked IP Attempted Access',
      detail: `Previously blocked IP ${ip} attempted ${req.method} ${req.originalUrl}`,
      req,
      blocked: true,
      dedupKey: `ipblock:${ip}`,
    });
    res.status(403).json({
      success: false,
      error: 'Access denied by HIM Security Shield.',
      code: 'IP_BLOCKED',
    });
    return;
  }
  next();
}

const SCANNER_PATH_PATTERNS = [
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/wp-content/i,
  /\/\.env/i,
  /\/\.git/i,
  /\/phpmyadmin/i,
  /\/xmlrpc\.php/i,
  /\/config\.php/i,
  /\/etc\/passwd/i,
  /\/\.htaccess/i,
  /\/server-status/i,
  /\/cgi-bin/i,
];

export async function scannerTrapMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const urlPath = req.originalUrl || req.url || '';
  if (SCANNER_PATH_PATTERNS.some((re) => re.test(urlPath))) {
    await recordSecurityEvent({
      severity: 'HIGH',
      type: 'SCANNER_PROBE_DETECTED',
      title: 'Automated Vulnerability Scanner Blocked',
      detail: `Recon probe targeting restricted path ${sanitizeTextPreview(urlPath, 100)}`,
      req,
      blocked: true,
      dedupKey: `scan:${getClientIp(req)}:${urlPath.slice(0, 32)}`,
    });
    res.status(403).json({
      success: false,
      error: 'Blocked by HIM Active Defense.',
    });
    return;
  }
  next();
}

// Payload inspection patterns
const PROTOTYPE_POLLUTION_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const PATH_TRAVERSAL_RE = /(\.\.[/\\]|%2e%2e[/\\%]|%00|\0)/i;
const XSS_RE = /(<\s*script\b|javascript\s*:|onerror\s*=|onload\s*=|onmouseover\s*=|onfocus\s*=|<\s*iframe\b|document\.cookie|\beval\s*\()/i;
const SQLI_NOSQL_RE = /(\bunion\s+(all\s+)?select\b|'\s*or\s+1\s*=\s*1\b|"\s*or\s+1\s*=\s*1\b|;\s*drop\s+table\b|\$(?:ne|gt|gte|lt|lte|where|regex)\b)/i;

interface ThreatMatch {
  type: SecurityEventType;
  severity: SecuritySeverity;
  title: string;
  detail: string;
  preview: string;
}

function inspectObjectForThreats(val: unknown, currentKey = '', depth = 0): ThreatMatch | null {
  if (depth > 12 || val === null || val === undefined) return null;

  if (typeof val === 'string') {
    // Skip raw base64 data URI scanning so large image uploads aren't falsely flagged
    if ((currentKey === 'base64Data' || currentKey === 'image' || currentKey === 'fieldImg' || currentKey === 'customImg') && val.startsWith('data:image/')) {
      return null;
    }

    if (PATH_TRAVERSAL_RE.test(val)) {
      return {
        type: 'PATH_TRAVERSAL_BLOCKED',
        severity: 'CRITICAL',
        title: 'Path Traversal Exploit Blocked',
        detail: `Suspicious traversal sequence detected in "${currentKey || 'input'}"`,
        preview: val,
      };
    }
    if (XSS_RE.test(val)) {
      return {
        type: 'XSS_INJECTION_BLOCKED',
        severity: 'HIGH',
        title: 'Cross-Site Scripting (XSS) Payload Blocked',
        detail: `Executable script/event handler pattern detected in "${currentKey || 'input'}"`,
        preview: val,
      };
    }
    if (SQLI_NOSQL_RE.test(val)) {
      return {
        type: 'INJECTION_PROBE_BLOCKED',
        severity: 'HIGH',
        title: 'SQL / NoSQL Injection Probe Blocked',
        detail: `Injection operator pattern detected in "${currentKey || 'input'}"`,
        preview: val,
      };
    }
    return null;
  }

  if (Array.isArray(val)) {
    for (let i = 0; i < Math.min(val.length, 200); i++) {
      const match = inspectObjectForThreats(val[i], `${currentKey}[${i}]`, depth + 1);
      if (match) return match;
    }
    return null;
  }

  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      if (PROTOTYPE_POLLUTION_KEYS.has(key)) {
        return {
          type: 'PROTOTYPE_POLLUTION_BLOCKED',
          severity: 'CRITICAL',
          title: 'Prototype Pollution Exploit Blocked',
          detail: `Malicious object key "${key}" rejected at WAF perimeter`,
          preview: `{ "${key}": ... }`,
        };
      }
      if (key.startsWith('$') && SQLI_NOSQL_RE.test(key)) {
        return {
          type: 'INJECTION_PROBE_BLOCKED',
          severity: 'HIGH',
          title: 'NoSQL Operator Injection Blocked',
          detail: `Blocked query operator key "${key}"`,
          preview: `{ "${key}": ... }`,
        };
      }
      const match = inspectObjectForThreats(obj[key], key, depth + 1);
      if (match) return match;
    }
  }

  return null;
}

export async function wafPayloadMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Check raw URL / query string for traversal or XSS
  const rawUrl = req.originalUrl || req.url || '';
  let decodedUrl = rawUrl;
  try {
    decodedUrl = decodeURIComponent(rawUrl);
  } catch {
    decodedUrl = rawUrl;
  }

  if (PATH_TRAVERSAL_RE.test(rawUrl) || PATH_TRAVERSAL_RE.test(decodedUrl)) {
    await recordSecurityEvent({
      severity: 'CRITICAL',
      type: 'PATH_TRAVERSAL_BLOCKED',
      title: 'URL Path Traversal Blocked',
      detail: `Rejected directory traversal attempt on URL`,
      req,
      payloadPreview: decodedUrl,
      blocked: true,
    });
    res.status(403).json({ success: false, error: 'Malicious path rejected by HIM Security Shield.' });
    return;
  }

  if (XSS_RE.test(decodedUrl) || SQLI_NOSQL_RE.test(decodedUrl)) {
    await recordSecurityEvent({
      severity: 'HIGH',
      type: XSS_RE.test(decodedUrl) ? 'XSS_INJECTION_BLOCKED' : 'INJECTION_PROBE_BLOCKED',
      title: 'Malicious Query Parameter Blocked',
      detail: `Rejected injection pattern in URL query`,
      req,
      payloadPreview: decodedUrl,
      blocked: true,
    });
    res.status(403).json({ success: false, error: 'Suspicious query payload blocked.' });
    return;
  }

  // Inspect parsed JSON/query
  const threat =
    inspectObjectForThreats(req.query, 'query') ||
    inspectObjectForThreats(req.body, 'body');

  if (threat) {
    await recordSecurityEvent({
      severity: threat.severity,
      type: threat.type,
      title: threat.title,
      detail: threat.detail,
      req,
      payloadPreview: threat.preview,
      blocked: true,
    });
    res.status(403).json({
      success: false,
      error: 'Request blocked by HIM Intrusion Prevention Firewall.',
      threatType: threat.type,
    });
    return;
  }

  next();
}

export function createRateLimiter(options: {
  name: string;
  windowMs: number;
  maxRequests: number;
}) {
  const buckets = new Map<string, { count: number; resetAt: number }>();

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = getClientIp(req);
    const now = Date.now();
    const record = buckets.get(ip);

    if (!record || now > record.resetAt) {
      buckets.set(ip, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    record.count += 1;
    if (record.count > options.maxRequests) {
      const retryAfterSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));

      await recordSecurityEvent({
        severity: 'HIGH',
        type: 'RATE_LIMIT_EXCEEDED',
        title: `Rate Limit Exceeded (${options.name})`,
        detail: `IP ${ip} exceeded ${options.maxRequests} req/${Math.round(options.windowMs / 1000)}s limit`,
        req,
        blocked: true,
        dedupKey: `rl:${options.name}:${ip}`,
      });

      res.status(429).json({
        success: false,
        error: `Too many requests. Please retry after ${retryAfterSec}s.`,
        retryAfterSeconds: retryAfterSec,
      });
      return;
    }

    next();
  };
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const session = isRequestAdmin(req);
  if (!session) {
    await recordSecurityEvent({
      severity: 'HIGH',
      type: 'UNAUTHORIZED_API_ACCESS',
      title: 'Unauthorized Admin Endpoint Access Attempt',
      detail: `Unauthenticated request blocked on protected endpoint ${req.method} ${req.originalUrl}`,
      req,
      blocked: true,
      dedupKey: `unauth:${getClientIp(req)}:${req.method}:${req.originalUrl}`,
    });
    res.status(401).json({
      success: false,
      error: 'Admin authentication required.',
      code: 'UNAUTHORIZED',
    });
    return;
  }
  next();
}

// ---------- LOGIN & PIN MANAGEMENT ----------

export async function handleAdminLogin(req: Request, pin: string): Promise<{
  ok: boolean;
  status: number;
  message: string;
  token?: string;
  expiresAt?: number;
  remainingAttempts?: number;
  lockedUntil?: number;
  retryAfterSeconds?: number;
  unreadAlertsCount?: number;
}> {
  const ip = getClientIp(req);
  const now = Date.now();
  const attemptRec = loginAttemptsByIp.get(ip) || { failures: 0, firstFailureAt: now, lockedUntil: 0 };

  // Reset expired attempt window
  if (attemptRec.lockedUntil && now > attemptRec.lockedUntil) {
    attemptRec.failures = 0;
    attemptRec.lockedUntil = 0;
    attemptRec.firstFailureAt = now;
  } else if (!attemptRec.lockedUntil && now - attemptRec.firstFailureAt > LOCKOUT_DURATION_MS) {
    attemptRec.failures = 0;
    attemptRec.firstFailureAt = now;
  }

  // Check active lockout
  if (attemptRec.lockedUntil && now < attemptRec.lockedUntil) {
    const retryAfterSeconds = Math.ceil((attemptRec.lockedUntil - now) / 1000);
    await recordSecurityEvent({
      severity: 'CRITICAL',
      type: 'BRUTE_FORCE_LOCKOUT',
      title: 'Locked Attacker Tried Admin Login',
      detail: `Locked IP ${ip} attempted another login (${retryAfterSeconds}s remaining)`,
      req,
      blocked: true,
      dedupKey: `lockretry:${ip}`,
    });
    return {
      ok: false,
      status: 429,
      message: `Security Lockout Active. Try again in ${Math.ceil(retryAfterSeconds / 60)}m ${retryAfterSeconds % 60}s.`,
      lockedUntil: attemptRec.lockedUntil,
      retryAfterSeconds,
      remainingAttempts: 0,
    };
  }

  const cleanPin = typeof pin === 'string' ? pin.trim() : '';
  const cfg = getConfigSync();
  const isValid = /^\d{6,12}$/.test(cleanPin) && verifyPinHash(cleanPin, cfg.pinHash);

  if (!isValid) {
    attemptRec.failures += 1;
    if (attemptRec.failures === 1) attemptRec.firstFailureAt = now;

    if (attemptRec.failures >= MAX_LOGIN_ATTEMPTS) {
      attemptRec.lockedUntil = now + LOCKOUT_DURATION_MS;
      loginAttemptsByIp.set(ip, attemptRec);

      await recordSecurityEvent({
        severity: 'CRITICAL',
        type: 'BRUTE_FORCE_LOCKOUT',
        title: 'Admin Brute-Force Lockout Triggered',
        detail: `${MAX_LOGIN_ATTEMPTS} consecutive failed Admin PIN guesses from IP ${ip}. IP locked for 15 minutes.`,
        req,
        blocked: true,
      });

      return {
        ok: false,
        status: 429,
        message: 'Too many failed PIN attempts. Admin portal locked for 15 minutes.',
        lockedUntil: attemptRec.lockedUntil,
        retryAfterSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
        remainingAttempts: 0,
      };
    }

    loginAttemptsByIp.set(ip, attemptRec);
    const remaining = MAX_LOGIN_ATTEMPTS - attemptRec.failures;

    await recordSecurityEvent({
      severity: attemptRec.failures >= 3 ? 'HIGH' : 'MEDIUM',
      type: 'FAILED_ADMIN_LOGIN',
      title: 'Failed Admin PIN Attempt',
      detail: `Wrong PIN entered from IP ${ip} (Attempt ${attemptRec.failures}/${MAX_LOGIN_ATTEMPTS}, ${remaining} remaining)`,
      req,
      blocked: true,
    });

    return {
      ok: false,
      status: 401,
      message: `Invalid authorization PIN (${remaining} attempt${remaining === 1 ? '' : 's'} left before lockout)`,
      remainingAttempts: remaining,
    };
  }

  // Success!
  loginAttemptsByIp.delete(ip);
  const { token, expiresAt } = issueAdminToken();
  const unreadAlertsCount = cachedEvents.filter((e) => !e.acknowledged && e.severity !== 'LOW').length;

  await recordSecurityEvent({
    severity: 'LOW',
    type: 'ADMIN_LOGIN_SUCCESS',
    title: 'Owner Unlocked Admin HQ',
    detail: `Authenticated Admin session issued to ${ip}`,
    req,
    blocked: false,
  });

  return {
    ok: true,
    status: 200,
    message: 'Authenticated',
    token,
    expiresAt,
    unreadAlertsCount,
  };
}

export async function changeAdminPin(req: Request, currentPin: string, newPin: string): Promise<{
  ok: boolean;
  status: number;
  message: string;
}> {
  const cfg = getConfigSync();
  if (!verifyPinHash(String(currentPin || '').trim(), cfg.pinHash)) {
    await recordSecurityEvent({
      severity: 'HIGH',
      type: 'FAILED_ADMIN_LOGIN',
      title: 'PIN Rotation Rejected (Wrong Current PIN)',
      detail: `PIN change failed current-PIN verification from ${getClientIp(req)}`,
      req,
      blocked: true,
    });
    return { ok: false, status: 401, message: 'Current PIN is incorrect.' };
  }

  const trimmed = String(newPin || '').trim();
  if (!/^\d{6}$/.test(trimmed)) {
    return { ok: false, status: 400, message: 'New PIN must be exactly 6 numerical digits.' };
  }
  if (WEAK_PINS.has(trimmed)) {
    return { ok: false, status: 400, message: 'Please pick a stronger non-trivial 6-digit PIN.' };
  }

  cfg.pinHash = hashPinWithSalt(trimmed);
  cfg.updatedAt = new Date().toISOString();
  await persistConfig(cfg);

  await recordSecurityEvent({
    severity: 'MEDIUM',
    type: 'PIN_CHANGED',
    title: 'Admin Security PIN Rotated',
    detail: `Administrator updated HQ authorization PIN from ${getClientIp(req)}`,
    req,
    blocked: false,
  });

  return { ok: true, status: 200, message: 'Admin security PIN updated successfully.' };
}

// ---------- UPLOAD & ORDER VALIDATION ----------

const ALLOWED_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export function validateImageBase64Payload(input: string): {
  valid: boolean;
  buffer?: Buffer;
  ext?: string;
  reason?: string;
} {
  if (typeof input !== 'string' || input.length < 16) {
    return { valid: false, reason: 'Empty or malformed image payload' };
  }

  let base64Body = input;
  let ext = 'jpg';

  if (input.startsWith('data:')) {
    const match = input.match(/^data:([^;]+);base64,([A-Za-z0-9+/=\r\n]+)$/);
    if (!match) {
      return { valid: false, reason: 'Invalid data URI format' };
    }
    const mime = match[1].toLowerCase().trim();
    if (!ALLOWED_IMAGE_MIME.has(mime)) {
      return { valid: false, reason: `Blocked unsupported or unsafe MIME type: ${mime}` };
    }
    base64Body = match[2];
    if (mime === 'image/png') ext = 'png';
    else if (mime === 'image/webp') ext = 'webp';
    else if (mime === 'image/gif') ext = 'gif';
  }

  const buffer = Buffer.from(base64Body, 'base64');
  if (!buffer || buffer.length < 8) {
    return { valid: false, reason: 'Invalid base64 image bytes' };
  }
  if (buffer.length > MAX_IMAGE_BYTES) {
    return { valid: false, reason: `Image exceeds 5MB limit (${Math.round(buffer.length / 1024)}KB)` };
  }

  // Verify binary magic bytes for real image headers (blocks script/HTML disguised as jpg)
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
  const isWebp =
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP';

  if (!isJpeg && !isPng && !isGif && !isWebp) {
    return { valid: false, reason: 'File signature failed real image magic-byte inspection' };
  }

  return { valid: true, buffer, ext };
}

export async function sanitizeAndVerifyOrder(
  rawOrder: any,
  productsDb: any[],
  req: Request
): Promise<{ ok: boolean; status: number; error?: string; order?: any }> {
  if (!rawOrder || typeof rawOrder !== 'object') {
    return { ok: false, status: 400, error: 'Malformed order body' };
  }
  const orderId = stripHtmlTags(String(rawOrder.orderId || ''), 40);
  if (!orderId || !/^#?[A-Z0-9-]{4,32}$/i.test(orderId)) {
    return { ok: false, status: 400, error: 'Invalid orderId format' };
  }
  if (!Array.isArray(rawOrder.items) || rawOrder.items.length === 0 || rawOrder.items.length > 50) {
    return { ok: false, status: 400, error: 'Order must contain between 1 and 50 items' };
  }

  let canonicalSubtotal = 0;
  const sanitizedItems: any[] = [];

  for (const item of rawOrder.items) {
    const prodId = stripHtmlTags(String(item?.product?.id || item?.productId || ''), 64);
    const qty = Number(item?.quantity);
    if (!prodId || !Number.isInteger(qty) || qty < 1 || qty > 50) {
      return { ok: false, status: 400, error: 'Invalid item quantity or product id' };
    }

    const dbProd = productsDb.find((p) => p.id === prodId);
    const unitPrice = dbProd ? Number(dbProd.price) : Number(item?.product?.price);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      return { ok: false, status: 400, error: `Invalid pricing for product ${prodId}` };
    }
    if (dbProd && typeof dbProd.stockUnits === 'number' && dbProd.stockUnits < qty) {
      return { ok: false, status: 400, error: `Insufficient stock for ${dbProd.name}` };
    }

    canonicalSubtotal += unitPrice * qty;
    sanitizedItems.push({
      ...item,
      quantity: qty,
      selectedShade: item?.selectedShade ? stripHtmlTags(String(item.selectedShade), 64) : undefined,
      product: dbProd
        ? { ...dbProd }
        : {
            ...item.product,
            id: prodId,
            name: stripHtmlTags(String(item?.product?.name || 'HIM Spec'), 120),
            price: unitPrice,
          },
    });
  }

  const submittedSubtotal = Number(rawOrder.subtotal);
  const submittedTotal = Number(rawOrder.total);

  // Detect extreme client-side price tampering (e.g. forged total <= 0 or < 50% of canonical without valid promo)
  if (
    !Number.isFinite(submittedTotal) ||
    submittedTotal < 0 ||
    (canonicalSubtotal > 0 && Number.isFinite(submittedSubtotal) && submittedSubtotal < canonicalSubtotal * 0.85)
  ) {
    await recordSecurityEvent({
      severity: 'CRITICAL',
      type: 'PRICE_TAMPER_BLOCKED',
      title: 'Checkout Price Tampering Attempt Blocked',
      detail: `Submitted subtotal ${submittedSubtotal} vs canonical ${canonicalSubtotal} on order ${orderId}`,
      req,
      payloadPreview: `orderId=${orderId} submitted=${submittedTotal} canonical=${canonicalSubtotal}`,
      blocked: true,
    });
    return { ok: false, status: 403, error: 'Order pricing integrity verification failed.' };
  }

  const c = rawOrder.customer || {};
  const sanitizedCustomer = {
    fullName: stripHtmlTags(String(c.fullName || ''), 100) || 'Customer',
    email: stripHtmlTags(String(c.email || ''), 120),
    phone: stripHtmlTags(String(c.phone || ''), 32),
    address: stripHtmlTags(String(c.address || ''), 240),
    city: stripHtmlTags(String(c.city || ''), 80),
    state: stripHtmlTags(String(c.state || ''), 80),
    postalCode: stripHtmlTags(String(c.postalCode || ''), 24),
    country: stripHtmlTags(String(c.country || 'India'), 80),
  };

  const safeDiscount = Math.max(0, Math.min(canonicalSubtotal, Number(rawOrder.discount) || 0));
  const safeShipping = Math.max(0, Number(rawOrder.shippingFee) || 0);
  const verifiedTotal = Math.max(0, canonicalSubtotal - safeDiscount + safeShipping);

  return {
    ok: true,
    status: 200,
    order: {
      ...rawOrder,
      orderId,
      createdAt: rawOrder.createdAt || new Date().toISOString(),
      items: sanitizedItems,
      subtotal: canonicalSubtotal,
      discount: safeDiscount,
      shippingFee: safeShipping,
      total: Number.isFinite(submittedTotal) && submittedTotal >= verifiedTotal * 0.9 ? submittedTotal : verifiedTotal,
      currency: stripHtmlTags(String(rawOrder.currency || 'INR'), 10),
      status: 'deployed',
      trackingNumber: stripHtmlTags(String(rawOrder.trackingNumber || `HIM-${Date.now().toString().slice(-6)}`), 48),
      estimatedDelivery: stripHtmlTags(String(rawOrder.estimatedDelivery || '2-4 Business Days'), 80),
      deliveryMethod: stripHtmlTags(String(rawOrder.deliveryMethod || 'Express Courier'), 80),
      paymentMethod: stripHtmlTags(String(rawOrder.paymentMethod || 'Authenticated Checkout'), 80),
      customer: sanitizedCustomer,
      events: Array.isArray(rawOrder.events) ? rawOrder.events.slice(0, 12) : [],
    },
  };
}

// ---------- ADMIN SECURITY CONSOLE QUERIES ----------

export function getSecuritySummaryAndEvents() {
  const cfg = getConfigSync();
  const blockedCount = cachedEvents.filter((e) => e.blocked).length;
  const unreadAlertsCount = cachedEvents.filter((e) => !e.acknowledged && e.severity !== 'LOW').length;
  const criticalCount = cachedEvents.filter((e) => e.severity === 'CRITICAL').length;
  const highCount = cachedEvents.filter((e) => e.severity === 'HIGH').length;
  const activeLockouts = Array.from(loginAttemptsByIp.entries())
    .filter(([, rec]) => rec.lockedUntil > Date.now())
    .map(([ip, rec]) => ({ ip, lockedUntil: rec.lockedUntil }));

  return {
    events: cachedEvents,
    stats: {
      totalEvents: cachedEvents.length,
      blockedAttacks: blockedCount,
      unreadAlertsCount,
      criticalCount,
      highCount,
      activeLockoutsCount: activeLockouts.length,
      blockedIpsCount: cfg.blockedIps.length,
    },
    settings: {
      webhookUrl: cfg.webhookUrl,
      alertEmail: cfg.alertEmail,
      autoBlockCritical: cfg.autoBlockCritical,
      blockedIps: cfg.blockedIps,
      updatedAt: cfg.updatedAt,
    },
    activeLockouts,
  };
}

export async function acknowledgeAllSecurityEvents(): Promise<number> {
  let count = 0;
  cachedEvents = cachedEvents.map((ev) => {
    if (!ev.acknowledged) count += 1;
    return { ...ev, acknowledged: true };
  });
  await persistEvents();
  return count;
}

export async function updateSecuritySettings(updates: {
  webhookUrl?: string;
  alertEmail?: string;
  autoBlockCritical?: boolean;
  unblockIp?: string;
  blockIp?: string;
}) {
  const cfg = getConfigSync();

  if (typeof updates.webhookUrl === 'string') {
    const trimmed = updates.webhookUrl.trim();
    if (trimmed === '' || /^https?:\/\/.+/i.test(trimmed)) {
      cfg.webhookUrl = trimmed;
    }
  }
  if (typeof updates.alertEmail === 'string') {
    cfg.alertEmail = stripHtmlTags(updates.alertEmail, 120);
  }
  if (typeof updates.autoBlockCritical === 'boolean') {
    cfg.autoBlockCritical = updates.autoBlockCritical;
  }
  if (typeof updates.unblockIp === 'string' && updates.unblockIp.trim()) {
    cfg.blockedIps = cfg.blockedIps.filter((ip) => ip !== updates.unblockIp!.trim());
  }
  if (typeof updates.blockIp === 'string' && updates.blockIp.trim()) {
    const cleanIp = updates.blockIp.trim().replace(/[^a-fA-F0-9.:_-]/g, '');
    if (cleanIp && !cfg.blockedIps.includes(cleanIp)) {
      cfg.blockedIps.push(cleanIp);
    }
  }

  cfg.updatedAt = new Date().toISOString();
  await persistConfig(cfg);
  return {
    webhookUrl: cfg.webhookUrl,
    alertEmail: cfg.alertEmail,
    autoBlockCritical: cfg.autoBlockCritical,
    blockedIps: cfg.blockedIps,
    updatedAt: cfg.updatedAt,
  };
}

export async function sendTestSecurityAlert(req: Request): Promise<{ event: SecurityEvent; webhookDelivered: boolean }> {
  const event = await recordSecurityEvent({
    severity: 'HIGH',
    type: 'SECURITY_ALERT_TEST',
    title: 'Security Alert Channel Verification',
    detail: 'Owner triggered a live intrusion alert test from HIM HQ Security Center.',
    req,
    blocked: false,
  });
  const webhookDelivered = await dispatchWebhookAlert(event);
  return { event, webhookDelivered };
}
