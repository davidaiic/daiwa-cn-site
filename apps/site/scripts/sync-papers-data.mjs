/**
 * apps/site/scripts/sync-papers-data.mjs
 *
 * 目标：
 * - 预构建阶段把云端数据同步到本地 src/data，作为“单一来源（SSoT）”参与 Astro 静态构建
 * - 支持：过滤空记录 + patch 合并 + deleted 写入 + static关键词单一来源 + taxonomy 同步
 *
 * 输出文件（写入 apps/site/src/data/）：
 * - papers_minisearch.json
 * - papers_deleted.json
 * - papers_static_keywords.json
 * - paper_taxonomy.json
 * - paper_build_meta.json
 */

import dotenv from 'dotenv';
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';


// 注意顺序：先 .env 再 .env.local（让 local 覆盖）
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

console.log('[sync-papers-data] running:', import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_DIR = path.resolve(__dirname, '..'); // apps/site
const DATA_DIR = path.join(SITE_DIR, 'src', 'data');

const FILE_PAPERS_LOCAL = path.join(DATA_DIR, 'papers.json');
const FILE_MINI = path.join(DATA_DIR, 'papers_minisearch.json');
const FILE_DELETED = path.join(DATA_DIR, 'papers_deleted.json');
const FILE_STATIC_KW = path.join(DATA_DIR, 'papers_static_keywords.json');
const FILE_TAXONOMY = path.join(DATA_DIR, 'paper_taxonomy.json');
const FILE_META = path.join(DATA_DIR, 'paper_build_meta.json');

const log = (...args) => console.log('[sync-papers-data]', ...args);

function stripTrailingSlash(s) {
  return String(s || '').replace(/\/+$/, '');
}

function pickApiBase() {
  const candidates = [
    process.env.PUBLIC_TCB_API_BASE,
    process.env.DAIWASITE_PAPERS_API_BASE,
    process.env.PAPERS_API_BASE,
    process.env.TCB_PAPERS_API_BASE,
  ].filter(Boolean);

  if (!candidates.length) return '';
  return stripTrailingSlash(candidates[0]);
}

const API_BASE = pickApiBase();

const TIMEOUT_MS = Number(process.env.PAPERS_SYNC_TIMEOUT_MS || 20000);
const MODE = (process.env.PAPERS_SYNC_MODE || 'full').toLowerCase(); // full | incremental

function toArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean);
  return [v].filter(Boolean);
}

