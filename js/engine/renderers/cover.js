// Game-style title screen: "Começar" on a bare starfield, no page-shell
// frame (the frame represents an open page; this is the title, not a
// page). Clicking plays a parchment-scroll unroll before the hub appears.

const FADE_OUT_MS = 420; // must match --dur-padrao in css/tokens.css
const UNROLL_MS = 900; // must match pergaminhoDesenrola in css/screens.css

export function renderCover(appRoot, book, { onOpen }) {
  appRoot.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'tela-titulo';

  const titulo = document.createElement('div');
  titulo.className = 'tela-titulo__bloco';
  titulo.innerHTML = `
    <div class="emblema-principal" role="presentation"></div>
    <h1 class="tela-titulo__nome">${book.bookTitle}</h1>
    <button type="button" class="btn-cta tela-titulo__comecar">
      <span class="fagulha"></span><span>${book.startLabel || 'Começar'}</span>
    </button>
  `;

  wrap.appendChild(titulo);
  appRoot.appendChild(wrap);

  let opened = false;
  function open() {
    if (opened) return;
    opened = true;

    titulo.classList.add('is-saindo');
    setTimeout(() => {
      titulo.remove();
      mountPergaminho(wrap);
      setTimeout(() => {
        wrap.remove();
        onOpen?.();
      }, UNROLL_MS);
    }, FADE_OUT_MS);
  }

  titulo.querySelector('.tela-titulo__comecar').addEventListener('click', open);

  return wrap;
}

function mountPergaminho(wrap) {
  const pergaminho = document.createElement('div');
  pergaminho.className = 'pergaminho-abertura';
  pergaminho.innerHTML = `
    <div class="pergaminho-superficie"></div>
    <div class="pergaminho-rolo pergaminho-rolo--topo"></div>
    <div class="pergaminho-rolo pergaminho-rolo--base"></div>
  `;
  wrap.appendChild(pergaminho);
  // Force reflow so the animation class change is picked up as a transition, not a jump.
  void pergaminho.offsetWidth;
  pergaminho.classList.add('is-desenrolando');
  return pergaminho;
}
