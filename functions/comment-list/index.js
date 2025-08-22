// functions/comment-list/index.js
const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE });
const db = app.database();

exports.main = async (event = {}) => {
    try {
        const headers = corsHeaders(event);
        const method = (event.httpMethod || event.requestContext && event.requestContext.httpMethod || '').toUpperCase();
        if (method === 'OPTIONS') return { statusCode: 204, headers };

        const qs = event.queryStringParameters || event.queryString || {};
        const hdrs = event.headers || {};
        const hArticle = hdrs['x-article-id'] || hdrs['X-Article-Id'] || '';
        const articleId = qs.articleId || hArticle || '';

        if (!articleId) return resp(400, { ok: false, msg: 'articleId 必填' }, headers);

        const res = await db.collection('comments')
            .where({ articleId, status: 'approved' })
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        return resp(200, { ok: true, data: res.data || [] }, headers);
    } catch (e) {
        return resp(500, { ok: false, msg: e.message }, corsHeaders(event));
    }
};

function corsHeaders(event) {
    const origin = (event && event.headers && (event.headers.origin || event.headers.Origin)) || '*';
    return {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,x-article-id'
    };
}
function resp(code, obj, headers) {
    return { statusCode: code, headers, body: JSON.stringify(obj) };
}
