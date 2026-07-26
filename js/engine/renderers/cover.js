// The cover is the closed grimoire itself, not a "page" — it sits
// directly on the starfield/particles background with no page-shell
// frame (the frame represents an open page, the cover is the object).

const OPEN_DURATION_MS = 900; // must match livroAbre in css/screens.css

export function renderCover(appRoot, book, { onOpen }) {
  appRoot.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'tela-capa';

  const livro = document.createElement('div');
  livro.className = 'capa-livro';
  livro.setAttribute('role', 'button');
  livro.setAttribute('tabindex', '0');
  livro.setAttribute('aria-label', book.openBookLabel || 'Abrir o grimório');
  livro.innerHTML = `
    <div class="capa-livro__lombada"></div>
    <div class="capa-livro__moldura"></div>
    <div class="emblema-principal" role="presentation"></div>
    <div class="capa-livro__titulo">${book.bookTitle}</div>
    <span class="txt-rotulo">${book.openBookLabel || 'Abrir o grimório'}</span>
  `;

  const dica = document.createElement('p');
  dica.className = 'tela-capa__dica txt-corpo';
  dica.textContent = book.coverHint || '';

  wrap.append(livro, dica);
  appRoot.appendChild(wrap);

  let opened = false;
  function open() {
    if (opened) return;
    opened = true;
    livro.classList.add('is-abrindo');
    setTimeout(() => {
      wrap.remove();
      onOpen?.();
    }, OPEN_DURATION_MS);
  }

  livro.addEventListener('click', open);
  livro.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });

  return wrap;
}
