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

    // 若有独立 taxonomy 集合优先
    const tx = await db.collection('paper_taxonomy').limit(1).get();
    if (tx.data && tx.data[0]) {
        const t = tx.data[0];
        return ok(headers, {
            articleTypes: Array.isArray(t.articleTypes) ? t.articleTypes : [],
            studyDesigns: Array.isArray(t.studyDesigns) ? t.studyDesigns : [],
            keywords: Array.isArray(t.keywords) ? t.keywords : [],
        });
    }

    // 没有 taxonomy 集合则从 papers 推断
    const AT = new Set(), SD = new Set(), KW = new Set();
    const coll = db.collection('papers'); let skip = 0, page = 100;
    while (true) {
        const r = await coll.field({ article_type: true, study_design: true, keywords_cn: true, keywords: true })
            .skip(skip).limit(page).get();
        for (const it of (r.data || [])) {
            if (it.article_type) AT.add(String(it.article_type));
            if (it.study_design) SD.add(String(it.study_design));
            const arr = Array.isArray(it.keywords_cn) ? it.keywords_cn :
                (Array.isArray(it.keywords) ? it.keywords : []);
            arr.forEach(k => { const v = String(k).trim(); if (v) KW.add(v); });
        }
        if ((r.data || []).length < page) break;
        skip += page;
    }

    return ok(headers, { articleTypes: [...AT], studyDesigns: [...SD], keywords: [...KW] });
};
