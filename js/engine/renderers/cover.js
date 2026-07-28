// ============================================================================
// TELA INICIAL — Astrolábio Celestial.
//
// Três anéis concêntricos giratórios (dias / meses em romano / anos). Alinhar
// a data correta sob o marcador das 12h abre o grimório. A data-alvo NÃO fica
// em texto simples no código: vem ofuscada de config/story.config.js
// (book.coverTargetPayload), gerada por scripts/generate-answer.mjs.
// ============================================================================

import { toRoman } from '../../utils/roman-numerals.js';
import { decodeAnswer } from '../../utils/text-match.js';
import { burstParticles } from '../components/particle-burst.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const CX = 200;
const CY = 200;

const SNAP_MS = 420;      // deve casar com .astro-anel.is-snapping (components.css)
const WIN_HOLD_MS = 1500; // tempo do pulso/partículas antes de sair da tela
const FADE_OUT_MS = 520;  // deve casar com .tela-capa.is-saindo

const DIAS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const MESES = Array.from({ length: 12 }, (_, i) => toRoman(i + 1));
const ANOS = Array.from({ length: 13 }, (_, i) => String(1998 + i));

const RINGS = [
  { id: 'dias', rotulo: 'dias', values: DIAS, labelRadius: 176, band: 44, fontSize: 15, tick: 8 },
  { id: 'meses', rotulo: 'meses', values: MESES, labelRadius: 126, band: 44, fontSize: 15, tick: 8 },
  { id: 'anos', rotulo: 'anos', values: ANOS, labelRadius: 80, band: 40, fontSize: 10.5, tick: 7 },
];

// ---------------------------------------------------------------- helpers ---

function svg(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

/** Ponto polar medido a partir do TOPO (12h), em graus, sentido horário. */
function polar(radius, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
}

function normalizeIndex(i, length) {
  return ((i % length) + length) % length;
}

/** Pontos de uma estrela de N pontas (usada no marcador das 12h). */
function starPoints(cx, cy, outerR, innerR, points) {
  const out = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const deg = (180 / points) * i;
    const rad = ((deg - 90) * Math.PI) / 180;
    out.push(`${(cx + r * Math.cos(rad)).toFixed(2)},${(cy + r * Math.sin(rad)).toFixed(2)}`);
  }
  return out.join(' ');
}

// ------------------------------------------------------------------ defs ----

function buildDefs() {
  const defs = svg('defs');
  defs.innerHTML = `
    <linearGradient id="astro-latao" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#F3E5AB" />
      <stop offset="28%"  stop-color="#D4AF37" />
      <stop offset="55%"  stop-color="#8A6D3B" />
      <stop offset="78%"  stop-color="#D4AF37" />
      <stop offset="100%" stop-color="#6B5228" />
    </linearGradient>

    <linearGradient id="astro-latao-inv" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#8A6D3B" />
      <stop offset="35%"  stop-color="#D4AF37" />
      <stop offset="62%"  stop-color="#F3E5AB" />
      <stop offset="100%" stop-color="#8A6D3B" />
    </linearGradient>

    <radialGradient id="astro-fundo-anel" cx="42%" cy="34%" r="72%">
      <stop offset="0%"   stop-color="#241A0C" />
      <stop offset="60%"  stop-color="#170F06" />
      <stop offset="100%" stop-color="#1A1208" />
    </radialGradient>

    <radialGradient id="astro-nucleo" cx="36%" cy="30%" r="70%">
      <stop offset="0%"   stop-color="#F3E5AB" />
      <stop offset="38%"  stop-color="#D4AF37" />
      <stop offset="72%"  stop-color="#8A6D3B" />
      <stop offset="100%" stop-color="#1A1208" />
    </radialGradient>

    <filter id="astro-brilho" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="3.2" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="astro-relevo" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.4" stdDeviation="0.9" flood-color="#000" flood-opacity=".75" />
    </filter>
  `;
  return defs;
}

// ------------------------------------------------------------------ anel ----

/**
 * Monta um anel giratório. A rotação é rastreada em JS (fonte da verdade) e
 * aplicada via custom property `--rot`, para que o snap possa ser uma
 * transição CSS suave sem brigar com o arrasto ao vivo.
 *
 * @param {object} config
 * @param {(topIndex:number) => void} onSettle - chamado após cada encaixe
 */
