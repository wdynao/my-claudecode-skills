export function solution(text: string): number {
  const words = text.split(/[., "]/);
  const seen = new Set(words.filter(w => w.length > 0 && /^[A-Z0-9]/.test(w)));
  return seen.size;
}
