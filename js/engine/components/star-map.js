// ============================================================================
// MAPA CELESTE — a carta estelar do hub, em tela cheia.
//
// Camadas (de trás pra frente):
//   1. carta astronômica decorativa (traços finos de ouro, opacidade baixa)
//   2. linhas de conexão entre as estrelas (SVG em pixels reais)
//   3. as estrelas em si, posicionadas em % da tela
//   4. o card flutuante de cada estrela (hover/foco)
//
// As posições vêm em % (layoutOrganicConstellation), então tudo se adapta
// à tela sozinho; só as linhas precisam de pixels, e são recalculadas por
// um ResizeObserver.
// ============================================================================

import { layoutOrganicConstellation } from '../../utils/constellation-layout.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function svg(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

/** Pontos de uma estrela de N pontas, centrada em (cx, cy). */
function starPoints(cx, cy, outerR, innerR, points) {
  const out = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const rad = (((180 / points) * i - 90) * Math.PI) / 180;
    out.push(`${(cx + r * Math.cos(rad)).toFixed(2)},${(cy + r * Math.sin(rad)).toFixed(2)}`);
  }
  return out.join(' ');
}

// -------------------------------------------------- carta decorativa de fundo

function buildZodiaco() {
  const el = svg('svg', {
    class: 'mapa-ceu__zodiaco',
    viewBox: '0 0 1000 1000',
    preserveAspectRatio: 'xMidYMid slice',
    'aria-hidden': 'true',
  });

  const g = svg('g', { class: 'mapa-ceu__zodiaco-traco' });
  const cx = 500;
  const cy = 500;

  // Anéis concêntricos da carta.
  [180, 300, 360, 430].forEach((r) => {
    g.appendChild(svg('circle', { cx, cy, r, fill: 'none' }));
  });

  // Eclíptica inclinada.
  g.appendChild(svg('ellipse', {
    cx, cy, rx: 430, ry: 150, fill: 'none',
    transform: `rotate(-18 ${cx} ${cy})`,
  }));

  // Divisões dos 12 setores + marcas menores.
  for (let i = 0; i < 12; i++) {
    const deg = i * 30;
    const rad = ((deg - 90) * Math.PI) / 180;
    g.appendChild(svg('line', {
      x1: cx + 180 * Math.cos(rad), y1: cy + 180 * Math.sin(rad),
      x2: cx + 430 * Math.cos(rad), y2: cy + 430 * Math.sin(rad),
    }));
    g.appendChild(svg('circle', {
      cx: cx + 300 * Math.cos(rad), cy: cy + 300 * Math.sin(rad), r: 5, fill: 'none',
    }));
  }
  for (let i = 0; i < 72; i++) {
    const rad = ((i * 5 - 90) * Math.PI) / 180;
    g.appendChild(svg('line', {
      x1: cx + 415 * Math.cos(rad), y1: cy + 415 * Math.sin(rad),
      x2: cx + 430 * Math.cos(rad), y2: cy + 430 * Math.sin(rad),
    }));
  }

  el.appendChild(g);
  return el;
}

// ----------------------------------------------------------------- estrela ---

function buildStarGlyph(state) {
  const el = svg('svg', { class: 'estrela__glifo', viewBox: '0 0 64 64', 'aria-hidden': 'true' });

  if (state === 'bloqueado') {
    el.appendChild(svg('circle', { cx: 32, cy: 32, r: 4.5, class: 'estrela__ponto' }));
    return el;
  }

  el.appendChild(svg('polygon', {
    points: starPoints(32, 32, 26, 7, 8),
    class: 'estrela__corpo',
  }));
  el.appendChild(svg('polygon', {
    points: starPoints(32, 32, 13, 3.4, 4),
    class: 'estrela__faisca',
  }));
  el.appendChild(svg('circle', { cx: 32, cy: 32, r: 2.6, class: 'estrela__nucleo' }));
  return el;
}

function buildCard(node) {
  const card = document.createElement('div');
  card.className = 'mapa-card';
  card.innerHTML = `
    <span class="mapa-card__canto mapa-card__canto--tl"></span>
    <span class="mapa-card__canto mapa-card__canto--tr"></span>
    <span class="mapa-card__canto mapa-card__canto--bl"></span>
    <span class="mapa-card__canto mapa-card__canto--br"></span>
    <h2 class="mapa-card__titulo">${node.titulo}</h2>
    ${node.subtitulo ? `<p class="mapa-card__subtitulo">${node.subtitulo}</p>` : ''}
  `;
  return card;
}

function buildStar(node, position, onSelect) {
  const interativo = node.state === 'atual';
  const focavel = node.state !== 'bloqueado';

  const wrap = document.createElement(interativo ? 'button' : 'div');
  wrap.className = `mapa-estrela mapa-estrela--${node.state}`;
  wrap.style.left = `${position.x}%`;
  wrap.style.top = `${position.y}%`;

  if (interativo) {
    wrap.type = 'button';
    wrap.setAttribute('aria-label', node.titulo);
    wrap.addEventListener('click', () => {
      onSelect?.(node.id, { x: position.x / 100, y: position.y / 100 });
    });
  } else if (focavel) {
    wrap.setAttribute('tabindex', '0');
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', node.titulo);
  } else {
    wrap.setAttribute('aria-hidden', 'true');
  }

  const aura = document.createElement('span');
  aura.className = 'estrela__aura';
  wrap.append(aura, buildStarGlyph(node.state));

  if (focavel) {
    // Perto do topo o card abriria fora da tela — nesse caso, abre embaixo.
    // (O ajuste horizontal é medido depois da montagem, em ajustarCards.)
    if (position.y < 30) wrap.classList.add('is-card-abaixo');
    wrap.appendChild(buildCard(node));
  }

  return wrap;
}

