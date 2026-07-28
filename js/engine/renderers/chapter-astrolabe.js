import { buildPageShell } from '../components/page-shell.js';
import { buildWaxSeal } from '../components/wax-seal.js';
import { buildCarta } from '../components/carta.js';
import { burstParticles } from '../components/particle-burst.js';

const SNAP_MS = 300;

const SYMBOL_CYCLE = ['sol', 'lua', 'estrela', 'constelacao'];

function symbolMarkup(type) {
  switch (type) {
    case 'sol':
      return '<span class="glifo-sol"></span>';
    case 'lua':
      return '<span class="glifo-lua"></span>';
    case 'constelacao':
      return `<svg class="glifo-constelacao" viewBox="0 0 20 20" width="14" height="14">
        <line x1="3" y1="16" x2="10" y2="5" stroke="var(--cor-estelar)" stroke-width="1" />
        <line x1="10" y1="5" x2="17" y2="12" stroke="var(--cor-estelar)" stroke-width="1" />
        <circle cx="3" cy="16" r="1.4" fill="var(--cor-ouro-300)" />
        <circle cx="10" cy="5" r="1.4" fill="var(--cor-ouro-300)" />
        <circle cx="17" cy="12" r="1.4" fill="var(--cor-ouro-300)" />
      </svg>`;
    case 'estrela':
    default:
      return '<span class="fagulha" style="width:12px;height:12px;"></span>';
  }
}

/**
 * Builds one draggable ring. Symbols are placed via the "clock numeral"
 * CSS technique (a full-size wrapper rotated per slot, content pinned to
 * its top edge) — purely CSS, responsive, no per-slot pixel math.
 *
 * @param {{id:string, slots:number, targetSlot:number}} ringConfig
 * @param {(slotIndex:number) => void} onSettle - called after every snap
 * @returns {HTMLElement}
 */
function buildRing(ringConfig, onSettle) {
  const { slots } = ringConfig;
  const ring = document.createElement('div');
  ring.className = `astrolabio__anel astrolabio__anel--${ringConfig.id}`;
  ring.style.setProperty('--rot', '0deg');
  ring.setAttribute('role', 'slider');
  ring.setAttribute('tabindex', '0');
  ring.setAttribute('aria-label', `Disco ${ringConfig.id}`);
  ring.style.touchAction = 'none';

  for (let i = 0; i < slots; i++) {
    const slot = document.createElement('div');
    slot.className = 'astrolabio__slot';
    slot.style.setProperty('--ang', `${(360 / slots) * i}deg`);
    slot.innerHTML = symbolMarkup(SYMBOL_CYCLE[i % SYMBOL_CYCLE.length]);
    ring.appendChild(slot);
  }

  let rotation = 0; // degrees, JS-tracked source of truth
  let dragging = false;
  let startAngle = 0;
  let lastBoundary = 0;

  function centerOf(el) {
    const rect = el.getBoundingClientRect();
    return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
  }

  function angleAt(clientX, clientY) {
    const { cx, cy } = centerOf(ring);
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
  }

  function normalizeSlot(rawSlotIndex) {
    return ((rawSlotIndex % slots) + slots) % slots;
  }

  ring.addEventListener('pointerdown', (e) => {
    dragging = true;
    startAngle = angleAt(e.clientX, e.clientY);
    ring.classList.remove('is-snapping');
    // Capture is a nice-to-have (keeps tracking if the pointer leaves the
    // element mid-drag) — its failure must never break the angle tracking
    // above, which is the part that actually matters.
    try { ring.setPointerCapture(e.pointerId); } catch { /* not a capturable pointer */ }
  });

  ring.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const angle = angleAt(e.clientX, e.clientY);
    const delta = angle - startAngle;
    rotation += delta;
    startAngle = angle;
    ring.style.setProperty('--rot', `${rotation}deg`);

    const slotAngle = 360 / slots;
    const boundary = Math.floor(rotation / slotAngle);
    if (boundary !== lastBoundary) {
      lastBoundary = boundary;
      ring.classList.add('is-pulso');
      setTimeout(() => ring.classList.remove('is-pulso'), 220);
    }
  });

  function settle(e) {
    if (!dragging) return;
    dragging = false;
    if (e?.pointerId !== undefined) {
      try { ring.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    }

    const slotAngle = 360 / slots;
    const nearestSlot = Math.round(rotation / slotAngle);
    rotation = nearestSlot * slotAngle;

    ring.classList.add('is-snapping');
    ring.style.setProperty('--rot', `${rotation}deg`);
    setTimeout(() => ring.classList.remove('is-snapping'), SNAP_MS);

    onSettle(normalizeSlot(nearestSlot));
  }

  ring.addEventListener('pointerup', settle);
  ring.addEventListener('pointercancel', settle);

  return ring;
}

