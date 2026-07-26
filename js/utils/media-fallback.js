// Every <img> in the site must degrade gracefully instead of showing a
// broken-image icon — important while chapters still reference
// placeholder asset paths that don't exist yet.

export function createMediaElement({ src, alt = '', className = '' } = {}) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  if (className) img.className = className;

  img.addEventListener('error', () => {
    const fallback = document.createElement('div');
    fallback.className = `midia-fallback ${className}`.trim();
    fallback.innerHTML = '<span class="fagulha" style="width:16px;height:16px;"></span>';
    img.replaceWith(fallback);
  }, { once: true });

  return img;
}
