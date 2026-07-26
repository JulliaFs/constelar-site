import { buildPageShell } from '../components/page-shell.js';

/** Terminal screen shown once every built chapter is complete. */
export function renderComingSoon(appRoot, comingSoon) {
  const { outerEl, contentEl } = buildPageShell({ sky: { nebulaTint: 0.08 } });

  const rotulo = document.createElement('div');
  rotulo.className = 'txt-rotulo';
  rotulo.textContent = comingSoon.eyebrow || 'próximo capítulo';

  const titulo = document.createElement('h1');
  titulo.className = 'txt-capitulo';
  titulo.textContent = comingSoon.title;

  const corpo = document.createElement('div');
  corpo.className = 'txt-corpo';
  corpo.innerHTML = (comingSoon.body || []).map((p) => `<p>${p}</p>`).join('');

  contentEl.append(rotulo, titulo, corpo);
  appRoot.appendChild(outerEl);
  return outerEl;
}
