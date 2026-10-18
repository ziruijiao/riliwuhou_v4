import { KNOWLEDGE } from './knowledge-base.js';
import { solveMath, gcd, lcm } from './math-engine.js';
import { findSensitiveWord } from './sensitive-filter.js?v=4.0.9';
 //请不要篡改源代码哦 
const SAFETY_REJECTION_MESSAGE='您的问题涉嫌违规，我不能给你回答，如果你认为不违规，请联系zirui@goodemail.de5.net';
const jokes = [
  "为什么程序员分不清万圣节和圣诞节？Oct 31 = Dec 25",
  "程序员喜欢黑暗模式，因为光会吸引bugs",
  "Java开发者戴眼镜，因为他们不会C#",
  "代码注释就像生活备忘录，少了看不懂，多了累赘",
  "前端：页面完美，后端：日志报错，运维：服务器炸了",
  "我有个关于栈的笑话，但是太深奥了，你可能get不到。",
  "为什么开发者不喜欢大自然？因为它有太多的bugs。",
  "程序员的爱情就像代码，写到一半就出bug。",
  "程序员最怕生产环境四个字。",
  "为什么程序员总是分不清万圣节和圣诞节？因为 Oct 31 等于 Dec 25。",
  "我有个关于栈的笑话，但是太深奥了，你可能get不到。",
  "为什么Java开发人员要戴眼镜？因为他们不会C#。",
  "硬件工程师和软件工程师有什么区别？硬件工程师造武器，软件工程师提供弹药。",
  "为什么开发者不喜欢大自然？因为它有太多的bugs。",
  "我女朋友说：你要再这样天天写代码，我们就完了！于是我立刻收拾行李，她问：你要去哪？我说：我去找个能编译我们爱情的地方。",
  "为什么程序员喜欢黑暗模式？因为光吸引bugs。",
  "为什么程序员讨厌自然？因为有太多的未经测试的API。",
  "为什么程序员总是喝咖啡？因为没有咖啡，他们无法处理Java。",
  "程序员的爱情就像代码，写到一半就出bug。",
  "程序员交朋友，先要加班，再要调试。",
  "你知道程序员最怕的是什么吗？不是错误，而是他们怕没有找到bug。",
  "为什么程序员不喜欢和女朋友去逛街？因为他们总是找不到正确的路径。",
  "程序员最害怕的两个字是：`生产环境`。",
  "如果程序员的生活有注释，那他的生活一定会清晰很多。",
  "为什么程序员总是忙得没有时间看电影？因为他们总是在debug。",
  "程序员之间的爱情很简单，`if (true) { love } else { break; }`。",
  "程序员的感情问题有时候就像是编译错误，查了半天找不到原因。",
  "前端工程师的日常：HTML、CSS、JS：`我可以控制一切，但控制不了自己`。",
  "后台工程师的日常：`服务器报错了，我去查日志...哦，日志没问题。`",
  "程序员的故事就是一个不断尝试修复bug的过程，但始终没能修好自己的情感问题。",
  "当程序员谈恋爱时，他们会说：'你知道我爱你吗？这就像是一个闭环。'",
  "什么动物最容易摔倒？答：狐狸，因为它很狡猾（脚滑）。",
"医生问病人是怎么骨折的。病人：我觉得鞋里有沙子，就扶着电线杆抖鞋，有个路人以为我触电了，抄起木棍就把我打骨折了。",
"有一天小番茄走路摔了一跤，然后它变成了番茄酱。",
"问：布和纸最怕什么？答：不（布）怕一万，只（纸）怕万一。",
"一颗糖走在路上，走着走着脚软了，低头一看，哦，原来是软糖。",
"为什么数学书总是很忧郁？因为它有太多的问题。",
"从前有个人钓鱼，钓上来一只鱿鱼。鱿鱼求他：求你别烤我。那人说：行，我考你几个问题。鱿鱼开心：你考吧你考吧！然后那个人就把鱿鱼烤了。",
"小白加小白等于什么？等于小白兔（小白 two）。",
"有一天火柴头痒，挠了挠，然后它着火了。",
"麒麟到了北极会变成什么？冰淇淋（冰麒麟）。",
"为什么海鸥飞到巴黎就不走了？因为巴黎欧莱雅（鸥来呀）。",
"有个馒头走在路上，饿了，就把自己吃了。",
"问：什么门永远关不上？答：球门。",
"两只香蕉赛跑，跑前面那只觉得热，把外套脱了，后面那只踩到摔了。",
"螃蟹出门不小心撞到泥鳅，泥鳅很生气：你是不是瞎啊！螃蟹：不是啊，我是螃蟹。",
"我问朋友为什么总熬夜，他说：白天不属于我，只有晚上的时间才是偷来的，舍不得睡。",
"去买西瓜，老板说保熟，不熟包退。我抱回家切开，纯白瓜瓤，我抱回去找老板，老板看了看：这个，它还没准备好。",
"别人的存款：五位数六位数。我的存款：余额不足。",
"减肥这件事，三分靠管住嘴，七分靠迈开腿，剩下九十分，全靠做梦。",
"早上闹钟响，我的身体：该起床了。我的脑子：再躺亿分钟。最后身体听脑子的，继续躺平。",
"本来想靠才华吃饭，后来发现，才华不够，饭也吃不太饱。",
"网购看商品评价：全是好评，一追评全是真话。",
"我以为我是情绪稳定的成年人，实际是：一点小事，内心上演八十集连续剧。",
"朋友劝我早睡，我：道理我都懂，但我的手机不懂。",
"体检报告出来，每一行都在提醒我要好好生活，转头我就继续摆烂。",
"小时候盼长大，长大了盼回到小时候，主打一个哪段不在就向往哪段。",
"钱包：我已经空空如也。我：别慌，心也一样。",
"想运动，装备买齐，运动两天，装备开始在角落积灰。",
"别人遇事冷静从容，我遇事：表面淡定，内心哇哇乱叫。",
"天气热到什么程度，出门一趟，感觉自己快熟了，只差撒点孜然。",
"乌龟受伤了，让蜗牛去买药。两个小时过去了蜗牛还没回来。乌龟生气：再不回来我就要死了！门外传来蜗牛声音：你再说我我就不去了啊！",
"啄木鸟：哒哒哒哒哒哒哒。树：我没病，你别啄了。啄木鸟：没病走两步。树：我走不了。啄木鸟：那就是有病。",
"小鸭子对鸭妈妈说：妈妈，我们脚为什么这么黄？鸭妈妈叹气：少问，天生黄脚鸭。",
"小鱼问大鱼：大～鱼～大～鱼～你最喜欢吃什么呀。大鱼：我最喜欢吃说话慢吞吞的小鱼。小鱼：哦这样啊。",
"两只蜗牛被乌龟抢劫，警察来录口供，蜗牛：我记不清了，一切都发生得太快了。",
"哈士奇去上课，老师提问，哈士奇摇摇头：我听不懂，我拆家还可以。",
"蚊子和苍蝇吵架，蚊子：人人都打你。苍蝇：你还好意思说，你吸人血人人追着拍你。",
"熊猫去理发店，理发师问想要什么发型，熊猫：简单点，黑白就可以。",
"蛤蟆去参加选美，落选了很伤心，癞蛤蟆安慰它：没事，我们走的是丑萌路线。",
"蜜蜂天天忙采蜜，抱怨天天加班，蝴蝶劝它：想开点，至少你还有蜂蜜吃。",
"有一天土豆和洋葱走在街上，土豆被车撞，变成薯片，洋葱吓哭了。",
"问：为什么超人总是穿紧身衣？答：救人要紧。",
"有一天饺子出门摔了一跤，变成了馅饼。",
"有个人走在路上，走着走着脚酸了，低头一看，踩到柠檬了。",
"星星有多重？八克，因为星巴克（星八克）。",
"许仙给老婆买了一顶帽子，白娘子戴上之后就死了，因为那是顶鸭（压）舌（蛇）帽。",
"有一天，0 和 8 在街上相遇，0 看了 8 一眼，冷冷说：胖就胖呗，系什么腰带。",
"有个鸡蛋去茶馆喝茶，后来变成了茶叶蛋。",
"有一天，小蚂蚁迷路找不到蚁窝，可着急了，恰好看到它的朋友经过，于是冲过去大喊一声：哥们儿！你… 你都如何回蚁窝（回忆我）？",
"有一天，珍珠奶茶出门逛街，走着走着，珍珠离家出走了。"
];

