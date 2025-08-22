// functions/comment-post/index.js
const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE });
const db = app.database();

exports.main = async (event = {}) => {
    try {
        // --- CORS & 预检 ---
        const headers = corsHeaders(event);
        const method = (event.httpMethod || event.requestContext && event.requestContext.httpMethod || '').toUpperCase();
        if (method === 'OPTIONS') {
            return { statusCode: 204, headers }; // 预检直接放行
        }

        // --- 解析 body（支持 JSON / base64）---
        let body = {};
        if (event && typeof event.body !== 'undefined') {
            if (event.isBase64Encoded) {
                try { body = JSON.parse(Buffer.from(event.body, 'base64').toString('utf8')); } catch (e) { body = {}; }
            } else if (typeof event.body === 'string') {
                try { body = JSON.parse(event.body); } catch (e) { body = {}; }
            } else if (event.body && typeof event.body === 'object') {
                body = event.body;
            }
        }

        // --- 解析 query ---
        const qs = event.queryStringParameters || event.queryString || {};

        // --- header 兜底 ---
        const hdrs = event.headers || {};
        const hArticle = hdrs['x-article-id'] || hdrs['X-Article-Id'] || '';

        // --- 综合取值 ---
        const articleId = body.articleId || qs.articleId || hArticle || '';
        const author = (body.author || '').toString().slice(0, 50);
        const content = (body.content || '').toString().slice(0, 2000);

        if (!articleId) return resp(400, { ok: false, msg: 'articleId 必填' }, headers);
        if (!content.trim()) return resp(400, { ok: false, msg: '内容必填' }, headers);

        const doc = {
            articleId, author, content,
            status: 'pending',
            createdAt: Date.now()
        };

        await db.collection('comments').add(doc);
        return resp(200, { ok: true }, headers);
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
