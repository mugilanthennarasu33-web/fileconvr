import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base production canonical URL (guaranteed canonical domain)
let rawBaseUrl = process.env.VITE_SITE_URL || 'https://www.fileconvrt.site';
if (
  !rawBaseUrl ||
  rawBaseUrl.includes('localhost') ||
  rawBaseUrl.includes('127.0.0.1') ||
  rawBaseUrl.includes('fileconvr.com') ||
  rawBaseUrl.includes('preview')
) {
  rawBaseUrl = 'https://www.fileconvrt.site';
}
const baseUrl = rawBaseUrl.replace(/\/+$/, '');

// Format ISO date YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];

const routes = [
  // Homepage
  { path: '', changefreq: 'daily', priority: '1.0' },

  // Core High-Volume Tools
  { path: 'merge-pdf', changefreq: 'weekly', priority: '0.9' },
  { path: 'split-pdf', changefreq: 'weekly', priority: '0.9' },
  { path: 'compress-pdf', changefreq: 'weekly', priority: '0.9' },
  { path: 'pdf-to-word', changefreq: 'weekly', priority: '0.9' },
  { path: 'word-to-pdf', changefreq: 'weekly', priority: '0.9' },

  // Document Utilities & Conversions
  { path: 'pdf-to-img', changefreq: 'weekly', priority: '0.8' },
  { path: 'img-to-pdf', changefreq: 'weekly', priority: '0.8' },
  { path: 'rotate-pdf', changefreq: 'weekly', priority: '0.8' },
  { path: 'organize-pdf', changefreq: 'weekly', priority: '0.8' },
  { path: 'page-numbers-pdf', changefreq: 'weekly', priority: '0.8' },
  { path: 'watermark-pdf', changefreq: 'weekly', priority: '0.8' },
  { path: 'protect-pdf', changefreq: 'weekly', priority: '0.8' },
  { path: 'unlock-pdf', changefreq: 'weekly', priority: '0.8' },
  { path: 'ocr-pdf', changefreq: 'weekly', priority: '0.8' },
  { path: 'repair-pdf', changefreq: 'weekly', priority: '0.8' },
  { path: 'compare-pdf', changefreq: 'weekly', priority: '0.8' },
  { path: 'summarize-pdf', changefreq: 'weekly', priority: '0.8' },

  // Office Format Converters
  { path: 'excel-to-pdf', changefreq: 'weekly', priority: '0.7' },
  { path: 'ppt-to-pdf', changefreq: 'weekly', priority: '0.7' },
];

function generateSitemapXml() {
  const urls = routes.map((r) => {
    const loc = r.path ? `${baseUrl}/${r.path}` : `${baseUrl}/`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
const xml = generateSitemapXml();
fs.writeFileSync(outputPath, xml, 'utf8');

console.log(`[Sitemap Generator] Successfully generated ${routes.length} canonical URLs into:`);
console.log(` -> ${outputPath}`);
console.log(` -> Canonical Domain Base: ${baseUrl}`);
routes.forEach((r) => {
  console.log(`    - ${r.path ? `${baseUrl}/${r.path}` : `${baseUrl}/`}`);
});
