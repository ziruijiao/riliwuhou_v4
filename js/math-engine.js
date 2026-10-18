const OPS = {
  '+': { p: 1, a: 'L', fn: (a,b) => a + b },
  '-': { p: 1, a: 'L', fn: (a,b) => a - b },
  '*': { p: 2, a: 'L', fn: (a,b) => a * b },
  '/': { p: 2, a: 'L', fn: (a,b) => a / b },
  '%': { p: 2, a: 'L', fn: (a,b) => a % b },
  '^': { p: 3, a: 'R', fn: (a,b) => a ** b }
};
 //请不要篡改源代码哦 
const FUNCS = {
  sqrt: Math.sqrt, abs: Math.abs, sin: Math.sin, cos: Math.cos, tan: Math.tan,
  log: Math.log10, ln: Math.log, floor: Math.floor, ceil: Math.ceil, round: Math.round
};

export function gcd(a,b){
  a=Math.abs(Math.trunc(a)); b=Math.abs(Math.trunc(b));
  while(b){ [a,b]=[b,a%b]; } return a;
}
export function lcm(a,b){ return a && b ? Math.abs(a*b)/gcd(a,b) : 0; }

export function safeEval(raw){
  const src = String(raw)
    .replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/[（]/g,'(').replace(/[）]/g,')')
    .replace(/π/gi,'pi').replace(/√\s*([\d.]+)/g,'sqrt($1)').replace(/\s+/g,'').toLowerCase();
  if(!src || src.length>260) throw new Error('表达式过长或为空');
  if(!/^[0-9a-z_+\-*/%^().,]+$/.test(src)) throw new Error('包含无法识别的符号');

  const tokens=[]; let i=0;
  while(i<src.length){
    const c=src[i];
    if(/[0-9.]/.test(c)){
      let s=''; while(i<src.length && /[0-9.e]/.test(src[i])) s+=src[i++];
      const n=Number(s); if(!Number.isFinite(n)) throw new Error('数字格式不正确'); tokens.push({t:'n',v:n}); continue;
    }
    if(/[a-z_]/.test(c)){
      let s=''; while(i<src.length && /[a-z_]/.test(src[i])) s+=src[i++]; tokens.push({t:'id',v:s}); continue;
    }
    if('+-*/%^(),'.includes(c)){ tokens.push({t:c,v:c}); i++; continue; }
    throw new Error('无法解析表达式');
  }

  const out=[], st=[]; let prev=null;
  for(let k=0;k<tokens.length;k++){
    const tok=tokens[k];
    if(tok.t==='n') out.push(tok);
    else if(tok.t==='id'){
      if(tok.v==='pi') out.push({t:'n',v:Math.PI});
      else if(tok.v==='e') out.push({t:'n',v:Math.E});
      else if(FUNCS[tok.v]) st.push({t:'fn',v:tok.v});
      else throw new Error(`未知函数或常量：${tok.v}`);
    } else if(tok.t===',') {
      while(st.length && st.at(-1).t!=='(') out.push(st.pop());
    } else if(tok.t==='(') st.push(tok);
    else if(tok.t===')'){
      while(st.length && st.at(-1).t!=='(') out.push(st.pop());
      if(!st.length) throw new Error('括号不匹配'); st.pop();
      if(st.length && st.at(-1).t==='fn') out.push(st.pop());
    } else if(OPS[tok.t]){
      let op=tok.t;
      const unary = op==='-' && (!prev || OPS[prev.t] || prev.t==='(' || prev.t===',');
      if(unary) out.push({t:'n',v:0});
      while(st.length && OPS[st.at(-1).t]){
        const top=st.at(-1).t;
        if((OPS[op].a==='L' && OPS[op].p<=OPS[top].p) || (OPS[op].a==='R' && OPS[op].p<OPS[top].p)) out.push(st.pop()); else break;
      }
      st.push(tok);
    }
    if(tok.t!==',') prev=tok;
  }
  while(st.length){ if(st.at(-1).t==='(') throw new Error('括号不匹配'); out.push(st.pop()); }
  const vals=[];
  for(const tok of out){
    if(tok.t==='n') vals.push(tok.v);
    else if(tok.t==='fn'){
      const a=vals.pop(); if(a===undefined) throw new Error('函数缺少参数'); vals.push(FUNCS[tok.v](a));
    } else if(OPS[tok.t]){
      const b=vals.pop(), a=vals.pop(); if(a===undefined||b===undefined) throw new Error('运算符缺少数字');
      if(tok.t==='/' && b===0) throw new Error('不能除以 0'); vals.push(OPS[tok.t].fn(a,b));
    }
  }
  if(vals.length!==1 || !Number.isFinite(vals[0])) throw new Error('表达式无法得到有限结果');
  return vals[0];
}