function buildRing(config, onSettle) {
  const { values, labelRadius, band, fontSize, tick } = config;
  const slots = values.length;
  const slotAngle = 360 / slots;
  const rOut = labelRadius + band / 2;
  const rIn = labelRadius - band / 2;

  const group = svg('g', {
    class: `astro-anel astro-anel--${config.id}`,
    role: 'slider',
    tabindex: '0',
    'aria-label': `Anel de ${config.rotulo}`,
  });
  group.style.setProperty('--rot', '0deg');

  // Fundo escovado do anel + fios de contorno.
  group.appendChild(svg('circle', {
    cx: CX, cy: CY, r: labelRadius,
    fill: 'none', stroke: 'url(#astro-fundo-anel)', 'stroke-width': band,
    class: 'astro-anel__leito',
  }));
  group.appendChild(svg('circle', {
    cx: CX, cy: CY, r: rOut, fill: 'none',
    stroke: 'url(#astro-latao)', 'stroke-width': 1.6, class: 'astro-anel__fio',
  }));
  group.appendChild(svg('circle', {
    cx: CX, cy: CY, r: rIn, fill: 'none',
    stroke: 'url(#astro-latao-inv)', 'stroke-width': 1.2, class: 'astro-anel__fio',
  }));

  // Ranhuras e numerais.
  values.forEach((value, i) => {
    const deg = i * slotAngle;

    const [tx1, ty1] = polar(rOut - 1.5, deg);
    const [tx2, ty2] = polar(rOut - 1.5 - tick, deg);
    group.appendChild(svg('line', {
      x1: tx1.toFixed(2), y1: ty1.toFixed(2), x2: tx2.toFixed(2), y2: ty2.toFixed(2),
      class: 'astro-anel__ranhura',
    }));

    const [lx, ly] = polar(labelRadius - 2, deg);
    const label = svg('text', {
      x: lx.toFixed(2), y: ly.toFixed(2),
      'font-size': fontSize,
      transform: `rotate(${deg.toFixed(3)} ${lx.toFixed(2)} ${ly.toFixed(2)})`,
      class: 'astro-anel__numeral',
    });
    label.textContent = value;
    group.appendChild(label);
  });

  // Faixa transparente de pegada: dá uma área de arrasto generosa sem
  // depender de acertar um numeral fino.
  group.appendChild(svg('circle', {
    cx: CX, cy: CY, r: labelRadius,
    fill: 'none', stroke: 'transparent', 'stroke-width': band,
    class: 'astro-anel__pegada',
  }));

  let rotation = 0;
  let dragging = false;
  let startAngle = 0;
  let lastTickIndex = 0;
  let locked = false;

  function angleAt(clientX, clientY) {
    const rect = group.ownerSVGElement.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
  }

  function applyRotation() {
    group.style.setProperty('--rot', `${rotation}deg`);
  }

  function topIndexFor(rot) {
    return normalizeIndex(-Math.round(rot / slotAngle), slots);
  }

  group.addEventListener('pointerdown', (e) => {
    if (locked) return;
    dragging = true;
    startAngle = angleAt(e.clientX, e.clientY);
    group.classList.remove('is-snapping');
    group.classList.add('is-arrastando');
    // A captura é um extra (mantém o rastreio se o ponteiro sair do anel);
    // se falhar, o rastreio de ângulo acima continua funcionando.
    try { group.setPointerCapture(e.pointerId); } catch { /* ponteiro não capturável */ }
  });

  group.addEventListener('pointermove', (e) => {
    if (!dragging || locked) return;
    const angle = angleAt(e.clientX, e.clientY);
    // Delta por evento: nunca "pula", independente da velocidade do arrasto.
    rotation += angle - startAngle;
    startAngle = angle;
    applyRotation();

    const idx = topIndexFor(rotation);
    if (idx !== lastTickIndex) {
      lastTickIndex = idx;
      group.classList.add('is-pulso');
      setTimeout(() => group.classList.remove('is-pulso'), 200);
    }
  });

  function settle(e) {
    if (!dragging) return;
    dragging = false;
    group.classList.remove('is-arrastando');
    if (e?.pointerId !== undefined) {
      try { group.releasePointerCapture(e.pointerId); } catch { /* já liberado */ }
    }

    rotation = Math.round(rotation / slotAngle) * slotAngle;
    group.classList.add('is-snapping');
    applyRotation();
    setTimeout(() => group.classList.remove('is-snapping'), SNAP_MS);

    onSettle(topIndexFor(rotation));
  }

  group.addEventListener('pointerup', settle);
  group.addEventListener('pointercancel', settle);

  group.addEventListener('keydown', (e) => {
    if (locked) return;
    const step = e.key === 'ArrowLeft' ? -slotAngle : e.key === 'ArrowRight' ? slotAngle : 0;
    if (!step) return;
    e.preventDefault();
    rotation += step;
    group.classList.add('is-snapping');
    applyRotation();
    setTimeout(() => group.classList.remove('is-snapping'), SNAP_MS);
    onSettle(topIndexFor(rotation));
  });

  return {
    el: group,
    initialIndex: topIndexFor(0),
    lock() {
      locked = true;
      group.classList.add('is-travado');
      group.setAttribute('tabindex', '-1');
    },
  };
}

