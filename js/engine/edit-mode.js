// ============================================================================
// MODO EDITOR (só para quem escreve o presente).
//
// Ligado: os textos da carta viram editáveis na própria tela e uma barra
// discreta permite adicionar parágrafos e copiar o arquivo de config do
// capítulo já formatado, pronto para colar em config/chapters/<id>.js.
//
// Desligado (padrão): nada disso existe no DOM. A experiência de quem
// recebe o presente fica exatamente como era.
//
// Como ligar/desligar:
//   • triplo clique no título da capa
//   • Ctrl + Shift + E (de qualquer tela)
// ============================================================================

const CHAVE = 'nossa-constelacao-modo-editor';

let ligado = false;
const ouvintes = new Set();

function lerFlag() {
  try {
    return localStorage.getItem(CHAVE) === '1';
  } catch {
    return false;
  }
}

function gravarFlag(valor) {
  try {
    if (valor) localStorage.setItem(CHAVE, '1');
    else localStorage.removeItem(CHAVE);
  } catch {
    /* modo anônimo, cota cheia — a flag só não persiste */
  }
}

export function isEditMode() {
  return ligado;
}

/** Avisado sempre que o modo alterna, para a tela atual se redesenhar. */
export function onEditModeChange(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

function alternar() {
  ligado = !ligado;
  gravarFlag(ligado);
  document.body.classList.toggle('modo-editor', ligado);
  mostrarAviso(ligado ? 'Modo editor ligado.' : 'Modo editor desligado.');
  for (const fn of ouvintes) fn(ligado);
}

/** Instala os gatilhos secretos. Chamado uma vez, na inicialização. */
export function initEditMode() {
  ligado = lerFlag();
  document.body.classList.toggle('modo-editor', ligado);

  // Triplo clique no título da capa (detail === 3 é o próprio contador
  // de cliques do navegador — não precisa de temporizador manual).
  document.addEventListener('click', (e) => {
    if (e.detail === 3 && e.target.closest('.tela-capa__nome')) alternar();
  });

  // Atalho global: dá para ligar já dentro de um capítulo, sem ter que
  // voltar até a capa.
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
      e.preventDefault();
      alternar();
    }
  });

  return ligado;
}

// ---------------------------------------------------------------------------
// Aviso discreto
// ---------------------------------------------------------------------------

let avisoEl = null;
let avisoTimer = null;

export function mostrarAviso(texto) {
  if (!avisoEl) {
    avisoEl = document.createElement('div');
    avisoEl.className = 'editor-aviso';
    document.body.appendChild(avisoEl);
  }
  avisoEl.textContent = texto;
  avisoEl.classList.add('visivel');

  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => avisoEl.classList.remove('visivel'), 2600);
}

// ---------------------------------------------------------------------------
// Serializador: transforma o objeto do capítulo no texto do arquivo .js
// ---------------------------------------------------------------------------

const IDENTIFICADOR = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function comoChave(k) {
  return IDENTIFICADOR.test(k) ? k : `'${k.replace(/'/g, "\\'")}'`;
}

function comoTexto(s) {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
}

function serializar(valor, nivel = 0) {
  const pad = '  '.repeat(nivel);
  const padInterno = '  '.repeat(nivel + 1);

  if (typeof valor === 'string') return comoTexto(valor);
  if (typeof valor === 'number' || typeof valor === 'boolean') return String(valor);
  if (valor === null) return 'null';

  if (Array.isArray(valor)) {
    if (!valor.length) return '[]';

    // Listas curtas e simples cabem numa linha só (ex: um par de arestas).
    const simples = valor.every((v) => typeof v === 'number' || typeof v === 'boolean');
    const textosCurtos = valor.every((v) => typeof v === 'string')
      && valor.join('').length < 46;
    if (simples || textosCurtos) {
      return `[${valor.map((v) => serializar(v, nivel)).join(', ')}]`;
    }

    const itens = valor.map((v) => `${padInterno}${serializar(v, nivel + 1)}`);
    return `[\n${itens.join(',\n')},\n${pad}]`;
  }

  if (typeof valor === 'object') {
    const entradas = Object.entries(valor).filter(([, v]) => v !== undefined);
    if (!entradas.length) return '{}';
    const itens = entradas.map(([k, v]) => `${padInterno}${comoChave(k)}: ${serializar(v, nivel + 1)}`);
    return `{\n${itens.join(',\n')},\n${pad}}`;
  }

  return 'null';
}