function nfmt(n){
  if(Number.isInteger(n)) return String(n);
  return Number(n.toPrecision(12)).toString();
}

export function solveMath(text){
  const q=String(text).trim();
  let m;

  if((m=q.match(/(-?\d+(?:\.\d+)?)\s*(?:的|\*)\s*(-?\d+(?:\.\d+)?)\s*%/i)) || (m=q.match(/(-?\d+(?:\.\d+)?)\s*%\s*(?:of|乘以)\s*(-?\d+(?:\.\d+)?)/i))){
    const first=Number(m[1]), second=Number(m[2]);
    const val=/\s%\s*(?:of|乘以)/i.test(m[0]) ? first/100*second : first*second/100;
    return {ok:true,title:'百分比计算',answer:`结果是 **${nfmt(val)}**`,steps:[`百分数先除以 100，再与基数相乘。`]};
  }
  if((m=q.match(/(?:平均数|平均值|均值|average)[^\d-]*((?:-?\d+(?:\.\d+)?[，,、\s]+)+-?\d+(?:\.\d+)?)/i))){
    const nums=m[1].split(/[，,、\s]+/).filter(Boolean).map(Number);
    const val=nums.reduce((a,b)=>a+b,0)/nums.length;
    return {ok:true,title:'平均值',answer:`这 ${nums.length} 个数的平均值是 **${nfmt(val)}**`,steps:[`总和 ${nfmt(nums.reduce((a,b)=>a+b,0))} ÷ ${nums.length}。`]};
  }
  if((m=q.match(/(?:中位数|median)[^\d-]*((?:-?\d+(?:\.\d+)?[，,、\s]+)+-?\d+(?:\.\d+)?)/i))){
    const nums=m[1].split(/[，,、\s]+/).filter(Boolean).map(Number).sort((a,b)=>a-b);
    const mid=Math.floor(nums.length/2); const val=nums.length%2?nums[mid]:(nums[mid-1]+nums[mid])/2;
    return {ok:true,title:'中位数',answer:`排序后，中位数是 **${nfmt(val)}**`,steps:[`有 ${nums.length} 个数，${nums.length%2?'取正中间一个':'取中间两个的平均值'}。`]};
  }
  if((m=q.match(/(?:\b|^)(\d+)\s*!/))){
    const n=Number(m[1]); if(n>170) return {ok:false,error:'阶乘太大，超过前端 Number 的有限范围。'};
    let v=1; for(let i=2;i<=n;i++) v*=i;
    return {ok:true,title:'阶乘',answer:`${n}! = **${nfmt(v)}**`,steps:[`从 1 连乘到 ${n}。`]};
  }
  if((m=q.match(/(?:判断|检查)?\s*(\d+)\s*(?:是不是|是否为|是)?\s*(?:质数|素数)/))){
    const n=Number(m[1]); let prime=n>=2;
    for(let d=2; prime&&d*d<=n; d++) if(n%d===0) prime=false;
    return {ok:true,title:'质数判断',answer:`**${n}${prime?' 是':' 不是'}质数**。`,steps:[prime?`试除到 √${n} 没有发现因子。`:`存在 1 和自身以外的因子。`]};
  }
  if(!/x\s*\^?2/i.test(q) && (m=q.match(/(-?\d+(?:\.\d+)?)\s*x\s*([+-]\s*\d+(?:\.\d+)?)\s*=\s*(-?\d+(?:\.\d+)?)/i))){
    const a=Number(m[1]), b=Number(m[2].replace(/\s/g,'')), c=Number(m[3]);
    if(a===0) return {ok:false,error:'x 的系数为 0，这不是一元一次方程。'};
    const x=(c-b)/a;
    return {ok:true,title:'一元一次方程',answer:`解为 **x = ${nfmt(x)}**`,steps:[`移项得 ${a}x = ${nfmt(c-b)}`,`两边除以 ${a}。`]};
  }
  if((m=q.match(/(?:gcd|最大公约数).*?(-?\d+).*?(-?\d+)/i))) {
    const a=Number(m[1]), b=Number(m[2]); return {ok:true,title:'最大公约数',answer:`gcd(${a}, ${b}) = **${gcd(a,b)}**`, steps:[`用辗转相除法不断计算余数，直到余数为 0。`]};
  }
  if((m=q.match(/(?:lcm|最小公倍数).*?(-?\d+).*?(-?\d+)/i))) {
    const a=Number(m[1]), b=Number(m[2]); return {ok:true,title:'最小公倍数',answer:`lcm(${a}, ${b}) = **${nfmt(lcm(a,b))}**`, steps:[`使用 lcm(a,b)=|ab|/gcd(a,b)。`]};
  }
  if((m=q.match(/(-?\d+(?:\.\d+)?)\s*(?:mod|%|取余|模)\s*(-?\d+(?:\.\d+)?)/i))) {
    const a=Number(m[1]), b=Number(m[2]); if(!b) return {ok:false,error:'除数不能为 0。'};
    return {ok:true,title:'取余计算',answer:`${a} mod ${b} = **${nfmt(a%b)}**`,steps:[`商取整后，余数满足 a = bq + r。`]};
  }
  if((m=q.match(/(?:半径|r\s*=?)\s*(\d+(?:\.\d+)?).*?(?:圆.*?(?:面积|周长)|面积|周长)/i)) || (m=q.match(/(?:圆.*?(?:面积|周长)).*?(\d+(?:\.\d+)?)/i))){
    const r=Number(m[1]); const wantsCirc=/周长/.test(q) && !/面积/.test(q); const val=wantsCirc?2*Math.PI*r:Math.PI*r*r;
    return {ok:true,title:`圆的${wantsCirc?'周长':'面积'}`,answer:`半径 r=${r}，${wantsCirc?'C = 2πr':'S = πr²'} ≈ **${nfmt(val)}**`,steps:[`π 取 JavaScript 内置高精度常量。`]};
  }
  if((m=q.match(/(-?\d*\.?\d*)\s*x\s*\^?2\s*([+-]\s*\d*\.?\d*)\s*x\s*([+-]\s*\d*\.?\d*)\s*=\s*0/i))){
    const a=Number(m[1]||1), b=Number(m[2].replace(/\s/g,'')), c=Number(m[3].replace(/\s/g,''));
    const d=b*b-4*a*c;
    if(d<0){ const re=-b/(2*a), im=Math.sqrt(-d)/(2*a); return {ok:true,title:'一元二次方程',answer:`判别式 Δ=${nfmt(d)} < 0，复数根为 **${nfmt(re)} ± ${nfmt(im)}i**`,steps:[`Δ=b²-4ac`,`x=(-b±√Δ)/(2a)`]}; }
    const x1=(-b+Math.sqrt(d))/(2*a), x2=(-b-Math.sqrt(d))/(2*a);
    return {ok:true,title:'一元二次方程',answer:`Δ=${nfmt(d)}，解为 **x₁=${nfmt(x1)}，x₂=${nfmt(x2)}**`,steps:[`代入求根公式 x=(-b±√Δ)/(2a)。`]};
  }

  const expr = q
    .replace(/^(?:计算|算一下|求值|请问|帮我算)[:：\s]*/,'')
    .replace(/[？?。！!]+$/,'');
  if(/[\dπ()]|sqrt|sin|cos|tan|log|ln/i.test(expr) && /[+\-*/×÷%^√]|(?:sqrt|sin|cos|tan|log|ln)/i.test(expr)){
    try { const v=safeEval(expr); return {ok:true,title:'表达式计算',answer:`结果是 **${nfmt(v)}**`,steps:[`已按标准运算优先级计算：括号 → 幂 → 乘除/取余 → 加减。`]}; }
    catch(e){ return {ok:false,error:e.message}; }
  }
  return null;
}
