// Usage:
//   node scripts/generate-answer.mjs "Nome Da Cidade"
//
// Prints an obfuscated payload to paste into a chapter's
// `answerPayload` field. Keeps the plain answer out of the
// shipped source files.

import { normalize } from '../js/utils/text-match.js';

const SHIFT = 7;

function encodeAnswer(plainAnswer) {
  const normalized = normalize(plainAnswer);
  const shifted = normalized
    .split('')
    .map((ch) => String.fromCodePoint(ch.codePointAt(0) + SHIFT))
    .join('');
  const reversed = shifted.split('').reverse().join('');
  return Buffer.from(reversed, 'utf-8').toString('base64');
}

const answer = process.argv.slice(2).join(' ');

if (!answer) {
  console.error('Uso: node scripts/generate-answer.mjs "Nome Da Cidade"');
  process.exit(1);
}

console.log(encodeAnswer(answer));
