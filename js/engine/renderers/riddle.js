import { buildPageShell } from '../components/page-shell.js';
import { buildWaxSeal } from '../components/wax-seal.js';
import { buildCarta } from '../components/carta.js';
import { floatMusicalNotes } from '../components/particle-burst.js';
import { createAnswerValidator } from '../../utils/text-match.js';
import { toRunes, buildLegend } from '../../utils/runes.js';

// Apresentações que ocupam a tela inteira, sem a moldura de página. O
// cenário delas é o próprio capítulo — uma caixa retangular em volta
// quebraria a imersão.
const SEM_MOLDURA = new Set(['pedestal']);

// ---------------------------------------------------------------------------
// Campo padrão — usado pelas apresentações empilhadas (plain, runes, melody).
// ---------------------------------------------------------------------------

function buildCampoPadrao(chapter) {
  const campo = document.createElement('div');
  campo.className = 'enigma-campo';
  campo.innerHTML = `
    <form novalidate>
      <div class="enigma-campo__linha">
        <span class="enigma-campo__ponta"></span>
        <input type="text" class="enigma-input" autocomplete="off" spellcheck="false"
               placeholder="${chapter.riddle.placeholder || ''}" />
        <span class="enigma-campo__ponta"></span>
      </div>
      <div class="enigma-regua"></div>
      <button type="submit" class="btn-cta btn-cta--nouveau enigma-enviar">
        <span class="fagulha"></span><span>${chapter.riddle.submitLabel || 'Decifrar'}</span>
      </button>
      <div class="enigma-status">
        <span class="enigma-status__msg enigma-status__msg--hint visivel">Enter para confirmar</span>
      </div>
    </form>
  `;
  return campo;
}

// ---------------------------------------------------------------------------
// Decorações empilhadas: entram ACIMA do campo padrão.
// ---------------------------------------------------------------------------

const DECORACOES = {
  plain(chapter) {
    const frag = document.createElement('div');
    frag.className = 'tela-enigma__prompt';
    const prompt = document.createElement('p');
    prompt.className = 'txt-enigma';
    prompt.textContent = chapter.riddle.prompt;
    frag.appendChild(prompt);

    if (chapter.riddle.hintLines?.length) {
      const pistas = document.createElement('div');
      pistas.className = 'enigma-pistas';
      pistas.innerHTML = chapter.riddle.hintLines.map((l) => `<div>${l}</div>`).join('');
      frag.appendChild(pistas);
    }
    return frag;
  },

  runes(chapter) {
    const message = chapter.riddle.runeMessage;
    const runeText = toRunes(message);
    const legend = buildLegend(message);

    const frag = document.createElement('div');
    frag.className = 'runas-cena';
    frag.innerHTML = `
      <div class="runas-tablete">
        <p class="runas-tablete__texto">${runeText}</p>
      </div>
      <div class="runas-legenda">
        ${legend.map(({ letter, rune }) => `
          <span class="runas-legenda__item">
            <span class="runas-legenda__rune">${rune}</span>
            <span class="runas-legenda__seta">→</span>
            <span class="runas-legenda__letra">${letter}</span>
          </span>
        `).join('')}
      </div>
    `;
    return frag;
  },

  melody(chapter) {
    const frag = document.createElement('div');
    frag.className = 'melodia-cena';
    frag.innerHTML = `
      <div class="melodia-pergaminho">
        <div class="melodia-letra">
          ${chapter.riddle.lyricLines.map((l) => `<p>${l}</p>`).join('')}
        </div>
        ${chapter.riddle.chordLine ? `<p class="melodia-cifra">${chapter.riddle.chordLine}</p>` : ''}
      </div>
    `;
    return frag;
  },
};

// ---------------------------------------------------------------------------
// ALTAR (apresentação 'pedestal') — monumento único: o nome do capítulo
// gravado na coroa, o enigma esculpido na pedra e a resposta digitada numa
// placa de latão entalhada na base. Nada de formulário empilhado.
// ---------------------------------------------------------------------------

function buildAltar(chapter) {
  const cena = document.createElement('div');
  cena.className = 'altar';
  cena.dataset.cena = '';
  cena.innerHTML = `
    <div class="altar__coroa">
      <svg class="altar__coroa-ornamento" viewBox="0 0 420 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 30 H150" /><path d="M270 30 H420" />
        <path d="M186 30 Q 210 6, 234 30" class="altar__coroa-arco" />
        <path d="M150 30 L162 22 L174 30 L162 38 Z" class="altar__coroa-losango" />
        <path d="M270 30 L258 22 L246 30 L258 38 Z" class="altar__coroa-losango" />
      </svg>
      <h1 class="altar__nome">${chapter.title}</h1>
    </div>

    <div class="altar__tabua">
      ${chapter.intro?.length ? `<p class="altar__preambulo">${chapter.intro[0]}</p>` : ''}
      <p class="altar__inscricao">${chapter.riddle.prompt}</p>

      <form class="altar__placa" novalidate>
        <span class="altar__placa-rebite"></span>
        <input type="text" class="enigma-input altar__entrada" autocomplete="off" spellcheck="false"
               placeholder="${chapter.riddle.placeholder || ''}" />
        <button type="submit" class="altar__selo enigma-enviar"
                aria-label="${chapter.riddle.submitLabel || 'Decifrar'}"
                title="${chapter.riddle.submitLabel || 'Decifrar'}">
          <span class="fagulha"></span>
        </button>
        <span class="altar__placa-rebite"></span>
      </form>

      <div class="enigma-status altar__status">
        <span class="enigma-status__msg enigma-status__msg--hint visivel">Enter para confirmar</span>
      </div>
    </div>

    <div class="altar__base">
      <span class="altar__base-topo"></span>
    </div>

    <svg class="altar__fissuras" viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true">
      <path d="M150 40 L118 88 L134 138 L100 208" />
      <path d="M150 40 L186 84 L166 136 L200 206" />
      <path d="M150 40 L150 104 L136 160 L154 244" />
      <path d="M118 88 L62 104" />
      <path d="M186 84 L242 100" />
    </svg>
  `;
  return cena;
}

