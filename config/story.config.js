// ============================================================================
// STORY CONFIG — global texts + chapter manifest. No logic lives here.
// To add chapter 5/6 later: create config/chapters/<id>.js following the
// schema documented in any example-*.js file, then add one line below.
// ============================================================================

export const book = {
  bookTitle: 'Nossa Constelação',
  startLabel: 'Começar',
};

// Only { id, load() } here — the hub/constellation must render using
// just ids, never a chapter's title/content, so a locked chapter's
// module (and its images) is never fetched before the reader reaches it.
export const chapters = [
  { id: 'ch1-primeira-luz', load: () => import('./chapters/ch1-primeira-luz.js') },
  { id: 'ch2-enigma-viajante', load: () => import('./chapters/ch2-enigma-viajante.js') },
  { id: 'ch3-alinhamento-celestial', load: () => import('./chapters/ch3-alinhamento-celestial.js') },
  { id: 'ch4-runas-esquecidas', load: () => import('./chapters/ch4-runas-esquecidas.js') },
  { id: 'ch5-melodia-estrelas', load: () => import('./chapters/ch5-melodia-estrelas.js') },
];

// Shown once every chapter above is completed (the trailing, always-locked
// node on the hub map becomes "current" and clicking it shows this instead
// of loading a chapter module).
export const comingSoon = {
  eyebrow: 'próximo capítulo',
  title: 'Capítulo 5 em construção',
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
