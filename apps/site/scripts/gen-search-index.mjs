import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';

const root = process.cwd(); // apps/site
const outDir = path.join(root, 'public', 'search');
await fs.mkdir(outDir, { recursive: true });

const records = [];

// 仅收录 wiki（可按需增加 columns/news）
await addFrom('content/wiki', (meta, fileAbs) => ({
    id: `wiki:${meta.slug}`,
    url: `/zh/wiki/${meta.slug}/`,
    title: meta.title || '',
    summary: meta.summary || '',
    tags: meta.tags || []
}));

await fs.writeFile(path.join(outDir, 'index.json'), JSON.stringify({ v: 1, docs: records }, null, 2), 'utf-8');
console.log(`[gen-search-index] ${records.length} docs -> public/search/index.json`);

async function addFrom(dir, mapper) {
    const base = path.join(root, dir);
    const files = await fg('**/index.md', { cwd: base, dot: false });
    for (const rel of files) {
        const abs = path.join(base, rel);
        const raw = await fs.readFile(abs, 'utf-8');
        const { data } = matter(raw);
        const doc = mapper({ ...data, slug: data.slug || path.basename(path.dirname(abs)) }, abs);
        records.push(doc);
    }
}
