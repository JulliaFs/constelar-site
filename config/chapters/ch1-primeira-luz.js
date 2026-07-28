// ============================================================================
// CAPÍTULO 1 — "A Primeira Luz" (tipo constellation-puzzle)
// A constelação é a Lira (Lyra): o triângulo de Vega no topo e o
// paralelogramo do corpo do instrumento embaixo.
//
// x/y são porcentagens do palco do desafio, então a figura se adapta
// sozinha ao tamanho da tela.
// ============================================================================

export default {
  id: 'ch1-primeira-luz',
  type: 'constellation-puzzle',
  title: 'Capítulo I — A Primeira Luz',
  subtitle: 'A Harpa do Firmamento',
  intro: ['Toda jornada começa com uma estrela. Encontre o caminho e desperte a primeira memória.'],
  startLabel: 'Iniciar desafio',

  puzzle: {
    // Estrela de destaque: ganha uma aura dupla creme/dourada.
    mainStarId: 'vega',

    nodes: [
      { id: 'vega',  label: 'Vega (α Lyrae)', x: 50, y: 20, isAlpha: true },
      { id: 'eps',   label: 'ε Lyrae',        x: 62, y: 30 },
      { id: 'zeta',  label: 'ζ Lyrae',        x: 38, y: 38 },
      { id: 'delta', label: 'δ Lyrae',        x: 62, y: 48 },
      { id: 'beta',  label: 'Sheliak (β)',    x: 35, y: 72 },
      { id: 'gamma', label: 'Sulafat (γ)',    x: 58, y: 80 },
    ],

    // Únicas conexões válidas (a ordem do par não importa). Qualquer
    // outro par tentado apenas se desfaz, sem punição.
    edges: [
      // Triângulo do topo (Vega)
      ['vega', 'eps'],
      ['eps', 'zeta'],
      ['zeta', 'vega'],

      // Ligação do triângulo ao corpo
      ['zeta', 'delta'],
      ['zeta', 'beta'],

      // Paralelogramo inferior
      ['delta', 'gamma'],
      ['beta', 'gamma'],
    ],
  },

  // Mostrado dentro da carta, depois que o selo se rompe.
  reveal: {
    title: 'Carta da Primeira Luz',
    paragraphs: [
      'Assim como a estrela Vega guia os navegantes na escuridão, esta primeira luz ilumina o começo da nossa jornada...',
      '[ESCREVA AQUI O SEU TEXTO POÉTICO]',
    ],
    continueLabel: 'Guardar Carta no Céu',
  },

  sky: { nebulaTint: 0.08 },
};
