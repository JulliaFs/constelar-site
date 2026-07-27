import { buildPageShell } from '../components/page-shell.js';
import { buildConstellation } from '../components/constellation.js';

const DARKEN_DURATION_MS = 900; // must match --dur-cena in css/tokens.css

/**
 * The bespoke ending sequence played after the last chapter's carta is
 * closed, instead of the normal page-turn-back-to-hub. Terminal screen —
 * does not return to the hub (only the dev "Início" shortcut escapes it).
 *
 * @param {HTMLElement} outgoingOuterEl - the currently-mounted `.pagina`
 * @param {{appRoot: HTMLElement, finale: object, chapterIds: string[]}} opts
 */
export function playFinale(outgoingOuterEl, { appRoot, finale, chapterIds }) {
  outgoingOuterEl.classList.add('is-escurecendo');

  setTimeout(() => {
    outgoingOuterEl.remove();
    mountFinaleScreen(appRoot, finale, chapterIds);
  }, DARKEN_DURATION_MS);
}

function mountFinaleScreen(appRoot, finale, chapterIds) {
  const { outerEl, contentEl } = buildPageShell({ sky: { nebulaTint: 0.15 } });
  contentEl.classList.add('tela-finale');

  const constelacao = buildConstellation({
    size: 'large',
    ids: chapterIds,
    completedIds: chapterIds,
    currentId: null,
  });
  constelacao.classList.add('constelacao--finale');

  const mensagem = document.createElement('p');
  mensagem.className = 'txt-capitulo tela-finale__mensagem';
  mensagem.textContent = finale.message;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn-cta';
  btn.innerHTML = `<span class="fagulha"></span><span>${finale.buttonLabel}</span>`;
  btn.addEventListener('click', () => showTeaser(contentEl, finale));

  contentEl.append(constelacao, mensagem, btn);
  appRoot.appendChild(outerEl);
  return outerEl;
}

function showTeaser(contentEl, finale) {
  contentEl.innerHTML = '';
  contentEl.classList.add('tela-teaser');

  const corpo = document.createElement('div');
  corpo.className = 'txt-corpo tela-teaser__corpo';
  const teaserLines = Array.isArray(finale.teaser) ? finale.teaser : [finale.teaser];
  corpo.innerHTML = teaserLines.map((p) => `<p>${p}</p>`).join('');

  contentEl.appendChild(corpo);
  requestAnimationFrame(() => contentEl.classList.add('visivel'));
}
