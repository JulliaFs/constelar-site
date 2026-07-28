// ============================================================================
// CAPÍTULO 1 — desafio de ligar a constelação (a Lira).
//
// Clique numa estrela: uma linha passa a seguir o ponteiro em tempo real.
// Clique na segunda estrela para fechar a conexão. Par certo se fixa com
// faíscas e brilho; par errado apenas se desfaz — sem punição, sem limite.
// Ao completar todas as arestas, a figura pulsa e uma harpa celestial é
// desenhada por cima antes do selo de cera aparecer.
// ============================================================================

import { buildPageShell } from '../components/page-shell.js';
import { buildCtaButton } from '../components/cta-button.js';
import { buildWaxSeal } from '../components/wax-seal.js';
import { buildCarta } from '../components/carta.js';
import { burstParticles, sparkAt } from '../components/particle-burst.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const MS_ERRO = 420;      // deve casar com puzzleTentativaSome
const MS_CELEBRACAO = 1200; // figura pulsando + harpa, antes do selo

function svg(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

function starPoints(cx, cy, outerR, innerR, points) {
  const out = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const rad = (((180 / points) * i - 90) * Math.PI) / 180;
    out.push(`${(cx + r * Math.cos(rad)).toFixed(2)},${(cy + r * Math.sin(rad)).toFixed(2)}`);
  }
  return out.join(' ');
}

function edgeKey(a, b) {
  return [a, b].sort().join('|');
}

/** Estrela de 8 pontas em ouro envelhecido; a alpha ganha aura dupla. */
function buildStarNode(node, isAlpha) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = `puzzle-no${isAlpha ? ' puzzle-no--alpha' : ''}`;
  el.style.left = `${node.x}%`;
  el.style.top = `${node.y}%`;
  el.setAttribute('aria-label', node.label || 'Estrela');

  const glifo = svg('svg', { class: 'puzzle-no__glifo', viewBox: '0 0 64 64' });
  glifo.appendChild(svg('polygon', {
    points: starPoints(32, 32, 27, 7, 8),
    class: 'puzzle-no__corpo',
  }));
  glifo.appendChild(svg('polygon', {
    points: starPoints(32, 32, 12, 3, 4),
    class: 'puzzle-no__faisca',
  }));
  glifo.appendChild(svg('circle', { cx: 32, cy: 32, r: 2.4, class: 'puzzle-no__nucleo' }));

  const aura = document.createElement('span');
  aura.className = 'puzzle-no__aura';

  el.append(aura, glifo);

  if (node.label) {
    const nome = document.createElement('span');
    nome.className = 'puzzle-no__nome';
    nome.textContent = node.label;
    el.appendChild(nome);
  }

  return el;
}

/** Harpa celestial em linhas douradas, desenhada sobre a figura pronta. */
function buildHarpa() {
  const el = svg('svg', {
    class: 'puzzle-harpa',
    viewBox: '0 0 100 100',
    preserveAspectRatio: 'none',
    'aria-hidden': 'true',
  });

  const g = svg('g', { class: 'puzzle-harpa__traco' });

  // Moldura da lira: duas hastes curvas ligadas por um travessão.
  g.appendChild(svg('path', { d: 'M38 38 C 26 56, 28 74, 35 86', fill: 'none' }));
  g.appendChild(svg('path', { d: 'M62 30 C 74 50, 70 70, 58 82', fill: 'none' }));
  g.appendChild(svg('path', { d: 'M35 86 Q 47 94, 58 82', fill: 'none' }));
  g.appendChild(svg('path', { d: 'M38 38 Q 50 22, 62 30', fill: 'none' }));

  // Cordas.
  for (let i = 0; i < 5; i++) {
    const t = (i + 1) / 6;
    const x1 = 38 + (62 - 38) * t;
    const y1 = 38 + (30 - 38) * t;
    const x2 = 35 + (58 - 35) * t;
    const y2 = 86 + (82 - 86) * t;
    g.appendChild(svg('line', { x1, y1, x2, y2, class: 'puzzle-harpa__corda' }));
  }

  el.appendChild(g);
  return el;
}