/** Monta o conteúdo completo de config/chapters/<id>.js. */
export function gerarConfigCapitulo(chapter) {
  return `// ${chapter.title || chapter.id}\n`
    + `// Gerado pelo modo editor — confira antes de salvar.\n\n`
    + `export default ${serializar(chapter, 0)};\n`;
}

// ---------------------------------------------------------------------------
// Área de transferência (com plano B se o navegador recusar)
// ---------------------------------------------------------------------------

export async function copiarParaClipboard(texto, mensagemOk) {
  try {
    await navigator.clipboard.writeText(texto);
    mostrarAviso(mensagemOk);
    return true;
  } catch {
    // Alguns contextos bloqueiam a API. Mostra o código selecionado para
    // a pessoa copiar com Ctrl+C em vez de perder o trabalho.
    mostrarCodigoManual(texto);
    return false;
  }
}

function mostrarCodigoManual(texto) {
  const painel = document.createElement('div');
  painel.className = 'editor-codigo';
  painel.innerHTML = `
    <p class="editor-codigo__aviso">Não consegui copiar sozinho — selecione e use Ctrl+C:</p>
    <textarea class="editor-codigo__campo" spellcheck="false"></textarea>
    <button type="button" class="editor-codigo__fechar">Fechar</button>
  `;
  const campo = painel.querySelector('textarea');
  campo.value = texto;

  painel.querySelector('.editor-codigo__fechar').addEventListener('click', () => painel.remove());
  document.body.appendChild(painel);
  campo.focus();
  campo.select();
}

// ---------------------------------------------------------------------------
// Barra de edição da carta
// ---------------------------------------------------------------------------

/**
 * Torna o título e os parágrafos da carta editáveis e monta a barra de
 * ferramentas. Chamado só quando o modo editor está ligado.
 *
 * @param {{painel: HTMLElement, tituloEl: HTMLElement|null, textoEl: HTMLElement, chapter: object}} opts
 */
export function ativarEdicaoCarta({ painel, tituloEl, textoEl, chapter }) {
  tituloEl?.setAttribute('contenteditable', 'true');
  for (const p of textoEl.querySelectorAll('p')) {
    p.setAttribute('contenteditable', 'true');
  }

  const barra = document.createElement('div');
  barra.className = 'editor-barra';
  barra.innerHTML = `
    <span class="editor-barra__marca">modo editor</span>
    <button type="button" class="editor-barra__botao" data-acao="paragrafo">+ Adicionar Parágrafo</button>
    <button type="button" class="editor-barra__botao" data-acao="copiar">📋 Copiar Config do Capítulo</button>
  `;

  barra.querySelector('[data-acao="paragrafo"]').addEventListener('click', () => {
    const p = document.createElement('p');
    p.setAttribute('contenteditable', 'true');
    p.setAttribute('data-linha', '');
    p.textContent = 'Novo parágrafo...';
    textoEl.appendChild(p);
    p.focus();
    // Deixa o texto de exemplo selecionado, para já sair digitando por cima.
    const range = document.createRange();
    range.selectNodeContents(p);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  });

  barra.querySelector('[data-acao="copiar"]').addEventListener('click', async () => {
    if (!chapter) {
      mostrarAviso('Este capítulo não passou seus dados para o editor.');
      return;
    }

    // Lê o que está na tela, não o que estava no arquivo.
    const paragrafos = [...textoEl.querySelectorAll('p')]
      .map((p) => p.textContent.trim())
      .filter(Boolean);

    const atualizado = {
      ...chapter,
      reveal: {
        ...chapter.reveal,
        ...(tituloEl ? { title: tituloEl.textContent.trim() } : {}),
        paragraphs: paragrafos,
      },
    };

    await copiarParaClipboard(
      gerarConfigCapitulo(atualizado),
      'Código do capítulo copiado! Cole no seu arquivo config.',
    );
  });

  painel.prepend(barra);
}