// ------------------------------------------------------------------ mapa -----

/**
 * @param {{
 *   nodes: {id:string, state:'completo'|'atual'|'bloqueado', titulo:string, subtitulo?:string}[],
 *   lightUpId?: string|null,
 *   onSelect?: (id:string, origin:{x:number,y:number}) => void,
 * }} opts
 * @returns {{el: HTMLElement, destroy: () => void}}
 */
export function buildStarMap({ nodes, lightUpId = null, onSelect } = {}) {
  const el = document.createElement('div');
  el.className = 'mapa-ceu';

  el.appendChild(buildZodiaco());

  const linhas = svg('svg', { class: 'mapa-ceu__linhas', 'aria-hidden': 'true' });
  el.appendChild(linhas);

  const posicoes = layoutOrganicConstellation(nodes.map((n) => n.id));
  const porId = new Map(posicoes.map((p) => [p.id, p]));

  // Uma linha por par consecutivo. O traço só "acende" quando a estrela de
  // destino já foi conquistada (ou é a atual, indicando o caminho a seguir).
  const segmentos = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    const acesa = a.state === 'completo' && (b.state === 'completo' || b.state === 'atual');

    const line = svg('line', {
      class: `mapa-linha${acesa ? ' mapa-linha--acesa' : ''}`,
    });
    // A linha que se desenha é a que SAI do capítulo recém-concluído: é ela
    // que acabou de acender (a que chega nele já estava acesa antes).
    if (lightUpId && a.id === lightUpId) line.dataset.acendendo = 'true';
    linhas.appendChild(line);
    segmentos.push({ line, de: a.id, para: b.id });
  }

  const cards = [];
  for (const node of nodes) {
    const pos = porId.get(node.id);
    const wrap = buildStar(node, pos, onSelect);
    el.appendChild(wrap);
    const card = wrap.querySelector('.mapa-card');
    if (card) cards.push({ wrap, card, x: pos.x });
  }

  // As linhas são desenhadas em pixels reais (não em % esticada), para o
  // traço não distorcer e o comprimento do dash bater com a tela.
  function redesenhar() {
    // Auto-limpeza: quando o mapa sai do DOM (troca de tela), o observer
    // se desliga sozinho — quem monta não precisa lembrar de destruir.
    if (!el.isConnected) {
      observer.disconnect();
      return true; // nada a fazer: o mapa saiu da tela
    }
    // clientWidth/Height (tamanho de layout) em vez de getBoundingClientRect:
    // o mapa entra com uma animação de `scale`, e o rect viria escalado,
    // desalinhando as linhas das estrelas (que são posicionadas em %).
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (!w || !h) return false; // ainda sem layout — quem chamou tenta de novo
    linhas.setAttribute('viewBox', `0 0 ${w} ${h}`);

    for (const seg of segmentos) {
      const a = porId.get(seg.de);
      const b = porId.get(seg.para);
      seg.line.setAttribute('x1', ((a.x / 100) * w).toFixed(1));
      seg.line.setAttribute('y1', ((a.y / 100) * h).toFixed(1));
      seg.line.setAttribute('x2', ((b.x / 100) * w).toFixed(1));
      seg.line.setAttribute('y2', ((b.y / 100) * h).toFixed(1));

      if (seg.line.dataset.acendendo === 'true') {
        const len = seg.line.getTotalLength();
        seg.line.style.setProperty('--comprimento', len.toFixed(1));
      }
    }

    ajustarCards(w);
    return true;
  }

  /**
   * Mantém cada card dentro da tela. Em vez de limiares fixos de posição
   * (que quebram conforme o tamanho do texto e da janela), mede o card e
   * calcula o deslocamento exato — centralizado quando cabe, encostado na
   * margem quando não cabe.
   */
  function ajustarCards(w) {
    const MARGEM = 10;
    for (const { card, x } of cards) {
      const largura = card.offsetWidth;
      if (!largura) continue;
      // O card já vem centralizado na estrela pelo CSS (translateX(-50%));
      // a margem só corrige o quanto ele precisa "escorregar" para caber.
      const idealEsq = (x / 100) * w - largura / 2;
      const maxEsq = Math.max(MARGEM, w - largura - MARGEM);
      const esq = Math.min(Math.max(idealEsq, MARGEM), maxEsq);
      card.style.marginLeft = `${(esq - idealEsq).toFixed(1)}px`;
    }
  }

  const observer = new ResizeObserver(redesenhar);

  /** Só depois do primeiro traçado a linha nova tem comprimento para animar. */
  function acenderLinhaNova() {
    for (const seg of segmentos) {
      if (seg.line.dataset.acendendo === 'true') {
        seg.line.classList.add('mapa-linha--acesa', 'is-desenhando');
      }
    }
  }

  return {
    el,

    /**
     * Deve ser chamado logo DEPOIS de inserir `el` no DOM: o traçado
     * precisa do tamanho real do elemento. Síncrono de propósito — adiar
     * para requestAnimationFrame deixaria o mapa sem linhas enquanto a
     * aba estivesse em segundo plano (rAF não roda em aba oculta).
     */
    mount() {
      observer.observe(el);

      // Na primeira montagem o elemento pode ainda não ter passado por
      // layout; nesse caso o desenho é reagendado até conseguir medir.
      // setTimeout (e não só requestAnimationFrame) porque rAF não roda
      // em aba em segundo plano, e o mapa não pode ficar sem linhas.
      let tentativas = 0;
      const tentar = () => {
        if (redesenhar() || tentativas++ > 20) {
          acenderLinhaNova();
          return;
        }
        setTimeout(tentar, 30);
      };
      tentar();
    },

    destroy() {
      observer.disconnect();
    },
  };
}
