export function buildCtaButton(label, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn-cta';
  btn.innerHTML = `<span class="fagulha"></span><span>${label}</span>`;
  btn.addEventListener('click', onClick);
  return btn;
}
