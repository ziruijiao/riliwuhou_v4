import { LocalAI, detectIntent, searchActions, md } from './js/ai-engine.js';
import { CATEGORIES, QUICK_PROMPTS } from './js/knowledge-base.js';
import { jzrDecrypt, JZR_KEY } from './js/jzw-crypto.js';
 //请不要篡改源代码哦 
const DEBUG_MODE = false;
const DEBUG_SLOW_MS = 3000;
const $ = s => document.querySelector(s);
const els = {
  sidebar:$('#sidebar'), backdrop:$('#sidebarBackdrop'), menu:$('#menuBtn'), categoryList:$('#categoryList'), quickGrid:$('#quickGrid'),
  input:$('#promptInput'), send:$('#sendBtn'), chat:$('#chatScroll'), messages:$('#messages'), hero:$('#hero'), typing:$('#typingWrap'),
  count:$('#charCount'), hint:$('#editorHint'), status:$('#statusText'), newChat:$('#newChatBtn'), history:$('#historyList'), clearHistory:$('#clearHistoryBtn'),
  theme:$('#themeBtn'), search:$('#searchBtn'), aiCall:$('#aiCallBtn')
};
const ai = new LocalAI();
const STORE='calendar-afternoon-v4';
const AI_KEY_URL='https://v4.riliwuhou.de5.net/txt.txt'; 
const AI_API_URL='https://ai.zdzltop.com/v1/chat/completions';
const AI_MODEL='zdzl-chat';                              // zdzl-chat 普通 / zdzl-reasoner 深度思考
const AI_CONFIRM_MSG='每个ip每天只能调用1次，在设置里接入api后可以自行管理，你确定要调用吗？';
const AI_DAILY_KEY='calendar-afternoon-ai-daily';
const AI_DAY_MS=24*60*60*1000;
const AI_EPOCH_TIME='1970-01-01T00:00:00.000Z';
const AI_KEY_CACHE_KEY='calendar-afternoon-ai-key';
const AI_KEY_CACHE_MS=10*60*1000;
const IDENTITY_ANSWER='我是日历午后助手';
let state={messages:[], threads:[], theme:'light', threadId:crypto.randomUUID?.()||String(Date.now())};

