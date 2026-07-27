/**
 * The letter/card reveal: appears (closed) right after a wax seal
 * breaks. The reader clicks it to open and read the real content;
 * closing it is what completes the chapter (same `onComplete`
 * contract every renderer already uses).
 *
 * @param {{paragraphs: string[], closeLabel?: string, onClose: () => void}} opts
 * @returns {{el: HTMLElement, open: () => void}}
 */
export function buildCarta({ paragraphs, closeLabel, onClose }) {
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
      <div class="carta-aberta__pergaminho txt-corpo">
        ${paragraphs.map((p, i) => `<p data-linha style="animation-delay:${i * 140}ms">${p}</p>`).join('')}
      </div>
      <button type="button" class="btn-cta carta-aberta__fechar">${closeLabel || 'Fechar'}</button>
    `;
    area.appendChild(aberta);

    requestAnimationFrame(() => aberta.classList.add('visivel'));

    aberta.querySelector('.carta-aberta__fechar').addEventListener('click', () => onClose?.());
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
