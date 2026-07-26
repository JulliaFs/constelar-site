import { buildCornerOrnament } from './corner-ornament.js';

/**
 * Builds the outer "page" shell reused by every screen: border/shadow,
 * sky gradient layer, star-dust layer, inset frame line, and the 4
 * corner ornaments — all pinned to the OUTER element so they stay
 * static during the page-turn 3D flip, which only rotates `contentEl`.
 *
 * @param {{sky?: {centerX?: string, centerY?: string, nebulaTint?: number}}} opts
 * @returns {{outerEl: HTMLElement, contentEl: HTMLElement}}
 */
export function buildPageShell({ sky = {} } = {}) {
  const outerEl = document.createElement('section');
  outerEl.className = 'pagina';
  outerEl.style.setProperty('--ceu-x', sky.centerX || '50%');
  outerEl.style.setProperty('--ceu-y', sky.centerY || '46%');
  outerEl.style.setProperty('--nebulosa-opacidade', String(sky.nebulaTint ?? 0));

  const ceu = document.createElement('div');
  ceu.className = 'pagina__ceu';

  const nebulosa = document.createElement('div');
  nebulosa.className = 'pagina__nebulosa';

  const estrelas = document.createElement('div');
  estrelas.className = 'pagina__estrelas';

  const moldura = document.createElement('div');
  moldura.className = 'pagina__moldura';

  const dobra = document.createElement('div');
  dobra.className = 'pagina__dobra';

  const contentEl = document.createElement('div');
  contentEl.className = 'pagina__conteudo';

  outerEl.append(
    ceu,
    nebulosa,
    estrelas,
    moldura,
    buildCornerOrnament('tl'),
    buildCornerOrnament('tr'),
    buildCornerOrnament('bl'),
    buildCornerOrnament('br'),
    contentEl,
    dobra,
  );

  return { outerEl, contentEl };
}
