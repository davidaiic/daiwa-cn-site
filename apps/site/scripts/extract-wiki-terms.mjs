import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';

const root = process.cwd();
const pub = path.join(root, 'public');
await fs.mkdir(pub, { recursive: true });

const CANON = process.env.PUBLIC_CANONICAL_HOST?.replace(/\/+$/, '')
    || 'https://shiyaoprice-4gl8n61ibf516ead-1334775748.tcloudbaseapp.com';

const base = `${CANON}/daiwa-cn-site`;

const wikiUrls = [];
const files = await fg('content/wiki/**/index.md', { cwd: root, dot: false });

for (const rel of files) {
    const abs = path.join(root, rel);
    const raw = await fs.readFile(abs, 'utf-8');
    const { data } = matter(raw);
    const slug = data.slug || path.basename(path.dirname(abs));
    wikiUrls.push(`${base}/zh/wiki/${slug}/`);
}

const wikiXml = urlset(wikiUrls);
await fs.writeFile(path.join(pub, 'sitemap-wiki.xml'), wikiXml, 'utf-8');

const indexXml = sitemapIndex([
    `${base}/sitemap-wiki.xml`
]);
await fs.writeFile(path.join(pub, 'sitemap-index.xml'), indexXml, 'utf-8');

console.log(`[gen-sitemaps] wiki: ${wikiUrls.length} -> public/sitemap-wiki.xml & sitemap-index.xml`);

function urlset(urls) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;
}

function sitemapIndex(sitemaps) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(u => `  <sitemap><loc>${u}</loc></sitemap>`).join('\n')}
</sitemapindex>`;
}
