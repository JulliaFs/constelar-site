// 3D page-turn: plays when a chapter completes and the reader returns
// to the hub. Only the content plane rotates (perspective + rotateY);
// the outer shell's corner ornaments stay static throughout.

const DURATION_MS = 900; // must match --dur-cena in css/tokens.css

/**
 * @param {HTMLElement} outgoingOuterEl - the currently-mounted `.pagina`
 * @param {() => (HTMLElement|Promise<HTMLElement>)} mountNext - builds + appends the next screen, returns its outer `.pagina`
 */
export function playPageTurn(outgoingOuterEl, mountNext) {
  const outgoingContent = outgoingOuterEl.querySelector('.pagina__conteudo');
  outgoingOuterEl.classList.add('is-virando');
  outgoingContent?.classList.add('is-saindo');

  setTimeout(async () => {
    outgoingOuterEl.remove();

    const nextOuterEl = await mountNext();
    const nextContent = nextOuterEl.querySelector('.pagina__conteudo');
    nextContent?.classList.add('is-entrando');
    nextContent?.addEventListener('animationend', () => {
      nextContent.classList.remove('is-entrando');
    }, { once: true });
  }, DURATION_MS);
}
