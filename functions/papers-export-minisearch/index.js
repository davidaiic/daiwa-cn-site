const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({ env: process.env.TCB_ENV || process.env.SCF_NAMESPACE });
const db = app.database();

function corsHeaders(event){
  const o = event?.headers?.origin || event?.headers?.Origin || '*';
  return {
    'Content-Type':'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods':'GET,OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type'
  };
}
const ok = (h, d) => ({ statusCode: 200, headers: h, body: JSON.stringify(d) });

function mapPaper(d){
  return {
    id: d._id || d.id,
    title: d.title_zh || d.title || '',
    title_en: d.title_en || '',
    journal: d.journal_zh || d.journal || d.journal_en || '',
    journal_en: d.journal_en || d.journal || '',
    doi: d.doi || '',
    year: Number(d.year) || null,
    study_design: d.study_design || '',
    article_type: d.article_type || '',
    authors: Array.isArray(d.authors) ? d.authors : [],
    abstract: d.abstract_zh || d.abstract || '',
    keywords: Array.isArray(d.keywords_cn) ? d.keywords_cn : (Array.isArray(d.keywords) ? d.keywords : []),
    keywords_en: Array.isArray(d.keywords) ? d.keywords : [],
    pdf_en: d.pdf_en || '',
    pdf_ja: d.pdf_ja || '',
    include_in_minisearch: d.include_in_minisearch !== false
  };
}

exports.main = async (event = {}) => {
  const headers = corsHeaders(event);
  const m = (event.httpMethod || event.requestContext?.httpMethod || '').toUpperCase();
  if (m === 'OPTIONS') return { statusCode: 204, headers };

  const coll = db.collection('papers');
  const pageSize = 100;
  let skip = 0, out = [];
  while(true){
    const res = await coll.skip(skip).limit(pageSize).get();
    const batch = (res.data || []).map(mapPaper).filter(x => x.include_in_minisearch);
    out = out.concat(batch);
    if ((res.data || []).length < pageSize) break;
    skip += pageSize;
  }
  return ok(headers, out);
};
