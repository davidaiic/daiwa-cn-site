const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE });
const db = app.database();

exports.main = async (event = {}) => {
    try {
        const qs = event.queryString || event.queryStringParameters || {};
        const articleId = qs.articleId || '';
        if (!articleId) return resp(400, { ok: false, msg: 'articleId 必填' });

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

function resp(code, obj) {
    return {
        statusCode: code,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(obj)
    };
}