/**
 * @param {HTMLElement} appRoot
 * @param {object} chapter
 * @param {{solved?: boolean, sealBroken?: boolean}|undefined} resume
 * @param {{onSolved: () => void, onSealBroken: () => void, onComplete: () => void}} handlers
 */
export function renderAstrolabe(appRoot, chapter, resume, { onSolved, onSealBroken, onComplete }) {
  if (!chapter.astrolabe?.rings?.length) {
    throw new Error(`Capítulo astrolábio "${chapter.id}" precisa do campo "astrolabe.rings".`);
  }
  if (!chapter.reveal?.paragraphs) {
    throw new Error(`Capítulo astrolábio "${chapter.id}" precisa do campo "reveal.paragraphs".`);
  }

  const { outerEl, contentEl } = buildPageShell({ sky: chapter.sky });

  const titulo = document.createElement('h1');
  titulo.className = 'txt-capitulo';
  titulo.textContent = chapter.title;
  contentEl.appendChild(titulo);

  if (chapter.intro?.length) {
    const intro = document.createElement('div');
    intro.className = 'txt-corpo';
    intro.innerHTML = chapter.intro.map((p) => `<p>${p}</p>`).join('');
    contentEl.appendChild(intro);
  }

  const stage = document.createElement('div');
  stage.className = 'tela-enigma__corpo';
  contentEl.appendChild(stage);

  function showAstrolabeStage() {
    stage.innerHTML = '';

    const astrolabio = document.createElement('div');
    astrolabio.className = 'astrolabio';

    const centro = document.createElement('div');
    centro.className = 'astrolabio__centro';
    astrolabio.appendChild(centro);

    const currentSlots = new Array(chapter.astrolabe.rings.length).fill(0);

    chapter.astrolabe.rings.forEach((ringConfig, index) => {
      const ring = buildRing(ringConfig, (slotIndex) => {
        currentSlots[index] = slotIndex;
        checkAlignment();
      });
      astrolabio.appendChild(ring);
    });

    stage.appendChild(astrolabio);

    function checkAlignment() {
      const aligned = chapter.astrolabe.rings.every((r, i) => currentSlots[i] === r.targetSlot);
      if (!aligned) return;

      astrolabio.classList.add('is-alinhado');
      burstParticles(astrolabio, { originXPercent: 50, originYPercent: 50, count: 26 });
      onSolved?.();

      setTimeout(() => {
        stage.innerHTML = '';
        showSolvedStage({ freshlySolved: true });
      }, 1100);
    }
  }

  function showSolvedStage({ freshlySolved = false } = {}) {
    stage.innerHTML = '';
    const seal = buildWaxSeal({
      onBreak: () => onSealBroken?.(),
      onRevealed: showCartaStage,
    });
    stage.appendChild(seal.el);
    if (freshlySolved) {
      seal.stampIn();
    } else {
      seal.el.querySelector('.selo-wrap')?.classList.add('is-entrando');
    }
  }

  function showCartaStage() {
    stage.innerHTML = '';
    const carta = buildCarta({
      titulo: chapter.reveal.title,
      paragraphs: chapter.reveal.paragraphs,
      closeLabel: chapter.reveal.continueLabel,
      onClose: onComplete,
    });
    stage.appendChild(carta.el);
  }

  if (resume?.sealBroken) {
    showCartaStage();
  } else if (resume?.solved) {
    showSolvedStage({ freshlySolved: false });
  } else {
    showAstrolabeStage();
  }

  appRoot.appendChild(outerEl);
  return outerEl;
}
