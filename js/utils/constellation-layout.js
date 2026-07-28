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

// ============================================================================
// Layout orgânico do mapa celeste (tela cheia).
//
// Em vez de uma faixa horizontal, as estrelas seguem uma "varredura"
// serpenteante pelo céu — o traçado abaixo é o esqueleto da constelação.
// As coordenadas saem em PORCENTAGEM (0-100), então a disposição se adapta
// sozinha a qualquer tamanho de tela sem recalcular nada em pixels.
// ============================================================================

// Âncoras do traçado, em % da tela. Editar aqui muda o "desenho" da
// constelação inteira; a quantidade de capítulos é independente disso.
const TRACADO = [
  { x: 13, y: 70 },
  { x: 26, y: 43 },
  { x: 41, y: 60 },
  { x: 55, y: 28 },
  { x: 70, y: 50 },
  { x: 86, y: 24 },
];

const LIMITES = { minX: 9, maxX: 91, minY: 15, maxY: 78 };

function pontoNoTracado(t) {
  if (t <= 0) return { ...TRACADO[0] };
  if (t >= 1) return { ...TRACADO[TRACADO.length - 1] };

  // Comprimentos acumulados para amostrar o traçado de forma uniforme.
  const segmentos = [];
  let total = 0;
  for (let i = 0; i < TRACADO.length - 1; i++) {
    const len = Math.hypot(TRACADO[i + 1].x - TRACADO[i].x, TRACADO[i + 1].y - TRACADO[i].y);
    segmentos.push(len);
    total += len;
  }

  let alvo = t * total;
  for (let i = 0; i < segmentos.length; i++) {
    if (alvo <= segmentos[i]) {
      const f = segmentos[i] === 0 ? 0 : alvo / segmentos[i];
      return {
        x: TRACADO[i].x + (TRACADO[i + 1].x - TRACADO[i].x) * f,
        y: TRACADO[i].y + (TRACADO[i + 1].y - TRACADO[i].y) * f,
      };
    }
    alvo -= segmentos[i];
  }
  return { ...TRACADO[TRACADO.length - 1] };
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/**
 * Posições orgânicas em % para o mapa celeste em tela cheia.
 * Determinístico (mesma seed por id), então a constelação é sempre a
 * mesma entre sessões — e adicionar um capítulo redistribui o traçado
 * sozinho, sem escolher coordenadas à mão.
 *
 * @param {string[]} ids - ids na ordem de leitura
 * @returns {{id: string, x: number, y: number}[]} x/y em porcentagem (0-100)
 */
export function layoutOrganicConstellation(ids) {
  const n = ids.length;

  return ids.map((id, i) => {
    const rand = mulberry32(hashString(id));
    const t = n <= 1 ? 0.5 : i / (n - 1);
    const base = pontoNoTracado(t);

    // Deslocamento sutil por id: tira a regularidade do traçado sem
    // deixar duas estrelas colidirem.
    const desvioX = (rand() - 0.5) * 6.5;
    const desvioY = (rand() - 0.5) * 8;

    return {
      id,
      x: clamp(base.x + desvioX, LIMITES.minX, LIMITES.maxX),
      y: clamp(base.y + desvioY, LIMITES.minY, LIMITES.maxY),
    };
  });
}
