// Zoom-in-on-star: plays when the reader clicks the one available
// star on the hub map, zooming toward the clicked node before its
// chapter's content appears.

const DURATION_MS = 560; // must match the mapaZoomSaida animation in css/transitions.css

/**
 * @param {HTMLElement} outgoingOuterEl - the currently-mounted hub `.pagina`
 * @param {{x: number, y: number}} origin - normalized (0-1) click origin
 * @param {() => (HTMLElement|Promise<HTMLElement>)} mountNext - builds + appends the chapter screen, returns its outer `.pagina`
 */
export function playStarZoom(outgoingOuterEl, origin, mountNext) {
  outgoingOuterEl.style.setProperty('--zoom-x', `${origin.x * 100}%`);
  outgoingOuterEl.style.setProperty('--zoom-y', `${origin.y * 100}%`);
  outgoingOuterEl.classList.add('is-zoom-saida');

  setTimeout(async () => {
    outgoingOuterEl.remove();

    const nextOuterEl = await mountNext();
    const nextContent = nextOuterEl.querySelector('.pagina__conteudo');
    nextContent?.classList.add('is-zoom-entrada');
    nextContent?.addEventListener('animationend', () => {
      nextContent.classList.remove('is-zoom-entrada');
    }, { once: true });
  }, DURATION_MS);
}
