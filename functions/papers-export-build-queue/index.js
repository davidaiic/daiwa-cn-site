const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE });
const db = app.database();

function H(e) {
    const o = e?.headers?.origin || e?.headers?.Origin || '*';
    return { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
}
const OK = (h, d) => ({ statusCode: 200, headers: h, body: JSON.stringify(d) });

exports.main = async (event = {}) => {
    const headers = H(event);
    const m = (event.httpMethod || event.requestContext?.httpMethod || '').toUpperCase();
    if (m === 'OPTIONS') return { statusCode: 204, headers };

    const qs = event.queryStringParameters || {};
    let since = String(qs.since || '').trim() || null;
    if (!since) {
        const meta = await db.collection('paper_build_meta').doc('site').get();
        since = meta?.data?.lastBuildAt || null;
    }

    const sk = await db.collection('papers_static_keywords').where({ disabled: db.command.neq(true) }).limit(1000).get();
    const allTopics = new Set((sk.data || []).map(x => x.slug || x.kw).filter(Boolean));
    const manualRebuild = new Set((sk.data || []).filter(x => x.rebuild === true).map(x => x.slug || x.kw));

    const impacted = new Set();
    if (since) {
        const t = new Date(since).getTime() || 0;
        const coll = db.collection('papers'); let skip = 0, part = 100;
        while (true) {
            const r = await coll.field({ keywords_cn: true, keywords: true, affects_keywords: true, is_dirty: true, updatedAt: true })
                .skip(skip).limit(part).get();
            for (const it of (r.data || [])) {
                const changed = it.is_dirty === true || (it.updatedAt && new Date(it.updatedAt).getTime() > t);
                if (!changed) continue;
                const kws = Array.isArray(it.keywords_cn) ? it.keywords_cn : (Array.isArray(it.keywords) ? it.keywords : []);
                const extra = Array.isArray(it.affects_keywords) ? it.affects_keywords : [];
                for (const k of [...kws, ...extra]) {
                    const s = String(k).trim(); if (!s) continue;
                    if (allTopics.has(s)) impacted.add(s);
                }
            }
            if ((r.data || []).length < part) break;
            skip += part;
        }
    }

    const freqAll = new Set();
    {
        let skip = 0, part = 100; const coll = db.collection('papers');
        while (true) {
            const r = await coll.field({ keywords_cn: true, keywords: true }).skip(skip).limit(part).get();
            for (const it of (r.data || [])) {
                const arr = Array.isArray(it.keywords_cn) ? it.keywords_cn : (Array.isArray(it.keywords) ? it.keywords : []);
                arr.forEach(k => { const s = String(k).trim(); if (s) freqAll.add(s); });
            }
            if ((r.data || []).length < part) break;
            skip += part;
        }
    }
    const suggestAdd = [...freqAll].filter(k => !allTopics.has(k));

    const now = new Date().toISOString();
    return OK(headers, {
        since, now,
        topics: { total: allTopics.size },
        suggested: { add: suggestAdd, rebuild: [...new Set([...manualRebuild, ...impacted])] }
    });
};
