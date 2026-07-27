import { normalize } from './text-match.js';

// A common, widely-used Elder Futhark "fun cipher" mapping (not strict
// academic phonetics — several Latin letters share a rune where the
// 24-symbol Futhark alphabet has no exact equivalent, e.g. C/K/Q, V/W,
// X/Z). Good enough for an "ancient message" puzzle; real Unicode runic
// characters (U+16A0–U+16F0), not invented glyphs.
const LATIN_TO_RUNE = {
  a: 'ᚨ', b: 'ᛒ', c: 'ᚲ', d: 'ᛞ', e: 'ᛖ', f: 'ᚠ', g: 'ᚷ', h: 'ᚺ',
  i: 'ᛁ', j: 'ᛃ', k: 'ᚲ', l: 'ᛚ', m: 'ᛗ', n: 'ᚾ', o: 'ᛟ', p: 'ᛈ',
  q: 'ᚲ', r: 'ᚱ', s: 'ᛋ', t: 'ᛏ', u: 'ᚢ', v: 'ᚹ', w: 'ᚹ', x: 'ᛉ',
  y: 'ᚤ', z: 'ᛉ',
};

/** Transliterates a plain Latin phrase into runic Unicode characters. */
export function toRunes(text) {
  return normalize(text)
    .split('')
    .map((ch) => (ch === ' ' ? '  ' : LATIN_TO_RUNE[ch] ?? ch))
    .join('');
}

/**
 * Builds the rune→letter legend for a phrase — only the runes actually
 * used, in first-appearance order, so it always matches the puzzle
 * shown (never hand-authored, never out of sync).
 */
export function buildLegend(text) {
  const normalized = normalize(text);
  const seen = new Set();
  const legend = [];
  for (const ch of normalized) {
    if (ch === ' ' || seen.has(ch) || !LATIN_TO_RUNE[ch]) continue;
    seen.add(ch);
    legend.push({ letter: ch.toUpperCase(), rune: LATIN_TO_RUNE[ch] });
  }
  return legend;
}
