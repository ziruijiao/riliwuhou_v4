
const PREFIX = "JZR1:";
const STD = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const DEFAULT_KEY = "jiaozirui2025";

function permRev(i) { return (((i - 13 + 64) % 64) * 55) % 64; }
function charRev(ch) {
  const idx = STD.indexOf(ch);
  return idx === -1 ? ch : STD[permRev(idx)];
}

function strToBytes(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) {
      bytes.push(0xc0 | (c >> 6));
      bytes.push(0x80 | (c & 0x3f));
    } else {
      bytes.push(0xe0 | (c >> 12));
      bytes.push(0x80 | ((c >> 6) & 0x3f));
      bytes.push(0x80 | (c & 0x3f));
    }
  }
  return bytes;
}

function bytesToStr(bytes) {
  let str = "";
  for (let i = 0; i < bytes.length;) {
    const b = bytes[i];
    if (b < 0x80) { str += String.fromCharCode(b); i++; }
    else if (b < 0xe0) {
      str += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
      i += 2;
    } else {
      str += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f));
      i += 3;
    }
  }
  return str;
}

function b64Decode(str) {
  const bytes = [];
  str = str.replace(/\s+/g, "").replace(/=+$/, "");
  for (let i = 0; i < str.length; i += 4) {
    const c0 = STD.indexOf(str[i]), c1 = STD.indexOf(str[i + 1]);
    const c2 = (i + 2 < str.length) ? STD.indexOf(str[i + 2]) : -1;
    const c3 = (i + 3 < str.length) ? STD.indexOf(str[i + 3]) : -1;
    bytes.push((c0 << 2) | (c1 >> 4));
    if (c2 !== -1) bytes.push(((c1 & 0xf) << 4) | (c2 >> 2));
    if (c3 !== -1) bytes.push(((c2 & 3) << 6) | c3);
  }
  return bytes;
}
export function jzrDecrypt(text, key) {
  key = key || DEFAULT_KEY;
  const s = String(text || "").trim();
  if (s.indexOf(PREFIX) !== 0) throw new Error("无效代码：缺少 JZR1 前缀");
  const shuffled = s.substring(PREFIX.length);
  let b64 = "";
  for (let i = 0; i < shuffled.length; i++) b64 += charRev(shuffled[i]);
  const bytes = b64Decode(b64);
  const kb = strToBytes(key), kl = kb.length;
  for (let j = 0; j < bytes.length; j++) {
    bytes[j] = ((bytes[j] - (j % 256) + 256) % 256) ^ kb[j % kl];
  }
  return JSON.parse(bytesToStr(bytes));
}

export { DEFAULT_KEY as JZR_KEY };
