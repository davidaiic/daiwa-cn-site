const tcb = require('tcb-admin-node');
tcb.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE });
const db = tcb.database();

exports.main = async (event) => {
    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
        const { articleId, author = '', content = '' } = body;
        if (!articleId || !content.trim()) return resp(400, { ok: false, msg: '参数不完整' });

        // 极简防刷：长度限制 + 频率限制（可扩展）
        if (content.length > 2000) return resp(400, { ok: false, msg: '内容过长' });

        const doc = {
            articleId,
            author: String(author).slice(0, 50),
            content: String(content).slice(0, 2000),
            status: 'pending', // 默认待审核
            createdAt: Date.now(),
            ip: event.sourceIp || ''
        };
        await db.collection('comments').add(doc);
        return resp(200, { ok: true });
    } catch (e) {
        return resp(500, { ok: false, msg: e.message });
    }
};
function resp(code, obj) { return { statusCode: code, headers: headers(), body: JSON.stringify(obj) }; }
function headers() { return { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }; }
