import { buildPageShell } from '../components/page-shell.js';
import { buildConstellation } from '../components/constellation.js';

const COMING_SOON_ID = '__coming_soon__';

/**
 * The star-map hub. Only the "current" node (next incomplete chapter,
 * or the trailing coming-soon node once every built chapter is done)
 * is clickable — never-skippable is enforced here, not just by the
 * caller not offering a way to reach later chapters.
 *
 * @param {HTMLElement} appRoot
 * @param {{chapterIds: string[], completedIds: string[], currentChapterId: string|null, lightUpId?: string|null, comingSoon: {title:string, body:string[]}}} data
 * @param {{onSelectChapter: (id:string, origin:{x:number,y:number}) => void, onSelectComingSoon: (origin:{x:number,y:number}) => void}} handlers
 */
export function renderHub(appRoot, data, { onSelectChapter, onSelectComingSoon }) {
  const { outerEl, contentEl } = buildPageShell({ sky: { nebulaTint: 0.12 } });

  const rotulo = document.createElement('div');
  rotulo.className = 'txt-rotulo';
  rotulo.textContent = 'sua constelação';

  const allIds = [...data.chapterIds, COMING_SOON_ID];
  const effectiveCurrentId = data.currentChapterId ?? COMING_SOON_ID;

  const mapa = document.createElement('div');
  mapa.className = 'tela-mapa';

  const constelacao = buildConstellation({
    size: 'large',
    ids: allIds,
    completedIds: data.completedIds,
    currentId: effectiveCurrentId,
    lightUpId: data.lightUpId ?? null,
    onSelect: (id, origin) => {
      if (id === COMING_SOON_ID) {
        onSelectComingSoon(origin);
      } else {
        onSelectChapter(id, origin);
      }
    },
  });
  constelacao.classList.add('tela-mapa__constelacao');

  const legenda = document.createElement('div');
  legenda.className = 'tela-mapa__legenda';
  legenda.innerHTML = `
    <span class="tela-mapa__legenda-item txt-nota"><span class="fagulha"></span> disponível</span>
    <span class="tela-mapa__legenda-item txt-nota"><span class="fagulha" style="opacity:.3"></span> bloqueado</span>
  `;

  mapa.append(rotulo, constelacao, legenda);
  contentEl.appendChild(mapa);
  appRoot.appendChild(outerEl);

  return outerEl;
}
