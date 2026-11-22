function resolveOrigin(): string {
  const configured = process.env.SITE_URL || process.env.PUBLIC_SITE_URL;
  if (configured && /^https?:\/\//i.test(configured.trim())) {
    return configured.trim().replace(/\/+$/, '');
  }
  return 'https://www.heismard.com';
}

export default function handler(_req: any, res: any) {
  const origin = resolveOrigin();
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
