import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
let envUrl = process.env.VITE_SUPABASE_URL;
let envKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if ((!envUrl || !envKey) && existsSync('.env')) {
  const raw = readFileSync('.env','utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*VITE_SUPABASE_URL\s*=\s*(.+)\s*$/);
    if (m && !envUrl) envUrl = m[1].trim();
    const m2 = line.match(/^\s*VITE_SUPABASE_ANON_KEY\s*=\s*(.+)\s*$/);
    if (m2 && !envKey) envKey = m2[1].trim();
  }
}
const url = envUrl;
const key = envKey;
let products = [];
if (!url || !key) {
  console.warn('Missing VITE_SUPABASE_URL / KEY — generating empty merchant feed');
} else {
  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from('products').select('id,title,description,price,discount_price,images,category,is_active').eq('is_active', true).limit(200);
    if (error) console.warn('Feed fetch error:', error.message);
    else if (data) products = data;
  } catch (e) { console.warn('Feed exception:', e.message); }
}
if (!products) products = [];
const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const items = products.map((p) => {
  const link = `https://showy.jubair.bond/product/${p.id}`;
  const price = `${(p.discount_price ?? p.price).toFixed(2)} BDT`;
  const image = p.images?.[0] || 'https://showy.jubair.bond/icon-512.png';
  return `  <item>\n    <g:id>${p.id}</g:id>\n    <g:title>${esc(p.title)}</g:title>\n    <g:description>${esc(p.description.slice(0,500))}</g:description>\n    <g:link>${link}</g:link>\n    <g:image_link>${esc(image)}</g:image_link>\n    <g:condition>new</g:condition>\n    <g:availability>in stock</g:availability>\n    <g:price>${price}</g:price>\n    <g:brand>Showy</g:brand>\n    <g:google_product_category>${esc(p.category)}</g:google_product_category>\n  </item>`;
}).join('\n');
const xml = `<?xml version="1.0"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n<channel>\n  <title>Showy Store — Merchant Feed</title>\n  <link>https://showy.jubair.bond/</link>\n  <description>Products from Showy multi-vendor marketplace</description>\n${items}\n</channel>\n</rss>`;
mkdirSync('dist', { recursive: true });
writeFileSync('dist/merchant-feed.xml', xml);
writeFileSync('public/merchant-feed.xml', xml);
console.log(`Merchant feed: ${products.length} products → dist/merchant-feed.xml + public/merchant-feed.xml`);
