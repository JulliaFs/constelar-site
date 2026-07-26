import { buildPageShell } from '../components/page-shell.js';
import { buildCtaButton } from '../components/cta-button.js';
import { createMediaElement } from '../../utils/media-fallback.js';

export function renderNarrative(appRoot, chapter, { onComplete }) {
  if (!chapter.body) {
    throw new Error(`Capítulo narrativo "${chapter.id}" precisa do campo "body".`);
  }

  const { outerEl, contentEl } = buildPageShell({ sky: chapter.sky });

  const titulo = document.createElement('h1');
  titulo.className = 'txt-capitulo';
  titulo.textContent = chapter.title;

  const corpo = document.createElement('div');
  corpo.className = 'txt-corpo';
  corpo.innerHTML = chapter.body.map((p) => `<p>${p}</p>`).join('');

  contentEl.append(titulo, corpo);

  if (chapter.images?.length) {
    const galeria = document.createElement('div');
    galeria.className = 'tela-narrativa__imagens';
    for (const img of chapter.images) {
      const figure = document.createElement('figure');
      const el = createMediaElement({
        src: img.src,
        alt: img.alt || '',
        className: 'tela-narrativa__imagem',
      });
      figure.appendChild(el);
      if (img.caption) {
        const legenda = document.createElement('figcaption');
        legenda.className = 'tela-narrativa__legenda';
        legenda.textContent = img.caption;
        figure.appendChild(legenda);
      }
      galeria.appendChild(figure);
    }
    contentEl.appendChild(galeria);
  }

  const btn = buildCtaButton(chapter.advanceLabel || 'Continuar', onComplete);
  contentEl.appendChild(btn);

  appRoot.appendChild(outerEl);
  return outerEl;
}
