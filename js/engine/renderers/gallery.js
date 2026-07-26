import { buildPageShell } from '../components/page-shell.js';
import { buildCtaButton } from '../components/cta-button.js';
import { createMediaElement } from '../../utils/media-fallback.js';

export function renderGallery(appRoot, chapter, { onComplete }) {
  if (!chapter.media?.length) {
    throw new Error(`Capítulo galeria "${chapter.id}" precisa de ao menos um item em "media".`);
  }

  const { outerEl, contentEl } = buildPageShell({ sky: chapter.sky });

  const titulo = document.createElement('h1');
  titulo.className = 'txt-capitulo';
  titulo.textContent = chapter.title;

  const grade = document.createElement('div');
  grade.className = 'tela-galeria__grade';

  for (const item of chapter.media) {
    const wrap = document.createElement('figure');
    wrap.className = 'tela-galeria__item';

    const el = createMediaElement({
      src: item.src,
      alt: item.caption || '',
      className: 'tela-galeria__midia',
    });
    wrap.appendChild(el);

    if (item.caption) {
      const legenda = document.createElement('figcaption');
      legenda.className = 'tela-galeria__legenda';
      legenda.textContent = item.caption;
      wrap.appendChild(legenda);
    }

    grade.appendChild(wrap);
  }

  const btn = buildCtaButton(chapter.advanceLabel || 'Continuar', onComplete);

  contentEl.append(titulo, grade, btn);
  appRoot.appendChild(outerEl);
  return outerEl;
}
