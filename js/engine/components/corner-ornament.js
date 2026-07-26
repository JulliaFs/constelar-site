export function buildCornerOrnament(position) {
  const el = document.createElement('div');
  el.className = `pagina__canto pagina__canto--${position}`;
  el.innerHTML = '<span></span>';
  return el;
}
