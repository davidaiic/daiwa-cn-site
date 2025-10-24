const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE });
const db = app.database();

function corsHeaders(e) {
    const o = e?.headers?.origin || e?.headers?.Origin || '*';
    return { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
}
const ok = (h, d) => ({ statusCode: 200, headers: h, body: JSON.stringify(d) });

exports.main = async (event = {}) => {
    const headers = corsHeaders(event);
    const m = (event.httpMethod || event.requestContext?.httpMethod || '').toUpperCase();
    if (m === 'OPTIONS') return { statusCode: 204, headers };

    // 优先从维护表导出
    const st = await db.collection('papers_static_keywords').where({ disabled: db.command.neq(true) }).limit(1000).get();
    if (st.data && st.data.length) {
        const list = st.data.map(x => x.slug || x.kw).filter(Boolean);
        if (list.length) return ok(headers, list);
    }

    // 没有维护表则按频次生成 TOPN
    const freq = new Map(); let skip = 0, page = 100;
    const coll = db.collection('papers');
    while (true) {
        const r = await coll.field({ keywords_cn: true, keywords: true }).skip(skip).limit(page).get();
        for (const it of (r.data || [])) {
            const arr = Array.isArray(it.keywords_cn) ? it.keywords_cn :
                (Array.isArray(it.keywords) ? it.keywords : []);
            for (const k of arr) { const s = String(k).trim(); if (!s) continue; freq.set(s, (freq.get(s) || 0) + 1); }
        }
        if ((r.data || []).length < page) break;
        skip += page;
    }
    const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50).map(([k]) => k);
    return ok(headers, top);
};
