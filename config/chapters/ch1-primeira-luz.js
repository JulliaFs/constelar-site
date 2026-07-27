// ============================================================================
// CAPÍTULO 1 — "A Primeira Luz" (tipo constellation-puzzle)
// Ligar as estrelas nas conexões certas forma uma constelação simples
// (aqui, o desenho da Ursa Maior/"panela"). Troque nodes/edges por outro
// desenho se quiser — só precisa continuar um grafo conectado de 6-8 nós.
// ============================================================================

export default {
  id: 'ch1-primeira-luz',
  type: 'constellation-puzzle',
  title: 'Constelação I — A Primeira Luz',
  intro: ['Toda jornada começa com uma estrela. Encontre o caminho e desperte a primeira memória.'],
  startLabel: 'Iniciar desafio',

  puzzle: {
    // x/y em porcentagem (0-100) da área do desafio.
    nodes: [
      { id: 'n1', x: 15, y: 62 },
      { id: 'n2', x: 29, y: 50 },
      { id: 'n3', x: 44, y: 44 },
      { id: 'n4', x: 60, y: 47 },
      { id: 'n5', x: 74, y: 36 },
      { id: 'n6', x: 70, y: 60 },
      { id: 'n7', x: 51, y: 66 },
    ],
    // Únicas conexões válidas (ordem não importa). Qualquer outro par
    // tentado só pisca e some, sem punição.
    edges: [
      ['n1', 'n2'],
      ['n2', 'n3'],
      ['n3', 'n4'],
      ['n4', 'n5'],
      ['n5', 'n6'],
      ['n6', 'n7'],
      ['n7', 'n4'],
    ],
  },

  // Mostrado dentro da carta, depois que o selo se rompe.
  reveal: {
    paragraphs: [
      '[TEXTO DA CARTA 1 PLACEHOLDER]',
    ],
    continueLabel: 'Fechar',
  },

  sky: { nebulaTint: 0.08 },
};