/**
 * @param {HTMLElement} appRoot
 * @param {object} chapter
 * @param {{solved?: boolean, sealBroken?: boolean}|undefined} resume
 * @param {{onSolved: () => void, onSealBroken: () => void, onComplete: () => void}} handlers
 */
export function renderRiddle(appRoot, chapter, resume, { onSolved, onSealBroken, onComplete }) {
  if (!chapter.riddle) {
    throw new Error(`Capítulo enigma "${chapter.id}" precisa do campo "riddle".`);
  }
  if (!chapter.reveal?.paragraphs) {
    throw new Error(`Capítulo enigma "${chapter.id}" precisa do campo "reveal.paragraphs".`);
  }

  const apresentacao = chapter.riddle.presentation || 'plain';
  const semMoldura = SEM_MOLDURA.has(apresentacao);

  let outerEl;
  let stage;

  if (semMoldura) {
    // Cena em tela cheia: só a penumbra, o foco de luz e o monumento.
    outerEl = document.createElement('section');
    outerEl.className = 'tela-altar tela-cheia';
    outerEl.innerHTML = '<div class="tela-altar__luz"></div>';

    stage = document.createElement('div');
    stage.className = 'tela-altar__palco';
    outerEl.appendChild(stage);
  } else {
    const shell = buildPageShell({ sky: chapter.sky });
    outerEl = shell.outerEl;

    const titulo = document.createElement('h1');
    titulo.className = 'txt-capitulo';
    titulo.textContent = chapter.title;
    shell.contentEl.appendChild(titulo);

    if (chapter.intro?.length) {
      const intro = document.createElement('div');
      intro.className = 'txt-corpo';
      intro.innerHTML = chapter.intro.map((p) => `<p>${p}</p>`).join('');
      shell.contentEl.appendChild(intro);
    }

    stage = document.createElement('div');
    stage.className = `tela-enigma__corpo tela-enigma__corpo--${apresentacao}`;
    shell.contentEl.appendChild(stage);
  }

  const validate = createAnswerValidator(chapter.riddle.answerPayload, chapter.riddle.maxTypoDistance ?? 2);

  function showRiddleStage() {
    stage.innerHTML = '';

    if (semMoldura) {
      stage.appendChild(buildAltar(chapter));
    } else {
      const decorar = DECORACOES[apresentacao] || DECORACOES.plain;
      stage.appendChild(decorar(chapter));
      stage.appendChild(buildCampoPadrao(chapter));
    }

    // A apresentação monta o próprio markup; o comportamento é sempre o
    // mesmo e se liga pelos mesmos ganchos.
    const form = stage.querySelector('form');
    const input = stage.querySelector('.enigma-input');
    const statusEl = stage.querySelector('.enigma-status');
    const hintMsg = stage.querySelector('.enigma-status__msg--hint');
    const enviar = stage.querySelector('.enigma-enviar');
    const campo = stage.querySelector('.enigma-campo') || stage.querySelector('.altar__placa');
    const retryMessages = chapter.riddle.gentleRetryMessages || ['Ainda não é essa. Tente novamente.'];
    let retryIndex = 0;

    // Enter dispara o mesmo caminho do botão, sem envio implícito duplicado.
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        form.requestSubmit();
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (campo.classList.contains('is-correto')) return;

      if (validate(input.value)) {
        campo.classList.remove('is-erro');
        campo.classList.add('is-correto');
        hintMsg.classList.remove('visivel');
        const ok = document.createElement('span');
        ok.className = 'enigma-status__msg enigma-status__msg--ok visivel';
        ok.textContent = 'É isso.';
        statusEl.appendChild(ok);
        input.disabled = true;
        enviar?.setAttribute('disabled', '');

        // A cena da apresentação (quando existe) toca sua própria
        // animação de acerto — no altar, as fissuras douradas.
        const cena = stage.querySelector('[data-cena]');
        cena?.classList.add('is-iluminado');

        if (apresentacao === 'melody') floatMusicalNotes(stage);

        onSolved?.();
        setTimeout(() => showSolvedStage({ freshlySolved: true }), cena ? 1000 : 700);
        return;
      }

      campo.classList.remove('is-erro');
      // força reflow para a animação de erro poder repetir em tentativas seguidas
      void campo.offsetWidth;
      campo.classList.add('is-erro');
      hintMsg.textContent = retryMessages[retryIndex % retryMessages.length];
      retryIndex++;
      input.focus();
      input.select();
    });

    input.focus();
  }

  function showSolvedStage({ freshlySolved = false } = {}) {
    stage.innerHTML = '';
    const isMelody = apresentacao === 'melody';

    const seal = buildWaxSeal({
      size: isMelody ? 'grande' : 'normal',
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
      chapter,
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
    showRiddleStage();
  }

  appRoot.appendChild(outerEl);
  return outerEl;
}