/**
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

  if (chapter.subtitle) {
    const sub = document.createElement('p');
    sub.className = 'tela-puzzle__subtitulo';
    sub.textContent = chapter.subtitle;
    contentEl.appendChild(sub);
  }

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
    stage.appendChild(buildCtaButton(chapter.startLabel || 'Iniciar desafio', showPuzzleStage));
  }

  function showPuzzleStage() {
    stage.innerHTML = '';

    const palco = document.createElement('div');
    palco.className = 'puzzle-estagio';

    const linhas = svg('svg', { class: 'puzzle-linhas', 'aria-hidden': 'true' });
    palco.appendChild(linhas);

    // Linha de mira: acompanha o ponteiro enquanto uma estrela está selecionada.
    const mira = svg('line', { class: 'puzzle-mira' });
    linhas.appendChild(mira);

    const nodeEls = new Map();
    const porId = new Map(chapter.puzzle.nodes.map((n) => [n.id, n]));
    for (const node of chapter.puzzle.nodes) {
      const isAlpha = node.isAlpha || node.id === chapter.puzzle.mainStarId;
      const el = buildStarNode(node, isAlpha);
      palco.appendChild(el);
      nodeEls.set(node.id, el);
    }

    stage.appendChild(palco);

    const arestasCertas = new Set(chapter.puzzle.edges.map(([a, b]) => edgeKey(a, b)));
    const conectadas = new Set();
    let selecionado = null;

    // ---- medidas em pixels reais (o SVG usa viewBox = tamanho do palco) ----
    let larguraPalco = 0;
    let alturaPalco = 0;

    function medir() {
      const w = palco.clientWidth;
      const h = palco.clientHeight;
      if (!w || !h) return false;
      larguraPalco = w;
      alturaPalco = h;
      linhas.setAttribute('viewBox', `0 0 ${w} ${h}`);
      for (const linha of linhas.querySelectorAll('.puzzle-linha')) posicionarLinha(linha);
      return true;
    }

    const pontoDe = (id) => {
      const n = porId.get(id);
      return { x: (n.x / 100) * larguraPalco, y: (n.y / 100) * alturaPalco };
    };

    function posicionarLinha(linha) {
      const a = pontoDe(linha.dataset.de);
      const b = pontoDe(linha.dataset.para);
      linha.setAttribute('x1', a.x.toFixed(1));
      linha.setAttribute('y1', a.y.toFixed(1));
      linha.setAttribute('x2', b.x.toFixed(1));
      linha.setAttribute('y2', b.y.toFixed(1));
    }

    function desenharLinha(idA, idB, classe) {
      const linha = svg('line', { class: `puzzle-linha ${classe}` });
      linha.dataset.de = idA;
      linha.dataset.para = idB;
      posicionarLinha(linha);
      linhas.insertBefore(linha, mira); // a mira fica sempre por cima
      return linha;
    }

    // ---- linha de mira seguindo o ponteiro ----
    function atualizarMira(clientX, clientY) {
      if (!selecionado) return;
      const rect = palco.getBoundingClientRect();
      // Mapear pelo rect (e não por clientWidth) mantém o ponteiro correto
      // mesmo se o palco estiver sob alguma transformação de escala.
      const x = ((clientX - rect.left) / rect.width) * larguraPalco;
      const y = ((clientY - rect.top) / rect.height) * alturaPalco;
      const origem = pontoDe(selecionado);
      mira.setAttribute('x1', origem.x.toFixed(1));
      mira.setAttribute('y1', origem.y.toFixed(1));
      mira.setAttribute('x2', x.toFixed(1));
      mira.setAttribute('y2', y.toFixed(1));
    }

    palco.addEventListener('pointermove', (e) => atualizarMira(e.clientX, e.clientY));

    function limparSelecao() {
      if (selecionado) nodeEls.get(selecionado).classList.remove('is-selecionado');
      selecionado = null;
      mira.classList.remove('is-ativa');
    }

    function tentarConexao(idA, idB) {
      const chave = edgeKey(idA, idB);

      if (arestasCertas.has(chave) && !conectadas.has(chave)) {
        conectadas.add(chave);
        desenharLinha(idA, idB, 'puzzle-linha--acesa');
        nodeEls.get(idA).classList.add('is-aceso');
        nodeEls.get(idB).classList.add('is-aceso');

        // Faíscas no meio da conexão recém-fechada.
        const a = porId.get(idA);
        const b = porId.get(idB);
        sparkAt(palco, { xPercent: (a.x + b.x) / 2, yPercent: (a.y + b.y) / 2 });

        if (conectadas.size === arestasCertas.size) {
          setTimeout(() => celebrar(palco), 260);
        }
        return;
      }

      // Errou (ou repetiu uma já feita): a linha só se desfaz, sem punição.
      const linha = desenharLinha(idA, idB, 'puzzle-linha--tentativa');
      setTimeout(() => linha.remove(), MS_ERRO);
    }

    function selecionar(id) {
      if (!selecionado) {
        selecionado = id;
        nodeEls.get(id).classList.add('is-selecionado');
        mira.classList.add('is-ativa');
        const origem = pontoDe(id);
        mira.setAttribute('x1', origem.x.toFixed(1));
        mira.setAttribute('y1', origem.y.toFixed(1));
        mira.setAttribute('x2', origem.x.toFixed(1));
        mira.setAttribute('y2', origem.y.toFixed(1));
        return;
      }
      if (selecionado === id) {
        limparSelecao();
        return;
      }
      const de = selecionado;
      limparSelecao();
      tentarConexao(de, id);
    }

    for (const [id, el] of nodeEls) {
      el.addEventListener('click', () => selecionar(id));
    }

    // O palco pode ainda não ter passado por layout; tenta até conseguir medir.
    let tentativas = 0;
    const tentarMedir = () => {
      if (medir() || tentativas++ > 20) return;
      setTimeout(tentarMedir, 30);
    };
    tentarMedir();

    const observer = new ResizeObserver(() => {
      if (!palco.isConnected) {
        observer.disconnect();
        return;
      }
      medir();
    });
    observer.observe(palco);
  }

  function celebrar(palco) {
    palco.classList.add('is-completo');
    palco.appendChild(buildHarpa());
    burstParticles(palco, { count: 30, spread: 150 });
    onSolved?.();

    setTimeout(() => {
      stage.innerHTML = '';
      showSolvedStage({ freshlySolved: true });
    }, MS_CELEBRACAO);
  }

  function showSolvedStage({ freshlySolved = false } = {}) {
    stage.innerHTML = '';
    const seal = buildWaxSeal({
      onBreak: () => onSealBroken?.(),
      onRevealed: showCartaStage,
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
      titulo: chapter.reveal.title,
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
