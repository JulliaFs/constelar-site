// Normalization + fuzzy matching helpers used to validate puzzle answers
// without keeping a plain-text answer sitting in the source.

export function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents (combining diacritics)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,      // deletion
        curr[j - 1] + 1,  // insertion
        prev[j - 1] + cost // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * Builds a validator function for a given obfuscated payload.
 * The payload is decoded lazily, only inside the closure, so the
 * plain answer never exists as a literal string in the source files.
 *
 * @param {string} payload - output of encodeAnswer()
 * @param {number} maxDistance - allowed edit distance for typos
 */
export function createAnswerValidator(payload, maxDistance = 2) {
  const target = decodeAnswer(payload);

  return function isCorrect(userInput) {
    const input = normalize(userInput || '');
    if (!input) return false;
    if (input === target) return true;
    return levenshtein(input, target) <= maxDistance;
  };
}

// --- obfuscation scheme (shift + reverse + base64) ---
// Not real cryptography, only meant to prevent a casual "view source" read.

const SHIFT = 7;

export function encodeAnswer(plainAnswer) {
  const normalized = normalize(plainAnswer);
  const shifted = normalized
    .split('')
    .map((ch) => String.fromCodePoint(ch.codePointAt(0) + SHIFT))
    .join('');
  const reversed = shifted.split('').reverse().join('');
  return btoa(unescape(encodeURIComponent(reversed)));
}

export function decodeAnswer(payload) {
  const reversed = decodeURIComponent(escape(atob(payload)));
  const shifted = reversed.split('').reverse().join('');
  return shifted
    .split('')
    .map((ch) => String.fromCodePoint(ch.codePointAt(0) - SHIFT))
    .join('');
}