const INTENTS = [
  {id:'math', label:'数学计算', words:['计算','求值','方程','最大公约数','最小公倍数','取余','面积','周长','半径','sin','cos','sqrt','几何','多少','等于','质数','素数','平均值','平均数','中位数','阶乘','百分比']},
  {id:'cpp', label:'C++', words:['c++','cpp','vector','stl','cout','cin','std::','指针','引用','模板','迭代器']},
  {id:'code', label:'技术与编程', words:['代码','编程','python','java','javascript','js','html','css','算法','报错','bug','函数','数组','链表','二分','递归','tcp','http']},
  {id:'science', label:'科学与自然', words:['物理','化学','生物','天文','牛顿','光合作用','dna','rna','ph','元素','黑洞','宇宙','地球','为什么会有四季']},
  {id:'learn', label:'教育与学习', words:['学习','复习','背诵','记忆','考试','计划','一周','几天学完','怎么学','专注','番茄','费曼']},
  {id:'business', label:'商业与金融', words:['商业','金融','经济','市场','管理','复利','现金流','swot','机会成本','营销','创业']},
  {id:'art', label:'娱乐与艺术', words:['电影','音乐','绘画','游戏','故事','剧本','和弦','色彩','创意','灵感']}
];

const STOP = new Set('的 了 是 在 和 与 或 有 也 我 你 他 她 它 这 那 一个 一下 什么 怎么 为什么 请 帮我 解释 告诉 关于'.split(' '));
const units = {
  mm:0.001, 毫米:0.001, cm:0.01, 厘米:0.01, m:1, 米:1, km:1000, 千米:1000, 公里:1000,
  g:0.001, 克:0.001, kg:1, 千克:1, 公斤:1,
  s:1, 秒:1, min:60, 分钟:60, h:3600, 小时:3600
};
const groups = [
  new Set(['mm','毫米','cm','厘米','m','米','km','千米','公里']),
  new Set(['g','克','kg','千克','公斤']),
  new Set(['s','秒','min','分钟','h','小时'])
];
let knowledgeEntries=KNOWLEDGE;

