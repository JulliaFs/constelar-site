// ============================================================================
// SELO DE CERA — o gesto que abre a carta.
//
// Cera rubi envelhecida com reflexo de bronze, bordas orgânicas e um
// símbolo celestial (lua + estrela de 8 pontas) gravado no centro. Ao
// clicar: uma fissura se desenha, o selo se parte por ela e uma chuva de
// partículas douradas/rubi se dispersa.
// ============================================================================

import { burstParticles, PALETA_LACRE } from './particle-burst.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const MS_FISSURA = 320; // deve casar com fissuraAbre (components.css)
const MS_QUEBRA = 900;  // deve casar com seloEsquerda/seloDireita

function starPoints(cx, cy, outerR, innerR, points) {
  const out = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const rad = (((180 / points) * i - 90) * Math.PI) / 180;
    out.push(`${(cx + r * Math.cos(rad)).toFixed(2)},${(cy + r * Math.sin(rad)).toFixed(2)}`);
  }
  return out.join(' ');
}

/** O símbolo gravado no centro do selo (baixo-relevo na cera). */
function buildEmblema() {
  const el = document.createElementNS(SVG_NS, 'svg');
  el.setAttribute('class', 'selo-emblema');
  el.setAttribute('viewBox', '0 0 100 100');
  el.setAttribute('aria-hidden', 'true');

  const lua = document.createElementNS(SVG_NS, 'path');
  // Crescente: um círculo "mordido" por outro.
  lua.setAttribute('d', 'M50 22 A28 28 0 1 0 50 78 A22 22 0 1 1 50 22 Z');
  lua.setAttribute('class', 'selo-emblema__lua');
  el.appendChild(lua);

  const estrela = document.createElementNS(SVG_NS, 'polygon');
  estrela.setAttribute('points', starPoints(62, 44, 15, 5, 8));
  estrela.setAttribute('class', 'selo-emblema__estrela');
  el.appendChild(estrela);

  return el;
}

/** A linha da fissura, que se desenha antes do selo se partir. */
function buildFissura() {
  const el = document.createElementNS(SVG_NS, 'svg');
  el.setAttribute('class', 'selo-fissura');
  el.setAttribute('viewBox', '0 0 100 100');
  el.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M50 -2 L46 18 L55 34 L44 52 L54 70 L47 86 L51 102');
  path.setAttribute('class', 'selo-fissura__traco');
  el.appendChild(path);

  return el;
}

/**
 * `onBreak` dispara assim que o selo cede (bom para salvar progresso).
 * `onRevealed` só dispara quando a quebra termina de animar — quem troca
 * a tela deve usar este, senão a carta apaga o selo e as partículas antes
 * de elas aparecerem.
 *
 * @param {{onBreak?: () => void, onRevealed?: () => void, size?: 'normal'|'grande', label?: string}} opts
 * @returns {{el: HTMLElement, stampIn: () => void}}
 */
export function buildWaxSeal({ onBreak, onRevealed, size = 'normal', label } = {}) {
  const container = document.createElement('div');
  container.className = 'selo-area';

  const wrap = document.createElement('div');
  wrap.className = size === 'grande' ? 'selo-wrap selo-wrap--grande' : 'selo-wrap';
  wrap.setAttribute('role', 'button');
  wrap.setAttribute('tabindex', '0');
  wrap.setAttribute('aria-label', label || 'Quebrar o lacre');

  const halo = document.createElement('div');
  halo.className = 'selo-halo';

  // Duas metades recortadas pela mesma linha em ziguezague da fissura:
  // ao se afastarem, a borda quebrada encaixa perfeitamente.
  const metadeEsq = document.createElement('div');
  metadeEsq.className = 'selo-corpo selo-metade--esq';
  metadeEsq.append(buildEmblema());

  const metadeDir = document.createElement('div');
  metadeDir.className = 'selo-corpo selo-metade--dir';
  metadeDir.append(buildEmblema());

  wrap.append(halo, metadeEsq, metadeDir, buildFissura());

  const legenda = document.createElement('div');
  legenda.className = 'selo-legenda txt-rotulo';
  legenda.textContent = label || 'Quebrar o lacre';

  container.append(wrap, legenda);

  let broken = false;
  function attemptBreak() {
    if (broken) return;
    broken = true;

    // 1) a fissura se desenha  2) o selo se parte  3) as partículas voam
    wrap.classList.add('is-rachando');
    legenda.classList.add('is-saindo');

    setTimeout(() => {
      wrap.classList.add('is-quebrado');
      burstParticles(container, { count: 28, colors: PALETA_LACRE, spread: 130 });
      onBreak?.();
      // Só depois da quebra terminar é que a tela pode ser trocada.
      setTimeout(() => onRevealed?.(), MS_QUEBRA);
    }, MS_FISSURA);
  }

  wrap.addEventListener('click', attemptBreak);
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      attemptBreak();
    }
  });

  return {
    el: container,
    stampIn() {
      wrap.classList.add('is-entrando');
    },
  };
}
