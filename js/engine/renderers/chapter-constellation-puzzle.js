import { buildPageShell } from '../components/page-shell.js';
import { buildCtaButton } from '../components/cta-button.js';
import { buildWaxSeal } from '../components/wax-seal.js';
import { buildCarta } from '../components/carta.js';
import { burstParticles } from '../components/particle-burst.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function edgeKey(a, b) {
  return [a, b].sort().join('|');
}

/**
 * Chapter 1's mechanic: click star A, then star B. A correct pair (any
 * order) lights up permanently; a wrong pair's line just fades after a
 * moment — no penalty, no attempt limit, no order requirement.
 *
 * @param {HTMLElement} appRoot
 * @param {object} chapter
 * @param {{solved?: boolean, sealBroken?: boolean}|undefined} resume
 * @param {{onSolved: () => void, onSealBroken: () => void, onComplete: () => void}} handlers
 */
export function renderConstellationPuzzle(appRoot, chapter, resume, { onSolved, onSealBroken, onComplete }) {
  if (!chapter.puzzle?.nodes?.length || !chapter.puzzle?.edges?.length) {
    throw new Error(`Capítulo puzzle "${chapter.id}" precisa de "puzzle.nodes" e "puzzle.edges".`);
  }
  if (!chapter.reveal?.paragraphs) {
    throw new Error(`Capítulo puzzle "${chapter.id}" precisa do campo "reveal.paragraphs".`);
  }

  const { outerEl, contentEl } = buildPageShell({ sky: chapter.sky });

  const titulo = document.createElement('h1');
  titulo.className = 'txt-capitulo';
  titulo.textContent = chapter.title;
  contentEl.appendChild(titulo);

  if (chapter.intro?.length) {
    const intro = document.createElement('div');
    intro.className = 'txt-corpo';
    intro.innerHTML = chapter.intro.map((p) => `<p>${p}</p>`).join('');
    contentEl.appendChild(intro);
  }

  const stage = document.createElement('div');
  stage.className = 'tela-puzzle';
  contentEl.appendChild(stage);

  function showStartStage() {
    stage.innerHTML = '';
    const btn = buildCtaButton(chapter.startLabel || 'Iniciar desafio', showPuzzleStage);
    stage.appendChild(btn);
  }

  function showPuzzleStage() {
    stage.innerHTML = '';

    const estagio = document.createElement('div');
    estagio.className = 'puzzle-estagio';

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'puzzle-linhas');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    estagio.appendChild(svg);

    const nodeEls = new Map();
    for (const node of chapter.puzzle.nodes) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'puzzle-no';
      el.style.left = `${node.x}%`;
      el.style.top = `${node.y}%`;
      el.setAttribute('aria-label', 'Estrela');
      estagio.appendChild(el);
      nodeEls.set(node.id, el);
    }

    stage.appendChild(estagio);

    const correctEdges = new Set(chapter.puzzle.edges.map(([a, b]) => edgeKey(a, b)));
    const connected = new Set();
    let selectedId = null;

    function nodeCenter(id) {
      const node = chapter.puzzle.nodes.find((n) => n.id === id);
      return { x: node.x, y: node.y };
    }

    function drawLine(idA, idB, className) {
      const a = nodeCenter(idA);
      const b = nodeCenter(idB);
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', a.x);
      line.setAttribute('y1', a.y);
      line.setAttribute('x2', b.x);
      line.setAttribute('y2', b.y);
      line.setAttribute('class', `puzzle-linha ${className}`);
      svg.appendChild(line);
      return line;
    }

    function attemptConnection(idA, idB) {
      const key = edgeKey(idA, idB);
      if (correctEdges.has(key) && !connected.has(key)) {
        connected.add(key);
        drawLine(idA, idB, 'puzzle-linha--aceso');
        nodeEls.get(idA).classList.add('is-aceso');
        nodeEls.get(idB).classList.add('is-aceso');

        if (connected.size === correctEdges.size) {
          setTimeout(() => showCompletionStage(estagio), 300);
        }
      } else {
        const line = drawLine(idA, idB, 'puzzle-linha--tentativa');
        line.addEventListener('animationend', () => line.remove(), { once: true });
      }
    }

    function selectNode(id) {
      if (selectedId === null) {
        selectedId = id;
        nodeEls.get(id).classList.add('is-selecionado');
        return;
      }
      if (selectedId === id) {
        nodeEls.get(id).classList.remove('is-selecionado');
        selectedId = null;
        return;
      }
      nodeEls.get(selectedId).classList.remove('is-selecionado');
      attemptConnection(selectedId, id);
      selectedId = null;
    }

    for (const [id, el] of nodeEls) {
      el.addEventListener('click', () => selectNode(id));
    }
  }

  function showCompletionStage(estagio) {
    estagio.classList.add('is-completo');
    burstParticles(estagio, { originXPercent: 50, originYPercent: 50 });
    onSolved?.();

    setTimeout(() => {
      stage.innerHTML = '';
      showSolvedStage({ freshlySolved: true });
    }, 900);
  }

  function showSolvedStage({ freshlySolved = false } = {}) {
    stage.innerHTML = '';
    const seal = buildWaxSeal({
      onBreak: () => {
        onSealBroken?.();
        showCartaStage();
      },
    });
    stage.appendChild(seal.el);
    if (freshlySolved) {
      seal.stampIn();
    } else {
      seal.el.querySelector('.selo-wrap')?.classList.add('is-entrando');
    }
  }

  function showCartaStage() {
    stage.innerHTML = '';
    const carta = buildCarta({
      paragraphs: chapter.reveal.paragraphs,
      closeLabel: chapter.reveal.continueLabel,
      onClose: onComplete,
    });
    stage.appendChild(carta.el);
  }

  if (resume?.sealBroken) {
    showCartaStage();
  } else if (resume?.solved) {
    showSolvedStage({ freshlySolved: false });
  } else {
    showStartStage();
  }

  appRoot.appendChild(outerEl);
  return outerEl;
}
