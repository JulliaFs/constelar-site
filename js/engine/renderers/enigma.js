import { buildPageShell } from '../components/page-shell.js';
import { buildCtaButton } from '../components/cta-button.js';
import { buildWaxSeal } from '../components/wax-seal.js';
import { createAnswerValidator } from '../../utils/text-match.js';

/**
 * @param {HTMLElement} appRoot
 * @param {object} chapter
 * @param {{enigmaSolved?: boolean, enigmaRevealed?: boolean}|undefined} resume
 * @param {{onSolved: () => void, onRevealed: () => void, onComplete: () => void}} handlers
 */
export function renderEnigma(appRoot, chapter, resume, { onSolved, onRevealed, onComplete }) {
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

    const prompt = document.createElement('p');
    prompt.className = 'txt-enigma';
    prompt.textContent = chapter.riddle.prompt;
    stage.appendChild(prompt);

    if (chapter.riddle.hintLines?.length) {
      const pistas = document.createElement('div');
      pistas.className = 'enigma-pistas';
      pistas.innerHTML = chapter.riddle.hintLines.map((l) => `<div>${l}</div>`).join('');
      stage.appendChild(pistas);
    }

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
    const seal = buildWaxSeal({
      onBreak: () => {
        onRevealed?.();
        showRevealedStage();
      },
    });
    stage.appendChild(seal.el);
    if (freshlySolved) {
      seal.stampIn();
    } else {
      seal.el.querySelector('.selo-wrap')?.classList.add('is-entrando');
    }
  }

  function showRevealedStage() {
    stage.innerHTML = '';

    const painel = document.createElement('div');
    painel.className = 'selo-revelacao txt-corpo';
    painel.innerHTML = chapter.reveal.paragraphs
      .map((p, i) => `<p data-linha style="animation-delay:${i * 140}ms">${p}</p>`)
      .join('');
    stage.appendChild(painel);

    requestAnimationFrame(() => painel.classList.add('visivel'));

    const btn = buildCtaButton(chapter.reveal.continueLabel || 'Continuar', onComplete);
    btn.style.marginTop = 'var(--esp-4)';
    stage.appendChild(btn);
  }

  if (resume?.enigmaRevealed) {
    showRevealedStage();
  } else if (resume?.enigmaSolved) {
    showSolvedStage({ freshlySolved: false });
  } else {
    showRiddleStage();
  }

  appRoot.appendChild(outerEl);
  return outerEl;
}
