// ============================================================================
// STORY CONFIG — global texts + chapter manifest. No logic lives here.
// To add chapter 5/6 later: create config/chapters/<id>.js following the
// schema documented in any example-*.js file, then add one line below.
// ============================================================================

export const book = {
  bookTitle: 'Nossa Constelação',
  openBookLabel: 'Abrir o grimório',
  coverHint: 'Clique no livro para começar',
};

// Only { id, load() } here — the hub/constellation must render using
// just ids, never a chapter's title/content, so a locked chapter's
// module (and its images) is never fetched before the reader reaches it.
export const chapters = [
  { id: 'example-1', load: () => import('./chapters/example-1-narrative.js') },
  { id: 'example-2', load: () => import('./chapters/example-2-enigma.js') },
  { id: 'example-3', load: () => import('./chapters/example-3-gallery.js') },
  { id: 'example-4', load: () => import('./chapters/example-4-narrative.js') },
  // config/chapters/chapter-1.js holds the REAL, already-tested chapter 1
  // content (Teixeira de Freitas riddle) — swap it back in for real content
  // once the new engine is validated with the placeholders above. See
  // README.md for the exact field mapping.
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
