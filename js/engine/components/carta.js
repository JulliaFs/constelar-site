import { isEditMode, ativarEdicaoCarta } from '../edit-mode.js';

/**
 * A carta: aparece fechada logo depois que o selo de cera se rompe. A
 * leitora clica para abrir e ler; fechar é o que conclui o capítulo
 * (mesmo contrato `onComplete` que todos os renderers já usam).
 *
 * O primeiro parágrafo recebe uma capitular iluminada (drop cap) via
 * `::first-letter` no CSS — nada de marcação especial no conteúdo, então
 * o texto continua sendo texto puro no arquivo de dados.
 *
 * `chapter` só é usado pelo modo editor (para exportar o config do
 * capítulo); no modo normal ele é ignorado.
 *
 * @param {{titulo?: string, paragraphs: string[], closeLabel?: string, chapter?: object, onClose: () => void}} opts
 * @returns {{el: HTMLElement, open: () => void}}
 */
export function buildCarta({ titulo, paragraphs, closeLabel, chapter, onClose }) {
  const area = document.createElement('div');
  area.className = 'carta-area';

  const wrap = document.createElement('div');
  wrap.className = 'carta-wrap';
  wrap.setAttribute('role', 'button');
  wrap.setAttribute('tabindex', '0');
  wrap.setAttribute('aria-label', 'Abrir a carta');
  wrap.innerHTML = `
    <div class="carta-corpo"></div>
    <div class="carta-selo-mini"></div>
  `;

  const legenda = document.createElement('div');
  legenda.className = 'carta-legenda txt-rotulo';
  legenda.textContent = 'Abrir a carta';

  area.append(wrap, legenda);

  function openLetter() {
    area.innerHTML = '';
    const aberta = document.createElement('div');
    aberta.className = 'carta-aberta';
    aberta.innerHTML = `
      <div class="carta-aberta__pergaminho">
        <span class="carta-aberta__canto carta-aberta__canto--tl"></span>
        <span class="carta-aberta__canto carta-aberta__canto--tr"></span>
        <span class="carta-aberta__canto carta-aberta__canto--bl"></span>
        <span class="carta-aberta__canto carta-aberta__canto--br"></span>
        ${titulo ? `<h2 class="carta-aberta__titulo">${titulo}</h2>` : ''}
        <div class="carta-aberta__texto">
          ${paragraphs.map((p, i) => `<p data-linha style="animation-delay:${i * 140}ms">${p}</p>`).join('')}
        </div>
      </div>
      <button type="button" class="btn-cta btn-cta--nouveau carta-aberta__fechar">
        <span class="fagulha"></span><span>${closeLabel || 'Fechar'}</span>
      </button>
    `;
    area.appendChild(aberta);

    // Reflow forçado em vez de requestAnimationFrame: rAF não roda em aba
    // em segundo plano, e a carta não pode ficar presa invisível.
    void aberta.offsetWidth;
    aberta.classList.add('visivel');

    aberta.querySelector('.carta-aberta__fechar').addEventListener('click', () => onClose?.());

    // Só no modo editor: textos editáveis + barra de ferramentas.
    if (isEditMode()) {
      ativarEdicaoCarta({
        painel: aberta.querySelector('.carta-aberta__pergaminho'),
        tituloEl: aberta.querySelector('.carta-aberta__titulo'),
        textoEl: aberta.querySelector('.carta-aberta__texto'),
        chapter,
      });
    }
  }

  wrap.addEventListener('click', openLetter);
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLetter();
    }
  });

  return { el: area, open: openLetter };
}
