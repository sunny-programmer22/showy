import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const SITE = 'https://showy.jubair.bond';

const html = readFileSync(join(DIST, 'index.html'), 'utf8');

const SITEMAP_PAGES = [
  { seg: 'products', changefreq: 'daily', priority: '0.9' },
  { seg: 'shops', changefreq: 'weekly', priority: '0.8' },
  { seg: 'about', changefreq: 'monthly', priority: '0.5' },
  { seg: 'contact', changefreq: 'monthly', priority: '0.5' },
  { seg: 'faq', changefreq: 'monthly', priority: '0.6' },
  { seg: 'privacy', changefreq: 'yearly', priority: '0.3' },
  { seg: 'terms', changefreq: 'yearly', priority: '0.3' }
];

const DEEP_LINK_ONLY = [
  'orders', 'checkout', 'create-shop',
  'upload-product', 'vendor-dashboard', 'admin-panel'
];

for (const seg of [...SITEMAP_PAGES.map((p) => p.seg), ...DEEP_LINK_ONLY]) {
  mkdirSync(join(DIST, seg), { recursive: true });
  writeFileSync(join(DIST, seg, 'index.html'), html);
}

const urls = [
  { loc: `${SITE}/`, changefreq: 'daily', priority: '1.0' },
  ...SITEMAP_PAGES.map((p) => ({ loc: `${SITE}/${p.seg}/`, changefreq: p.changefreq, priority: p.priority }))
];

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };
    const [productsRes, shopsRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/products?select=id&is_active=eq.true&order=created_at.desc&limit=5000`, { headers }),
      fetch(`${supabaseUrl}/rest/v1/shops?select=id&is_active=eq.true&limit=2000`, { headers })
    ]);
    if (productsRes.ok) {
      const products = await productsRes.json();
      for (const p of products) {
        mkdirSync(join(DIST, 'product', String(p.id)), { recursive: true });
        writeFileSync(join(DIST, 'product', String(p.id), 'index.html'), html);
        urls.push({ loc: `${SITE}/product/${p.id}/`, changefreq: 'weekly', priority: '0.7' });
      }
      console.log(`generated ${products.length} product pages`);
    } else {
      console.warn('products fetch failed:', productsRes.status);
    }
    if (shopsRes.ok) {
      const shops = await shopsRes.json();
      for (const s of shops) {
        mkdirSync(join(DIST, 'shop', String(s.id)), { recursive: true });
        writeFileSync(join(DIST, 'shop', String(s.id), 'index.html'), html);
        urls.push({ loc: `${SITE}/shop/${s.id}/`, changefreq: 'weekly', priority: '0.6' });
      }
      console.log(`generated ${shops.length} shop pages`);
    } else {
      console.warn('shops fetch failed:', shopsRes.status);
    }
  } catch (e) {
    console.warn('dynamic page generation skipped:', e.message);
  }
} else {
  console.warn('Supabase env not set — static pages only');
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`)
  .join('\n')}
</urlset>
`;
writeFileSync(join(DIST, 'sitemap.xml'), xml);
console.log(`sitemap.xml written with ${urls.length} URLs`);
