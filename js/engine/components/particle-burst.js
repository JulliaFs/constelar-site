// Pequenos efeitos de partícula feitos em DOM/CSS (sem canvas, sem
// biblioteca) usados nos momentos de recompensa. O contêiner precisa ser
// `position: relative` (ou similar) para as coordenadas em % funcionarem.

export const PALETA_OURO = ['#F0C869', '#D4AF37', '#FFF0CA'];
export const PALETA_LACRE = ['#F0C869', '#D4AF37', '#8E2436', '#C0442F'];

/**
 * @param {HTMLElement} container
 * @param {{count?: number, originXPercent?: number, originYPercent?: number,
 *          colors?: string[], spread?: number}} opts
 */
export function burstParticles(container, {
  count = 20,
  originXPercent = 50,
  originYPercent = 50,
  colors = PALETA_OURO,
  spread = 100,
} = {}) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * spread;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    const el = document.createElement('div');
    el.className = 'particula-estouro';
    el.style.left = `${originXPercent}%`;
    el.style.top = `${originYPercent}%`;
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.setProperty('--dx', `${dx}px`);
    el.style.setProperty('--dy', `${dy}px`);
    el.style.animationDelay = `${Math.random() * 120}ms`;

    container.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }
}

/**
 * Faíscas curtas num ponto específico — usado quando uma conexão da
 * constelação acerta o alvo.
 *
 * @param {HTMLElement} container
 * @param {{xPercent: number, yPercent: number, count?: number}} opts
 */
export function sparkAt(container, { xPercent, yPercent, count = 10 }) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 14 + Math.random() * 26;

    const el = document.createElement('div');
    el.className = 'particula-faisca';
    el.style.left = `${xPercent}%`;
    el.style.top = `${yPercent}%`;
    el.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    el.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    el.style.animationDelay = `${Math.random() * 80}ms`;

    container.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }
}

const NOTE_GLYPHS = ['♪', '♫', '♩'];

/**
 * Notas musicais flutuantes — recompensa do capítulo 5. Sobem e somem,
 * escalonadas, em vez de estourar para os lados.
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
