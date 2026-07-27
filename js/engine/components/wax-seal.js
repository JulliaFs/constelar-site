/**
 * The wax-seal break gesture: the enigma chapter's reveal/unlock
 * affordance. Stamps in (elastic pop) after a correct answer, breathes
 * in place, and on click splits into two halves + shard fragments.
 *
 * @param {{onBreak?: () => void, size?: 'normal'|'grande'}} opts
 * @returns {{el: HTMLElement, stampIn: () => void}}
 */
export function buildWaxSeal({ onBreak, size = 'normal' } = {}) {
  const container = document.createElement('div');
  container.className = 'tela-enigma__selo-area';

  const wrap = document.createElement('div');
  wrap.className = size === 'grande' ? 'selo-wrap selo-wrap--grande' : 'selo-wrap';
  wrap.setAttribute('role', 'button');
  wrap.setAttribute('tabindex', '0');
  wrap.setAttribute('aria-label', 'Quebrar o lacre');
  wrap.innerHTML = `
    <div class="selo-halo"></div>
    <div class="selo-corpo selo-metade--esq"></div>
    <div class="selo-corpo selo-metade--dir"></div>
    ${'<div class="selo-caco"></div>'.repeat(6)}
  `;

  const legenda = document.createElement('div');
  legenda.className = 'selo-legenda txt-rotulo';
  legenda.textContent = 'Quebrar o lacre';

  container.append(wrap, legenda);

  let broken = false;
  function attemptBreak() {
    if (broken) return;
    broken = true;
    wrap.classList.add('is-quebrado');
    legenda.style.opacity = '0';
    onBreak?.();
  }

  wrap.addEventListener('click', attemptBreak);
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      attemptBreak();
    }
  });

  return {
    el: container,
    stampIn() {
      wrap.classList.add('is-entrando');
    },
  };
}
