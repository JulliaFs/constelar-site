import { createAnswerValidator } from '../utils/text-match.js';

function clear(container) {
  container.innerHTML = '';
}

function screenShell() {
  const el = document.createElement('section');
  el.className = 'book-screen';
  return el;
}

export function renderWelcome(container, data, { onStart }) {
  clear(container);
  const screen = screenShell();
  screen.innerHTML = `
    <div class="eyebrow">${data.welcomeEyebrow}</div>
    <h1 class="book-title">${data.welcomeTitle}</h1>
    <p class="book-subtitle">${data.welcomeSubtitle}</p>
    <div class="book-body">
      ${data.welcomeBody.map((p) => `<p>${p}</p>`).join('')}
    </div>
    <button type="button" class="btn" id="start-btn">${data.startButtonLabel}</button>
  `;
  container.appendChild(screen);
  screen.querySelector('#start-btn').addEventListener('click', onStart);
}

export function renderPuzzle(container, data, { onSuccess }) {
  clear(container);
  const screen = screenShell();
  screen.innerHTML = `
    ${data.eyebrow ? `<div class="eyebrow">${data.eyebrow}</div>` : ''}
    <h1 class="book-title">${data.title}</h1>
    ${data.intro ? `<p class="book-body">${data.intro}</p>` : ''}
    <div class="coords-box">
      ${data.coordinatesLines.map((l) => `<div>${l}</div>`).join('')}
    </div>
    <form class="puzzle-form" id="puzzle-form" novalidate>
      <label for="puzzle-input" class="eyebrow">${data.inputLabel}</label>
      <input
        type="text"
        id="puzzle-input"
        class="puzzle-input"
        placeholder="${data.placeholder || ''}"
        autocomplete="off"
        spellcheck="false"
      />
      <button type="submit" class="btn">${data.submitLabel || 'Confirmar'}</button>
      <p class="puzzle-feedback" id="puzzle-feedback" role="status"></p>
    </form>
  `;
  container.appendChild(screen);

  const validate = createAnswerValidator(data.answerPayload, data.maxTypoDistance ?? 2);
  const form = screen.querySelector('#puzzle-form');
  const input = screen.querySelector('#puzzle-input');
  const feedback = screen.querySelector('#puzzle-feedback');
  const retryMessages = data.gentleRetryMessages || ['Ainda não é essa. Tente novamente.'];
  let retryIndex = 0;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value;

    if (validate(value)) {
      feedback.textContent = 'É isso! ✦';
      feedback.classList.add('visible', 'success');
      input.disabled = true;
      form.querySelector('button[type="submit"]').disabled = true;
      setTimeout(onSuccess, 700);
      return;
    }

    feedback.classList.remove('success');
    feedback.textContent = retryMessages[retryIndex % retryMessages.length];
    feedback.classList.add('visible');
    retryIndex++;
    input.focus();
    input.select();
  });

  input.focus();
}

export function renderReveal(container, data, { onContinue }) {
  clear(container);
  const screen = screenShell();
  screen.innerHTML = `
    <div class="unlock-icon">${data.unlockIcon || '✦'}</div>
    <div class="eyebrow">${data.unlockLabel || 'Capítulo desbloqueado'}</div>
    <div class="book-body fade-in-delayed">
      ${data.paragraphs.map((p) => `<p>${p}</p>`).join('')}
    </div>
    <button type="button" class="btn fade-in-delayed" id="continue-btn">${data.continueLabel || 'Continuar'}</button>
  `;
  container.appendChild(screen);
  screen.querySelector('#continue-btn').addEventListener('click', onContinue);
}

export function renderComingSoon(container, data) {
  clear(container);
  const screen = screenShell();
  screen.innerHTML = `
    <div class="eyebrow">${data.eyebrow}</div>
    <h1 class="book-title">${data.title}</h1>
    <div class="book-body">
      ${data.body.map((p) => `<p>${p}</p>`).join('')}
    </div>
  `;
  container.appendChild(screen);
}
