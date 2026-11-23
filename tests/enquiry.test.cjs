const {test,afterEach} = require('node:test');
const assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
const {validate} = require('../lib/enquiry.cjs');
const handler = require('../api/enquiry.js');
const fs = require('node:fs');
const vm = require('node:vm');
const originalFetch = global.fetch;
const originalEnv = {...process.env};
afterEach(()=>{global.fetch=originalFetch;process.env={...originalEnv};});
const valid = () => ({name:'Test Person',email:'test@example.com',brief:'A support team',submission_id:randomUUID(),landing_page:'https://preview.example/',cta_source:'hero',utm_source:'qa'});
async function invoke(body,headers={},method='POST'){
  const result={};const response={setHeader(k,v){result[k]=v;},status(code){result.status=code;return this;},json(data){result.body=data;return this;}};
  await handler({method,headers:{host:'preview.example','content-type':'application/json',origin:'https://preview.example',...headers},body},response);return result;
}
function configure(){process.env.VERCEL_ENV='preview';process.env.PODS_TEST_ENQUIRY_ENDPOINT='https://script.google.com/macros/s/test/exec';process.env.PODS_TEST_ENQUIRY_SECRET='test-secret';}
test('required fields, whitespace, length, UUID, email, types and honeypot',()=>{
  assert.ok(validate(valid()));
  for(const patch of [{name:'  '},{email:'bad@'},{brief:''},{name:'x'.repeat(121)},{brief:'x'.repeat(5001)},{company:{}},{submission_id:'123'},{contact_url:'spam'}])assert.equal(validate({...valid(),...patch}),null);
  assert.equal(validate([]),null);assert.equal(validate(null),null);
  assert.equal(validate({...valid(),untrusted:'drop'}).untrusted,undefined);
});
test('malformed, oversized, cross-origin and wrong methods rejected without delivery',async()=>{
  global.fetch=()=>{throw new Error('must not call');};
  for(const body of ['{',null,'x'.repeat(32001),{...valid(),brief:''}])assert.equal((await invoke(body)).status,400);
  assert.equal((await invoke(valid(),{origin:'https://other.example'})).status,400);
  assert.equal((await invoke(valid(),{'content-type':'text/plain'})).status,400);
  const res=await invoke(valid(),{},'GET');assert.equal(res.status,405);assert.equal(res.Allow,'POST');
});
test('preview refuses inherited production credentials and unconfigured delivery',async()=>{
  process.env.VERCEL_ENV='preview';delete process.env.PODS_TEST_ENQUIRY_ENDPOINT;delete process.env.PODS_TEST_ENQUIRY_SECRET;
  process.env.PODS_ENQUIRY_ENDPOINT='https://script.google.com/macros/s/production/exec';
  process.env.PODS_ENQUIRY_SECRET='production';
  global.fetch=()=>{throw new Error('must not call');};
  assert.equal((await invoke(valid())).status,503);
});
test('delivery forwards attribution and acknowledges only matching stored ID',async()=>{
  configure();const body=valid();let sent;
  global.fetch=async(url,options)=>{assert.ok(url.includes('/test/'));sent=JSON.parse(options.body);return {ok:true,json:async()=>({ok:true,submission_id:body.submission_id})};};
  assert.equal((await invoke(body)).status,200);assert.equal(sent.shared_secret,'test-secret');assert.equal(sent.cta_source,'hero');assert.equal(sent.utm_source,'qa');assert.ok(sent.received_at);
  global.fetch=async()=>({ok:true,json:async()=>({ok:true,submission_id:'wrong'})});assert.equal((await invoke(body)).status,503);
});
test('upstream rejection, timeout, malformed response and retry retain ID',async()=>{
  configure();const body=valid();const ids=[];
  for(const mode of ['throw','invalid','json','unavailable','success']){
    global.fetch=async(url,options)=>{ids.push(JSON.parse(options.body).submission_id);if(mode==='throw')throw new Error('timeout');return {ok:mode!=='unavailable',json:async()=>{if(mode==='json')throw new Error();return mode==='invalid'?{ok:false,code:'invalid'}:{ok:true,submission_id:body.submission_id};}};};
    assert.equal((await invoke(body)).status,mode==='success'?200:mode==='invalid'?400:503);
  }
  assert.equal(new Set(ids).size,1);
});
function gasHarness(initial=[]){
  const rows=initial;let held=false,throwAfterAppend=false;
  const sheet={getLastRow:()=>rows.length,appendRow(row){assert.ok(held);rows.push(row);if(throwAfterAppend){throwAfterAppend=false;throw new Error('response lost');}},getRange(r,c,n,w){return {getValues:()=>rows.slice(r-1,r-1+n).map(row=>row.slice(c-1,c-1+w))};}};
  const props={SHEET_ID:'test-sheet',SHEET_NAME:'Enquiries',SHARED_SECRET:'test-secret'};
  const context={PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]})},LockService:{getScriptLock:()=>({tryLock(){held=true;return true;},hasLock:()=>held,releaseLock(){held=false;}})},SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet}),flush(){}},ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})}};
  vm.createContext(context);vm.runInContext(fs.readFileSync('integrations/google-sheets/Code.gs','utf8'),context);
  return {rows,submit:data=>context.doPost({postData:{contents:JSON.stringify({shared_secret:'test-secret',...data})}}),loseResponse:()=>{throwAfterAppend=true;},held:()=>held};
}
test('actual Apps Script stores exactly one row for repeated ID, including lost acknowledgement',()=>{
  const h=gasHarness();const data=valid();assert.equal(h.submit(data).ok,true);assert.equal(h.submit(data).ok,true);assert.equal(h.rows.length,2);
  const next=valid();h.loseResponse();assert.equal(h.submit(next).ok,false);assert.equal(h.submit(next).ok,true);assert.equal(h.rows.length,3);assert.equal(h.held(),false);
  assert.equal(h.rows[1][8],'hero');assert.equal(h.rows[1][9],'qa');assert.equal(h.rows[1][14],'not_booked');
});
test('Apps Script rejects bad secret/schema and escapes spreadsheet formulas',()=>{
  const h=gasHarness();assert.equal(h.submit({...valid(),shared_secret:'wrong'}).ok,false);assert.equal(h.rows.length,0);
  const data={...valid(),name:'=IMPORTXML("x")',brief:' +SUM(1,2)'};assert.equal(h.submit(data).ok,true);assert.ok(h.rows[1][2].startsWith("'="));assert.ok(h.rows[1][5].startsWith("' +"));
  const old=gasHarness([['wrong schema']]);assert.equal(old.submit(valid()).ok,false);assert.equal(old.rows.length,1);
});
