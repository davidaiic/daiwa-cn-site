const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE });
const db = app.database();

function H(e){const o=e?.headers?.origin||e?.headers?.Origin||'*';
  return {'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':o,'Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'} }
const OK=(h,d)=>({statusCode:200,headers:h,body:JSON.stringify(d)});

exports.main = async (event = {}) => {
  const headers = H(event);
  const m = (event.httpMethod || event.requestContext?.httpMethod || '').toUpperCase();
  if (m === 'OPTIONS') return { statusCode: 204, headers };

  let body = {}; try{ body = JSON.parse(event.body || '{}'); }catch(e){}
  const rebuildTopics = Array.isArray(body.rebuildTopics) ? body.rebuildTopics : [];
  const clearDirty = body.clearDirty === true;
  const lastBuildAt = body.lastBuildAt || new Date().toISOString();

  if (rebuildTopics.length){
    const coll = db.collection('papers_static_keywords');
    await Promise.allSettled(rebuildTopics.map(async kw => {
      await coll.where({ $or: [{slug: kw},{kw}] }).update({ rebuild: false });
    }));
  }
  if (clearDirty){
    await db.collection('papers').where({ is_dirty: true }).update({ is_dirty: false });
  }
  await db.collection('paper_build_meta').doc('site').set({ key:'site', lastBuildAt });

  return OK(headers, { ok:true, lastBuildAt });
};
