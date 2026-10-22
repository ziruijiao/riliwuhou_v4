const CACHE='calendar-afternoon-v4.0.20';
const ASSETS=['./','./index.html','./styles.css','./app.js','./js/ai-engine.js','./js/database.js','./js/math-engine.js','./js/knowledge-base.js','./js/sensitive-filter.js?v=4.0.9','./Sensitive-lexicon-main/ThirdPartyCompatibleFormats/TrChat/SensitiveLexicon.json','./Sensitive-lexicon-main/Vocabulary/COVID-19词库.txt','./Sensitive-lexicon-main/Vocabulary/GFW补充词库.txt','./Sensitive-lexicon-main/Vocabulary/暴恐词库.txt','./Sensitive-lexicon-main/Vocabulary/补充词库.txt','./Sensitive-lexicon-main/Vocabulary/反动词库.txt','./Sensitive-lexicon-main/Vocabulary/非法网址.txt','./Sensitive-lexicon-main/Vocabulary/广告类型.txt','./Sensitive-lexicon-main/Vocabulary/零时-Tencent.txt','./Sensitive-lexicon-main/Vocabulary/民生词库.txt','./Sensitive-lexicon-main/Vocabulary/其他词库.txt','./Sensitive-lexicon-main/Vocabulary/色情词库.txt','./Sensitive-lexicon-main/Vocabulary/色情类型.txt','./Sensitive-lexicon-main/Vocabulary/涉枪涉爆.txt','./Sensitive-lexicon-main/Vocabulary/贪腐词库.txt','./Sensitive-lexicon-main/Vocabulary/网易前端过滤敏感词库.txt','./Sensitive-lexicon-main/Vocabulary/新思想启蒙.txt','./Sensitive-lexicon-main/Vocabulary/政治类型.txt','./assets/logo.png','./manifest.webmanifest'];
// 配置/密钥类文件始终走网络，不写入缓存，避免长期拿到旧密文
const NETWORK_FIRST=['/txt.txt'];
// 敏感词库目录：除非 sw.js 缓存版本号升级，否则永久使用缓存，不重新拉取
const LEXICON_PREFIX='/Sensitive-lexicon-main/';
// 其余资源缓存 5 小时内直接命中，超过 5 小时回源刷新一次
const MAX_AGE_MS=5*60*60*1000;
const TS_DB='calendar-afternoon-ts';
let tsPromise;
function tsOpen(){if(!tsPromise)tsPromise=new Promise((res,rej)=>{const rq=indexedDB.open(TS_DB,1);rq.onupgradeneeded=()=>rq.result.createObjectStore('ts');rq.onsuccess=()=>res(rq.result);rq.onerror=()=>rej(rq.error);});return tsPromise;}
function tsGet(u){return tsOpen().then(db=>new Promise((res)=>{const tx=db.transaction('ts','readonly').objectStore('ts').get(u);tx.onsuccess=()=>res(tx.result||0);tx.onerror=()=>res(0);})).catch(()=>0);}
function tsSet(u){return tsOpen().then(db=>new Promise((res)=>{const tx=db.transaction('ts','readwrite').objectStore('ts').put(Date.now(),u);tx.onsuccess=()=>res();tx.onerror=()=>res();})).catch(()=>{});}
function fetchAndCache(req){
  return fetch(req).then(r=>{const ok=r.ok||r.type==='opaque';const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));if(ok)tsSet(req.url);return r;}).catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html')));
}
function cachePermanent(req){
  return caches.match(req).then(hit=>{
    if(hit) return hit;
    return fetch(req).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));return r;}).catch(()=>caches.match('./index.html'));
  });
}
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>Promise.all(ASSETS.map(a=>tsSet(new URL(a,self.location.origin).href)))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  let pathname=e.request.url;
  try{ pathname=new URL(e.request.url,self.location.origin).pathname; }catch(_){}
  if(NETWORK_FIRST.some(p=>pathname.endsWith(p))){
    e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.delete(e.request));return r;}).catch(()=>caches.match(e.request)));
    return;
  }
  if(pathname.indexOf(LEXICON_PREFIX)===0){
    e.respondWith(cachePermanent(e.request));
    return;
  }
  e.respondWith(tsGet(e.request.url).then(ts=>{
    if(ts&&Date.now()-ts<MAX_AGE_MS) return caches.match(e.request).then(hit=>hit||fetchAndCache(e.request));
    return fetchAndCache(e.request);
  }).catch(()=>fetchAndCache(e.request)));
});
