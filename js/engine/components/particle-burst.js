// A small, purpose-built gold particle burst (DOM/CSS only, no canvas/
// library) used for puzzle-completion payoffs. `container` must be
// `position: relative` (or similar) so percentage coordinates work.

/**
 * @param {HTMLElement} container
 * @param {{count?: number, originXPercent?: number, originYPercent?: number}} opts
 */
export function burstParticles(container, { count = 20, originXPercent = 50, originYPercent = 50 } = {}) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 100;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    const el = document.createElement('div');
    el.className = 'particula-estouro';
    el.style.left = `${originXPercent}%`;
    el.style.top = `${originYPercent}%`;
    el.style.setProperty('--dx', `${dx}px`);
    el.style.setProperty('--dy', `${dy}px`);
    el.style.animationDelay = `${Math.random() * 120}ms`;

    container.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }
}

const NOTE_GLYPHS = ['♪', '♫', '♩'];

/**
 * Floating musical notes — chapter 5's success payoff. Notes drift
 * upward and fade, staggered, instead of bursting outward.
 *
 * @param {HTMLElement} container
 * @param {{count?: number}} opts
 */
export function floatMusicalNotes(container, { count = 14 } = {}) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'nota-flutuante';
    el.textContent = NOTE_GLYPHS[Math.floor(Math.random() * NOTE_GLYPHS.length)];
    el.style.left = `${10 + Math.random() * 80}%`;
    el.style.setProperty('--deriva', `${(Math.random() - 0.5) * 60}px`);
    el.style.animationDelay = `${Math.random() * 700}ms`;
    el.style.animationDuration = `${1800 + Math.random() * 900}ms`;

    container.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }
}
