function resolveOrigin(req: any): string {
  const configured = process.env.SITE_URL || process.env.PUBLIC_SITE_URL;
  if (configured && /^https?:\/\//i.test(configured.trim())) {
    return configured.trim().replace(/\/+$/, '');
  }
  const proto = String(req.headers?.['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = String(req.headers?.['x-forwarded-host'] || req.headers?.host || 'heisman.in').split(',')[0].trim();
  return `${proto}://${host}`;
}

export default function handler(req: any, res: any) {
  const origin = resolveOrigin(req);
  const body = `# robots.txt for HIM — He Is Man (HIM Men's Grooming & Skincare Brand)
User-agent: Googlebot
Allow: /
Disallow: /api/

User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${origin}/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  return res.status(200).send(body);
}
