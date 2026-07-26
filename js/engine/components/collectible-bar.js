/** Renders (in place) a slim row of "memory fragment" glyphs, one per completed chapter. */
export function renderCollectibleBar(el, count) {
  el.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const item = document.createElement('div');
    item.className = 'colecionaveis__item fagulha';
    item.style.animationDelay = `${i * 60}ms`;
    el.appendChild(item);
  }
}
