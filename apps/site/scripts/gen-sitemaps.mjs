import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import matter from 'gray-matter';
import YAML from 'yaml';

const root = process.cwd();
const base = path.join(root, 'apps/site');
const publicDir = path.join(base, 'public', 'daiwa-cn-site');
await fs.promises.mkdir(publicDir, { recursive:true });

const host = process.env.PUBLIC_CANONICAL_HOST || 'https://shiyaoprice-4gl8n61ibf516ead-1334775748.tcloudbaseapp.com';
const prefix = `${host}/daiwa-cn-site`;

const sitemapsDir = path.join(publicDir, 'sitemaps');
await fs.promises.mkdir(sitemapsDir, { recursive:true });

const maps = new Map();
function add(type, loc, lastmod){
  if(!maps.has(type)) maps.set(type, []);
  maps.get(type).push({ loc, lastmod });
}
function writeMap(type){
  const items = maps.get(type)||[];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.map(it => `  <url><loc>${xmlEsc(it.loc)}</loc>${it.lastmod?`<lastmod>${it.lastmod}</lastmod>`:''}</url>`).join('\n')}
</urlset>`;
  const out = path.join(sitemapsDir, `${type}.xml`);
  fs.writeFileSync(out, xml, 'utf-8');
  return `${prefix}/sitemaps/${type}.xml`
}

// wiki/columns/news
const content = path.join(base, 'content');
for(const kind of ['wiki','columns','news']){
  const dir = path.join(content, kind);
  if(!fs.existsSync(dir)) continue;
  const files = await fg(['**/*.md','**/*.mdx'], { cwd: dir });
  for(const rel of files){
    const full = path.join(dir, rel);
    const raw = fs.readFileSync(full, 'utf-8');
    const fm = matter(raw);
    const data = fm.data||{};
    const slug = data.slug || rel.replace(/index\.(md|mdx)$/,'').replace(/\.(md|mdx)$/,'');
    const url = `${prefix}/zh/${kind}/${slug}/`;
    add(kind, url, (data.lastmod||'').toString().slice(0,10));
  }
}

// papers.json (preferred) / papers.yaml (fallback)
const papersJson = path.join(base, 'src', 'data', 'papers.json');
if(fs.existsSync(papersJson)){
  const jsonRaw = fs.readFileSync(papersJson, 'utf-8') || '[]';
  let parsed;
  try { parsed = JSON.parse(jsonRaw); } catch { parsed = []; }
  const list = Array.isArray(parsed.data) ? parsed.data : (Array.isArray(parsed) ? parsed : []);

  for(const p of list){
    if(!p || !p.slug) continue;
    const slug = String(p.slug);
    const url = `${prefix}/papers/${encodeURIComponent(slug)}/`;
    const lastmod = p.year ? `${p.year}-01-01` : '';
    add('papers', url, lastmod);
  }
} else {
  const papersYaml = path.join(base, 'data', 'papers.yaml');
  if(fs.existsSync(papersYaml)){
    const y = YAML.parse(fs.readFileSync(papersYaml,'utf-8')) || [];
    for(const p of y){
      const slug = (p.id || p.title || '').toString().toLowerCase().replace(/[^a-z0-9\-]+/g,'-');
      const url = `${prefix}/papers/${encodeURIComponent(slug)}/`;
      add('papers', url, p.year ? `${p.year}-01-01` : '');
    }
  }
}

// write per-type & index
const entries = [];
for(const t of ['papers','wiki','columns','news']){
  if(maps.has(t)){
    const loc = writeMap(t);
    entries.push({ loc });
  }
}
const idx = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e=>`  <sitemap><loc>${xmlEsc(e.loc)}</loc></sitemap>`).join('\n')}
</sitemapindex>`;
fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), idx, 'utf-8');

function xmlEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