function normalizeTextKey(x) {
  return String(x || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[’'"]/g, '');
}

function coerceMiniDoc(doc) {
  const slug =
    doc.slug ||
    doc._id ||
    doc.id ||
    doc.title_zh ||
    doc.title ||
    doc.title_en ||
    '';

  const title_zh = doc.title_zh || doc.title || doc.title_cn || '';
  const title_en = doc.title_en || doc.titleEn || '';

  const keywords_cn = toArray(doc.keywords_cn || doc.keywordsCn || doc.keywords || []);
  const keywords = toArray(doc.keywords || doc.keywords_cn || doc.keywords_cn || []);

  const authors = toArray(doc.authors || []);
  const year =
    typeof doc.year === 'number' ? doc.year : (doc.year ? Number(doc.year) : undefined);

  const journal = doc.journal || doc.journal_zh || '';
  const journal_zh = doc.journal_zh || '';

  const doi = doc.doi || '';

  const abstract_zh = doc.abstract_zh || doc.abstract || '';
  const abstract_en = doc.abstract_en || '';

  const title = title_zh || title_en || slug;
  const abstract = abstract_zh || abstract_en || '';

  const id = doc.id || doi || slug;

  const include_in_minisearch =
    doc.include_in_minisearch === undefined ? true : Boolean(doc.include_in_minisearch);

  return {
    id,
    slug,
    title,
    title_zh,
    title_en,
    abstract,
    abstract_zh,
    abstract_en,
    journal,
    journal_zh,
    year,
    doi,
    authors,
    keywords,
    keywords_cn,
    article_type: doc.article_type || doc.articleType || '',
    study_design: doc.study_design || doc.studyDesign || '',
    include_in_minisearch,
  };
}

function applyPatchToMiniDoc(base, patch) {
  if (!patch || typeof patch !== 'object') return base;

  const p = { ...patch };
  if (p.title_zh === undefined && p.titleZh !== undefined) p.title_zh = p.titleZh;
  if (p.title_en === undefined && p.titleEn !== undefined) p.title_en = p.titleEn;
  if (p.keywords_cn === undefined && p.keywordsCn !== undefined) p.keywords_cn = p.keywordsCn;
  if (p.article_type === undefined && p.articleType !== undefined) p.article_type = p.articleType;
  if (p.study_design === undefined && p.studyDesign !== undefined) p.study_design = p.studyDesign;
  if (p.journal_zh === undefined && p.journalZh !== undefined) p.journal_zh = p.journalZh;

  const merged = { ...base };

  const setIf = (k, v) => {
    if (v === undefined || v === null) return;
    if (typeof v === 'string' && v.trim() === '') return;
    if (Array.isArray(v) && v.length === 0) return;
    merged[k] = v;
  };

  setIf('title_zh', p.title_zh);
  setIf('title_en', p.title_en);
  setIf('journal', p.journal);
  setIf('journal_zh', p.journal_zh);
  setIf('year', typeof p.year === 'number' ? p.year : (p.year ? Number(p.year) : undefined));
  setIf('doi', p.doi);
  setIf('article_type', p.article_type);
  setIf('study_design', p.study_design);

  if (p.authors) merged.authors = toArray(p.authors);

  if (p.keywords_cn || p.keywords) {
    merged.keywords_cn = toArray(p.keywords_cn || p.keywords || merged.keywords_cn);
    merged.keywords = toArray(p.keywords || p.keywords_cn || merged.keywords);
  }

  if (p.abstract_zh || p.abstract || p.abstract_en) {
    merged.abstract_zh = p.abstract_zh || p.abstract || merged.abstract_zh;
    merged.abstract_en = p.abstract_en || merged.abstract_en;
    merged.abstract = merged.abstract_zh || merged.abstract_en || merged.abstract;
  }

  // 旧前端兼容字段
  merged.title = merged.title_zh || merged.title_en || merged.title || merged.slug;
  merged.abstract = merged.abstract_zh || merged.abstract_en || merged.abstract || '';

  if (p.include_in_minisearch !== undefined) {
    merged.include_in_minisearch = Boolean(p.include_in_minisearch);
  }

  return merged;
}

async function readJSON(filePath, fallback) {
  try {
    const s = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

async function writeJSON(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const s = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, s, 'utf-8');
}

async function fetchJSON(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} for ${url} ${text ? `| ${text}` : ''}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function mergePreferRemote(localDoc, remoteDoc) {
  // remote 作为权威；但 remote 为空值时保留 local
  const out = { ...localDoc };

  for (const [k, v] of Object.entries(remoteDoc || {})) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }

  // 重新归一化兼容字段
  const fixed = coerceMiniDoc(out);
  return fixed;
}

function isValidMiniDoc(d) {
  if (!d) return false;
  if (!d.slug) return false;
  if (!(d.title_zh || d.title_en || d.title)) return false;
  // 空白卡片防线：title 至少一个字
  const t = String(d.title_zh || d.title_en || d.title || '').trim();
  if (!t) return false;
  return true;
}

function uniqBy(arr, keyFn) {
  const m = new Map();
  for (const x of arr) {
    const k = keyFn(x);
    if (!k) continue;
    if (!m.has(k)) m.set(k, x);
  }
  return Array.from(m.values());
}

async function main() {
  // 1) 本地 papers.json（兜底来源）
  const localPapers = await readJSON(FILE_PAPERS_LOCAL, []);
  const localMini = Array.isArray(localPapers) ? localPapers.map(coerceMiniDoc) : [];

  // 2) 远端数据（单一来源：patch/deleted/static关键词/taxonomy）
  let remoteMini = [];
  let remotePatch = [];
  let remoteDeleted = [];
  let remoteStaticKw = [];
  let remoteTaxonomy = null;

  const metaPrev = await readJSON(FILE_META, {});
  const prevSince = metaPrev?.last_since_ms || null;

  if (!API_BASE) {
    log('未配置 DAIWASITE_PAPERS_API_BASE，使用本地 papers.json 兜底');
  } else {
    const base = API_BASE;

    const urls = {
      minisearch: `${base}/papers/export/minisearch`,
      patch: `${base}/papers/export/patch`,
      deleted: `${base}/papers/export/deleted`,
      staticKw: `${base}/papers/export/static-keywords`,
      taxonomy: `${base}/papers/export/taxonomy`,
      buildQueue: `${base}/papers/export/build-queue${prevSince && MODE === 'incremental' ? `?since=${prevSince}` : ''}`,
    };

    if (MODE === 'incremental' && prevSince) {
      try {
        const queue = await fetchJSON(urls.buildQueue);
        const nothingChanged =
          (queue.paper_slugs || []).length === 0 &&
          (queue.deleted_slugs || []).length === 0 &&
          !queue.static_keywords_changed &&
          !queue.taxonomy_changed;

        if (nothingChanged) {
          log(`增量模式：since=${prevSince} 未检测到变化，跳过远端拉取（沿用本地 data 文件）`);
          // 仍然更新 meta
          const meta = {
            ...metaPrev,
            last_run_at: new Date().toISOString(),
            mode: 'incremental',
            note: 'no changes detected; kept previous local data',
          };
          await writeJSON(FILE_META, meta);
          return;
        } else {
          log(`增量模式：检测到变化，继续拉取远端数据（since=${prevSince}）`);
        }
      } catch (e) {
        log(`增量模式：build-queue 拉取失败，回退全量同步：${String(e.message || e)}`);
      }
    }

    // 全量/回退全量
    try {
      log(`使用全量同步 ${urls.minisearch}`);
      const mini = await fetchJSON(urls.minisearch);
      remoteMini = Array.isArray(mini) ? mini.map(coerceMiniDoc) : [];
      log(`远端 minisearch OK: ${remoteMini.length} 条`);
    } catch (e) {
      log(`远端 minisearch 失败，回退本地：${String(e.message || e)}`);
      remoteMini = [];
    }

    try {
      const patch = await fetchJSON(urls.patch);
      remotePatch = Array.isArray(patch) ? patch : [];
      log(`远端 patch OK: ${remotePatch.length} 条`);
    } catch (e) {
      log(`远端 patch 失败（允许继续）：${String(e.message || e)}`);
      remotePatch = [];
    }

    try {
      const del = await fetchJSON(urls.deleted);
      remoteDeleted = Array.isArray(del) ? del : [];
      log(`远端 deleted OK: ${remoteDeleted.length} 条`);
    } catch (e) {
      log(`远端 deleted 失败（允许继续）：${String(e.message || e)}`);
      remoteDeleted = [];
    }

    try {
      const kw = await fetchJSON(urls.staticKw);
      remoteStaticKw = Array.isArray(kw) ? kw : [];
      log(`远端 static-keywords OK: ${remoteStaticKw.length} 条`);
    } catch (e) {
      log(`远端 static-keywords 失败（允许继续）：${String(e.message || e)}`);
      remoteStaticKw = [];
    }

    try {
      remoteTaxonomy = await fetchJSON(urls.taxonomy);
      log(`远端 taxonomy OK`);
    } catch (e) {
      log(`远端 taxonomy 失败（允许继续）：${String(e.message || e)}`);
      remoteTaxonomy = null;
    }
  }

  // 3) 合并 minisearch（本地 papers.json + 远端 minisearch，远端覆盖本地）
  const mapLocal = new Map(localMini.filter(isValidMiniDoc).map((d) => [d.slug, d]));
  const merged = new Map(mapLocal);

  for (const r of remoteMini.filter(isValidMiniDoc)) {
    if (!r.slug) continue;
    if (!merged.has(r.slug)) {
      merged.set(r.slug, r);
    } else {
      const l = merged.get(r.slug);
      merged.set(r.slug, mergePreferRemote(l, r));
    }
  }

  let miniList = Array.from(merged.values());

  // 4) patch 合并（只在已有 slug 上合并；避免生成“空白卡片”）
  const patchMap = new Map();
  for (const row of remotePatch) {
    const slug = row.slug || row._id;
    if (!slug) continue;
    patchMap.set(slug, row.patch || {});
  }

  let patched = [];
  let patchSkipped = 0;

  for (const d of miniList) {
    if (!isValidMiniDoc(d)) continue;
    if (patchMap.has(d.slug)) {
      patched.push(applyPatchToMiniDoc(d, patchMap.get(d.slug)));
    } else {
      patched.push(d);
    }
  }

  // patch 里存在但 minisearch 没有该 slug：默认跳过（防止“空记录”）
  for (const slug of patchMap.keys()) {
    const exists = patched.some((x) => x.slug === slug);
    if (!exists) patchSkipped += 1;
  }

  // 5) deleted：写文件 + 从 minisearch 里剔除
  const deletedList = remoteDeleted
    .map((r) => ({
      _id: r._id,
      slug: r.slug || r._id,
      patch: r.patch || {},
      updated_at: r.updated_at || r.updatedAt || null,
      note: r.note || '',
    }))
    .filter((x) => x.slug);

  const deletedSet = new Set(deletedList.map((x) => x.slug));

  const finalMini = patched
    .filter(isValidMiniDoc)
    .filter((d) => d.include_in_minisearch !== false)
    .filter((d) => !deletedSet.has(d.slug));

  // 6) static keywords：单一来源（只来自云端；云端不可用则保留现有文件内容）
  let staticKwOut = [];
  if (remoteStaticKw.length) {
    staticKwOut = remoteStaticKw
      .map((r) => ({
        kw: r.kw || r._id,
        enabled: r.enabled === undefined ? true : Boolean(r.enabled),
        order: typeof r.order === 'number' ? r.order : (r.order ? Number(r.order) : 0),
      }))
      .filter((x) => x.kw)
      .sort((a, b) => (a.order || 0) - (b.order || 0) || String(a.kw).localeCompare(String(b.kw)));
  } else {
    // 保留旧文件，以免本地预览直接缺失专题
    const existing = await readJSON(FILE_STATIC_KW, []);
    staticKwOut = Array.isArray(existing) ? existing : [];
  }

  // 7) taxonomy：同理
  let taxonomyOut = null;
  if (remoteTaxonomy) {
    taxonomyOut = remoteTaxonomy;
  } else {
    const existing = await readJSON(FILE_TAXONOMY, null);
    taxonomyOut = existing;
  }

  // 8) 写文件
  await writeJSON(FILE_MINI, finalMini);
  log(`写入：${path.relative(SITE_DIR, FILE_MINI)}（${finalMini.length} 条）`);

  await writeJSON(FILE_DELETED, deletedList);
  log(`写入：${path.relative(SITE_DIR, FILE_DELETED)}（${deletedList.length} 条）`);

  await writeJSON(FILE_STATIC_KW, staticKwOut);
  log(`写入：${path.relative(SITE_DIR, FILE_STATIC_KW)}（${staticKwOut.length} 条）`);

  if (taxonomyOut) {
    await writeJSON(FILE_TAXONOMY, taxonomyOut);
    log(`写入：${path.relative(SITE_DIR, FILE_TAXONOMY)}`);
  }

  const meta = {
    last_run_at: new Date().toISOString(),
    last_since_ms: Date.now(),
    mode: API_BASE ? 'full' : 'local-fallback',
    api_base: API_BASE || null,
    counts: {
      local_papers: localMini.length,
      remote_minisearch: remoteMini.length,
      remote_patch: remotePatch.length,
      remote_deleted: remoteDeleted.length,
      remote_static_keywords: remoteStaticKw.length,
      output_minisearch: finalMini.length,
      patch_skipped_no_base: patchSkipped,
    },
  };

  await writeJSON(FILE_META, meta);
  log(`更新：${path.relative(SITE_DIR, FILE_META)}`);
}

main().catch((e) => {
  console.error('[sync-papers-data] fatal:', e);
  process.exit(1);
});