function load(){
  try { state={...state,...JSON.parse(localStorage.getItem(STORE)||'{}')}; } catch{}
  document.documentElement.dataset.scheme=state.theme||'light';
  ai.setMemory(state.messages);
}
function save(){ localStorage.setItem(STORE,JSON.stringify(state)); }
function time(){ return new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit'}).format(new Date()); }
function uid(){ return crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`; }
function esc(s=''){ return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function stripEmoji(value=''){
  return String(value)
    .replace(/(?:\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\p{Emoji_Modifier})?)*)|(?:[#*0-9]\uFE0F?\u20E3)/gu,'')
    .replace(/[\uFE0E\uFE0F\u200D\u20E3]|\p{Emoji_Modifier}|\p{Regional_Indicator}/gu,'');
}

function renderCategories(){
  els.categoryList.innerHTML=CATEGORIES.map((c,i)=>`<button class="topic-btn${i===0?' is-active':''}" type="button" data-prompt="${esc(c.prompt)}"><span class="topic-icon">${c.icon}</span><span><div class="topic-name">${c.name}</div><div class="topic-note">${c.desc}</div></span></button>`).join('');
}
function renderQuick(){ els.quickGrid.innerHTML=QUICK_PROMPTS.map(x=>`<button class="starter-card" type="button" data-prompt="${esc(x.prompt)}"><div class="starter-title">${x.title}</div><div class="starter-text">${x.text}</div></button>`).join(''); }

function renderHistory(){
  if(!state.threads?.length){ els.history.innerHTML='<div class="archive-empty">还没有归档的对话</div>'; return; }
  els.history.innerHTML=state.threads.slice(-7).reverse().map(t=>`<button class="archive-entry" type="button" data-thread="${t.id}">${esc(t.title||'未命名对话')}</button>`).join('');
}

function renderMessages(){
  els.hero.hidden=state.messages.length>0;
  els.messages.innerHTML=state.messages.map(m=>messageHTML(m)).join('');
  bindCodeCopies();
  scrollBottom(false);
}
function messageHTML(m){
  const user=m.role==='user';
  const body=user?`<p>${esc(m.raw).replace(/\n/g,'<br>')}</p>`:(m.raw?md(m.raw):m.html);
  const meta=user?`<span>你</span><span>${m.at}</span>`:`<span>超级日历午后</span><span class="intent-chip">${esc(m.intent?.label||'本地回答')}</span><span>${esc(m.source||'本地推理')}</span><span>${m.at}</span>`;
  const actions=!user&&m.actions?.length?`<div class="reply-actions">${m.actions.map(a=>`<a class="reply-link" href="${esc(a.url)}" target="_blank" rel="noreferrer">${esc(a.label)} ↗</a>`).join('')}</div>`:'';
  return `<article class="msg-row ${user?'is-user':'is-ai'}"><div class="portrait ${user?'portrait-user':'portrait-ai'}">${user?'你':`<img src="./assets/logo.png" alt="">`}</div><div class="msg-card"><div class="msg-meta">${meta}</div><div class="msg-body">${body}</div>${actions}</div></article>`;
}
function bindCodeCopies(){
  document.querySelectorAll('.snippet-copy').forEach(btn=>btn.onclick=async()=>{ const code=btn.closest('.snippet-block').querySelector('code').innerText; try{await navigator.clipboard.writeText(code);btn.textContent='已复制';setTimeout(()=>btn.textContent='复制',1300);}catch{btn.textContent='复制失败';} });
}

function autoResize(){
  els.input.style.height='auto'; els.input.style.height=Math.min(els.input.scrollHeight,180)+'px';
  const n=els.input.value.length; els.count.textContent=`${n} / 8000`; els.send.disabled=!els.input.value.trim();
  const it=detectIntent(els.input.value||''); els.hint.textContent=els.input.value.trim()?`正在判断：${it.label} · 本地优先`:'本地优先 · 无匹配时不会编造答案';
}
function scrollBottom(smooth=true){ requestAnimationFrame(()=>els.chat.scrollTo({top:els.chat.scrollHeight,behavior:smooth?'smooth':'auto'})); }
function openSearch(query){
  const q=String(query||'').trim();
  if(!q){ els.input.focus(); return; }
  els.input.value=q;
  autoResize();
  els.status.textContent=`检索关键词：${q}`;
  const target=searchActions(q).find(action=>action.url);
  if(!target){ els.status.textContent='已就绪'; return; }
  window.location.assign(target.url);
}
function archiveCurrent(){
  if(!state.messages.length) return;
  const first=state.messages.find(x=>x.role==='user')?.raw||'未命名对话';
  const t={id:state.threadId,title:first.slice(0,28),messages:state.messages.slice(-40),at:Date.now()};
  state.threads=(state.threads||[]).filter(x=>x.id!==t.id); state.threads.push(t); state.threads=state.threads.slice(-20);
}
function newChat(){ archiveCurrent(); state.messages=[]; state.threadId=uid(); ai.setMemory([]); save(); renderMessages(); renderHistory(); els.input.focus(); closeSidebar(); }
async function send(text=els.input.value){
  const raw=stripEmoji(text).trim(); if(!raw) return;
  if(DEBUG_MODE) debugger;
  els.input.value=''; autoResize();
  state.messages.push({id:uid(),role:'user',raw,at:time()}); save(); renderMessages(); scrollBottom();
  els.typing.hidden=false; els.status.textContent='分析中'; scrollBottom(); els.send.disabled=true;
  const started=performance.now();
  let result;
  try {
    result=raw.includes('谁')
      ? {html:md(IDENTITY_ANSWER),rawText:IDENTITY_ANSWER,intent:{id:'identity',label:'身份介绍'},confidence:1,actions:[],source:'本地回答'}
      : await ai.answer(raw);
  }
  catch(err){ result={html:`<p>本地引擎遇到异常：${esc(err.message||String(err))}</p>`,intent:{label:'错误'},confidence:0,actions:[],source:'本地引擎'}; }
  const elapsed=performance.now()-started;
  if(DEBUG_MODE) debugger;
  if(elapsed>DEBUG_SLOW_MS){
    alert(`本次处理耗时 ${Math.round(elapsed)} 毫秒，时间可能不正常。`);
  }
  const wait=Math.max(180,420-elapsed); await new Promise(r=>setTimeout(r,wait));
  els.typing.hidden=true; els.status.textContent='已就绪';
  state.messages.push({id:uid(),role:'assistant',html:result.html,raw:result.rawText||'',intent:result.intent,confidence:result.confidence,actions:result.actions,source:result.source,at:time()});
  ai.setMemory(state.messages); save(); renderMessages(); scrollBottom();
}

// —— 云端 AI 调用
function extractApiKey(txt){
  if(!txt) return '';
  let s=String(txt).trim();
  try{ const j=JSON.parse(s); const k=j.api_key||j.apikey||j.key||j.token||j.apiKey||j.api; if(k) return String(k).trim(); }catch(e){}
  let m=s.match(/(?:api[_-]?key|key|token|apikey)\s*[:=]\s*"?([A-Za-z0-9_\-\.]+)"?/i);
  if(m) return m[1];
  m=s.match(/Bearer\s+([A-Za-z0-9_\-\.]+)/i);
  if(m) return m[1];
  const line=s.split(/\r?\n/).map(x=>x.trim()).find(x=>x && !x.startsWith('#') && !x.startsWith('//'));
  return line||'';
}
function lastAiCallTime(){
  const stored=localStorage.getItem(AI_DAILY_KEY);
  if(stored===null){
    localStorage.setItem(AI_DAILY_KEY,AI_EPOCH_TIME);
    return 0;
  }
  const timestamp=Number(stored);
  if(Number.isFinite(timestamp)) return timestamp;
  const legacyTimestamp=Date.parse(stored);
  if(Number.isFinite(legacyTimestamp)){
    localStorage.setItem(AI_DAILY_KEY,new Date(legacyTimestamp).toISOString());
    return legacyTimestamp;
  }
  localStorage.setItem(AI_DAILY_KEY,AI_EPOCH_TIME);
  return 0;
}

async function callAI(){
  const raw=stripEmoji(els.input.value).trim();
  if(!raw){ els.input.focus(); return; }
  if(raw.includes('谁')){ await send(raw); return; }
  if(!confirm(AI_CONFIRM_MSG)) return;
  if(Date.now()-lastAiCallTime()<=AI_DAY_MS){
    alert('这个浏览器今天已经调用过 1 次 AI 了，明天再来吧。');
    return;
  }
  els.send.disabled=true; els.typing.hidden=false; els.status.textContent='云端 AI 思考中'; scrollBottom();
  const started=performance.now();
  let apiKey='';
  try{ const c=JSON.parse(localStorage.getItem(AI_KEY_CACHE_KEY)||'null'); if(c&&c.key&&Date.now()-c.t<AI_KEY_CACHE_MS) apiKey=c.key; }catch(e){}
  if(!apiKey) try{
    const res=await fetch(AI_KEY_URL,{cache:'no-store'});
    if(!res.ok) throw new Error('读取 API 配置失败（HTTP '+res.status+'）');
    const text=await res.text();
    let dec=null;
    try{ dec=jzrDecrypt(text,JZR_KEY); }catch(e){
      if(String(text).trim().startsWith('JZR1:')) throw new Error('API 配置解密失败：'+(e.message||String(e)));
    }
    if(dec){
      apiKey=(typeof dec==='string')?dec:((dec&&(dec.api_key||dec.key||dec.token||dec.api))||'');
    }else{
      apiKey=extractApiKey(text);
    }
    if(!apiKey) throw new Error('解密后没有找到可用的 API Key');
    localStorage.setItem(AI_KEY_CACHE_KEY,JSON.stringify({key:apiKey,t:Date.now()}));
  }catch(err){
    els.typing.hidden=true; els.send.disabled=false; els.status.textContent='已就绪';
    alert('无法获取 AI 配置：'+(err.message||String(err)));
    return;
  }
  let payload;
  try{
    const r=await fetch(AI_API_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey},
      body:JSON.stringify({model:AI_MODEL,messages:[{role:'user',content:raw}],stream:false,max_tokens:1000,temperature:0.7})
    });
    const data=await r.json().catch(()=>null);
    if(r.status===429){
      payload={ok:false,message:'您所在的省流量池已用完，请明天再试，或在设置里接入自己的 API Key 后自行管理。'};
    }else if(r.status!==200){
      payload={ok:false,message:(data&&data.error&&data.error.message)||('AI 请求失败（HTTP '+r.status+'）')};
    }else{
      payload={ok:true,reply:((data&&data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content)||'').trim()};
    }
  }catch(err){
    payload={ok:false,message:'调用 AI 失败：'+(err.message||String(err))};
  }
  const wait=Math.max(300,800-(performance.now()-started)); await new Promise(r=>setTimeout(r,wait));
  els.typing.hidden=true; els.send.disabled=false; els.status.textContent='已就绪';
  if(payload.ok!==true){
    alert(payload.message||'调用失败，请稍后再试。');
    return;
  }
  if(!payload.reply){
    alert('AI 这次没有返回内容，请换个问题试试。');
    return;
  }
  localStorage.setItem(AI_DAILY_KEY,Date.now());
  els.input.value=''; autoResize();
  state.messages.push({id:uid(),role:'user',raw,at:time()});
  state.messages.push({id:uid(),role:'assistant',html:md(payload.reply),raw:payload.reply,intent:{id:'ai',label:'云端 AI'},confidence:1,actions:[],source:'云端 AI',at:time()});
  ai.setMemory(state.messages); save(); renderMessages(); scrollBottom();
}

function openSidebar(){ els.sidebar.classList.add('is-open'); els.backdrop.hidden=false; }
function closeSidebar(){ els.sidebar.classList.remove('is-open'); els.backdrop.hidden=true; }

els.input.addEventListener('input',autoResize);
els.input.addEventListener('keydown',e=>{ if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send();} });
document.addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();
  const blockedShortcut=e.key==='F12' || (e.ctrlKey&&e.shiftKey&&['i','j','c'].includes(key)) || (e.ctrlKey&&key==='u');
  if(blockedShortcut&&!DEBUG_MODE){
    e.preventDefault();
    e.stopImmediatePropagation();
    alert('请不要打开开发人员工具哦 就猜到你有在搞神秘的事情了 ——焦梓睿:)');
  }
},true);
document.addEventListener('contextmenu',e=>{ if(!DEBUG_MODE) e.preventDefault(); });
els.send.addEventListener('click',()=>send());
els.menu.addEventListener('click',openSidebar); els.backdrop.addEventListener('click',closeSidebar);
els.newChat.addEventListener('click',newChat);
els.clearHistory.addEventListener('click',()=>{ if(confirm('清空已归档的本机对话？当前对话不会删除。')){state.threads=[];save();renderHistory();} });
els.theme.addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';document.documentElement.dataset.scheme=state.theme;save();});
els.search.addEventListener('click',()=>openSearch(els.input.value));
els.aiCall.addEventListener('click',callAI);
document.addEventListener('click',e=>{ const p=e.target.closest('[data-prompt]'); if(p){els.input.value=p.dataset.prompt;autoResize();els.input.focus(); if(innerWidth<=900) closeSidebar();} const h=e.target.closest('[data-thread]'); if(h){ archiveCurrent(); const t=state.threads.find(x=>x.id===h.dataset.thread); if(t){state.threadId=t.id;state.messages=t.messages||[];ai.setMemory(state.messages);save();renderMessages();closeSidebar();} } });
window.addEventListener('resize',()=>{ if(innerWidth>900) closeSidebar(); });
if(window.visualViewport){ window.visualViewport.addEventListener('resize',()=>scrollBottom(false)); }

load(); renderCategories(); renderQuick(); renderHistory(); renderMessages(); autoResize();
if('serviceWorker' in navigator && location.protocol!=='file:') navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
