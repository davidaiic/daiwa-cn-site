// scripts/gen-search-index.mjs
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');              // apps/site
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'wiki');
const OUT_DIR = path.join(ROOT, 'public', 'search');
const OUT_FILE = path.join(OUT_DIR, 'index.json');

const SITE = process.env.PUBLIC_SITE_BASE || 'http://localhost:4321';

// 轻量 frontmatter 解析（兼容 title/description/keywords）
function parseFrontmatter(md) {
    const m = md.match(/^---\s*[\r\n]+([\s\S]*?)\r?\n---\s*[\r\n]+/);
    const fm = {};
    if (m) {
        const body = m[1];
        body.split(/\r?\n/).forEach(line => {
            const mm = line.match(/^(\w+):\s*(.*)$/);
            if (mm) {
                const k = mm[1].trim();
                let v = mm[2].trim();
                if (v.startsWith('[') && v.endsWith(']')) {
                    v = v.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
                } else {
                    v = v.replace(/^['"]|['"]$/g, '');
                }
                fm[k] = v;
            }
        });
    }
    return fm;
}

// 读取所有 md 文件
async function collectWikiDocs() {
    const files = await fs.readdir(CONTENT_DIR);
    const docs = [];
    for (const f of files) {
        if (!f.endsWith('.md')) continue;
        const slug = f.replace(/\.md$/, '');
        const p = path.join(CONTENT_DIR, f);
        const raw = await fs.readFile(p, 'utf8');
        const fm = parseFrontmatter(raw);

        const doc = {
            id: `wiki:${slug}`,
            url: new URL(`/wiki/${encodeURIComponent(slug)}/`, SITE).toString().replace(/\/+$/, '/'),
            title: fm.title || slug,
            summary: fm.description || '',
            tags: Array.isArray(fm.keywords) ? fm.keywords : []
        };
        docs.push(doc);
    }
    return docs;
}

async function main() {
    await fs.mkdir(OUT_DIR, { recursive: true });
    const wikiDocs = await collectWikiDocs();
    const data = { v: 1, docs: wikiDocs };
    await fs.writeFile(OUT_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log(`[gen-search-index] ${wikiDocs.length} docs -> public/search/index.json`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
