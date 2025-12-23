const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE });
const db = app.database();

function corsHeaders(event) {
  const h = (event && event.headers) || {};
  const origin = h.origin || h.Origin || '*';
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
function ok(headers, data) {
  return { statusCode: 200, headers, body: JSON.stringify(data) };
}
function notFound(headers) {
  return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not Found' }) };
}
function qs(event) {
  return (event && event.queryStringParameters) || {};
}
function splitList(v) {
  return String(v || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}
function normStr(s) {
  return String(s || '').toLowerCase();
}

function mapPaper(d) {
  return {
    id: d._id || d.id || '',
    slug: d.slug || d._id || '',
    title: d.title_zh || d.title || '',
    title_zh: d.title_zh || '',
    title_en: d.title_en || '',
    journal: d.journal_zh || d.journal || d.journal_en || '',
    doi: d.doi || '',
    year: typeof d.year === 'number' ? d.year : (Number(d.year) || null),
    study_design: d.study_design || '',
    article_type: d.article_type || '',
    authors: Array.isArray(d.authors) ? d.authors : [],
    abstract: d.abstract_zh || d.abstract || '',
    keywords: Array.isArray(d.keywords_cn) ? d.keywords_cn : (Array.isArray(d.keywords) ? d.keywords : []),
    include_in_minisearch: d.include_in_minisearch !== false,
  };
}

async function exportMinisearch() {
  const coll = db.collection('daiwasite_papers');
  const pageSize = 100;
  let skip = 0;
  let out = [];
  while (true) {
    const res = await coll.skip(skip).limit(pageSize).get();
    const arr = res.data || [];
    out = out.concat(arr.map(mapPaper).filter(x => x.include_in_minisearch));
    if (arr.length < pageSize) break;
    skip += pageSize;
  }
  return out;
}

async function exportTaxonomy() {
  // 优先读维护表
  try {
    const r = await db.collection('daiwasite_paper_taxonomy').doc('site').get();
    if (r && r.data && r.data.length) return r.data[0];
  } catch (e) {}

  // 否则从 papers 统计
  const items = await exportMinisearch();
  const AT = new Set();
  const SD = new Set();
  const KW = new Set();
  items.forEach(it => {
    if (it.article_type) AT.add(String(it.article_type));
    if (it.study_design) SD.add(String(it.study_design));
    (it.keywords || []).forEach(k => { const s = String(k).trim(); if (s) KW.add(s); });
  });
  return { articleTypes: Array.from(AT), studyDesigns: Array.from(SD), keywords: Array.from(KW) };
}

async function exportStaticKeywords() {
  // 优先读维护表
  try {
    const coll = db.collection('daiwasite_papers_static_keywords');
    const r = await coll.limit(200).get();
    const rows = (r.data || []).filter(x => x && x.enabled !== false);
    if (rows.length) {
      rows.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
      return rows.map(x => x.kw || x.value || x.label || x._id).filter(Boolean);
    }
  } catch (e) {}

  // 否则从 papers 做词频 Top 50
  const items = await exportMinisearch();
  const freq = new Map();
  items.forEach(it => {
    (it.keywords || []).forEach(k => {
      const s = String(k).trim();
      if (!s) return;
      freq.set(s, (freq.get(s) || 0) + 1);
    });
  });
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(x => x[0]);
}

async function searchPapers(event) {
  const q = normStr(qs(event).q || '');
  const types = splitList(qs(event).types);
  const designs = splitList(qs(event).designs);
  const kws = splitList(qs(event).kws);

  const page = Math.max(1, Number(qs(event).page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(qs(event).pageSize || 50)));

  // 数据量不大时：全量取再过滤（简单可靠）
  const all = await exportMinisearch();

  const filtered = all.filter(d => {
    if (types.length && types.indexOf(d.article_type) < 0) return false;
    if (designs.length && designs.indexOf(d.study_design) < 0) return false;
    if (kws.length) {
      const set = new Set((d.keywords || []).map(x => String(x)));
      for (let i = 0; i < kws.length; i++) if (!set.has(kws[i])) return false;
    }
    if (q) {
      const text = [
        d.title, d.title_en, d.journal, d.abstract, (d.keywords || []).join(' ')
      ].join(' ').toLowerCase();
      if (text.indexOf(q) < 0) return false;
    }
    return true;
  });

  const start = (page - 1) * pageSize;
  return {
    total: filtered.length,
    page,
    pageSize,
    items: filtered.slice(start, start + pageSize),
  };
}

exports.main = async (event) => {
  const headers = corsHeaders(event);
  const method = String((event && (event.httpMethod || (event.requestContext && event.requestContext.httpMethod))) || '').toUpperCase();
  if (method === 'OPTIONS') return { statusCode: 204, headers };

  const rawPath =
    (event && (event.path || (event.requestContext && event.requestContext.path) || event.rawPath)) || '';

  // 兼容：用 endsWith 做路由（不依赖函数名/网关前缀）
  if (String(rawPath).endsWith('/papers/export/minisearch')) {
    const data = await exportMinisearch();
    return ok(headers, data);
  }
  if (String(rawPath).endsWith('/papers/export/taxonomy')) {
    const data = await exportTaxonomy();
    return ok(headers, data);
  }
  if (String(rawPath).endsWith('/papers/export/static-keywords')) {
    const data = await exportStaticKeywords();
    return ok(headers, data);
  }
  if (String(rawPath).endsWith('/papers/search')) {
    const data = await searchPapers(event);
    return ok(headers, data);
  }

  return notFound(headers);
};
