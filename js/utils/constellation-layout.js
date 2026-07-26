// Deterministic, seeded node layout for the progress constellation.
// Positions look hand-placed/irregular (sky map, not a progress bar)
// but are fully derived from chapter id + index, so adding a new
// chapter never requires manually picking coordinates.

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {string[]} ids - chapter ids, in reading order
 * @param {{width?: number, height?: number, marginX?: number, marginY?: number}} opts
 * @returns {{id: string, x: number, y: number}[]}
 */
export function layoutConstellation(ids, opts = {}) {
  const { width = 800, height = 180, marginX = 50, marginY = 34 } = opts;
  const n = ids.length;

  return ids.map((id, i) => {
    const rand = mulberry32(hashString(id));
    const t = n <= 1 ? 0.5 : i / (n - 1);

    const baseX = marginX + t * (width - marginX * 2);
    const jitterX = (rand() - 0.5) * (width / Math.max(n, 1)) * 0.5;
    const x = Math.min(width - marginX * 0.4, Math.max(marginX * 0.4, baseX + jitterX));

    const wave = Math.sin(i * 1.7 + hashString(id) % 7) * (height * 0.26);
    const jitterY = (rand() - 0.5) * height * 0.16;
    const y = Math.min(height - marginY, Math.max(marginY, height / 2 + wave + jitterY));

    return { id, x, y };
  });
}
