const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE });
const db = app.database();

function corsHeaders(e) {
    const o = e?.headers?.origin || e?.headers?.Origin || '*';
    return { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
}
const ok = (h, d) => ({ statusCode: 200, headers: h, body: JSON.stringify(d) });
const list = (qs, k) => String(qs[k] || '').split(',').map(s => s.trim()).filter(Boolean);

function mapPaper(d) {
    return {
        id: d._id || d.id,
        title: d.title_zh || d.title || '',
        title_en: d.title_en || '',
        journal: d.journal_zh || d.journal || d.journal_en || '',
        journal_en: d.journal_en || d.journal || '',
        doi: d.doi || '',
        year: Number(d.year) || null,
        study_design: d.study_design || '',
        article_type: d.article_type || '',
        authors: Array.isArray(d.authors) ? d.authors : [],
        abstract: d.abstract_zh || d.abstract || '',
        keywords: Array.isArray(d.keywords_cn) ? d.keywords_cn : (Array.isArray(d.keywords) ? d.keywords : []),
        keywords_en: Array.isArray(d.keywords) ? d.keywords : [],
        pdf_en: d.pdf_en || '',
        pdf_ja: d.pdf_ja || ''
    };
}

exports.main = async (event = {}) => {
    const headers = corsHeaders(event);
    const m = (event.httpMethod || event.requestContext?.httpMethod || '').toUpperCase();
    if (m === 'OPTIONS') return { statusCode: 204, headers };

    const qs = event.queryStringParameters || {};
    const q = String(qs.q || '').trim().toLowerCase();
    const types = list(qs, 'types');
    const designs = list(qs, 'designs');
    const kws = list(qs, 'kws');
    const page = Math.max(1, parseInt(qs.page || '1', 10));
    const pageSize = Math.min(500, Math.max(1, parseInt(qs.pageSize || '200', 10)));

    const coll = db.collection('papers'); let skip = 0, part = 100, all = [];
    while (true) {
        const r = await coll.skip(skip).limit(part).get();
        all = all.concat(r.data || []);
        if ((r.data || []).length < part) break;
        skip += part;
    }

    const filtered = all.map(mapPaper).filter(d => {
        const okT = types.length ? types.includes(d.article_type) : true;
        const okD = designs.length ? designs.includes(d.study_design) : true;
        const okK = kws.length ? kws.every(k => (d.keywords || []).includes(k)) : true;
        const okQ = q ? (
            (d.title || '').toLowerCase().includes(q) ||
            (d.title_en || '').toLowerCase().includes(q) ||
            (d.journal || '').toLowerCase().includes(q) ||
            (d.abstract || '').toLowerCase().includes(q) ||
            (d.keywords || []).join(' ').toLowerCase().includes(q)
        ) : true;
        return okT && okD && okK && okQ;
    });

    const start = (page - 1) * pageSize;
    return ok(headers, { total: filtered.length, page, pageSize, items: filtered.slice(start, start + pageSize) });
};
