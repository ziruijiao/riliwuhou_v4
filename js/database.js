function decodeText(value=''){
  return value.replace(/\\n/g,'\n').replace(/\\r/g,'\r').replace(/\\t/g,'\t').replace(/\\"/g,'"').trim();
}
 //请不要篡改源代码哦 
function tagsFor(question){
  return [...new Set([
    question,
    ...(question.toLowerCase().match(/[a-z0-9+#.-]{2,}/g)||[]),
    ...(question.match(/[\u4e00-\u9fff]{2,}/g)||[])
  ])];
}

function parseRecords(source){
  const records=[];
  const recordPattern=/["']?question["']?\s*:\s*["']((?:\\.|[^"'])+)["']\s*,\s*["']?answer["']?\s*:\s*["']((?:\\.|[^"'])*)["'](?:\s*,\s*["']?code["']?\s*:\s*`([\s\S]*?)`)?/g;
  for(const match of source.matchAll(recordPattern)){
    const title=decodeText(match[1]);
    const answer=decodeText(match[2]);
    const code=match[3] ? `\n\n\`\`\`cpp\n${match[3].trim()}\n\`\`\`` : '';
    records.push({title,tags:tagsFor(title),text:`${answer}${code}`});
  }
  return records;
}

export async function loadDatabaseKnowledge(){
  const response=await fetch('./小香蕉数据库.txt',{cache:'no-store'});
  if(!response.ok) throw new Error(`数据库加载失败（HTTP ${response.status}）`);
  const records=parseRecords(await response.text());
  if(!records.length) throw new Error('数据库中没有找到可识别的问答记录');
  return records;
}