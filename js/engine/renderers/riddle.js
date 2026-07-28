import { buildPageShell } from '../components/page-shell.js';
import { buildWaxSeal } from '../components/wax-seal.js';
import { buildCarta } from '../components/carta.js';
import { floatMusicalNotes } from '../components/particle-burst.js';
import { createAnswerValidator } from '../../utils/text-match.js';
import { toRunes, buildLegend } from '../../utils/runes.js';

// Renders the decorative wrapper around the prompt/input for each
// `chapter.riddle.presentation` value. Only the DOM/markup varies here —
// the validator, retry-cycling, and seal/carta orchestration below is
// identical for every presentation.
const PRESENTATIONS = {
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

  pedestal(chapter) {
    const frag = document.createElement('div');
    frag.className = 'pedestal-cena';
    frag.innerHTML = `
      <div class="pedestal-pergaminho">
        <p class="pedestal-pergaminho__texto">${chapter.riddle.prompt}</p>
      </div>
      <div class="pedestal-corpo"></div>
    `;
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
  stage.className = 'tela-enigma__corpo';
  contentEl.appendChild(stage);

  const validate = createAnswerValidator(chapter.riddle.answerPayload, chapter.riddle.maxTypoDistance ?? 2);

  function showRiddleStage() {
    stage.innerHTML = '';

    const decorate = PRESENTATIONS[chapter.riddle.presentation || 'plain'] || PRESENTATIONS.plain;
    stage.appendChild(decorate(chapter));

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
        <div class="enigma-status">
          <span class="enigma-status__msg enigma-status__msg--hint visivel">Enter para confirmar</span>
        </div>
      </form>
    `;
    stage.appendChild(campo);

    const form = campo.querySelector('form');
    const input = campo.querySelector('.enigma-input');
    const statusEl = campo.querySelector('.enigma-status');
    const hintMsg = campo.querySelector('.enigma-status__msg--hint');
    const retryMessages = chapter.riddle.gentleRetryMessages || ['Ainda não é essa. Tente novamente.'];
    let retryIndex = 0;

    // The form has no visible submit button (by design), so Chrome won't
    // implicitly submit on Enter in a lone text field — trigger it manually.
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
        onSolved?.();
        setTimeout(() => showSolvedStage({ freshlySolved: true }), 700);
        return;
      }

      campo.classList.remove('is-erro');
      // force reflow so the shake animation can replay on consecutive wrong answers
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
    const isMelody = chapter.riddle.presentation === 'melody';

    const seal = buildWaxSeal({
      size: isMelody ? 'grande' : 'normal',
      onBreak: () => onSealBroken?.(),
      onRevealed: showCartaStage,
    });
    stage.appendChild(seal.el);
    if (freshlySolved) {
      seal.stampIn();
      if (isMelody) floatMusicalNotes(stage);
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
    showRiddleStage();
  }

  appRoot.appendChild(outerEl);
  return outerEl;
}