// -------------------------------------------------------------- marcador ----

function buildMarker() {
  const g = svg('g', { class: 'astro-marcador' });

  g.appendChild(svg('polygon', {
    points: starPoints(CX, 30, 17, 6.5, 8),
    class: 'astro-marcador__estrela',
  }));
  g.appendChild(svg('circle', { cx: CX, cy: 30, r: 3.4, class: 'astro-marcador__nucleo' }));
  g.appendChild(svg('path', {
    d: `M ${CX - 7} 44 Q ${CX} 52 ${CX + 7} 44 Q ${CX} 70 ${CX - 7} 44 Z`,
    class: 'astro-marcador__ponteiro',
  }));

  return g;
}

function buildHub() {
  const g = svg('g', { class: 'astro-nucleo' });
  g.appendChild(svg('circle', { cx: CX, cy: CY, r: 54, class: 'astro-nucleo__disco' }));
  g.appendChild(svg('circle', { cx: CX, cy: CY, r: 44, class: 'astro-nucleo__aro' }));
  g.appendChild(svg('polygon', {
    points: starPoints(CX, CY, 26, 9, 8),
    class: 'astro-nucleo__estrela',
  }));
  g.appendChild(svg('circle', { cx: CX, cy: CY, r: 62, class: 'astro-nucleo__halo' }));
  return g;
}

// ----------------------------------------------------------------- tela -----

export function renderCover(appRoot, book, { onOpen }) {
  appRoot.innerHTML = '';

  if (!book.coverTargetPayload) {
    throw new Error('config/story.config.js: book.coverTargetPayload é obrigatório (data-alvo do astrolábio).');
  }
  const [alvoDia, alvoMes, alvoAno] = decodeAnswer(book.coverTargetPayload).split('|');
  const targets = [
    DIAS.indexOf(String(Number(alvoDia))),
    MESES.indexOf(toRoman(Number(alvoMes))),
    ANOS.indexOf(String(Number(alvoAno))),
  ];
  if (targets.some((t) => t < 0)) {
    throw new Error('book.coverTargetPayload aponta para um valor fora dos anéis (dia 1-31, mês 1-12, ano 1998-2010).');
  }

  const wrap = document.createElement('div');
  wrap.className = 'tela-capa';

  const titulo = document.createElement('h1');
  titulo.className = 'tela-capa__nome';
  titulo.textContent = book.bookTitle;

  const palco = document.createElement('div');
  palco.className = 'astro-palco';

  const root = svg('svg', {
    class: 'astro',
    viewBox: '0 0 400 400',
    role: 'group',
    'aria-label': 'Astrolábio: alinhe dia, mês e ano',
  });
  root.appendChild(buildDefs());

  const current = [];
  const rings = [];
  let solved = false;

  function checkAlignment() {
    if (solved) return;
    if (!targets.every((t, i) => current[i] === t)) return;
    solved = true;

    rings.forEach((r) => r.lock());
    palco.classList.add('is-alinhado');
    burstParticles(palco, { count: 30 });

    setTimeout(() => {
      wrap.classList.add('is-saindo');
      setTimeout(() => {
        wrap.remove();
        onOpen?.();
      }, FADE_OUT_MS);
    }, WIN_HOLD_MS);
  }

  RINGS.forEach((config, index) => {
    const ring = buildRing(config, (topIndex) => {
      current[index] = topIndex;
      checkAlignment();
    });
    current[index] = ring.initialIndex;
    rings.push(ring);
    root.appendChild(ring.el);
  });

  root.appendChild(buildHub());
  root.appendChild(buildMarker());

  palco.appendChild(root);

  const dica = document.createElement('p');
  dica.className = 'tela-capa__dica';
  dica.textContent = book.coverHint || '';

  wrap.append(titulo, palco, dica);
  appRoot.appendChild(wrap);

  return wrap;
}
