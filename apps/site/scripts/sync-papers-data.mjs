// apps/site/scripts/sync-papers-data.mjs
import fs from 'fs/promises';
import path from 'path';

// Node18+ 自带 fetch；兜底 node-fetch（本地老 Node 时）
if (typeof fetch === 'undefined') {
  const { default: nf } = await import('node-fetch');
  globalThis.fetch = nf;
}

// 解析 API Base：命令行优先，其次环境变量
const argApi = (process.argv.find(a => a.startsWith('--api=')) || '').slice(6);
const apiBase = (argApi || process.env.TCB_API_BASE || process.env.WEDATA_API_URL || '').replace(/\/+$/, '');

const OUT_DIR = path.resolve('apps/site/src/data');
await fs.mkdir(OUT_DIR, { recursive: true });

async function pull(rel) {
  const url = apiBase + rel;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

async function writeJSON(name, data) {
  const fp = path.join(OUT_DIR, name);
  await fs.writeFile(fp, JSON.stringify(data, null, 2), 'utf-8');
  console.log('✓', name, '->', fp);
}

if (!apiBase) {
  console.warn('[sync-papers-data] 未配置 API Base（--api / TCB_API_BASE / WEDATA_API_URL 任一）。跳过远端拉取。');
  console.warn('页面将于运行期通过 <meta name="tcb-api-base"> 或 location.origin 直连云函数。');
  process.exit(0);
}

try {
  const [taxonomy, minis, statkw, plan] = await Promise.all([
    pull('/papers/export/taxonomy'),
    pull('/papers/export/minisearch'),
    pull('/papers/export/static-keywords'),
    // build-queue 可能未开放/不需要，出错忽略
    pull('/papers/export/build-queue').catch(() => ({}))
  ]);
  await writeJSON('paper_taxonomy.json', taxonomy);
  await writeJSON('papers_minisearch.json', minis);
  await writeJSON('papers_static_keywords.json', statkw);
  await writeJSON('papers_build_plan.json', plan);
  console.log('[sync-papers-data] 完成。');
} catch (err) {
  console.error('[sync-papers-data] 拉取失败：', err?.message || err);
  console.warn('将使用现有的本地 JSON（若存在）；运行期前端同样可直连云函数。');
  process.exit(0);
}