function esc(s=''){ return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function normalize(s=''){ return s.toLowerCase().replace(/[，。！？、；：,.!?;:()（）\[\]{}“”"'`]/g,' ').replace(/\s+/g,' ').trim(); }
function bigrams(s){ const x=normalize(s).replace(/\s/g,''); const a=[]; for(let i=0;i<x.length-1;i++) a.push(x.slice(i,i+2)); return a; }
function dice(a,b){ const A=bigrams(a), B=bigrams(b); if(!A.length||!B.length) return 0; const c=[...A]; let hit=0; for(const x of B){ const i=c.indexOf(x); if(i>=0){hit++;c.splice(i,1);} } return 2*hit/(A.length+B.length); }
function keywordScore(q,item){
  const n=normalize(q); let s=dice(n,item.title)*1.3;
  for(const tag of item.tags){ const t=tag.toLowerCase(); if(n.includes(t)) s += Math.min(.8,.25+t.length*.035); else s += dice(n,t)*.25; }
  return s;
}
function pickKnowledgeFrom(entries,q){ return entries.map((x,index)=>({x,index,s:keywordScore(q,x)})).sort((a,b)=>b.s-a.s||b.index-a.index)[0]; }
function pickKnowledge(q){ return pickKnowledgeFrom(knowledgeEntries,q); }
function detectIntent(q){
  const n=normalize(q); const score={};
  for(const it of INTENTS){ score[it.id]=0; for(const w of it.words) if(n.includes(w)) score[it.id]+= w.length>3?2:1; }
  if(/```|#include|public static|def\s+\w+|function\s+\w+|console\.log/.test(q)) score.code=(score.code||0)+4;
  if(/\d\s*[+\-*/×÷%^]\s*\d|x\s*\^?2|x[^\n]{0,30}=|最大公约数|最小公倍数/.test(q)) score.math=(score.math||0)+5;
  if(/(?:学习|复习|备考|入门|掌握).{0,18}(?:计划|安排|几天|一周|怎么)|(?:计划|安排).{0,12}(?:学习|复习|备考)/.test(n)) score.learn=(score.learn||0)+7;
  if(/(?:换算|转成|等于).{0,8}(?:摄氏|华氏|公里|千米|厘米|公斤|千克|分钟|小时)/.test(n)) score.math=(score.math||0)+3;
  const [id,points]=Object.entries(score).sort((a,b)=>b[1]-a[1])[0]||['general',0];
  const item=INTENTS.find(x=>x.id===id);
  return {id:points? id:'general', label:points?item.label:'综合问答', confidence:Math.min(.98,.42+points*.09)};
}
function splitProblems(q){
  const x=q.replace(/(?:另外|此外|还有|同时|并且|然后)/g,'\n');
  return x.split(/\n+|[；;]/).map(s=>s.trim()).filter(Boolean).slice(0,4);
}
function contextResolve(q, memory){
  if(!memory?.length) return q;
  if(/^(那|那么|它|这个|上面|刚才|继续|再|为什么|怎么)/.test(q.trim()) || q.trim().length<8){
    const prev=[...memory].reverse().find(x=>x.role==='user');
    if(prev && prev.text!==q) return `${prev.text}；追问：${q}`;
  }
  return q;
}
function md(text){
  let out=esc(text);
  const blocks=[];
  out=out.replace(/```([\w+-]*)\n([\s\S]*?)```/g,(_,lang,code)=>{
    const id=blocks.length;
    blocks.push(`<div class="snippet-block"><div class="snippet-head"><span>${esc(lang||'code')}</span><button class="snippet-copy" type="button">复制</button></div><pre><code>${code}</code></pre></div>`);
    return `@@CODEBLOCK_${id}@@`;
  });
  out=out.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>');
  const lines=out.split('\n'); let html='', inUl=false, inOl=false;
  const close=()=>{ if(inUl){html+='</ul>';inUl=false;} if(inOl){html+='</ol>';inOl=false;} };
  for(const line of lines){
    const block=line.trim().match(/^@@CODEBLOCK_(\d+)@@$/);
    if(block){ close(); html+=blocks[Number(block[1])]||''; }
    else if(/^###\s+/.test(line)){ close(); html+=`<h3>${line.replace(/^###\s+/,'')}</h3>`; }
    else if(/^[-*]\s+/.test(line)){ if(!inUl){close();html+='<ul>';inUl=true;} html+=`<li>${line.replace(/^[-*]\s+/,'')}</li>`; }
    else if(/^\d+[.)]\s+/.test(line)){ if(!inOl){close();html+='<ol>';inOl=true;} html+=`<li>${line.replace(/^\d+[.)]\s+/,'')}</li>`; }
    else { close(); if(line.trim()) html+=`<p>${line}</p>`; }
  }
  close(); return html;
}

function searchActions(q){ const text=String(q||'').trim(); return [
  {label:'百度检索',url:`https://www.baidu.com/s?${new URLSearchParams({wd:text})}`},
  {label:'360 搜索',url:`https://www.so.com/s?${new URLSearchParams({q:text})}`}
]; }

function unitConversion(q){
  let m=q.match(/(-?\d+(?:\.\d+)?)\s*(毫米|厘米|千米|公里|米|mm|cm|km|m|克|千克|公斤|g|kg|秒|分钟|小时|s|min|h)\s*(?:等于|换算成|转成|到|=|是多少)?\s*(毫米|厘米|千米|公里|米|mm|cm|km|m|克|千克|公斤|g|kg|秒|分钟|小时|s|min|h)/i);
  if(!m) return null;
  const v=Number(m[1]), a=m[2].toLowerCase(), b=m[3].toLowerCase();
  const same=groups.some(g=>g.has(a)&&g.has(b)); if(!same) return {text:'这两个单位不属于同一物理量，不能直接换算。',confidence:.98};
  const ans=v*units[a]/units[b]; return {text:`${v} ${m[2]} = **${Number(ans.toPrecision(12))} ${m[3]}**。`,confidence:.99};
}

function dateAnswer(q){
  const now=new Date();
  const weekday=['日','一','二','三','四','五','六'][now.getDay()];
  if(/(?:今天|现在).*(?:几号|日期|星期几|周几)|(?:今天|现在)是(?:几号|什么日期|星期几|周几)/.test(q)){
    return {text:`按你设备当前时间，今天是 **${now.getFullYear()} 年 ${now.getMonth()+1} 月 ${now.getDate()} 日，星期${weekday}**。`,confidence:.99,source:'设备时间'};
  }
  const m=q.match(/(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})日?.{0,10}(?:距离|到|离).{0,4}(?:今天|现在).{0,6}(?:多少|几)天|(?:今天|现在).{0,6}(?:距离|到|离).{0,4}(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})日?.{0,6}(?:多少|几)天/);
  if(m){
    const y=Number(m[1]||m[4]), mo=Number(m[2]||m[5]), d=Number(m[3]||m[6]);
    const target=new Date(y,mo-1,d); const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    if(target.getFullYear()!==y || target.getMonth()!==mo-1 || target.getDate()!==d) return {text:'这个日期看起来不存在，请检查年月日。',confidence:.98,source:'日期计算'};
    const diff=Math.round((target-today)/86400000);
    return {text:diff===0?'这个日期就是**今天**。':`这个日期与今天相差 **${Math.abs(diff)} 天**，在今天${diff>0?'之后':'之前'}。`,confidence:.98,source:'日期计算'};
  }
  return null;
}

function tempConversion(q){
  let m=q.match(/(-?\d+(?:\.\d+)?)\s*(?:°?c|摄氏度|摄氏)\s*(?:等于|换算成|转成|到)?\s*(?:°?f|华氏度|华氏)/i);
  if(m){ const c=Number(m[1]); return {text:`${c}℃ = **${Number((c*9/5+32).toPrecision(10))}℉**。`,confidence:.99}; }
  m=q.match(/(-?\d+(?:\.\d+)?)\s*(?:°?f|华氏度|华氏)\s*(?:等于|换算成|转成|到)?\s*(?:°?c|摄氏度|摄氏)/i);
  if(m){ const f=Number(m[1]); return {text:`${f}℉ = **${Number(((f-32)*5/9).toPrecision(10))}℃**。`,confidence:.99}; }
  return null;
}

function codeDiagnostics(q){
  if(!/```|#include|std::|cout|cin|def\s|function\s|console\./i.test(q) || !/(报错|错|bug|问题|检查|为什么|运行)/i.test(q)) return null;
  const tips=[];
  if(/if\s*\([^)]*=[^=][^)]*\)/.test(q)) tips.push('检查 `if` 条件里是否误把赋值 `=` 写成比较 `==`。');
  if(/\[[^\]]+\]/.test(q)) tips.push('检查数组 / vector 下标边界，尤其是循环是否写成了 `i <= size()`。');
  if(/new\s+|malloc\s*\(/.test(q)) tips.push('如果手动分配内存，检查释放路径与空指针；C++ 更推荐 RAII 容器和智能指针。');
  if(/while\s*\(|for\s*\(/.test(q)) tips.push('确认循环变量确实变化，并验证终止条件，排除死循环。');
  if(/cin\s*>>|scanf\s*\(/.test(q)) tips.push('检查输入格式、输入失败状态以及读入数量是否符合预期。');
  tips.push('把问题缩小为“最小可复现示例”：保留能触发错误的最少代码和一组具体输入。');
  return {text:`我先做了一轮静态排查。仅凭前端规则无法真正编译运行，但下面这些点值得优先检查：\n${tips.map((x,i)=>`${i+1}. ${x}`).join('\n')}\n\n如果你把**完整报错信息、输入样例和期望输出**一起贴上来，我可以继续按错误类型缩小范围。`,confidence:.86};
}

function generateCode(q, intent){
  const lang = /python/i.test(q)?'python': /javascript|\bjs\b/i.test(q)?'javascript': /java(?!script)/i.test(q)?'java': 'cpp';
  const isAsk=/(写|实现|代码|示例|程序)/.test(q);
  if(!isAsk) return null;
  if(/二分/.test(q)){
    const code = lang==='python' ? `def binary_search(a, target):\n    left, right = 0, len(a) - 1\n    while left <= right:\n        mid = left + (right - left) // 2\n        if a[mid] == target:\n            return mid\n        if a[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1` : `#include <vector>\nusing namespace std;\n\nint binarySearch(const vector<int>& a, int target) {\n    int left = 0, right = static_cast<int>(a.size()) - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (a[mid] == target) return mid;\n        if (a[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}`;
    return {text:`二分查找的前提是搜索空间有序或具有单调性。下面这版把边界写得比较稳：\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n时间复杂度是 **O(log n)**，额外空间 **O(1)**。`,confidence:.96};
  }
  if(/最大公约数|gcd/.test(q)){
    const code=lang==='python'?`def gcd(a, b):\n    while b:\n        a, b = b, a % b\n    return abs(a)`:`#include <numeric>\n#include <cstdlib>\n\nlong long gcd2(long long a, long long b) {\n    a = std::llabs(a); b = std::llabs(b);\n    while (b) {\n        long long r = a % b;\n        a = b; b = r;\n    }\n    return a;\n}`;
    return {text:`可以用欧几里得算法：\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n它反复利用 \`gcd(a,b)=gcd(b,a mod b)\`，复杂度很低。`,confidence:.96};
  }
  if(/质数|素数/.test(q)){
    const code=lang==='python'?`def is_prime(n):\n    if n < 2:\n        return False\n    d = 2\n    while d * d <= n:\n        if n % d == 0:\n            return False\n        d += 1\n    return True`:`bool isPrime(long long n) {\n    if (n < 2) return false;\n    for (long long d = 2; d * d <= n; ++d) {\n        if (n % d == 0) return false;\n    }\n    return true;\n}`;
    return {text:`判断单个整数是否为质数时，只需要试除到 √n：\n\n\`\`\`${lang}\n${code}\n\`\`\``,confidence:.94};
  }
  return null;
}

function learningPlan(q){
  if(!/(计划|复习|学习|怎么学|学完)/.test(q)) return null;
  const days=Number(q.match(/(\d+)\s*天/)?.[1]||7);
  const topic=(q.match(/(?:学习|复习|学完|入门)([^，。！？]{2,18})/)?.[1]||'这个主题').replace(/^(一下|完)/,'').trim();
  const d=Math.max(3,Math.min(days,30));
  return {text:`可以用“**输入 → 练习 → 纠错 → 回忆**”四步循环来学 ${topic}。按 ${d} 天安排：\n1. **前 20% 时间**：快速建立知识地图，只抓核心概念和术语。\n2. **中间 50% 时间**：每天做少量典型题 / 小项目，立即对照错误原因。\n3. **接下来 20% 时间**：闭卷回忆，用自己的话讲出来，并整理错题。\n4. **最后 10% 时间**：做一次综合测试，只补最薄弱的 2～3 个点。\n\n每天建议分成 2～3 个 30–50 分钟专注块。不要把“看懂”当成“会了”，至少安排一次不看资料的主动输出。`,confidence:.88};
}

function artIdeas(q){
  if(!/(故事|创意|点子|灵感|短片|剧本)/.test(q)) return null;
  const seed=q.replace(/给我|请|帮我|几个|三个|一些|故事|创意|点子|灵感|短片|剧本/g,' ').trim()||'近未来生活';
  return {text:`围绕“${seed}”，可以从三个不同发动机出发：\n1. **规则反转**：城市里每个人每天只能说 100 个字，沉默突然变成最昂贵的奢侈品。\n2. **微小异常**：主角发现所有电子日历都比真实时间早一天，只有他能看见这个偏差。\n3. **道德选择**：一个离线 AI 能准确预测一次事故，但每次预测都会抹掉一段自己的记忆。\n\n想让故事更有抓力，可以继续给其中一个点子加上“主角想要什么、最怕失去什么、最后必须做什么选择”这三根骨架。`,confidence:.83};
}

function fallback(q,intent){
  const best=pickKnowledge(q);
  if(best && best.s>.72){ return {text:`### ${best.x.title}\n${best.x.text}`,confidence:Math.min(.94,.58+best.s*.2),source:'本地知识库'}; }
  const keywords=normalize(q).split(' ').filter(x=>x.length>0&&!STOP.has(x)).slice(0,6);
  const frame = intent.id==='business' ? ['目标是什么','可量化指标是什么','有哪些约束与风险','怎样用小实验验证'] : intent.id==='code' || intent.id==='cpp' ? ['预期输入与输出','最小复现代码','报错或异常现象','边界条件与复杂度'] : ['你已经知道的条件','真正要得到的结论','可验证的中间步骤','可能存在的例外'];
  return {text:`这个问题超出了我当前的本地知识覆盖，我不想硬编一个答案。\n\n我目前识别到的关键词是：**${keywords.join('、')||'暂无明确关键词'}**。继续处理时，建议按下面的顺序拆：\n${frame.map((x,i)=>`${i+1}. ${x}`).join('\n')}\n\n你也可以直接使用下面的国内检索入口查最新资料，再把关键内容贴回来，我可以继续帮你归纳和推理。`,confidence:.42,actions:searchActions(q),source:'推理框架'};
}

export class LocalAI {
  constructor(){ this.memory=[]; }
  setMemory(messages){ this.memory=(messages||[]).slice(-16).map(x=>({role:x.role,text:x.raw||x.text||''})); }
  async answer(input){
    const raw=String(input).trim();
    const resolved=contextResolve(raw,this.memory);
    const intent=detectIntent(resolved);
    if(intent.id==='math'){
      const math=solveMath(resolved);
      if(math?.ok) {
        const text=`${math.answer}${math.steps?.length?`\n\n${math.steps.map(x=>`- ${x}`).join('\n')}`:''}`;
        return {html:md(text),rawText:text,intent,confidence:.99,actions:[],source:'数学引擎'};
      }
      if(math && !math.ok) {
        const text=`我识别到了数学问题，但这里算不下去：**${math.error}**\n\n可以把表达式写得更明确一些，例如：\`(12+8)*3/5\`。`;
        return {html:md(text),rawText:text,intent,confidence:.92,actions:[],source:'数学引擎'};
      }
    }
    const knowledgeHit=pickKnowledgeFrom(KNOWLEDGE,raw);
    if(knowledgeHit?.s>.72){
      const text=`### ${knowledgeHit.x.title}\n${knowledgeHit.x.text}`;
      return {html:md(text),rawText:text,intent:{id:'knowledge',label:'本地知识库'},confidence:Math.min(.94,.58+knowledgeHit.s*.2),actions:[],source:'本地知识库'};
    }
    let sensitiveWord;
    try { sensitiveWord=await findSensitiveWord(raw); }
    catch(err){ const message=`本地安全词库暂时无法加载，未能完成内容检查：${err.message||String(err)}`; return {html:md(message),rawText:message,intent:{id:'error',label:'安全检查失败'},confidence:0,actions:[],source:'本地引擎'}; }
    if(sensitiveWord) return {html:md(SAFETY_REJECTION_MESSAGE),rawText:SAFETY_REJECTION_MESSAGE,intent:{id:'safety',label:'内容拒绝'},confidence:1,actions:[],source:'敏感词过滤'};
    const parts=splitProblems(raw);
    if(parts.length>1){
      const chunks=[]; let conf=1;
      for(const p of parts){ const one=await this._single(p,detectIntent(p)); chunks.push(`### ${chunks.length+1}. ${p}\n${one.text}`); conf=Math.min(conf,one.confidence||.5); }
      return {html:md(chunks.join('\n\n')), rawText:chunks.join('\n\n'), intent:{...intent,label:'多问题拆解'}, confidence:conf, actions:[]};
    }
    const out=await this._single(resolved,intent);
    return {html:md(out.text),rawText:out.text,intent,confidence:out.confidence||intent.confidence,actions:out.actions||[],source:out.source||'本地推理'};
  }
  async _single(q,intent){
    if(/笑话/.test(q)){
      const joke=jokes[Math.floor(Math.random()*jokes.length)];
      return {text:joke,confidence:.99,source:'笑话库'};
    }
    if(/^(你好|您好|嗨|hello|hi|在吗|早上好|下午好|晚上好)[!！。,.，\s]*$/i.test(q)) return {text:'你好，我在。你可以直接给我一道题、一段代码、一个知识点，或者一个需要拆解的问题。',confidence:.99,source:'对话规则'};
    const date=dateAnswer(q); if(date) return date;
    const u=tempConversion(q)||unitConversion(q); if(u) return {...u,source:'本地换算器'};
    if(intent.id==='math'){
      const m=solveMath(q); if(m?.ok) return {text:`${m.answer}${m.steps?.length?`\n\n${m.steps.map(x=>`- ${x}`).join('\n')}`:''}`,confidence:.99,source:'数学引擎'};
      if(m && !m.ok) return {text:`我识别到了数学问题，但这里算不下去：**${m.error}**\n\n可以把表达式写得更明确一些，例如：\`(12+8)*3/5\`。`,confidence:.92,source:'数学引擎'};
    }
    const diag=codeDiagnostics(q); if(diag) return {...diag,source:'代码静态分析'};
    const generated=generateCode(q,intent); if(generated) return {...generated,source:'代码模板引擎'};
    if(intent.id==='learn'){ const x=learningPlan(q); if(x) return {...x,source:'学习规划器'}; }
    if(intent.id==='art'){ const x=artIdeas(q); if(x) return {...x,source:'创意生成器'}; }
    return fallback(q,intent);
  }
}

export { detectIntent, md, searchActions, gcd, lcm };
