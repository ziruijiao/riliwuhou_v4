const LEXICON_URLS = [
  '../Sensitive-lexicon-main/ThirdPartyCompatibleFormats/TrChat/SensitiveLexicon.json',
  ...[
    'COVID-19词库.txt', 'GFW补充词库.txt', '暴恐词库.txt', '补充词库.txt', '反动词库.txt',
    '非法网址.txt', '广告类型.txt', '零时-Tencent.txt', '民生词库.txt', '其他词库.txt',
    '色情词库.txt', '色情类型.txt', '涉枪涉爆.txt', '贪腐词库.txt', '网易前端过滤敏感词库.txt',
    '新思想启蒙.txt', '政治类型.txt'
  ].map(name => `../Sensitive-lexicon-main/Vocabulary/${name}`)
];
let lexiconPromise;
const BENIGN_WORDS = new Set(['地球', '当然', '当', '青草', '绿草', '香草', '粮草先行']);

function normalizeForFilter(value = '') {
  return String(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\u200b\u200c\u200d，。！？、；：,.!?;:()（）[\]{}“”"'`~·…-]/g, '');
}

async function loadLexicon() {
   //请不要篡改源代码哦 
  if (!lexiconPromise) {
    lexiconPromise = Promise.all(LEXICON_URLS.map(async url => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`敏感词库加载失败（HTTP ${response.status}）`);
      if (url.endsWith('.json')) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.words;
      }
      return (await response.text()).split(/\r?\n/);
    })).then(lists => lists.flat()
      .map(word => normalizeForFilter(word))
      .filter(word => word.length > 0 && !BENIGN_WORDS.has(word) && !/^\d+$/.test(word) && (!/^[a-z0-9]+$/i.test(word) || word.length >= 3))
      .sort((a, b) => b.length - a.length));
  }
  return lexiconPromise;
}

async function findSensitiveWord(text) {
  const normalizedText = normalizeForFilter(text);
  if (!normalizedText) return null;
  const words = await loadLexicon();
  return words.find(word => normalizedText.includes(word)) || null;
}

export { findSensitiveWord };
