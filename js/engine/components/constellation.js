import { layoutConstellation } from '../../utils/constellation-layout.js';
import { toRoman } from '../../utils/roman-numerals.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * One component, two roles: a small persistent breadcrumb (360x60,
 * fixed near the bottom of every chapter-content screen) and the
 * large interactive hub map (only the "current" node is clickable).
 *
 * @param {{
 *   size?: 'small'|'large',
 *   ids: string[],               // in reading order, may include a trailing synthetic id
 *   completedIds: string[],
 *   currentId: string|null,
 *   lightUpId?: string|null,     // plays the "new star" light-up animation on this node
 *   onSelect?: (id: string, originNormalized: {x:number,y:number}) => void,
 * }} opts
 * @returns {HTMLElement}
 */
export function buildConstellation({
  size = 'small',
  ids,
  completedIds,
  currentId,
  lightUpId = null,
  onSelect,
} = {}) {
  const dims = size === 'large'
    ? { width: 800, height: 220, marginX: 70, marginY: 50 }
    : { width: 360, height: 60, marginX: 20, marginY: 16 };

  const nodes = layoutConstellation(ids, dims);
  const completedSet = new Set(completedIds);

  const wrapper = document.createElement('div');
  wrapper.className = `constelacao constelacao--${size}`;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${dims.width} ${dims.height}`);
  if (size === 'large') {
    svg.setAttribute('width', '100%');
    svg.style.height = 'auto';
  } else {
    svg.setAttribute('width', String(dims.width));
    svg.setAttribute('height', String(dims.height));
  }
  svg.style.overflow = 'visible';

  function stateFor(id) {
    if (completedSet.has(id)) return 'completo';
    if (id === currentId) return 'atual';
    return 'bloqueado';
  }

  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    const lit = completedSet.has(a.id) && (completedSet.has(b.id) || b.id === currentId);

    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', a.x);
    line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x);
    line.setAttribute('y2', b.y);
    line.setAttribute('class', `constelacao__linha${lit ? ' constelacao__linha--acesa' : ''}`);

    if (lightUpId === b.id) {
      const len = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y));
      line.style.setProperty('--comprimento', String(len));
      line.classList.add('is-acendendo', 'constelacao__linha--acesa');
    }

    svg.appendChild(line);
  }

  nodes.forEach((n, i) => {
    const state = stateFor(n.id);

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', n.x);
    circle.setAttribute('cy', n.y);
    circle.setAttribute('r', state === 'bloqueado' ? '2' : '3.4');
    circle.setAttribute('class', `constelacao__no constelacao__no--${state}`);
    if (n.id === lightUpId) circle.classList.add('is-acendendo');
    svg.appendChild(circle);

    if (state === 'atual') {
      const ring = document.createElementNS(SVG_NS, 'circle');
      ring.setAttribute('cx', n.x);
      ring.setAttribute('cy', n.y);
      ring.setAttribute('r', '9');
      ring.setAttribute('class', 'constelacao__anel');
      svg.appendChild(ring);
    }

    if (size === 'large') {
      const label = document.createElementNS(SVG_NS, 'text');
      label.setAttribute('x', String(n.x));
      label.setAttribute('y', String(Math.min(dims.height - 6, n.y + 22)));
      label.setAttribute('class', 'constelacao__label');
      label.textContent = toRoman(i + 1);
      svg.appendChild(label);
    }

    if (state === 'atual' && onSelect) {
      const hit = document.createElementNS(SVG_NS, 'circle');
      hit.setAttribute('cx', n.x);
      hit.setAttribute('cy', n.y);
      hit.setAttribute('r', '16');
      hit.setAttribute('class', 'constelacao__hit');
      hit.addEventListener('click', () => {
        onSelect(n.id, { x: n.x / dims.width, y: n.y / dims.height });
      });
      svg.appendChild(hit);
    }
  });

  wrapper.appendChild(svg);

  const counter = document.createElement('span');
  counter.className = 'constelacao__contador';
  const position = Math.min(completedSet.size + 1, ids.length);
  counter.textContent = `${toRoman(position)} / ${toRoman(ids.length)}`;
  wrapper.appendChild(counter);

  return wrapper;
}
