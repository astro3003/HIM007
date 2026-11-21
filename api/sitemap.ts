const PRODUCT_ENTRIES = [
  {
    id: 'prod-him-scrub-bar',
    title: "HIM Men's Deep Cleanse & Muscle Recovery Scrub Bar",
    image: '/assets/aistudio/WhatsApp_Image_2026-10-15_at_00.41.45.jpeg_20261015004503_40964ee5.jpg',
    priority: '0.95',
  },
  {
    id: 'prod-him-ayurvedic-detan-soap',
    title: 'HIM Ayurvedic De-Tan Soap',
    image: '/assets/aistudio/WhatsApp_Image_2026-10-15_at_00.41.44_2K_20261015005021_b1ec74ec.jpg',
    priority: '0.95',
  },
  {
    id: 'prod-him-anti-acne-soap',
    title: "HIM Men's Anti-Acne & Deep Pore Clarifying Soap",
    image: '/assets/aistudio/WhatsApp_Image_2026-10-15_at_00.41.44.jpeg_2K_20261015004821_f235a5af.jpg',
    priority: '0.95',
  },
  {
    id: 'prod-him-face-wash',
    title: 'HIM Face Wash',
    image: '/assets/aistudio/WhatsApp_Image_2026-10-15_at_01.11.49_2K_20261015011433_e13a9705.jpg',
    priority: '0.85',
  },
  {
    id: 'prod-him-hair-clay',
    title: 'HIM Hair Clay',
    image: '/assets/aistudio/Jar_with_black_and_orange_2K_20261015013158_cb141fa3.jpg',
    priority: '0.85',
  },
  {
    id: 'prod-him-beard-serum',
    title: 'HIM Beard Serum',
    image: '/assets/aistudio/Dropper_bottle_and_box_for_2K_20261015013209_934b1448.jpg',
    priority: '0.85',
  },
  {
    id: 'prod-him-hair-oil',
    title: 'HIM Hair Oil',
    image: '/assets/aistudio/Bottle_with_black_and_orange_4ac4c39e_75c87168.jpg',
    priority: '0.85',
  },
  {
    id: 'prod-him-face-brightening-serum',
    title: "HIM Men's Face Brightening Serum",
    image: '/assets/aistudio/Serum_bottle_and_box_packaging_fa6ed9b8_82a165c1.jpg',
    priority: '0.85',
  },
  {
    id: 'prod-him-eau-de-parfum',
    title: 'HIM Eau De Parfum',
    image: '/assets/aistudio/Perfume_bottle_and_black_orange_2K_20261015013224_627e8d62.jpg',
    priority: '0.85',
  },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

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
  const lastmod = new Date().toISOString().split('T')[0];

  const productUrls = PRODUCT_ENTRIES.map(
    (p) => `  <url>
    <loc>${escapeXml(`${origin}/product/${p.id}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p.priority}</priority>
    <image:image>
      <image:loc>${escapeXml(`${origin}${p.image}`)}</image:loc>
      <image:title>${escapeXml(p.title)}</image:title>
    </image:image>
  </url>`
  ).join('\n');

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
      <image:caption>HIM (He Is Man / HIM Mard) 9-piece men&apos;s skincare, soap, hair, beard and fragrance range formulated in India</image:caption>
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
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  return res.status(200).send(xml);
}
