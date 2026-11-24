// Local-only preview: uses the real API handler against an in-memory Sheet double.
// It cannot contact the production Apps Script destination, even if env vars are set.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const handler = require('../api/enquiry.js');
const {validate} = require('../lib/enquiry.cjs');
const root = path.resolve(__dirname,'..');
const rows = new Map();
let failNext = false;
const port = Number(process.env.PORT || 4173);
process.env.VERCEL_ENV = 'preview';
process.env.PODS_LOCAL_PREVIEW = '1';
process.env.PODS_TEST_ENQUIRY_ENDPOINT = `http://127.0.0.1:${port}/sheet`;
process.env.PODS_TEST_ENQUIRY_SECRET = 'local-test-only';
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.ttf':'font/ttf','.png':'image/png','.mp4':'video/mp4','.vtt':'text/vtt'};
const server = http.createServer(async (req,res) => {
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  res.setHeader('Cache-Control','no-store');
  res.status = code => {res.statusCode=code;return res;};
  res.json = data => {res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
  let url;
  try {url=new URL(req.url,'http://127.0.0.1');} catch {return res.status(400).end();}
  if (req.method === 'POST') {
    let raw='';
    for await (const chunk of req) {raw+=chunk;if(Buffer.byteLength(raw)>40000)return res.status(413).end();}
    req.body=raw;
    if (url.pathname === '/api/enquiry') return handler(req,res);
    if (url.pathname === '/sheet') {
      if(failNext){failNext=false;return res.status(503).json({ok:false});}
      let data;try{data=JSON.parse(raw);}catch{return res.status(400).json({ok:false});}
      if(data.shared_secret!=='local-test-only'||!validate(data))return res.status(400).json({ok:false,code:'invalid'});
      delete data.shared_secret;
      if(!rows.has(data.submission_id))rows.set(data.submission_id,data);
      return res.json({ok:true,submission_id:data.submission_id});
    }
    if (url.pathname === '/__preview/fail-next') {failNext=true;return res.json({ok:true});}
  }
  if (req.method === 'GET' && url.pathname === '/__preview/rows') return res.json([...rows.values()]);
  if (!['GET','HEAD'].includes(req.method)) return res.status(405).end();
  let pathname;
  try{pathname=decodeURIComponent(url.pathname);}catch{return res.status(400).end();}
  // Serve only website assets, never .git, documentation, secrets or backend source.
  if (pathname.split('/').some(part=>part.startsWith('.')) || /^\/(api|lib|tests|scripts|integrations|docs|node_modules)(\/|$)/.test(pathname))return res.status(404).end();
  let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)&&file!==root)return res.status(403).end();
  try {
    if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    if(!mime[path.extname(file)])return res.status(404).end();
    const body=fs.readFileSync(file);res.setHeader('Content-Type',mime[path.extname(file)]);
    if(req.method==='HEAD')return res.end();res.end(body);
  }catch{return res.status(404).end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Pods isolated preview: http://127.0.0.1:${port} (submissions held in memory; no live Sheets writes)`));
