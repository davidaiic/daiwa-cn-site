const tcb = require('tcb-admin-node');
tcb.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE });
const db = tcb.database();

exports.main = async (event) => {
    try {
        const qs = event.queryString || {};
        const articleId = qs.articleId || '';
        if (!articleId) return resp(400, { ok: false, msg: 'articleId ±ØÌî' });

        const res = await db.collection('comments')
            .where({ articleId, status: 'approved' })
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        return resp(200, { ok: true, data: res.data || [] });
    } catch (e) {
        return resp(500, { ok: false, msg: e.message });
    }
};
function resp(code, obj) { return { statusCode: code, headers: headers(), body: JSON.stringify(obj) }; }
function headers() { return { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }; }
