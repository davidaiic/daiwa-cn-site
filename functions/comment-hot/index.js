const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE });
const db = app.database();

exports.main = async (event = {}) => {
  try {
    const qs = event.queryStringParameters || event.queryString || {};
    const limit = Math.min(parseInt(qs.limit || '50', 10), 200);
    const res = await db.collection('comments')
      .where({ status: 'approved' })
      .orderBy('likeCount', 'desc')
      .orderBy('createdAt', 'desc')
      .limit(limit)
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
