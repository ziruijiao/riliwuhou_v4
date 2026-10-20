const CACHE='calendar-afternoon-v4.0.18';
const ASSETS=['./','./index.html','./styles.css','./app.js','./js/ai-engine.js','./js/database.js','./js/math-engine.js','./js/knowledge-base.js','./js/sensitive-filter.js?v=4.0.9','./Sensitive-lexicon-main/ThirdPartyCompatibleFormats/TrChat/SensitiveLexicon.json','./Sensitive-lexicon-main/Vocabulary/COVID-19词库.txt','./Sensitive-lexicon-main/Vocabulary/GFW补充词库.txt','./Sensitive-lexicon-main/Vocabulary/暴恐词库.txt','./Sensitive-lexicon-main/Vocabulary/补充词库.txt','./Sensitive-lexicon-main/Vocabulary/反动词库.txt','./Sensitive-lexicon-main/Vocabulary/非法网址.txt','./Sensitive-lexicon-main/Vocabulary/广告类型.txt','./Sensitive-lexicon-main/Vocabulary/零时-Tencent.txt','./Sensitive-lexicon-main/Vocabulary/民生词库.txt','./Sensitive-lexicon-main/Vocabulary/其他词库.txt','./Sensitive-lexicon-main/Vocabulary/色情词库.txt','./Sensitive-lexicon-main/Vocabulary/色情类型.txt','./Sensitive-lexicon-main/Vocabulary/涉枪涉爆.txt','./Sensitive-lexicon-main/Vocabulary/贪腐词库.txt','./Sensitive-lexicon-main/Vocabulary/网易前端过滤敏感词库.txt','./Sensitive-lexicon-main/Vocabulary/新思想启蒙.txt','./Sensitive-lexicon-main/Vocabulary/政治类型.txt','./assets/logo.png','./manifest.webmanifest'];
// 配置/密钥类文件始终走网络，不写入缓存，避免长期拿到旧密文
const NETWORK_FIRST=['/txt.txt'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  let pathname=e.request.url;
  try{ pathname=new URL(e.request.url,self.location.origin).pathname; }catch(_){}
  if(NETWORK_FIRST.some(p=>pathname.endsWith(p))){
    e.respondWith(
      fetch(e.request)
        .then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.delete(e.request));return r;})
        .catch(()=>caches.match(e.request))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match('./index.html'))));
});
