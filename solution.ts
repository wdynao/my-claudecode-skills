export function solution(text: string): number {
  const n = text.length;
  if (n === 0) return 0;
  const seen = new Set<string>();
  // state: 0=outside word, 1=inside qualifying word, 2=inside other word
  let state = 0;
  let wordStart = 0;
  for (let i = 0; i < n; i++) {
    const c = text.charCodeAt(i);
    // separator: space(32), period(46), comma(44), double-quote(34)
    const sep = c === 32 || c === 46 || c === 44 || c === 34;
    if (state === 0) {
      if (!sep) {
        wordStart = i;
        state = ((c - 48) >>> 0) <= 9 || ((c - 65) >>> 0) <= 25 ? 1 : 2;
      }
    } else if (sep) {
      if (state === 1) seen.add(text.substring(wordStart, i));
      state = 0;
    }
  }
  if (state === 1) seen.add(text.substring(wordStart, n));
  return seen.size;
}
