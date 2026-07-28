// ============================================================================
// STORY CONFIG — global texts + chapter manifest. No logic lives here.
// To add chapter 5/6 later: create config/chapters/<id>.js following the
// schema documented in any example-*.js file, then add one line below.
// ============================================================================

export const book = {
  bookTitle: 'Nossa Constelação',
  coverHint: 'Alinhe os astros no dia em que o seu universo começou.',

  // Data-alvo do astrolábio da tela inicial, no formato "dia|mês|ano"
  // (mês em número, 1-12). Fica ofuscada para não expor uma data pessoal
  // em texto simples no código do lado do cliente.
  // Para trocar: node scripts/generate-answer.mjs "27|7|2004"
  // Limites dos anéis: dia 1-31, mês 1-12, ano 1998-2010.
  coverTargetPayload: 'Ozc3OcKDPsKDPjk=',
};

// Only { id, load() } here — the hub/constellation must render using
// just ids, never a chapter's title/content, so a locked chapter's
// module (and its images) is never fetched before the reader reaches it.
// `mapa` é o texto que aparece no card flutuante do mapa celeste. Fica
// AQUI (e não no módulo do capítulo) de propósito: o mapa precisa desses
// títulos para todos os capítulos, e não pode importar o conteúdo de um
// capítulo que a leitora ainda não alcançou.
export const chapters = [
  {
    id: 'ch1-primeira-luz',
    load: () => import('./chapters/ch1-primeira-luz.js'),
    mapa: { titulo: 'I · A Primeira Luz', subtitulo: 'Toda jornada começa com uma estrela.' },
  },
  {
    id: 'ch2-enigma-viajante',
    load: () => import('./chapters/ch2-enigma-viajante.js'),
    mapa: { titulo: 'II · O Enigma do Viajante', subtitulo: 'Alguns caminhos só se abrem para quem encontra a resposta.' },
  },
  {
    id: 'ch3-alinhamento-celestial',
    load: () => import('./chapters/ch3-alinhamento-celestial.js'),
    mapa: { titulo: 'III · O Alinhamento Celestial', subtitulo: 'Quando Sol e Lua encontram seu equilíbrio.' },
  },
  {
    id: 'ch4-runas-esquecidas',
    load: () => import('./chapters/ch4-runas-esquecidas.js'),
    mapa: { titulo: 'IV · As Runas Esquecidas', subtitulo: 'Nem toda mensagem se entrega à primeira vista.' },
  },
  {
    id: 'ch5-melodia-estrelas',
    load: () => import('./chapters/ch5-melodia-estrelas.js'),
    mapa: { titulo: 'V · A Melodia das Estrelas', subtitulo: 'Algumas lembranças vivem nas melodias que guardamos.' },
  },
];

// Shown once every chapter above is completed (the trailing, always-locked
// node on the hub map becomes "current" and clicking it shows this instead
// of loading a chapter module).
export const comingSoon = {
  eyebrow: 'próximo capítulo',
  title: 'Capítulo 5 em construção',
  // Subtítulo do card desse nó no mapa celeste.
  mapaSubtitulo: 'Ainda sendo escrito nas estrelas.',
  body: [
    'Essa parte da história ainda está sendo escrita.',
    'Volte em breve para continuar.',
  ],
};

// Bespoke ending sequence played once the last chapter's carta is closed.
export const finale = {
  message: 'Você encontrou todas as cartas.',
  buttonLabel: '✨ Revelar o Último Segredo',
  teaser: ['[TEASER DO APP AQUI]'],
};
