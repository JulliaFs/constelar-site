import { chapters, comingSoon } from '../../../config/story.config.js';
import { buildStarMap } from '../components/star-map.js';

const COMING_SOON_ID = '__coming_soon__';

/**
 * O mapa celeste. Só o nó "atual" (próximo capítulo incompleto, ou o nó
 * final "em construção" quando todos já foram feitos) é clicável — a regra
 * de não pular capítulos é aplicada aqui, não só por omissão de caminho.
 *
 * Os títulos vêm do MANIFESTO (config/story.config.js), nunca dos módulos
 * de capítulo: o mapa não pode importar o conteúdo de um capítulo que a
 * leitora ainda não alcançou.
 *
 * @param {HTMLElement} appRoot
 * @param {{chapterIds: string[], completedIds: string[], currentChapterId: string|null, lightUpId?: string|null}} data
 * @param {{onSelectChapter: (id:string, origin:{x:number,y:number}) => void, onSelectComingSoon: (origin:{x:number,y:number}) => void}} handlers
 */
export function renderHub(appRoot, data, { onSelectChapter, onSelectComingSoon }) {
  const completos = new Set(data.completedIds);
  const idAtual = data.currentChapterId ?? COMING_SOON_ID;

  const meta = new Map(chapters.map((c) => [c.id, c.mapa || {}]));
  meta.set(COMING_SOON_ID, {
    titulo: comingSoon.title,
    subtitulo: comingSoon.mapaSubtitulo,
  });

  const estadoDe = (id) => {
    if (completos.has(id)) return 'completo';
    if (id === idAtual) return 'atual';
    return 'bloqueado';
  };

  const nodes = [...data.chapterIds, COMING_SOON_ID].map((id) => ({
    id,
    state: estadoDe(id),
    titulo: meta.get(id)?.titulo || '',
    subtitulo: meta.get(id)?.subtitulo || '',
  }));

  const mapa = buildStarMap({
    nodes,
    lightUpId: data.lightUpId ?? null,
    onSelect: (id, origin) => {
      if (id === COMING_SOON_ID) {
        onSelectComingSoon(origin);
      } else {
        onSelectChapter(id, origin);
      }
    },
  });

  const titulo = document.createElement('p');
  titulo.className = 'mapa-ceu__rotulo';
  titulo.textContent = 'sua constelação';
  mapa.el.appendChild(titulo);

  appRoot.appendChild(mapa.el);
  mapa.mount(); // precisa do elemento já no DOM para medir e traçar as linhas
  return mapa.el;
}
