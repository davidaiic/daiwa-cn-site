const https = require('https');
exports.main = async (event = {}) => {
  const method = (event.httpMethod || '').toUpperCase();
  const headers = event.headers || {};
  const key = headers['x-push-key'] || headers['X-Push-Key'] || '';
  if (method === 'OPTIONS') return { statusCode: 204, headers: cors(headers) };
  if (!key || key !== process.env.PUSH_API_KEY) return resp(403, { ok:false, msg:'Forbidden' }, headers);
  let body = []; if (event.body) { try { body = JSON.parse(event.body).urls || []; } catch {} }
  if (!Array.isArray(body) || body.length === 0) return resp(400, { ok:false, msg:'urls required' }, headers);
  const host = process.env.INDEXNOW_HOST || ''; const keyId = process.env.INDEXNOW_KEY || '';
  if (!host || !keyId) return resp(500, { ok:false, msg:'INDEXNOW_HOST/KEY not set' }, headers);
  const payload = JSON.stringify({ host, key:keyId, keyLocation:`https://${host}/indexnow.txt`, urlList: body });
  const result = await httpPost('https://api.indexnow.org/indexnow', payload, 'application/json');
  return resp(200, { ok:true, result }, headers);
};
function httpPost(url, data, ct){
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({ hostname:u.hostname, port:u.port||443, path:u.pathname+(u.search||''), method:'POST',
      headers:{'Content-Type':ct||'application/json','Content-Length':Buffer.byteLength(data)}}, res=>{
      let buf=''; res.on('data',d=>buf+=d); res.on('end',()=>{ try{ resolve(JSON.parse(buf)); }catch{ resolve({statusCode:res.statusCode, body:buf}); }});
    }); req.on('error', reject); req.write(data); req.end();
  });
}
function cors(h){ const o=h.origin||h.Origin||'*'; return {'Access-Control-Allow-Origin':o,'Access-Control-Allow-Headers':'Content-Type,x-push-key','Access-Control-Allow-Methods':'POST,OPTIONS'}; }
function resp(code, obj, h){ return { statusCode: code, headers: { 'Content-Type':'application/json; charset=utf-8', ...cors(h||{}) }, body: JSON.stringify(obj) }; }
